/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   './test_bed'
], function( testBedFactory ) {
   'use strict';

   // Tests using data set 1 ...
   describe( 'Language Module: ', function() {

      var testBed_;

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      beforeEach( function() {
         testBed_ = testBedFactory.create();
         testBed_.setup( 'set1' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      afterEach( function() {
         testBed_.tearDown();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function expectKey( key, localeString ) {
         testBed_.loadMessagesForLocale( localeString );

         if( testBed_.messages ) {
            return expect( testBed_.messages[ key ] );
         }

         return expect( undefined );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'When the current locale is fully qualified', function() {

         it( 'returns the key from the longest matching language file', function() {
            // We do have a key for de_DE_somewhere
            expectKey( 'key1', 'de_DE_somewhere' ).toBe( 'key1 - de_DE_somewhere' );

            // There is no key for de_DE_nrw, so it should fall back to de_DE
            expectKey( 'key1', 'de_DE_nrw' ).toBe( 'key1 - de_DE' );

            // There is no key for en_CA, so it should fall back to en
            expectKey( 'key1', 'en_CA' ).toBe( 'key1 - en' );

            // There is no key for Italian at all, so it should fall back to default
            expectKey( 'key1', 'en_CA' ).toBe( 'key1 - en' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'Message translation - ', function() {

         var bundle_;

         var locale_de    = { language: 'de' };
         var locale_de_de = { language: 'de', country: 'de' };
         var locale_en    = { language: 'en' };
         var locale_en_uk = { language: 'en', country: 'uk' };
         var locale_it    = { language: 'it' };

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         beforeEach( function() {

            bundle_ = {
               text1: 'A & B > C; "Z" < X',
               htmlText1: {
                  de: 'A &amp; B'
               },
               htmlText2: {
                  en: '&quot;Adam &amp; <em>Eve</em>&quot;',
                  de: 'Adam und Eva',
                  de_de: 'Adam &amp; Eva',
                  it: 'Adamo ed Eva'
               }
            };

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'When an existing plain text key is requested', function() {

            it( 'returns its value as is', function() {
               expect( testBed_.language.getPlainText( bundle_.text1, locale_de ) ).toEqual( bundle_.text1 );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'does not care about the locale', function() {
               expect( testBed_.language.getPlainText( bundle_.text1, locale_en ) ).toEqual( bundle_.text1 );
            } );

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'When plain text is requested for an html key', function() {

            it( 'returns the html text converted to plain text', function() {
               expect( testBed_.language.getPlainText( bundle_.htmlText2, locale_en ) )
                  .toEqual( '"Adam & Eve"' );
            } );

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'When an html text is requested for a plain text key', function() {

            it( 'returns the plain text converted to html', function() {
               expect( testBed_.language.getHtmlText( bundle_.text1, locale_de ) )
                  .toEqual( 'A &amp; B &gt; C; "Z" &lt; X' );
            } );

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'When an html text is requested for an existing html key', function() {

            it( 'returns the html text that matches the specified locale', function() {
               expect( testBed_.language.getHtmlText( bundle_.htmlText2, locale_de ) )
                  .toEqual( bundle_.htmlText2.de );

               expect( testBed_.language.getHtmlText( bundle_.htmlText2, locale_de_de ) )
                  .toEqual( bundle_.htmlText2.de_de );

               expect( testBed_.language.getHtmlText( bundle_.htmlText2, locale_en_uk ) )
                  .toEqual( bundle_.htmlText2.en );

               expect( testBed_.language.getHtmlText( bundle_.htmlText2, locale_it ) )
                  .toEqual( bundle_.htmlText2.it );
            } );

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'When the requested text is empty', function() {

            var bundle_;

            beforeEach( function() {
               bundle_ = {
                  emptyText: '',
                  emptyHtmlText: { de: '' }
               };
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'returns the empty string', function() {
               expect( testBed_.language.getHtmlText( bundle_.emptyText,     locale_de ) ).toEqual( '' );
               expect( testBed_.language.getHtmlText( bundle_.emptyHtmlText, locale_de ) ).toEqual( '' );
            } );

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'When the requested text is null', function() {

            var bundle_;

            beforeEach( function() {
               bundle_ = {
                  nullText: null,
                  nullHtmlText: null
               };
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'returns null', function() {
               expect( testBed_.language.getHtmlText( bundle_.nullText,     locale_de ) ).toBeNull();
               expect( testBed_.language.getHtmlText( bundle_.nullHtmlText, locale_de ) ).toBeNull();
            } );

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'When the locale is passed as a string', function() {
            var bundle = { de: 'Deutsch', 'en': 'English', 'en_US': 'American English' };

            it( 'is converted to a locale object internally', function() {
               expect( testBed_.language.getHtmlText( bundle, 'de' ) ).toEqual( bundle.de );
               expect( testBed_.language.getHtmlText( bundle, 'de_DE' ) ).toEqual( bundle.de );
               expect( testBed_.language.getHtmlText( bundle, 'it' ) ).toEqual( null );
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'When "default" is passed as the locale string', function() {
            var bundle = { de: 'Deutsch', 'en': 'English', 'it': 'Italiano' };

            it( 'returns the translation for the default locale', function() {
               testBed_.setLocale( 'it' );
               expect( testBed_.language.getHtmlText( bundle, 'default' ) ).toEqual( bundle.it );

               testBed_.setLocale( 'de' );
               expect( testBed_.language.getHtmlText( bundle, 'default' ) ).toEqual( bundle.de );
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'When getHtmlText() is called without a locale', function() {
            var bundle = { de: 'Deutsch', 'en': 'English', 'it': 'Italiano' };

            it( 'returns the translation for the default locale', function() {
               testBed_.setLocale( 'it' );
               expect( testBed_.language.getHtmlText( bundle ) ).toEqual( bundle.it );

               testBed_.setLocale( 'de' );
               expect( testBed_.language.getHtmlText( bundle ) ).toEqual( bundle.de );
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'translates using case insensitive locale comparison (jira ATP-7351)', function() {
            expect( testBed_.language.getHtmlText( { 'de_DE': 'My Text' }, 'DE_de' ) ).toEqual( 'My Text' );
         } );

      } );
   } );
} );
