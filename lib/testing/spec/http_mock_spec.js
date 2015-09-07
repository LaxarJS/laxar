/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../http_mock',
   '../../utilities/object'
], function( httpMock, object ) {
   'use strict';

   describe( 'A HttpMock', function() {

      var http;

      beforeEach( function() {
         jasmine.Clock.useMock();
         http = httpMock.create();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides the default http client methods', function() {
         expect( http.get ).toBeDefined();
         expect( http.put ).toBeDefined();
         expect( http.post ).toBeDefined();
         expect( http['delete'] ).toBeDefined();
         expect( http.del ).toBeDefined();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'returns promises for the client methods', function() {
         expect( http.get().then ).toBeDefined();
         expect( http.put().then ).toBeDefined();
         expect( http.post().then ).toBeDefined();
         expect( http['delete']().then ).toBeDefined();
         expect( http.del().then ).toBeDefined();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'attaches jasmine spies to the default http client methods', function() {
         expect( http.get.calls ).toBeDefined();
         expect( http.put.calls ).toBeDefined();
         expect( http.post.calls ).toBeDefined();
         expect( http['delete'].calls ).toBeDefined();
         expect( http.del.calls ).toBeDefined();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when configured with responses', function() {

         var responses;
         var clientSpy;

         beforeEach( function() {
            clientSpy = jasmine.createSpy( 'clientSpy' );
            responses = [
               { method: 'GET', uri: 'http://uri1', body: { key1: 1, key2: 'a' } },
               { method: 'POST', uri: 'http://uri2', body: { posted: true } },
               { method: 'DELETE', uri: 'http://delUri', body: { deleted: true } }
            ];
            responses.forEach( function( response ) {
               http.respondWith( response.method, response.uri, object.deepClone( response.body ) );
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'resolves the promise with the given data', function() {
            http.get( 'http://uri1' ).then( clientSpy );
            http.post( 'http://uri2' ).then( clientSpy );
            http.del( 'http://delUri' ).then( clientSpy );
            jasmine.Clock.tick( 0 );

            expect( clientSpy ).toHaveBeenCalledWith( { data: responses[0].body, status: 200 } );
            expect( clientSpy ).toHaveBeenCalledWith( { data: responses[1].body, status: 200 } );
            expect( clientSpy ).toHaveBeenCalledWith( { data: responses[2].body, status: 200 } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'rejects the promise for unknown urls', function() {
            http.get( 'http://idontexist' ).then( null, clientSpy );
            jasmine.Clock.tick( 0 );

            expect( clientSpy.calls[0].args[0] ).toMatch( 'nothing found for uri "http://idontexist" in ' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'creates a history of all requests for debugging purposes', function() {
            http.get( 'http://uri1' );
            http.post( 'http://uri2' );
            http.del( 'http://delUri' );
            http.put( 'http://idontexist' );
            jasmine.Clock.tick( 0 );

            expect( http.history[0] ).toMatch( /GET true http:\/\/uri1 \(\d*\)/ );
            expect( http.history[1] ).toMatch( /POST true http:\/\/uri2 \(\d*\)/ );
            expect( http.history[2] ).toMatch( /DELETE true http:\/\/delUri \(\d*\)/ );
            expect( http.history[3] ).toMatch( /PUT false http:\/\/idontexist \(\d*\)/ );
         } );

      } );

   } );

} );
