/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'underscore',
   './text_reader',
   './character'
], function( _, TextReader, Character ) {
   'use strict';

   var DEFAULT_PRECISION = -1;
   var DEFAULT_WIDTH = -1;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Creates a new instance of <code>GenericFormat</code>.
    *
    * @param {TextReader} reader The reader to read the format string from.
    * @constructor
    */
   function GenericFormat( reader ) {
      if( !reader.hasMoreInput() || reader.lookahead() !== '%' ) {
         throw new Error( 'Not a valid format string: "' + reader.inputString() + '".' );
      }

      this.hasSign_ = false;
      this.precision_ = DEFAULT_PRECISION;
      this.width_ = DEFAULT_WIDTH;
      this.hasPadding_ = false;
      this.hasGrouping_ = false;
      this.hasLeadingSpace_ = false;
      this.typeSpecifier_ = ' ';

      var startIndex = reader.position();

      reader.next();

      this.parseFlags( reader );
      this.parseWidth( reader );
      this.parsePrecision( reader );
      this.parseGrouping( reader );
      this.parseType( reader );

      this.asString_ = reader.inputString().substring( startIndex, reader.position() );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   GenericFormat.prototype.parseFlags = function( reader ) {
      while( reader.hasMoreInput() ) {
         switch( reader.lookahead() ) {
            case '+':
               reader.next();
               this.hasSign_ = true;
               break;

            case ' ':
               reader.next();
               this.hasLeadingSpace_ = true;
               break;

            case '0':
               reader.next();
               this.hasPadding_ = true;
               break;

            default:
               return;
         }
      }
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   GenericFormat.prototype.parseGrouping = function( reader ) {
      if( reader.hasMoreInput() && reader.lookahead() === '\'' ) {
         reader.next();
         this.hasGrouping_ = true;
      }
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   GenericFormat.prototype.parseType = function( reader ) {
      if( reader.hasMoreInput() ) {
         this.typeSpecifier_ = reader.next();
      }
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   GenericFormat.prototype.parseWidth = function( reader ) {
      this.width_ = this.parseInteger( reader, -1 );
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   GenericFormat.prototype.parsePrecision = function( reader ) {
      if( reader.hasMoreInput() && reader.lookahead() === '.' ) {
         reader.next();
         this.precision_ = this.parseInteger( reader, 0 );
      }
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   GenericFormat.prototype.parseInteger = function( reader, defaultValue ) {
      var string = '';

      while( reader.hasMoreInput() && Character.isDigit( reader.lookahead() ) ) {
         string += reader.next();
      }

      if( string.length === 0 ) {
         return defaultValue;
      }

      return parseInt( string, 10 );
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   GenericFormat.prototype.parseType = function( reader ) {
      if( reader.hasMoreInput() ) {
         this.typeSpecifier_ = reader.next();
      }
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   GenericFormat.prototype.hasSign = function() {
      return this.hasSign_;
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   GenericFormat.prototype.hasGrouping = function() {
      return this.hasGrouping_;
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   GenericFormat.prototype.hasPadding = function() {
      return this.hasPadding_;
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   GenericFormat.prototype.hasLeadingSpace = function() {
      return this.hasLeadingSpace_;
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   GenericFormat.prototype.precision = function() {
      return this.precision_;
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   GenericFormat.prototype.width = function() {
      return this.width_;
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   GenericFormat.prototype.typeSpecifier = function() {
      return this.typeSpecifier_;
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   GenericFormat.prototype.toString = function() {
      return this.asString_;
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      /**
       * Creates a new instance of <code>GenericFormat</code> from a C-style format string.
       *
       * @param {String|TextReader} format The format string to parse.
       *
       * @return {GenericFormat} A new instance of <code>GenericFormat</code>.
       */
      parse: function( format ) {
         if( format instanceof TextReader.TextReader ) {
            return new GenericFormat( format );
         }

         if( _.isString( format ) ) {
            return new GenericFormat( TextReader.create( format ) );
         }

         throw new Error(
            'Argument to GenericFormat.parse() must be either a String or a TextReader instance.'
         );
      }
   };
} );
