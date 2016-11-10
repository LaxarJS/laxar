/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create } from '../pagejs_router';
import { create as createPagejsMock } from './mocks/pagejs_mock';
import { create as createBrowserMock } from '../../testing/browser_mock';
import { create as createConfigurationMock } from '../../testing/configuration_mock';

const anyFunc = jasmine.any( Function );

describe( 'A page.js router', () => {

   let pagejsMock;
   let locationMock;
   let browserMock;

   const configurationOverrides = {};
   let fakeDocumentBaseHref;
   let configurationData;
   let configurationMock;

   let baseRouteMap;
   let router;

   let spyOneAB;
   let spyOne;
   let spyTwo;

   beforeEach( () => {
      spyOneAB = jasmine.createSpy( 'spyOneAB' );
      spyOne = jasmine.createSpy( 'spyOne' );
      spyTwo = jasmine.createSpy( 'spyTwo' );

      baseRouteMap = {
         '/prefixOne/:paramA/:paramB': spyOneAB,
         '/prefixOne/:param': spyOne,
         '/prefixTwo': spyTwo
      };

      pagejsMock = createPagejsMock();
      locationMock = createLocationMock();
      browserMock = createBrowserMock( { locationMock } );
      if( fakeDocumentBaseHref ) {
         setupFakeDocumentBaseHref( fakeDocumentBaseHref );
      }

      configurationData = { ...configurationOverrides };
      configurationMock = createConfigurationMock( configurationData );

      // to override: setupFakeDocumentBase( 'https://otherserver:9101/other/path' );
      router = create( pagejsMock.page, browserMock, configurationMock );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'allows to register routes', () => {
      expect( () => { router.registerRoutes( baseRouteMap, () => {} ); } ).not.toThrow();
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'without route map, intended for constructing URLs', () => {

      describe( 'with the (default) hash-based routing configuration', () => {

         it( 'allows to construct hash-based absolute URLs for a list of patterns', () => {
            expect(
               router.constructAbsoluteUrl( [ '/prefixTwo' ], {} )
            ).toEqual( 'https://server:4711/path#!/prefixTwo' );

            expect(
               router.constructAbsoluteUrl( [ '/prefixOne/:param', '/prefixTwo' ], { param: 'vanilla-ice' } )
            ).toEqual( 'https://server:4711/path#!/prefixOne/vanilla-ice' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'allows to interleave named segments and parameter placeholders', () => {
            expect(
               router.constructAbsoluteUrl( [ '/prefixOne/:x/x/y/:y/:z' ], { x: '!X!', z: '!Z!' } )
            ).toEqual( 'https://server:4711/path#!/prefixOne/!X!/x/y/_/!Z!' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'configured to work without hashbang in URLs', () => {

         overrideConfig( 'router.base', '/the-base' );
         overrideConfig( 'router.pagejs.hashbang', false );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'allows to construct "real" URLs from patterns', () => {
            expect(
               router.constructAbsoluteUrl( [ '/prefixTwo' ], {} )
            ).toEqual( 'https://server:4711/the-base/prefixTwo' );

            expect(
               router.constructAbsoluteUrl( [ '/prefixOne/:param', '/prefixTwo' ], { param: 'vanilla-ice' } )
            ).toEqual( 'https://server:4711/the-base/prefixOne/vanilla-ice' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'escapes URL syntax in parameter values', () => {
            expect(
               router.constructAbsoluteUrl( [ '/prefixOne/:param' ], { param: 'nefarious hackery' } )
            ).toEqual( 'https://server:4711/the-base/prefixOne/nefarious%20hackery' );

            expect(
               router.constructAbsoluteUrl( [ '/prefixOne/:paramA/:paramB' ], { paramA: 'a?b=x', paramB: '/s' } )
            ).toEqual( 'https://server:4711/the-base/prefixOne/a%3Fb%3Dx/%252Fs' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'double-encodes slashes in url segments', () => {
            expect(
               router.constructAbsoluteUrl( [ '/prefixOne/:paramA/:paramB' ], { paramA: '/', paramB: '/s' } )
            ).toEqual( 'https://server:4711/the-base/prefixOne/%252F/%252Fs' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'encodes empty segments as _', () => {
            expect(
               router.constructAbsoluteUrl( [ '/prefixOne/:paramA/:paramB' ], { paramB: 'Hey!' } )
            ).toEqual( 'https://server:4711/the-base/prefixOne/_/Hey!' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'double-encodes the _ in segment values to distinguish it from an empty segment', () => {
            expect(
               router.constructAbsoluteUrl( [ '/:a/:b/:c/:d' ], { a: '', b: '_', c: null, d: '__' } )
            ).toEqual( 'https://server:4711/the-base//%255F/_/%255F%255F' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'strips trailing empty segments from URLs', () => {
            expect(
               router.constructAbsoluteUrl( [ '/prefixOne/:param' ], { param: null } )
            ).toEqual( 'https://server:4711/the-base/prefixOne/' );

            expect(
               router.constructAbsoluteUrl( [ '/prefixOne/:paramA/:paramB' ], { paramA: 'Hey!' } )
            ).toEqual( 'https://server:4711/the-base/prefixOne/Hey!/' );

            expect(
               router.constructAbsoluteUrl( [ '/prefixOne/:paramA/:paramB' ], {} )
            ).toEqual( 'https://server:4711/the-base/prefixOne/' );

            expect(
               router.constructAbsoluteUrl( [ '/:segment' ], {} )
            ).toEqual( 'https://server:4711/the-base/' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'does not harm empty strings by stripping empty segments', () => {
            expect(
               router.constructAbsoluteUrl( [ '//:a/:b/' ], { a: '', b: null } )
            ).toEqual( 'https://server:4711/the-base///' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'configured to work without hashbang in URLs', () => {

         overrideConfig( 'router.base', null );
         overrideConfig( 'router.pagejs.hashbang', false );
         beforeAll( () => { fakeDocumentBaseHref = 'http://fake-base.server/path'; } );
         afterAll( () => { fakeDocumentBaseHref = null; } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'falls back to the document base URL to generate URLs', () => {
            expect(
               router.constructAbsoluteUrl( [ '/prefixTwo' ], {} )
            ).toEqual( 'http://fake-base.server/path/prefixTwo' );

            expect(
               router.constructAbsoluteUrl( [ '/prefixOne/:param', '/prefixTwo' ], { param: 'vanilla-ice' } )
            ).toEqual( 'http://fake-base.server/path/prefixOne/vanilla-ice' );

            expect(
               router.constructAbsoluteUrl( [ '/' ], {} )
            ).toEqual( 'http://fake-base.server/path/' );
         } );

      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'initialized with a map of routes', () => {

      beforeEach( () => {
         router.registerRoutes( baseRouteMap );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'with configured base URL', () => {

         overrideConfig( 'router.base', 'http://someserver/base' );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'initializes page.js with that base', () => {
            expect( pagejsMock.page.base ).toHaveBeenCalledWith( 'http://someserver/base' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'configures page.js to use each of the routes', () => {
         expect( pagejsMock.configureRouteSpy ).toHaveBeenCalledWith( '/prefixOne/:paramA/:paramB', anyFunc );
         expect( pagejsMock.configureRouteSpy ).toHaveBeenCalledWith( '/prefixOne/:param', anyFunc );
         expect( pagejsMock.configureRouteSpy ).toHaveBeenCalledWith( '/prefixTwo', anyFunc );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'starts page.js to kick off navigation', () => {
         expect( pagejsMock.page.start ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'initializes page.js with the current document URL as base', () => {
         expect( pagejsMock.page.base ).toHaveBeenCalledWith( '/path' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'asked to navigate to a list of patterns', () => {

         beforeEach( () => {
            router.navigateTo( [ '/prefixOne/:param', 'prefixTwo' ], {
               param: 'vanilla-ice'
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'triggers page.js to load the URL for the first pattern', () => {
            expect( pagejsMock.page.show ).toHaveBeenCalledWith( '/prefixOne/vanilla-ice' );
         } );

      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function overrideConfig( path, value ) {
      beforeAll( () => {
         configurationOverrides[ path ] = value;
      } );
      afterAll( () => {
         delete configurationOverrides[ path ];
      } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createLocationMock() {
      return {
         hash: '#!/editor',
         href: 'https://server:4711/path?q=13#!/editor',
         pathname: '/path',
         hostname: 'server',
         port: 4711,
         protocol: 'https'
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function setupFakeDocumentBaseHref( fakeBase ) {
      console.log( 'setup', fakeBase );
      // Fake that the document contains a base element with an (external) base href,
      // so that it is used if the router base is not defined.

      // First call: to determine the base href:
      browserMock.resolve.and.callFake( ( url, base ) => {
         // Second call: to resolve the (already absolute) router base against the document base:
         browserMock.resolve.and.callFake( ( url, origin ) => {
            console.log( 'DELETE ME', url );
            const fakeOrigin = `${locationMock.protocol}://${locationMock.hostname}:${locationMock.port}`;
            expect( url ).toEqual( fakeBase );
            expect( origin ).toEqual( fakeOrigin );
            return url;
         } );
         expect( url ).toEqual( '.' );
         expect( base ).not.toBeDefined();
         return fakeBase;
      } );
   }

} );
