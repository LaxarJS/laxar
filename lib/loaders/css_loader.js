/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { forEach } from '../utilities/object';
import * as path from '../utilities/path';

export function create( configuration, themeManager, productPath ) {
   const mergedCssFileLoaded = Array.from( document.getElementsByTagName( 'link' ) )
      .some( link => link.hasAttribute( 'data-ax-merged-css' ) );

   if( mergedCssFileLoaded ) {
      return { load() {} };
   }

   const loadedFiles = [];
   const loader = {
      /**
       * If not already loaded, loads the given file into the current page by appending a `link` element to
       * the document's `head` element.
       *
       * Additionally it works around a
       * [style sheet limit](http://support.microsoft.com/kb/262161) in older Internet Explorers
       * (version < 10). The workaround is based on
       * [this test](http://john.albin.net/ie-css-limits/993-style-test.html).
       *
       * @param {String} url
       *    the url of the css file to load
       *
       * @memberOf axCssLoader
       */
      load( url ) {

         if( loadedFiles.indexOf( url ) === -1 ) {
            if( hasStyleSheetLimit() ) {
               // Here we most probably have an Internet Explorer having the limit of at most 31 stylesheets
               // per page. As a workaround we use style tags with import statements. Each style tag may
               // have 31 import statement. This gives us 31 * 31 = 961 possible stylesheets to include ...
               // Link to the problem on microsoft.com: http://support.microsoft.com/kb/262161
               // Solution based on ideas found here: http://john.albin.net/css/ie-stylesheets-not-loading

               const styleManagerId = 'cssLoaderStyleSheet' + Math.floor( loadedFiles.length / 30 );
               if( !document.getElementById( styleManagerId ) ) {
                  addHeadElement( 'style', {
                     type: 'text/css',
                     id: styleManagerId
                  } );
               }

               document.getElementById( styleManagerId ).styleSheet.addImport( url );
            }
            else {
               addHeadElement( 'link', {
                  type: 'text/css',
                  id: 'cssLoaderStyleSheet' + loadedFiles.length,
                  rel: 'stylesheet',
                  href: url
               } );
            }

            loadedFiles.push( url );
         }
      }
   };

   if( configuration.get( 'useMergedCss', false ) ) {
      loader.load( path.join( productPath, 'const/static/css', themeManager.getTheme() + '.theme.css' ) );
      return { load() {} };
   }

   return loader;

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   function hasStyleSheetLimit() {
      if( typeof hasStyleSheetLimit.result !== 'boolean' ) {
         hasStyleSheetLimit.result = false;
         if( document.createStyleSheet ) {
            const uaMatch = navigator.userAgent.match( /MSIE ?(\d+(\.\d+)?)[^\d]/i );
            if( !uaMatch || parseFloat( uaMatch[ 1 ] ) < 10 ) {
               // There is no feature test for this problem without running into it. We therefore test
               // for a browser knowing document.createStyleSheet (should only be IE) and afterwards check,
               // if it is a version prior to 10 as the problem is fixed since that version. In any other
               // case we assume the worst case and trigger the hack for limited browsers.
               hasStyleSheetLimit.result = true;
            }
         }
      }
      return hasStyleSheetLimit.result;
   }

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   function addHeadElement( elementName, attributes ) {
      const element = document.createElement( elementName );
      forEach( attributes, ( val, key ) => {
         element[ key ] = val;
      } );
      document.getElementsByTagName( 'head' )[ 0 ].appendChild( element );
   }
}
