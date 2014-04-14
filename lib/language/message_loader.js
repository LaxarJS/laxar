/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'underscore',
   './lang'
], function( _, lang ) {
   'use strict';

   var Q_;
   var fileResourceProvider_;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function provideMessages( baseUrls, locale ) {
      if( !locale || 'default' === locale ) {
         locale = lang.getDefaultLocale();
      }
      else if( locale instanceof String ) {
         locale = lang.localeFromString( locale );
      }

      var language = locale.language.toLowerCase();
      var country;
      var variant;

      var fileCandidates = [];

      _.each( baseUrls, function( baseUrl ) {
         if( locale.country ) {
            country = locale.country.toLowerCase();

            if( locale.variant ) {
               variant = locale.variant.toLowerCase();
               fileCandidates.push( baseUrl + language + '_' + country + '_' + variant );
            }

            fileCandidates.push( baseUrl + language + '_' + country );
         }

         fileCandidates.push( baseUrl + language );
      } );

      return loadAllMessages( fileCandidates, [] ).then(
         function( results ) {
            return mergeMessages( results );
         }
      );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function mergeMessages( messageSets ) {
      var messages = {};

      for( var i = messageSets.length - 1; i >= 0; --i ) {
         if( messageSets[ i ] ) {
            messages = _.extend( messages, messageSets[ i ] );
         }
      }

      return messages;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function loadAllMessages( fileCandidates, results ) {
      var path = _.first( fileCandidates ) + '.json';
      var remaining = _.rest( fileCandidates );

      return fileResourceProvider_.provide( path ).then(
         function successHandler( messages ) {
            results.push( messages );

            if( remaining.length === 0 ) {
               return results;
            }

            return loadAllMessages( remaining, results );
         },
         function errorHandler( /*error*/ ) {
            if( remaining.length === 0 ) {
               return results;
            }

            return loadAllMessages( remaining, results );
         } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      init: function( Q, fileResourceProvider ) {
         if( !Q ) {
            throw new Error( 'Need a promise factory implementation conforming to $q' );
         }

         if( !fileResourceProvider ) {
            throw new Error( 'Need a file resource provider' );
         }

         Q_ = Q;
         fileResourceProvider_ = fileResourceProvider;
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      provideMessages: provideMessages
   };
} );