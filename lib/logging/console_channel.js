/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
let winConsole;
export function log( messageObject ) {
   if( !window.console ) { return; }
   winConsole = window.console;

   var logMethod = messageObject.level.toLowerCase();
   if( !( logMethod in winConsole ) || logMethod === 'trace' ) {
      // In console objects trace doesn't define a valid log level but is used to print stack traces. We
      // thus need to change it something different.
      logMethod = 'log';
   }

   if( !( logMethod in winConsole ) ) {
      return;
   }

   var callArgs = [ messageObject.level + ': ' ];
   callArgs = callArgs.concat( mergeTextAndReplacements( messageObject.text, messageObject.replacements ) );
   callArgs.push( '(@ ' + messageObject.sourceInfo.file + ':' + messageObject.sourceInfo.line + ')' );
   callConsole( logMethod, callArgs );
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function callConsole( method, messageParts ) {
   // MSIE8 does not support console.log.apply( ... )
   // The following call is equivalent to: console[ method ].apply( console, args );
   Function.apply.apply( winConsole[ method ], [ winConsole, messageParts ] );
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function mergeTextAndReplacements( text, replacements ) {
   var pos = 0;
   var character;
   var buffer = '';
   var parts = [];

   while( pos < text.length ) {
      character = text.charAt( pos );

      switch( character ) {
         case '\\':
            ++pos;
            if( pos === text.length ) {
               throw new Error( 'Unterminated string: "' + text + '"' );
            }

            buffer += text.charAt( pos );
            break;

         case '[':
            parts.push( buffer );
            buffer = '';

            var end = text.indexOf( ']', pos );
            if( end === -1 ) {
               throw new Error( 'Unterminated replacement at character ' + pos + ': "' + text + '"' );
            }

            var replacementIndex = parseInt( text.substring( pos + 1, end ), 10 );

            parts.push( replacements[ replacementIndex ] );
            pos = end;

            break;

         default:
            buffer += character;
            break;
      }

      ++pos;
   }

   if( buffer.length > 0 ) {
      parts.push( buffer );
   }

   return parts;
}
