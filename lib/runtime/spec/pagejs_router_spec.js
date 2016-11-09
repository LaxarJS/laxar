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

   let spyOneBinary;
   let spyOneUnary;
   let spyTwo;
   let baseRouteMap;
   let fallbackHandlerSpy;

   let router;

   beforeEach( () => {
      spyOneBinary = jasmine.createSpy( 'spyOneBinary' );
      spyOneUnary = jasmine.createSpy( 'spyOneUnary' );
      spyTwo = jasmine.createSpy( 'spyTwo' );

      baseRouteMap = {
         '/prefixOne/:paramA/:paramB': spyOneBinary,
         '/prefixOne/:p': spyOneUnary,
         '/prefixTwo': spyTwo
      };
      fallbackHandlerSpy = jasmine.createSpy( 'fallbackHandlerSpy' );

      pagejsMock = createPagejsMock();
      locationMock = createLocationMock();
      browserMock = createBrowserMock( { locationMock } );
      if( fakeDocumentBaseHref ) {
         setupFakeDocumentBaseHref( fakeDocumentBaseHref );
      }

      configurationData = {
         'router.query.enabled': false,
         ...configurationOverrides
      };
      configurationMock = createConfigurationMock( configurationData );

      router = create( pagejsMock.page, browserMock, configurationMock );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'allows to register routes', () => {
      expect( () => { router.registerRoutes( baseRouteMap, () => {} ); } ).not.toThrow();
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'without route map, intended for constructing URLs', () => {

      describe( 'with the hash-based routing configuration', () => {

         overrideConfig( 'router.pagejs.hashbang', true );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

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
               router.constructAbsoluteUrl( [ '/prefixOne/:x/x/y/:y/:z' ], { x: 'XxX', z: 'ZzZ' } )
            ).toEqual( 'https://server:4711/path#!/prefixOne/XxX/x/y/_/ZzZ' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'ignores additional parameters', () => {
            expect(
               router.constructAbsoluteUrl( [ '/:x/y' ], { x: 'XX', z: 'ZZ' } )
            ).toEqual( 'https://server:4711/path#!/XX/y' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'if configured to use the query string', () => {

            overrideConfig( 'router.query.enabled', true );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'incorporates them into the query string', () => {
               expect(
                  router.constructAbsoluteUrl( [ '/:x/y' ], { x: 'XX', z: 'ZZ' } )
               ).toEqual( 'https://server:4711/path#!/XX/y?z=ZZ' );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'incorporates additional `true` options as value-less items into the query string', () => {
               expect(
                  router.constructAbsoluteUrl( [ '/:x' ], { x: 'XX', y: true, z: 'ZZ' } )
               ).toEqual( 'https://server:4711/path#!/XX?y&z=ZZ' );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'escapes URL syntax in query parameters and values', () => {
               expect(
                  router.constructAbsoluteUrl( [ '/:x' ], { x: 'ha?z=3', 'oth/er key': 's&me vALu/e' } )
               ).toEqual( 'https://server:4711/path#!/ha%3Fz%3D3?oth%2Fer%20key=s%26me%20vALu%2Fe' );
            } );

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
               router.constructAbsoluteUrl( [ '/prefix/:a/:b' ], { a: 'a?b=x', b: '/s' } )
            ).toEqual( 'https://server:4711/the-base/prefix/a%3Fb%3Dx/%252Fs' );
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

      describe( 'configured to work without hashbang in URLs, and without a configured router base', () => {

         overrideConfig( 'router.base', null );
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
         router.registerRoutes( baseRouteMap, fallbackHandlerSpy );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'starts page.js to kick off navigation', () => {
         expect( pagejsMock.page.start ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'while using hash-based URLs', () => {

         overrideConfig( 'router.pagejs.hashbang', true );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'initializes page.js with the current document path as base', () => {
            expect( pagejsMock.page.base ).toHaveBeenCalledWith( '/path' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'while not using hash-based URLs', () => {

         beforeAll( () => { fakeDocumentBaseHref = 'http://some/href'; } );
         afterAll( () => { fakeDocumentBaseHref = null; } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'initializes page.js with the current document base URL as base', () => {
            expect( pagejsMock.page.base ).toHaveBeenCalledWith( 'http://some/href' );
         } );

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
         expect( pagejsMock.configureRouteSpy ).toHaveBeenCalledWith( '/prefixOne/:p', anyFunc );
         expect( pagejsMock.configureRouteSpy ).toHaveBeenCalledWith( '/prefixTwo', anyFunc );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when page.js handles a route change', () => {

         beforeEach( () => {
            pagejsMock.triggerRoute( '/prefixTwo', { params: {} } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'runs the correct handler', () => {
            expect( spyTwo ).toHaveBeenCalled();
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when page.js handles a route change with parameters', () => {

         beforeEach( () => {
            pagejsMock.triggerRoute( '/prefixOne/:p', { params: { p: 'x' } } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'runs the correct handler with the respective parameters', () => {
            expect( spyOneUnary ).toHaveBeenCalledWith( { p: 'x' } );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when page.js handles a route change with underscore for segment parameters', () => {

         beforeEach( () => {
            pagejsMock.triggerRoute(
               '/prefixOne/:paramA/:paramB',
               { params: { paramA: '_', paramB: 'X' } }
            );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'transforms the missing parameters to null', () => {
            expect( spyOneBinary ).toHaveBeenCalledWith( { paramA: null, paramB: 'X' } );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when page.js handles a route change, passing encoded slashes or underscores', () => {

         beforeEach( () => {
            pagejsMock.triggerRoute(
               '/prefixOne/:paramA/:paramB',
               { params: { paramA: '%2F', paramB: '%5F' } }
            );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'reverts the double-encoding', () => {
            expect( spyOneBinary ).toHaveBeenCalledWith( { paramA: '/', paramB: '_' } );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when page.js handles a route change, passing query parameters', () => {

         let decodedParams;

         beforeEach( () => {
            pagejsMock.triggerRoute(
               '/prefixOne/:paramA/:paramB',
               { params: { paramA: '_', paramB: 'XYZ' }, querystring: 'paramA=1000&paramC=5000&paramD' }
            );
            decodedParams = spyOneBinary.calls.mostRecent().args[ 0 ];
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'ignores them by default', () => {
            expect( decodedParams.paramA ).toEqual( null );
            expect( decodedParams.paramC ).not.toBeDefined();
            expect( decodedParams.paramD ).not.toBeDefined();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'if query parameters are enabled', () => {

            overrideConfig( 'router.query.enabled', true );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'adds them to the handler parameters', () => {
               expect( decodedParams.paramC ).toEqual( '5000' );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'does not override the segment parameters', () => {
               expect( decodedParams.paramA ).toEqual( null );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'does not override the segment parameters', () => {
               expect( decodedParams.paramD ).toEqual( true );
            } );

         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'asked to navigate based on a patterns', () => {

         beforeEach( () => {
            router.navigateTo( [ '/prefixTwo' ], {} );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'triggers page.js to load the routing path for the first pattern', () => {
            expect( pagejsMock.page.show ).toHaveBeenCalledWith( '/prefixTwo' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'asked to navigate based on a list of patterns, substituting paremeters', () => {

         beforeEach( () => {
            router.navigateTo( [ '/prefixOne/:param', '/prefixTwo' ], {
               param: 'vanilla-ice'
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'triggers page.js to load the routing path for the first pattern', () => {
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
         protocol: 'https',
         hostname: 'server',
         port: 4711,
         pathname: '/path',
         hash: '#!/editor',
         href: 'https://server:4711/path#!/editor'
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   // Allow to fake that the document contains a base element with an (external) base href,
   // so that it is used if the router base is not defined.
   function setupFakeDocumentBaseHref( fakeBase ) {
      // First call: to determine the base href:
      browserMock.resolve.and.callFake( ( url, base ) => {
         // Second call: to resolve the (already absolute) router base against the document base:
         browserMock.resolve.and.callFake( ( url, origin ) => {
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
