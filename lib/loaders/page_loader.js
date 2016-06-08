/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import assert from '../utilities/assert';
import * as object from '../utilities/object';
import * as string from '../utilities/string';
import * as path from '../utilities/path';
import * as jsonValidator from '../json/validator';
import * as featuresProvider from './features_provider';
import pageTooling from '../tooling/pages';
import pageSchema from '../../static/schemas/page';

const SEGMENTS_MATCHER = /[_/-]./g;

const ID_SEPARATOR = '-';
const ID_SEPARATOR_MATCHER = /\-/g;
const SUBTOPIC_SEPARATOR = '+';

const JSON_SUFFIX_MATCHER = /\.json$/;
const COMPOSITION_EXPRESSION_MATCHER = /^(!?)\$\{([^}]+)\}$/;
const COMPOSITION_TOPIC_PREFIX = 'topic:';

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function PageLoader( baseUrl, fileResourceProvider ) {
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
PageLoader.prototype.load = function( pageName ) {
   return loadPageRecursively( this, pageName, [] );
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function loadPageRecursively( self, pageName, extensionChain ) {
   let page;
   const pageUrl = assetUrl( self.baseUrl_, pageName );

   if( extensionChain.indexOf( pageName ) !== -1 ) {
      throwError(
         { name: pageName },
         'Cycle in page extension detected: ' + extensionChain.concat( [ pageName ] ).join( ' -> ' )
      );
   }

   return load( self, pageUrl )
      .then( function( foundPage ) {
         validatePage( foundPage, pageName );

         page = foundPage;
         page.name = pageName.replace( JSON_SUFFIX_MATCHER, '' );

         if( !page.areas ) {
            page.areas = {};
         }
      }, function() {
         throwError( { name: pageName }, 'Page could not be found at location "' + pageUrl + '"' );
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
   const extendingAreas = page.areas;
   const mergedPageAreas = object.deepClone( basePage.areas );
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

      let promise = Promise.resolve();
      const seenCompositionIdCount = {};

      object.forEach( page.areas, function( widgets ) {
         /*jshint loopfunc:true*/
         for( let i = widgets.length - 1; i >= 0; --i ) {
            ( function( widgetSpec, index ) {
               if( widgetSpec.enabled === false ) {
                  return;
               }

               if( has( widgetSpec, 'widget' ) ) {
                  if( !has( widgetSpec, 'id' ) ) {
                     const widgetName = widgetSpec.widget.split( '/' ).pop();
                     widgetSpec.id = nextId( self, widgetName.replace( SEGMENTS_MATCHER, dashToCamelcase ) );
                  }
                  return;
               }

               if( has( widgetSpec, 'composition' ) ) {
                  const compositionName = widgetSpec.composition;
                  if( compositionChain.indexOf( compositionName ) !== -1 ) {
                     const message = 'Cycle in compositions detected: ' +
                                   compositionChain.concat( [ compositionName ] ).join( ' -> ' );
                     throwError( topPage, message );
                  }

                  if( !has( widgetSpec, 'id' ) ) {
                     const escapedCompositionName =
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
                        return processCompositionExpressions( composition, widgetSpec,  function( message ) {
                           const messagePrefix =
                              'Error loading composition "' + compositionName + '"' +
                              ' (id: "' + widgetSpec.id + '"). ';
                           throwError( { name: page.name }, messagePrefix + message );
                        } );
                     } )
                     .then( function( composition ) {
                        const chain = compositionChain.concat( compositionName );
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
   const prefixedAreas = {};
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
   const expressionData = {};

   // feature definitions in compositions may contain generated topics for default resource names or action
   // topics. As such these are generated before instantiating the composition's features.
   composition.features = iterateOverExpressions( composition.features || {}, replaceExpression );
   expressionData.features = featuresProvider.featuresForWidget( composition, widgetSpec, throwPageError );

   if( typeof composition.mergedFeatures === 'object' ) {
      const mergedFeatures = iterateOverExpressions( composition.mergedFeatures, replaceExpression );

      Object.keys( mergedFeatures ).forEach( function( featurePath ) {
         const currentValue = object.path( expressionData.features, featurePath, [] );
         const values = mergedFeatures[ featurePath ];
         object.setPath( expressionData.features, featurePath, values.concat( currentValue ) );
      } );
   }

   composition.areas = iterateOverExpressions( composition.areas, replaceExpression );

   function replaceExpression( subject ) {
      const matches = subject.match( COMPOSITION_EXPRESSION_MATCHER );
      if( !matches ) {
         return subject;
      }

      const possibleNegation = matches[1];
      const expression = matches[2];
      let result;
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

   const result = {};
   object.forEach( obj, function( value, key ) {
      const replacedKey = replacer( key );
      if( typeof value === 'object' ) {
         result[ replacedKey ] = iterateOverExpressions( value, replacer );
         return;
      }

      const replacedValue = typeof value === 'string' ? replacer( value ) : value;
      if( typeof replacedValue !== 'undefined' ) {
         result[ replacedKey ] = replacedValue;
      }
   } );

   return result;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function checkForDuplicateCompositionIds( page, idCount ) {
   const duplicates = Object.keys( idCount ).filter( function( compositionId ) {
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
   const idCount = {};

   object.forEach( page.areas, function( widgetList, index ) {
      page.areas[ index ] = widgetList.filter( function( widgetSpec ) {
         if( widgetSpec.enabled === false ) {
            return false;
         }
         idCount[ widgetSpec.id ] = idCount[ widgetSpec.id ] ? idCount[ widgetSpec.id ] + 1 : 1;
         return true;
      } );
   } );

   const duplicates = Object.keys( idCount ).filter( function( widgetId ) {
      return idCount[ widgetId ] > 1;
   } );

   if( duplicates.length ) {
      throwError( page, 'Duplicate widget ID(s): ' + duplicates.join( ', ' ) );
   }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function validatePage( foundPage, pageName ) {
   const result = jsonValidator.create( pageSchema ).validate( foundPage );
   if( result.errors.length ) {
      const errorString = result.errors.reduce( function( errorString, errorItem ) {
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
         for( let i = 0, length = targetList.length; i < length; ++i ) {
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
   const text = string.format( 'Error loading page "[name]": [0]', [ message ], page );
   throw new Error( text );
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates and returns a new page loader instance.
 *
 * @param {String} baseUrl
 *    the url where all pages are located
 * @param {FileResourceProvider} fileResourceProvider
 *    a FileResourceProvider to load application assets

 * @return {PageLoader}
 *    a page loader instance
 *
 * @private
 */
export function create( baseUrl, fileResourceProvider ) {
   assert( baseUrl ).isNotNull();
   assert( fileResourceProvider ).isNotNull();

   return new PageLoader( baseUrl, fileResourceProvider );
}
