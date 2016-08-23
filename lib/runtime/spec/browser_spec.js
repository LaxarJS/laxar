/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createBrowser } from '../browser';

describe( 'A browser', () => {

   let browser;

   beforeEach( () => {
      spyOn( window, 'fetch' );
      spyOn( console, 'info' );
      browser = createBrowser();
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'offers a method to access the window.location property', () => {
      expect( browser.location() ).toBe( window.location );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'with a method `resolve`', () => {

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'resolves URLs relative to a given base URL', () => {
         const result = browser.resolve( 'hallo', 'http://example.com/upper-dir/end-dir/end-doc' );
         expect( result ).toEqual( 'http://example.com/upper-dir/end-dir/hallo' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'resolves "current directory" relative to a given base URL', () => {
         const result = browser.resolve( '.', 'http://example.com/upper-dir/end-dir/end-doc' );
         expect( result ).toEqual( 'http://example.com/upper-dir/end-dir/' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'resolves the empty URL to the given base URL', () => {
         const result = browser.resolve( '', 'http://example.com/upper-dir/end-dir/end-doc' );
         expect( result ).toEqual( 'http://example.com/upper-dir/end-dir/end-doc' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'ascends directories in URLs relative to the given base URL', () => {
         const result = browser.resolve( '../hallo', 'http://example.com/upper-dir/end-dir/end-doc' );
         expect( result ).toEqual( 'http://example.com/upper-dir/hallo' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'does not tamper with absolute URLs', () => {
         const result = browser.resolve( 'https://www.example.com/yo', 'http://example.com/lo' );
         expect( result ).toEqual( 'https://www.example.com/yo' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'if no explicit base URL is given', () => {

         let mockBase;

         beforeEach( () => {
            mockBase = document.createElement( 'base' );
            mockBase.href = 'http://example.com/document/base-parent/base/doc';
            document.head.appendChild( mockBase );
         } );

         afterEach( () => {
            document.head.removeChild( mockBase );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'uses the document base URL ', () => {
            const result = browser.resolve( '..' );
            expect( result ).toEqual( 'http://example.com/document/base-parent/' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'uses the document base URL to resolve the empty URL', () => {
            const result = browser.resolve( '' );
            expect( result ).toEqual( 'http://example.com/document/base-parent/base/doc' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'does not tamper with absolute URLs when using the document base URL', () => {
            const result = browser.resolve( 'https://www.example.com/yo' );
            expect( result ).toEqual( 'https://www.example.com/yo' );
         } );

      } );


   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'has a method to access the browser console', () => {
      expect( browser.console ).toEqual( jasmine.any( Function ) );
      expect( browser.console().log ).toEqual( jasmine.any( Function ) );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'offers a `fetch` method', () => {
      expect( browser.fetch ).toEqual( jasmine.any( Function ) );
   } );

} );
