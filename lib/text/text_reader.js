/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../utilities/assert',
   './character'
], function( assert, Character ) {
   'use strict';

   /**
    * Creates a new instance of <code>TextReader</code>.
    *
    * @param text {String} The text to be parsed by the <code>TextReader</code>.
    *
    * @constructor
    */
   function TextReader( text ) {
      this.inputString_ = text;
      this.index_ = 0;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Checks if the input string has more data available.
    *
    * @param {Number} [optionalCount] If present, specifies the minimum number of characters that must be
    *                               ahead for this method to return <code>true</code>. If not present,
    *                               this parameter is assumed to be 1.
    *
    * @returns {Boolean} <code>true</code>, if there are at least <i>optionalCount</i> (or 1, if no
    *                   explicit count was specified) more characters available.
    */
   TextReader.prototype.hasMoreInput = function( optionalCount ) {
      if( optionalCount ) {
         return this.index_ + optionalCount < this.inputString_.length;
      }

      return this.index_ < this.inputString_.length;
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Checks if the remainder at the current read position starts with the specified prefix.
    *
    * @param prefix The prefix to test against.
    *
    * @returns {Boolean} <code>true</code>, if the remainder at the current read position starts with
    *                    <i>prefix</i>, otherwise <code>false</code>.
    */
   TextReader.prototype.test = function( prefix ) {
      if( prefix.length === 1 ) {
         return this.hasMoreInput() && this.lookahead() === prefix.charAt( 0 );
      }

      if( this.inputString_.length - this.index_ < prefix.length ) {
         return false;
      }

      for( var i = this.index_, k = 0; k < prefix.length; ++k, ++i ) {
         if( prefix.charAt( k ) !== this.inputString_.charAt( i ) ) {
            return false;
         }
      }

      return true;
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    *
    * @param {Number} [optionalCount] The number of characters to look ahead. Defaults to 0 which refers to
    *                               the character at the current read position.
    *
    * @returns {String} The character at the lookahead position.
    */
   TextReader.prototype.lookahead = function( optionalCount ) {
      var position = this.index_ + ( optionalCount || 0 );
      if( position < this.inputString_.length ) {
         return this.inputString_.charAt( position );
      }

      throw new Error( 'Trying to read beyond end of string.' );
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * @return {String}
    */
   TextReader.prototype.next = function() {
      var ch = this.lookahead();
      ++this.index_;
      return ch;
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Skips all whitespace characters starting at the current read position.
    */
   TextReader.prototype.skipWhitespace = function() {
      while( this.hasMoreInput() && Character.isWhitespace( this.lookahead() ) ) {
         this.next();
      }
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Returns the remainder at the current read position.
    *
    * @returns {String} The remainder at the current read position.
    */
   TextReader.prototype.remainder = function() {
      return this.inputString_.substring( this.index_ );
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Returns the original input string.
    *
    * @returns {String} The original input string.
    */
   TextReader.prototype.inputString = function() {
      return this.inputString_;
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Returns the current read position.
    *
    * @returns {Number} The current read position.
    */
   TextReader.prototype.position = function() {
      return this.index_;
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Skips <i>numberOfCharacters</i> starting at the current read position.
    *
    * @param numberOfCharacters The number of characters to skip.
    */
   TextReader.prototype.skip = function( numberOfCharacters ) {
      this.index_ += numberOfCharacters;

      if( this.index_ > this.inputString_.length ) {
         this.index_ = this.inputString_.length;
      }
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      /**
       * Creates a new instance of <code>TextReader</code>.
       *
       * @param text {String} The text to be parsed by the <code>TextReader</code>.
       *
       * @return {TextReader} A new instance of <code>TextReader</code>.
       */
      create: function( text ) {
         assert( text ).hasType( String ).isNotNull();

         return new TextReader( text );
      },

      TextReader: TextReader
   };
} );
