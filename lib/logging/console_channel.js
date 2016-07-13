/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
export function create( browser ) {

   return function log( messageObject ) {
      const browserConsole = browser.console();
      if( !browserConsole ) { return; }

      const { level, text, replacements, sourceInfo: { file, line } } = messageObject;

      let logMethod = level.toLowerCase();
      if( !( logMethod in browserConsole ) || logMethod === 'trace' ) {
         // In console objects trace doesn't define a valid log level but is used to print stack traces. We
         // thus need to change it something different.
         logMethod = 'log';
      }

      if( !( logMethod in browserConsole ) ) {
         return;
      }

      const callArgs = [ `${level}: ` ]
         .concat( mergeTextAndReplacements( text, replacements ) )
         .concat( [ `(@ ${file}:${line})` ] );

      browserConsole[ logMethod ]( ...callArgs );
   };

}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function mergeTextAndReplacements( text, replacements ) {
   const parts = [];
   let pos = 0;
   let buffer = '';

   while( pos < text.length ) {
      const character = text.charAt( pos );

      switch( character ) {
         case '\\': {
            ++pos;
            if( pos === text.length ) {
               throw new Error( 'Unterminated string: "' + text + '"' );
            }

            buffer += text.charAt( pos );
            break;
         }
         case '[': {
            parts.push( buffer );
            buffer = '';

            const end = text.indexOf( ']', pos );
            if( end === -1 ) {
               throw new Error( 'Unterminated replacement at character ' + pos + ': "' + text + '"' );
            }

            const replacementIndex = parseInt( text.substring( pos + 1, end ), 10 );

            parts.push( replacements[ replacementIndex ] );
            pos = end;

            break;
         }
         default: {
            buffer += character;
            break;
         }
      }

      ++pos;
   }

   if( buffer.length > 0 ) {
      parts.push( buffer );
   }

   return parts;
}
