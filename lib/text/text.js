/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'underscore',
   '../utilities/string',
   './text_reader',
   './formatter',
   './object_formatter',
   './character'
], function( _, stringUtils, TextReader, Formatter, ObjectFormatter, Character ) {
   'use strict';

   var standardFormatter_ = Formatter.standard();

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createTextArgument( name, value ) {
      return {
         name: name,
         value: value,

         getFormatter: function() {
            return {
               'format': function( textArgument, genericFormat ) {
                  return formatValue( textArgument.value, genericFormat ? genericFormat.toString()
                     : null );
               }
            };
         }
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function isInt( string ) {
      if( string.length === 0 ) {
         return false;
      }

      for( var i = 0; i < string.length; ++i ) {
         if( !Character.isDigit( string.charAt( i ) ) ) {
            return false;
         }
      }

      return true;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function isTextArgument( argument ) {
      return _.isString( argument.name ) && !_.isUndefined( argument.value );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function retrieveArgument( argumentName, context ) {
      if( !_.isString( argumentName ) ) {
         throw 'Invalid argument: ' + argumentName;
      }

      if( isInt( argumentName ) ) {
         // The first argument is the message itself!
         var index = parseInt( argumentName, 10 ) + 1;

         if( index < 1 || index >= context.args.length ) {
            throw new Error( 'Invalid argument reference "[' + argumentName + ']".' );
         }

         return context.args[ parseInt( argumentName, 10 ) + 1 ];
      }

      for( var i = 1; i < context.args.length; ++i ) {
         var argument = context.args[ i ];

         if( isTextArgument( argument ) && argument.name === argumentName ) {
            return argument.value;
         }
      }

      throw new Error( 'Invalid argument reference "[' + argumentName + ']".' );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function formatValue( value, formatString ) {
      return standardFormatter_.format( value, formatString );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function resolveArgument( argumentName, context, formatString ) {
      var argumentValue = retrieveArgument( argumentName, context );
      context.result += formatValue( argumentValue, formatString );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function parseFormatString( reader ) {
      var format = '';

      while( reader.hasMoreInput() ) {
         var ch = reader.lookahead();

         if( ch === '\\' ) {
            if( !reader.hasMoreInput() ) {
               throw new Error( 'Premature end of string: "' + reader.inputString() + '".' );
            }

            reader.next();
            format += reader.next();
         }
         else if( ch === ']' ) {
            return format;
         }
         else {
            format += reader.next();
         }
      }

      return format;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function parsePlaceHolder( reader, context ) {
      reader.next();

      var argumentName = '';
      var format = null;

      while( reader.hasMoreInput() ) {
         var ch = reader.next();

         if( ch === '\\' ) {
            if( !reader.hasMoreInput() ) {
               throw new Error( 'Premature end of string: "' + reader.inputString() + '".' );
            }
            argumentName += reader.next();
         }
         else if( ch === ':' ) {
            format = parseFormatString( reader );
         }
         else if( ch === ']' ) {
            resolveArgument( argumentName.trim(), context, format );
            return;
         }
         else {
            argumentName += ch;
         }
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function parseText( context ) {
      var reader = TextReader.create( context.message );

      while( reader.hasMoreInput() ) {
         var ch = reader.lookahead();

         if( ch === '\\' ) {
            reader.next();
            context.result += reader.next();
         }
         else if( '[' === ch ) {
            parsePlaceHolder( reader, context );
         }
         else {
            context.result += reader.next();
         }
      }

      return context.result;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function format( message, arg1 ) {
      var context = {
         message: message,
         args: _.toArray( arguments ),
         result: ''
      };

      return parseText( context );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      /**
       * Creates a named argument for {@link format}.
       *
       * @param name  The name of the named argument.
       * @param value The value of the named argument.
       *
       * @return {Object} A named argument.
       */
      argument: createTextArgument,

      /**
       * Formats a message with optional placeholders. Placeholders can be either numbers or names
       * referencing the arguments passed to <code>format()</code> after the actual message string.
       * If the placeholder is a number, it is interpreted as the positional index of the corresponding
       * argument, otherwise it is the name of a named argument (see {@link argument}).
       *
       * <p>The advantage of using named arguments is that the arguments need not occur in a pre-defined
       * order.</p>
       *
       * <p>Placeholders must be surrounded with angle brackets.</p>
       *
       * @example
       * var text = Text.format( "Hello, [adjective] [0]!",
       *                         "World",
       *                         Text.argument( "adjective", "cruel" ) );
       */
      format: format,


      createObjectFormatter: ObjectFormatter.create
   };
} );
