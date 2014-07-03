/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   './widget_loader',
   '../../utilities/assert',
   '../../utilities/object',
   '../../utilities/string',
   '../../utilities/path',
   '../../json/validator',
   'json!../../../static/schemas/page.json'
], function( widgetLoader, assert, object, string, path, jsonValidator, pageSchema ) {
   'use strict';

   var JSON_SUFFIX_MATCHER = /\.json$/;
   var ALL_SLASHES_MATCHER = /\//g;
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
            'Cycle in page extension detected: [0].', extensionChain.concat( [ pageName ] ).join( ' -> ' )
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
            throwError( 'Page "[0]" could not be found at location "[1]".', pageName, pageSelfLink );
         } )
         .then( function() {
            return processExtends( self, page, extensionChain );
         } )
         .then( function() {
            return processCompositions( self, page, [] );
         } )
         .then( function() {
            return processMixins( self, page );
         } )
         .then( function() {
            return postProcessWidgets( self, page );
         } )
         .then( function() {
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
            throwError( 'Page "[0]" overwrites layout set by page "[1]".', page.name, basePage.name );
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

   function processCompositions( self, page, compositionChain ) {
      var promise = self.q_.when();

      object.forEach( page.areas, function( widgets ) {
         /*jshint loopfunc:true*/
         for( var i = widgets.length - 1; i >= 0; --i ) {
            ( function( widgetSpec, index ) {
               if( has( widgetSpec, 'composition' ) ) {
                  if( widgetSpec.enabled === false ) {
                     return;
                  }

                  var compositionName = widgetSpec.composition;
                  if( compositionChain.indexOf( compositionName ) !== -1 ) {
                     throwError(
                        'Cycle in compositions detected: [0].',
                        compositionChain.concat( [ compositionName ] ).join( ' -> ' )
                     );
                  }

                  var compositionUrl = assetUrl( self.baseUrl_, compositionName );
                  var loadCompositionUrlPromise = load( self, compositionUrl );

                  if( !has( widgetSpec, 'id' ) ) {
                     var escapedCompositionName = widgetSpec.composition.replace( ALL_SLASHES_MATCHER, '_' );
                     widgetSpec.id = nextId( self, escapedCompositionName );
                  }

                  // Loading compositionUrl can be started asynchronously, but replacing the according widgets
                  // in the page needs to take place in order. Otherwise the order of widgets could be messed up.
                  promise = promise
                     .then( function() {
                        return loadCompositionUrlPromise;
                     } )
                     .then( function( composition ) {
                        return prefixCompositionIds( composition, widgetSpec );
                     } )
                     .then( function( composition ) {
                        return processCompositionExpressions( composition, widgetSpec );
                     } )
                     .then( function( composition ) {
                        var chain = compositionChain.concat( compositionName );
                        return processCompositions( self, composition, chain )
                           .then( function() {
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

      return promise;
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
      composition.areas = object.map( composition.areas, function( widgets, areaName ) {
         widgets.forEach( function( widget ) {
            if( has( widget, 'id' ) ) {
               widget.id = widgetSpec.id + '__' + widget.id;
            }
         } );

         if( areaName.indexOf( '.' ) > 0 ) {
            // All areas prefixed with a local widget id need to be prefixed as well
            return [ widgetSpec.id + '__' + areaName, widgets ];
         }

         return [ areaName, widgets ];
      } );

      return composition;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function processCompositionExpressions( composition, widgetSpec ) {
      var expressionData = {};

      // feature definitions in compositions may contain generated topics for default resource names or action
      // topics. As such these are generated before instantiating the composition's features.
      composition.features = iterateOverExpressions( composition.features || {}, replaceExpression );
      expressionData.features = widgetLoader.featuresForWidget( composition, widgetSpec );

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
            result = string.removeUnderscoresFromCamelCase( widgetSpec.id );
            result += string.capitalize( expression.substr( COMPOSITION_TOPIC_PREFIX.length ) );
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

      var deleteKeys = [];
      var result = object.map( obj, function( value, key ) {
         var replacedKey = replacer( key );
         if( typeof value === 'object' ) {
            return [ replacedKey, iterateOverExpressions( value, replacer ) ];
         }

         var replacedValue = typeof value === 'string' ? replacer( value ) : value;
         if( typeof replacedValue === 'undefined' ) {
            deleteKeys.push( replacedKey );
         }
         return [ replacedKey, replacedValue ];
      } );

      deleteKeys.forEach( function( key ) {
         delete result[ key ];
      } );

      return result;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   //
   // Processing mixins
   //
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function processMixins( self, page ) {
      var promise = self.q_.when();

      object.forEach( page.areas, function( widgets ) {
         /*jshint loopfunc:true*/
         for( var i = widgets.length - 1; i >= 0; --i ) {
            ( function( widgetSpec, index ) {
               if( has( widgetSpec, 'mixin' ) ) {
                  if( widgetSpec.enabled === false ) {
                     return;
                  }

                  var mixinUrl = assetUrl( self.baseUrl_, widgetSpec.mixin );
                  var loadMixinPromise = load( self, mixinUrl );
                  // Loading mixins can be started asynchronously, but replacing the according widgets in the
                  // page needs to take place in order. Otherwise the order of widgets could be messed up.
                  promise = promise
                     .then( function() {
                        return loadMixinPromise;
                     } )
                     .then( function( mixin ) {
                        replaceEntryAtIndexWith( widgets, index, mixin.widgets );
                     } );
               }
            } )( widgets[ i ], i );
         }
      } );

      return promise;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   //
   // Additional Tasks
   //
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function postProcessWidgets( self, page ) {
      var idCount = {};

      object.forEach( page.areas, function( widgetList, index ) {
         page.areas[ index ] = widgetList.filter( function( widgetSpec ) {
            if( widgetSpec.enabled === false ) {
               return false;
            }

            if( has( widgetSpec, 'widget' ) ) {
               if( !has( widgetSpec, 'id' ) ) {
                  widgetSpec.id = nextId( self, widgetSpec.widget.split( '/' ).pop() );
               }

               idCount[ widgetSpec.id ] = idCount[ widgetSpec.id ] ? idCount[ widgetSpec.id ] + 1 : 1;
            }
            return true;
         } );
      } );

      var duplicates = Object.keys( idCount ).filter( function( widgetId ) {
         return idCount[ widgetId ] > 1;
      } );

      if( duplicates.length ) {
         throwError( 'Duplicate widget ID(s) in page "[0]": [1].', page.name, duplicates.join( ', ' ) );
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function validatePage( foundPage, pageName ) {
      var result = jsonValidator.create( pageSchema ).validate( foundPage );
      if( result.errors.length ) {
         var errorString = result.errors.reduce( function( errorString, errorItem ) {
            return errorString + '\n - ' + errorItem.message;
         }, '' );

         throwError( 'Schema validation of page "[0]" failed: [1]', pageName, errorString );
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   //
   // Common functionality and utility functions
   //
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function mergeWidgetLists( targetList, sourceList, page ) {
      sourceList.forEach( function( widgetSpec ) {
         if( widgetSpec.insertBeforeId ) {
            for( var i = 0, length = targetList.length; i < length; ++i ) {
               if( targetList[ i ].id === widgetSpec.insertBeforeId ) {
                  targetList.splice( i, 0, widgetSpec );
                  return;
               }
            }

            throwError(
               'No id found that matches insertBeforeId value "[0]" in page "[1]".',
               widgetSpec.insertBeforeId,
               page.name
            );
         }

         targetList.push( widgetSpec );
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
      return prefix + '__id' + self.idCounter_++;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function replaceEntryAtIndexWith( arr, index, replacements ) {
      arr.splice.apply( arr, [ index, 1 ].concat( replacements ) );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function throwError( str, varargs /* , args, ... */ ) {
      var substitutions = [].slice.call( arguments, 1 );
      var text = Object.keys( substitutions ).reduce( function( str, key ) {
         return str.split( '[' + key + ']' ).join( substitutions[ key ] );
      }, str );

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
