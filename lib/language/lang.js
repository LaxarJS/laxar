/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [], function() {
   'use strict';

   var locale_;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Retrieves an HTML-formatted string from a message string or object.
    *
    * @param {String|Object} stringOrObject The message to transform and translate. If the corresponding
    *                                       value is a string, it is treated as html text and will be
    *                                       returned as is, otherwise it is supposed to be a HTML content
    *                                       object, i.e. a map of locale strings to HTML strings.
    *
    * @param {Object} locale The locale to use.
    *
    * @return {String} The corresponding html code.
    */
   function getHtmlText( stringOrObject, locale ) {
      if( !stringOrObject ) {
         return stringOrObject;
      }

      if( typeof stringOrObject === 'string' ) {
         return plainTextToHtml( stringOrObject );
      }

      if( !locale ) {
         locale = locale_;
      }

      if( typeof locale === 'string' ) {
         locale = localeFromString( locale );
      }

      return getTranslation( stringOrObject, locale );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Retrieves an HTML-formatted string from a message string or object.
    *
    * @param {String|Object} stringOrObject The message to transform and translate.
    * @param {Object} locale The locale to use.
    * @return {String} The corresponding plain text.
    */
   function getPlainText( stringOrObject, locale ) {
      if( !stringOrObject || typeof stringOrObject === 'string' ) {
         return stringOrObject;
      }

      if( !locale ) {
         locale = locale_;
      }

      var translation = getTranslation( stringOrObject, locale );
      if( !translation ) {
         return translation;
      }

      return htmlToPlainText( translation );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function getTranslation( htmlText, locale ) {
      if( !htmlText ) {
         return htmlText;
      }

      var text;

      if( !locale ) {
         locale = locale_;
      }

      if( typeof locale === 'string' ) {
         locale = localeFromString( locale );
      }

      locale = valuesToLowerCase( locale );
      htmlText = keysToLowerCase( htmlText );

      if( locale.variant ) {
         text = htmlText[ locale.language + '_' + locale.country + '_' + locale.variant ];
         if( text !== null && text !== undefined  ) {
            return text;
         }
      }

      if( locale.country ) {
         text = htmlText[ locale.language + '_' + locale.country ];
         if( text !== null && text !== undefined  ) {
            return text;
         }
      }

      text = htmlText[ locale.language ];

      if( text !== null && text !== undefined  ) {
         return text;
      }

      return null;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function htmlToPlainText( htmlString ) {
      var div = document.createElement( 'DIV' );
      div.innerHTML = htmlString;
      return 'textContent' in div ? div.textContent : div.innerText;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function plainTextToHtml( plainString ) {
      var div = document.createElement( 'DIV' );
      div[ 'textContent' in div ? 'textContent' : 'innerText' ] = plainString;
      return div.innerHTML;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function localeFromString( localeString ) {
      if( 'default' === localeString ) {
         return locale_;
      }

      var parts = localeString.split( '_' );

      return {
         language: parts[ 0 ],
         country: parts.length > 1 ? parts[ 1 ] : null,
         variant: parts.length > 2 ? parts[ 2 ] : null
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function valuesToLowerCase( obj ) {
      var result = {};
      for( var key in obj ) {
         if( obj.hasOwnProperty( key ) ) {
            result[ key ] = obj[ key ] ? obj[ key ].toLowerCase() : obj[ key ];
         }
      }
      return result;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function keysToLowerCase( obj ) {
      var result = {};
      for( var key in obj ) {
         if( obj.hasOwnProperty( key ) ) {
            result[ key.toLowerCase() ] = obj[ key ];
         }
      }
      return result;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      /**
       * Sets the default locale for this application.
       *
       * @param locale the default locale for this application.
       */
      setDefaultLocale: function( locale ) {
         if( typeof locale === 'string' ) {
            locale = localeFromString( locale );
         }

         locale_ = locale;
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * @returns {Locale} the default locale for this application.
       */
      getDefaultLocale: function() {
         return locale_;
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Takes a string and converts it into a locale object.
       *
       * @param {String} locale The locale formatted as a String.
       *
       * @return {Locale} the locale converted to an object.
       */
      localeFromString: localeFromString,

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Retrieves an HTML-formatted string from a message string or object.
       *
       * @param {String|Object} stringOrObject The message to transform and translate. If the corresponding
       *                                       value is a string, it is treated as html text and will be
       *                                       returned as is, otherwise it is supposed to be a HTML content
       *                                       object, i.e. a map of locale strings to HTML-formatted strings.
       *
       * @param {Object} locale The locale to use.
       *
       * @return {String} The corresponding html code.
       */
      getHtmlText: getHtmlText,

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      getPlainText: getPlainText
   };
} );