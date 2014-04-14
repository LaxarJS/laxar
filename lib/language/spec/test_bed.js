/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'underscore',
   '../language_shim',
   '../../testing/portal_mocks',
   '../../file_resource_provider/file_resource_provider',
   './data/data'
], function( _, language, portalMocks, fileResourceProvider, data ) {
   'use strict';

   function TestBed() {
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   TestBed.prototype.setup = function( dataSetName ) {
      var self = this;

      self.qMock = portalMocks.mockQ();
      self.eventBusMock = portalMocks.mockEventBus();
      self.httpMock = portalMocks.mockHttp( self.qMock );
      self.dataSet = data[ dataSetName ];
      self.dataSetName = dataSetName;
      self.language = language;

      this.fileResourceProvider = mockFileResourceProvider( self.qMock, dataSetName, self.dataSet );
      jasmine.Clock.useMock();

      self.setLocale = function( locale ) {
         language.init( self.qMock, self.fileResourceProvider, self.eventBusMock, locale );
      };
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   TestBed.prototype.tearDown = function() {
      this.qMock = null;
      this.httpMock = null;
      this.dataSet = null;
      this.eventBusMock = null;
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   TestBed.prototype.loadMessagesForLocale = function( localeString ) {
      language.init( this.qMock, this.fileResourceProvider, this.eventBusMock, parseLocale( localeString ) );

      var self = this;
      language.provideMessages( [ this.dataSetName ] ).then(
         function( messages ) {
            self.messages = messages;
         }
      );

      jasmine.Clock.tick( 101 );
      return this.messages;
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function parseLocale( localeString ) {
      var locale = {};

      var indexOfCountry = localeString.indexOf( '_' );
      if( indexOfCountry === -1 ) {
         locale.language = localeString;
         return locale;
      }

      locale.language = localeString.substring( 0, indexOfCountry );
      ++indexOfCountry;

      var indexOfVariant = localeString.indexOf( '_', indexOfCountry );
      if( indexOfVariant === -1 ) {
         locale.country = localeString.substring( indexOfCountry );
         return locale;
      }

      locale.country = localeString.substring( indexOfCountry, indexOfVariant );
      ++indexOfVariant;

      locale.variant = localeString.substring( indexOfVariant );
      return locale;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function mockFileResourceProvider( Q, baseName, dataSet ) {
      var paths_ = {};

      var result = {
         provide: function( path ) {
            var deferred = Q.defer();
            deferred.resolve( paths_[ path ] );
            return deferred.promise;
         }
      };

      _.each( dataSet.languages, function( messages, language ) {
         paths_[ baseName + language.toLowerCase() + '.json' ] = messages;
      } );

      return result;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      create: function() {
         return new TestBed();
      }
   };

} );
