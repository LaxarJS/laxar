/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

export function create() {
   const mergedCssFileLoaded = Array.from( document.getElementsByTagName( 'link' ) )
      .some( link => link.hasAttribute( 'data-ax-merged-css' ) );

   if( mergedCssFileLoaded ) {
      return { load() {} };
   }

   const loadedFiles = [];
   return {
      /**
       * If not already loaded, loads the given file into the current page by appending a `link` element to
       * the document's `head` element.
       *
       * @param {String} url
       *    the url of the css file to load. If `null`, loading is skipped
       */
      load( url ) {
         if( !loadedFiles.includes( url ) ) {
            const element = document.createElement( 'link' );
            element.type = 'text/css';
            element.id = `cssLoaderStyleSheet${loadedFiles.length}`;
            element.rel = 'stylesheet';
            element.href = url;
            document.getElementsByTagName( 'head' )[ 0 ].appendChild( element );

            loadedFiles.push( url );
         }
      }
   };
}
