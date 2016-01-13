/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../utilities/assert',
   '../utilities/object',
   '../utilities/string',
   '../utilities/path',
   '../json/validator',
   './features_provider',
   'json!../../static/schemas/page.json',
   '../tooling/pages'
], function( assert, object, string, path, jsonValidator, featuresProvider, pageSchema, pageTooling ) {
   'use strict';

   var SEGMENTS_MATCHER = /[_/-]./g;

   var ID_SEPARATOR = '-';
   var ID_SEPARATOR_MATCHER = /\-/g;
   var SUBTOPIC_SEPARATOR = '+';

   var JSON_SUFFIX_MATCHER = /\.json$/;
   var COMPOSITION_EXPRESSION_MATCHER = /^(!?)\$\{([^}]+)\}$/;
   var COMPOSITION_TOPIC_PREFIX = 'topic:';

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function PageLoader( q, httpClient, baseUrl, fileResourceProvider ) {
      this.q_ = q;
      this.httpClient_ = httpClient;
      this.baseUrl_ = baseUrl;
      this.fileResourceProvider_ = fileResourceProvider;
      this.idCounter_ = 0;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Loads a page specification and resolves all extension and compositions. The result is a page were all
    * referenced page fragments are merged in to one JavaScript object. As loading of all relevant files is
    * already asynchronous, this method is also asynchronous and thus returns a promise that is either
    * resolved with the constructed page or rejected with a JavaScript `Error` instance.
    *
    * @param {String} pageName
    *    the page to load. This is in fact a path relative to the base url this page loader was instantiated
    *    with and the `.json` suffix omitted
    *
    * @returns {Promise}
    *    the result promise
    *
    * @private
    */
   PageLoader.prototype.loadPage = function( pageName ) {
      return loadPageRecursively( this, pageName, [] );
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function loadPageRecursively( self, pageName, extensionChain ) {
      var page;
      var pageSelfLink = assetUrl( self.baseUrl_, pageName );

      if( extensionChain.indexOf( pageName ) !== -1 ) {
         throwError(
            { name: pageName },
            'Cycle in page extension detected: ' + extensionChain.concat( [ pageName ] ).join( ' -> ' )
         );
      }

      return load( self, pageSelfLink )
         .then( function( foundPage ) {
            validatePage( foundPage, pageName );

            page = foundPage;
            page.name = pageName.replace( JSON_SUFFIX_MATCHER, '' );
            page.selfLink = pageSelfLink;

            if( !page.areas ) {
               page.areas = {};
            }
         }, function() {
            throwError( { name: pageName }, 'Page could not be found at location "' + pageSelfLink + '"' );
         } )
         .then( function() {
            return processExtends( self, page, extensionChain );
         } )
         .then( function() {
            return processCompositions( self, page, pageName );
         } )
         .then( function() {
            return checkForDuplicateWidgetIds( self, page );
         } )
         .then( function() {
            pageTooling.setPageDefinition( pageName, page, pageTooling.FLAT );
            return page;
         } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   //
   // Processing inheritance (i.e. the `extends` keyword)
   //
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function processExtends( self, page, extensionChain ) {
      if( has( page, 'extends' ) ) {
         return loadPageRecursively( self, page[ 'extends' ], extensionChain.concat( [ page.name ] ) )
            .then( function( basePage ) {
               mergePageWithBasePage( page, basePage );
            } );
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function mergePageWithBasePage( page, basePage ) {
      var extendingAreas = page.areas;
      var mergedPageAreas = object.deepClone( basePage.areas );
      if( has( basePage, 'layout' ) ) {
         if( has( page, 'layout' ) ) {
            throwError( page, string.format( 'Page overwrites layout set by base page "[name]', basePage ) );
         }
         page.layout = basePage.layout;
      }

      object.forEach( extendingAreas, function( widgets, areaName ) {
         if( !( areaName in mergedPageAreas ) ) {
            mergedPageAreas[ areaName ] = widgets;
            return;
         }

         mergeWidgetLists( mergedPageAreas[ areaName ], widgets, page );
      } );

      page.areas = mergedPageAreas;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   //
   // Processing compositions
   //
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function processCompositions( self, topPage, topPageName ) {

      return processNestedCompositions( topPage, null, [] );

      function processNestedCompositions( page, instanceId, compositionChain ) {

         var promise = self.q_.when();
         var seenCompositionIdCount = {};

         object.forEach( page.areas, function( widgets ) {
            /*jshint loopfunc:true*/
            for( var i = widgets.length - 1; i >= 0; --i ) {
               ( function( widgetSpec, index ) {
                  if( widgetSpec.enabled === false ) {
                     return;
                  }

                  if( has( widgetSpec, 'widget' ) ) {
                     if( !has( widgetSpec, 'id' ) ) {
                        var widgetName = widgetSpec.widget.split( '/' ).pop();
                        widgetSpec.id = nextId( self, widgetName.replace( SEGMENTS_MATCHER, dashToCamelcase ) );
                     }
                     return;
                  }

                  if( has( widgetSpec, 'composition' ) ) {
                     var compositionName = widgetSpec.composition;
                     if( compositionChain.indexOf( compositionName ) !== -1 ) {
                        var message = 'Cycle in compositions detected: ' +
                                      compositionChain.concat( [ compositionName ] ).join( ' -> ' );
                        throwError( topPage, message );
                     }

                     if( !has( widgetSpec, 'id' ) ) {
                        var escapedCompositionName =
                           widgetSpec.composition.replace( SEGMENTS_MATCHER, dashToCamelcase );
                        widgetSpec.id = nextId( self, escapedCompositionName );
                     }

                     if( widgetSpec.id in seenCompositionIdCount ) {
                        seenCompositionIdCount[ widgetSpec.id ]++;
                     }
                     else {
                        seenCompositionIdCount[ widgetSpec.id ] = 1;
                     }

                     // Loading compositionUrl can be started asynchronously, but replacing the according widgets
                     // in the page needs to take place in order. Otherwise the order of widgets could be messed up.
                     promise = promise
                        .then( function() {
                           return load( self, assetUrl( self.baseUrl_, compositionName ) );
                        } )
                        .then( function( composition ) {
                           return prefixCompositionIds( composition, widgetSpec );
                        } )
                        .then( function( composition ) {
                           return processCompositionExpressions( composition, widgetSpec, throwError.bind( null, topPage ) );
                        } )
                        .then( function( composition ) {
                           var chain = compositionChain.concat( compositionName );
                           return processNestedCompositions( composition, widgetSpec.id, chain )
                              .then( function() {
                                 pageTooling.setCompositionDefinition( topPageName, widgetSpec.id, composition, pageTooling.FLAT );
                                 return composition;
                              } );
                        } )
                        .then( function( composition ) {
                           mergeCompositionAreasWithPageAreas( composition, page, widgets, index );
                        } );
                  }
               } )( widgets[ i ], i );
            }
         } );

         // now that all IDs have been created, we can store a copy of the page prior to composition expansion
         if( page === topPage ) {
            pageTooling.setPageDefinition( topPageName, page, pageTooling.COMPACT );
         }
         else {
            pageTooling.setCompositionDefinition( topPageName, instanceId, page, pageTooling.COMPACT );
         }

         checkForDuplicateCompositionIds( page, seenCompositionIdCount );

         return promise;
      }

   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function mergeCompositionAreasWithPageAreas( composition, page, widgets, index ) {
      object.forEach( composition.areas, function( compositionAreaWidgets, areaName ) {
         if( areaName === '.' ) {
            replaceEntryAtIndexWith( widgets, index, compositionAreaWidgets );
            return;
         }

         if( !( areaName in page.areas ) ) {
            page.areas[ areaName ] = compositionAreaWidgets;
            return;
         }

         mergeWidgetLists( page.areas[ areaName ], compositionAreaWidgets, page );
      } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function prefixCompositionIds( composition, widgetSpec ) {
      var prefixedAreas = {};
      object.forEach( composition.areas, function( widgets, areaName ) {
         widgets.forEach( function( widget ) {
            if( has( widget, 'id' ) ) {
               widget.id = widgetSpec.id + ID_SEPARATOR + widget.id;
            }
         } );

         if( areaName.indexOf( '.' ) > 0 ) {
            // All areas prefixed with a local widget id need to be prefixed as well
            prefixedAreas[ widgetSpec.id + ID_SEPARATOR + areaName ] = widgets;
            return;
         }

         prefixedAreas[ areaName ] = widgets;
      } );
      composition.areas = prefixedAreas;
      return composition;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function processCompositionExpressions( composition, widgetSpec, throwPageError ) {
      var expressionData = {};

      // feature definitions in compositions may contain generated topics for default resource names or action
      // topics. As such these are generated before instantiating the composition's features.
      composition.features = iterateOverExpressions( composition.features || {}, replaceExpression );
      expressionData.features = featuresProvider.featuresForWidget( composition, widgetSpec, throwPageError );

      if( typeof composition.mergedFeatures === 'object' ) {
         var mergedFeatures = iterateOverExpressions( composition.mergedFeatures, replaceExpression );

         Object.keys( mergedFeatures ).forEach( function( featurePath ) {
            var currentValue = object.path( expressionData.features, featurePath, [] );
            var values = mergedFeatures[ featurePath ];
            object.setPath( expressionData.features, featurePath, values.concat( currentValue ) );
         } );
      }

      composition.areas = iterateOverExpressions( composition.areas, replaceExpression );

      function replaceExpression( subject ) {
         var matches = subject.match( COMPOSITION_EXPRESSION_MATCHER );
         if( !matches ) {
            return subject;
         }

         var possibleNegation = matches[1];
         var expression = matches[2];
         var result;
         if( expression.indexOf( COMPOSITION_TOPIC_PREFIX ) === 0 ) {
            result = topicFromId( widgetSpec.id ) +
               SUBTOPIC_SEPARATOR + expression.substr( COMPOSITION_TOPIC_PREFIX.length );
         }
         else {
            result = object.path( expressionData, expression );
         }

         return typeof result === 'string' && possibleNegation ? possibleNegation + result : result;
      }

      return composition;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function iterateOverExpressions( obj, replacer ) {
      if( obj === null ) {
         return obj;
      }

      if( Array.isArray( obj ) ) {
         return obj.map( function( value ) {
            if( typeof value === 'object' ) {
               return iterateOverExpressions( value, replacer );
            }

            return typeof value === 'string' ? replacer( value ) : value;
         } ).filter( function( item ) {
            return typeof item !== 'undefined';
         } );
      }

      var result = {};
      object.forEach( obj, function( value, key ) {
         var replacedKey = replacer( key );
         if( typeof value === 'object' ) {
            result[ replacedKey ] = iterateOverExpressions( value, replacer );
            return;
         }

         var replacedValue = typeof value === 'string' ? replacer( value ) : value;
         if( typeof replacedValue !== 'undefined' ) {
            result[ replacedKey ] = replacedValue;
         }
      } );

      return result;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function checkForDuplicateCompositionIds( page, idCount ) {
      var duplicates = Object.keys( idCount ).filter( function( compositionId ) {
         return idCount[ compositionId ] > 1;
      } );

      if( duplicates.length ) {
         throwError( page, 'Duplicate composition ID(s): ' + duplicates.join( ', ' ) );
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   //
   // Additional Tasks
   //
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function checkForDuplicateWidgetIds( self, page ) {
      var idCount = {};

      object.forEach( page.areas, function( widgetList, index ) {
         page.areas[ index ] = widgetList.filter( function( widgetSpec ) {
            if( widgetSpec.enabled === false ) {
               return false;
            }
            idCount[ widgetSpec.id ] = idCount[ widgetSpec.id ] ? idCount[ widgetSpec.id ] + 1 : 1;
            return true;
         } );
      } );

      var duplicates = Object.keys( idCount ).filter( function( widgetId ) {
         return idCount[ widgetId ] > 1;
      } );

      if( duplicates.length ) {
         throwError( page, 'Duplicate widget ID(s): ' + duplicates.join( ', ' ) );
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function validatePage( foundPage, pageName ) {
      var result = jsonValidator.create( pageSchema ).validate( foundPage );
      if( result.errors.length ) {
         var errorString = result.errors.reduce( function( errorString, errorItem ) {
            return errorString + '\n - ' + errorItem.message;
         }, '' );

         throwError( { name: pageName }, 'Schema validation failed: ' + errorString );
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   //
   // Common functionality and utility functions
   //
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function mergeWidgetLists( targetList, sourceList, page ) {
      sourceList.forEach( function( widgetConfiguration ) {
         if( widgetConfiguration.insertBeforeId ) {
            for( var i = 0, length = targetList.length; i < length; ++i ) {
               if( targetList[ i ].id === widgetConfiguration.insertBeforeId ) {
                  targetList.splice( i, 0, widgetConfiguration );
                  return;
               }
            }

            throwError( page,
               string.format(
                  'No id found that matches insertBeforeId value "[insertBeforeId]"',
                  widgetConfiguration
               )
            );
         }

         targetList.push( widgetConfiguration );
      } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function assetUrl( base, asset ) {
      if( !asset.match( JSON_SUFFIX_MATCHER ) ) {
         asset += '.json';
      }
      return path.join( base, asset );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function has( object, what ) {
      return typeof object[ what ] === 'string' && object[ what ].length;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function load( self, url ) {
      if( !self.fileResourceProvider_ ) {
         return self.httpClient_.get( url ).then( function( response ) {
            return response.data;
         } );
      }
      return self.fileResourceProvider_.provide( url );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function nextId( self, prefix ) {
      return prefix + ID_SEPARATOR + 'id' + self.idCounter_++;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function dashToCamelcase( segmentStart ) {
      return segmentStart.charAt( 1 ).toUpperCase();
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function topicFromId( id ) {
      return id.replace( ID_SEPARATOR_MATCHER, SUBTOPIC_SEPARATOR ).replace( SEGMENTS_MATCHER, dashToCamelcase );
   }

   function replaceEntryAtIndexWith( arr, index, replacements ) {
      arr.splice.apply( arr, [ index, 1 ].concat( replacements ) );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function throwError( page, message ) {
      var text = string.format( 'Error loading page "[name]": [0]', [ message ], page );
      throw new Error( text );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {

      /**
       * Creates and returns a new page loader instance.
       *
       * @param {Object} q
       *    a Promise library conforming to $q from AngularJS
       * @param {Object} httpClient
       *    a http client conforming to $http from AngularJS
       * @param {String} baseUrl
       *    the url where all pages are located
       * @param {FileResourceProvider} fileResourceProvider
       *    a FileResourceProvider as a smarter alternative to httpClient, used if provided
       * @returns {PageLoader}
       *    a page loader instance
       *
       * @private
       */
      create: function( q, httpClient, baseUrl, fileResourceProvider ) {
         assert( q ).isNotNull();
         if( fileResourceProvider === null ) {
            assert( httpClient ).isNotNull();
         }
         assert( baseUrl ).isNotNull();
         return new PageLoader( q, httpClient, baseUrl, fileResourceProvider );
      }

   };

} );
