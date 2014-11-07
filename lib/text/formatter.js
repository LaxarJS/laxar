/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'underscore',
   './generic_format',
   './number_formatter',
   './string_formatter',
   './object_formatter',
   './text_reader'
], function( _, GenericFormat, NumberFormatter, StringFormatter, ObjectFormatter, TextReader ) {
   'use strict';

   function Formatter() {
      this.formatters_ = {};

      for( var i = 0; i < arguments.length; ++i ) {
         var formatterPlugin = arguments[ i ];
         this.formatters_[ formatterPlugin.typeSpecifier ] = formatterPlugin;
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   Formatter.prototype.getValueFormatter = function( value, genericFormat ) {
      if( _.isFunction( value.getFormatter ) ) {
         return value.getFormatter();
      }

      if( _.isUndefined( genericFormat ) ) {
         return null;
      }

      var formatterSpec = this.formatters_[ genericFormat.typeSpecifier() ];
      if( _.isUndefined( formatterSpec ) ) {
         throw new Error( 'Unknown type specifier in format string "' + genericFormat.toString() + '".' );
      }
      return formatterSpec.formatter;
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   Formatter.prototype.formatPart = function( value, genericFormat ) {
      if( _.isUndefined( value ) ) {
         return 'undefined';
      }

      if( _.isNull( value ) ) {
         return 'null';
      }

      var formatter = this.getValueFormatter( value, genericFormat );
      if( formatter ) {
         return formatter.format( value, genericFormat );
      }

      if( _.isFunction( value.toString ) ) {
         return value.toString();
      }

      return '' + value;
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * @param {Object} value        The value to format
    * @param {String} formatString The format string
    *
    * @return {String} The formatted value.
    */
   Formatter.prototype.format = function( value, formatString ) {
      if( _.isUndefined( formatString ) || null === formatString ) {
         return this.formatPart( value );
      }

      var reader = TextReader.create( formatString );
      var result = '';

      while( reader.hasMoreInput() ) {
         switch( reader.lookahead() ) {
            case '\\':
               reader.next();
               result += reader.next();
               break;

            case '%':
               if( reader.inputString().length - reader.position() > 1 ) {
                  if( reader.lookahead( 1 ) === '%' ) {
                     result += '%';
                     reader.skip( 2 );
                     break;
                  }
               }

               if( _.isUndefined( value ) || _.isNull( value ) ) {
                  reader.next();
                  result += 'null';
               }
               else {
                  result += this.formatPart( value, GenericFormat.parse( reader ) );
               }
               break;

            default:
               result += reader.next();
               break;
         }
      }

      return result;
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createFormatterSpec( typeSpecifier, formatter ) {
      return {
         typeSpecifier: typeSpecifier,
         formatter: formatter
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {

      /**
       * Creates a new instance of <code>Formatter</code> that can be used to parse an arbitrary string
       * containing optional format directives (e.g. &quot;Hello %s!&quot;)
       *
       * @param {...{ typeSpecifier: String, formatter: Object } } partFormatter
       *                The actual formatter(s). Each record must have a <i>typeSpecifier</i> field
       *                corresponding to the respective type specifier used in the format
       *                string (e.g 's' if the format string was '%s') and a <i>formatter</i>.
       *
       *                You can add multiple part formatters.
       *
       * @constructor
       */
      create: function( partFormatter /*, ... */ ) {
         return new Formatter( arguments );
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * @return {Formatter} A formatter that knows all standard formatters.
       */
      standard: function() {
         return new Formatter( createFormatterSpec( 'f', NumberFormatter.create() ),
                               createFormatterSpec( 's', StringFormatter.create() ),
                               createFormatterSpec( 'o', ObjectFormatter.create() ) );
      }

   };

} );
