/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import assert from '../utilities/assert';
import * as object from '../utilities/object';
import * as string from '../utilities/string';
import * as path from '../utilities/path';
import { create as createJsonValidator } from '../json/validator';
import * as featuresProvider from './features_provider';
import pageSchema from '../../static/schemas/page';
import { FLAT, COMPACT } from '../tooling/pages';

const SEGMENTS_MATCHER = /[_/-]./g;

const ID_SEPARATOR = '-';
const ID_SEPARATOR_MATCHER = /\-/g;
const SUBTOPIC_SEPARATOR = '+';

const JSON_SUFFIX_MATCHER = /\.json$/;
const COMPOSITION_EXPRESSION_MATCHER = /^(!?)\$\{([^}]+)\}$/;
const COMPOSITION_TOPIC_PREFIX = 'topic:';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function PageLoader( baseUrl, fileResourceProvider, pageCollector ) {
   this.baseUrl_ = baseUrl;
   this.fileResourceProvider_ = fileResourceProvider;
   this.idCounter_ = 0;
   this.pageToolingCollector_ = pageCollector;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

// eslint-disable-next-line valid-jsdoc
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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function loadPageRecursively( self, pageName, extensionChain ) {
   let page;
   const pageUrl = assetUrl( self.baseUrl_, pageName );

   if( extensionChain.includes( pageName ) ) {
      throwError(
         { name: pageName },
         `Cycle in page extension detected: ${extensionChain.concat( [ pageName ] ).join( ' -> ' )}`
      );
   }

   return load( self, pageUrl )
      .then( foundPage => {
         validatePage( foundPage, pageName );

         page = foundPage;
         page.name = pageName.replace( JSON_SUFFIX_MATCHER, '' );

         if( !page.areas ) {
            page.areas = {};
         }
      }, () => {
         throwError( { name: pageName }, `Page could not be found at location "${pageUrl}"` );
      } )
      .then( () => processExtends( self, page, extensionChain ) )
      .then( () => {
         generateMissingIds( self, page );
         // we need to check ids before and after expanding compositions
         checkForDuplicateIds( self, page );
         return processCompositions( self, page, pageName );
      } )
      .then( () => {
         checkForDuplicateIds( self, page );
         removeDisabledWidgets( self, page );
      } )
      .then( () => {
         self.pageToolingCollector_.collectPageDefinition( pageName, page, FLAT );
         return page;
      } );
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Processing inheritance (i.e. the `extends` keyword)
//
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function processExtends( self, page, extensionChain ) {
   if( has( page, 'extends' ) ) {
      return loadPageRecursively( self, page[ 'extends' ], extensionChain.concat( [ page.name ] ) )
         .then( basePage => {
            mergePageWithBasePage( page, basePage );
         } );
   }
   return Promise.resolve();
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function mergePageWithBasePage( page, basePage ) {
   const extendingAreas = page.areas;
   const mergedPageAreas = object.deepClone( basePage.areas );
   if( has( basePage, 'layout' ) ) {
      if( has( page, 'layout' ) ) {
         throwError( page, string.format( 'Page overwrites layout set by base page "[name]', basePage ) );
      }
      page.layout = basePage.layout;
   }

   object.forEach( extendingAreas, ( widgets, areaName ) => {
      if( !( areaName in mergedPageAreas ) ) {
         mergedPageAreas[ areaName ] = widgets;
         return;
      }

      mergeWidgetLists( mergedPageAreas[ areaName ], widgets, page );
   } );

   page.areas = mergedPageAreas;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Processing compositions
//
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function processCompositions( self, topPage, topPageName ) {

   return processNestedCompositions( topPage, null, [] );

   function processNestedCompositions( page, instanceId, compositionChain ) {

      let promise = Promise.resolve();

      object.forEach( page.areas, widgets => {
         widgets.slice().reverse().forEach( widgetSpec => {
            if( widgetSpec.enabled === false ) {
               return;
            }
            ensureWidgetSpecHasId( self, widgetSpec );

            if( !has( widgetSpec, 'composition' ) ) {
               return;
            }
            const compositionName = widgetSpec.composition;
            if( compositionChain.includes( compositionName ) ) {
               const chainString = compositionChain.concat( [ compositionName ] ).join( ' -> ' );
               const message = `Cycle in compositions detected: ${chainString}`;
               throwError( topPage, message );
            }

            // Loading compositionUrl can be started asynchronously, but replacing the according widgets
            // in the page needs to take place in order. Otherwise the order of widgets could be messed
            // up.
            promise = promise
               .then( () => load( self, assetUrl( self.baseUrl_, compositionName ) ) )
               .then( composition => prefixCompositionIds( composition, widgetSpec ) )
               .then( composition =>
                  processCompositionExpressions( composition, widgetSpec, message => {
                     throwError(
                        { name: page.name },
                        `Error loading composition "${compositionName}" (id: "${widgetSpec.id}"). ${message}`
                     );
                  } )
               )
               .then( composition => {
                  const chain = compositionChain.concat( compositionName );
                  return processNestedCompositions( composition, widgetSpec.id, chain )
                     .then( () => {
                        self.pageToolingCollector_.collectCompositionDefinition(
                           topPageName,
                           widgetSpec.id,
                           composition,
                           FLAT
                        );
                        return composition;
                     } );
               } )
               .then( composition => {
                  mergeCompositionAreasWithPageAreas( composition, page, widgets, widgetSpec );
               } );
         } );
      } );

      // now that all IDs have been created, we can store a copy of the page prior to composition expansion
      if( page === topPage ) {
         self.pageToolingCollector_.collectPageDefinition( topPageName, page, COMPACT );
      }
      else {
         self.pageToolingCollector_.collectCompositionDefinition( topPageName, instanceId, page, COMPACT );
      }

      return promise;
   }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function mergeCompositionAreasWithPageAreas( composition, page, widgets, compositionSpec ) {
   object.forEach( composition.areas, ( compositionAreaWidgets, areaName ) => {
      if( areaName === '.' ) {
         insertAfterEntry( widgets, compositionSpec, compositionAreaWidgets );
         return;
      }

      if( !( areaName in page.areas ) ) {
         page.areas[ areaName ] = compositionAreaWidgets;
         return;
      }

      mergeWidgetLists( page.areas[ areaName ], compositionAreaWidgets, page );
   } );

   removeEntry( widgets, compositionSpec );

   function insertAfterEntry( arr, entry, replacements ) {
      const index = arr.indexOf( entry );
      arr.splice( index, 0, ...replacements );
   }

   function removeEntry( arr, entry ) {
      const index = arr.indexOf( entry );
      arr.splice( index, 1 );
   }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function prefixCompositionIds( composition, widgetSpec ) {
   const prefixedAreas = {};
   object.forEach( composition.areas, ( widgets, areaName ) => {
      widgets.forEach( widget => {
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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function processCompositionExpressions( composition, widgetSpec, throwPageError ) {
   const expressionData = {};

   // feature definitions in compositions may contain generated topics for default resource names or action
   // topics. As such these are generated before instantiating the composition's features.
   composition.features = iterateOverExpressions( composition.features || {}, replaceExpression );
   expressionData.features = featuresProvider.featuresForWidget( composition, widgetSpec, throwPageError );

   if( typeof composition.mergedFeatures === 'object' ) {
      const mergedFeatures = iterateOverExpressions( composition.mergedFeatures, replaceExpression );

      Object.keys( mergedFeatures ).forEach( featurePath => {
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

      const possibleNegation = matches[ 1 ];
      const expression = matches[ 2 ];
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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function iterateOverExpressions( obj, replacer ) {
   if( obj === null ) {
      return obj;
   }

   if( Array.isArray( obj ) ) {
      return obj
         .map( value => {
            if( typeof value === 'object' ) {
               return iterateOverExpressions( value, replacer );
            }

            return typeof value === 'string' ? replacer( value ) : value;
         } )
         .filter( _ => _ !== undefined );
   }

   const result = {};
   object.forEach( obj, ( value, key ) => {
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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Additional Tasks
//
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function removeDisabledWidgets( self, page ) {
   object.forEach( page.areas, ( widgetList, index ) => {
      page.areas[ index ] = widgetList.filter( widgetSpec => widgetSpec.enabled !== false );
   } );
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function checkForDuplicateIds( self, page ) {
   const idCount = {};

   object.forEach( page.areas, widgetList => {
      object.forEach( widgetList, widgetSpec => {
         idCount[ widgetSpec.id ] = idCount[ widgetSpec.id ] ? idCount[ widgetSpec.id ] + 1 : 1;
      } );
   } );

   const duplicates = Object.keys( idCount ).filter( widgetId => idCount[ widgetId ] > 1 );

   if( duplicates.length ) {
      throwError( page, `Duplicate widget/composition ID(s): ${duplicates.join( ', ' )}` );
   }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function generateDefaultWidgetSpecName( widgetSpec ) {
   return artifactName().replace( SEGMENTS_MATCHER, dashToCamelcase );

   function artifactName() {
      if( widgetSpec.hasOwnProperty( 'widget' ) ) {
         return widgetSpec.widget.split( '/' ).pop();
      }
      if( widgetSpec.hasOwnProperty( 'composition' ) ) {
         return widgetSpec.composition;
      }
      if( widgetSpec.hasOwnProperty( 'layout' ) ) {
         return widgetSpec.layout;
      }
      // Assume that non-standard items do not require a specific name.
      return '';
   }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function ensureWidgetSpecHasId( self, widgetSpec ) {
   if( widgetSpec.hasOwnProperty( 'id' ) ) {
      return;
   }
   widgetSpec.id = nextId( self, generateDefaultWidgetSpecName( widgetSpec ) );
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function generateMissingIds( self, page ) {
   object.forEach( page.areas, widgetList => {
      object.forEach( widgetList, widgetSpec => {
         ensureWidgetSpecHasId( self, widgetSpec );
      } );
   } );
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function validatePage( foundPage, pageName ) {
   const errors = createJsonValidator( pageSchema ).validate( foundPage );
   if( errors.length ) {
      const errorString = errors
         .reduce( ( errorString, errorItem ) => `${errorString}\n - ${errorItem.message}`, '' );

      throwError( { name: pageName }, `Schema validation failed: ${errorString}` );
   }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Common functionality and utility functions
//
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function mergeWidgetLists( targetList, sourceList, page ) {
   sourceList.forEach( widgetConfiguration => {
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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function assetUrl( base, asset ) {
   const suffix = asset.match( JSON_SUFFIX_MATCHER ) ? '' : '.json';
   return path.join( base, asset + suffix );
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function has( object, what ) {
   return typeof object[ what ] === 'string' && object[ what ].length;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function load( self, url ) {
   return self.fileResourceProvider_.provide( url );
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function nextId( self, prefix ) {
   return `${prefix}${ID_SEPARATOR}id${self.idCounter_++}`;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function dashToCamelcase( segmentStart ) {
   return segmentStart.charAt( 1 ).toUpperCase();
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function topicFromId( id ) {
   return id.replace( ID_SEPARATOR_MATCHER, SUBTOPIC_SEPARATOR ).replace( SEGMENTS_MATCHER, dashToCamelcase );
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function throwError( page, message ) {
   const text = string.format( 'Error loading page "[name]": [0]', [ message ], page );
   throw new Error( text );
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates and returns a new page loader instance.
 *
 * @param {String} baseUrl
 *    the url where all pages are located
 * @param {FileResourceProvider} fileResourceProvider
 *    a FileResourceProvider to load application assets
 * @param {PagesCollector} pagesCollector
 *    a tooling collector to consume page and composition information
 *
 * @return {PageLoader}
 *    a page loader instance
 *
 * @private
 */
export function create( baseUrl, fileResourceProvider, pagesCollector ) {
   assert( baseUrl ).isNotNull();
   assert( fileResourceProvider ).isNotNull();

   return new PageLoader( baseUrl, fileResourceProvider, pagesCollector );
}
