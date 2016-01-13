/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../path'
], function( path ) {
   'use strict';

   describe( 'Path utilities', function() {

      describe( 'join( pathfragment [, pathfragment ]* )', function() {

         it( 'throws an error for non-string arguments', function() {
            expect( function() { path.join( {} ); } )
               .toThrow( 'Assertion error: Expected value to be an instance of "String" but was "Object".' );
            expect( function() { path.join( true ); } )
               .toThrow( 'Assertion error: Expected value to be an instance of "String" but was "Boolean".' );
            expect( function() { path.join( '', 9 ); } )
               .toThrow( 'Assertion error: Expected value to be an instance of "String" but was "Number".' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns an empty path if no arguments are given', function() {
            expect( path.join() ).toEqual( '' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'joins paths without parent references', function() {
            expect( path.join( 'here', 'there' ) ).toEqual( 'here/there' );
            expect( path.join( '/here', 'there/', 'super/path' ) ).toEqual( '/here/there/super/path' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'joins paths with parent references', function() {
            expect( path.join( 'here', '..' ) ).toEqual( '' );
            expect( path.join( '/here', 'there/', '../path' ) ).toEqual( '/here/path' );
            expect( path.join( '..', 'here' ) ).toEqual( '../here' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'joins paths with more parent references than real paths', function() {
            expect( path.join( 'here', '..', '..', 'part', '..' ) ).toEqual( '..' );
            expect( path.join( 'here', 'there/', '../../../path' ) ).toEqual( '../path' );
            expect( path.join( '..', '..' ) ).toEqual( '../..' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'joins paths with current dir reference', function() {
            expect( path.join( 'here', './' ) ).toEqual( 'here' );
            expect( path.join( 'here', './part', '..' ) ).toEqual( 'here' );
            expect( path.join( 'here', 'there/', '../.././path' ) ).toEqual( 'path' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'joins paths to a url', function() {
            expect( path.join( 'http://localhost/here', 'there' ) ).toEqual( 'http://localhost/here/there' );
            expect( path.join( 'http://localhost/here', '../there' ) ).toEqual( 'http://localhost/there' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'joins absolute paths by replacing previous paths', function() {
            expect( path.join( 'here', '/there' ) ).toEqual( '/there' );
            expect( path.join( '/here', '/there' ) ).toEqual( '/there' );
            expect( path.join( '/here', 'http://localhost/there', 'path' ) )
               .toEqual( 'http://localhost/there/path' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'does not overwrite the host part of a url with relative paths', function() {
            expect( path.join( 'http://localhost/there', '../../anywhere' ) )
               .toEqual( 'http://localhost/../anywhere' ); // ".." left as an excercise for the web server
         } );

      } );

      describe( 'normalize( path )', function() {

         it( 'removes multiple consecutive slashes', function() {
            expect( path.normalize( 'here//there' ) ).toEqual( 'here/there' );
            expect( path.normalize( 'here/there///path') ).toEqual( 'here/there/path' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'removes current directory (".") references', function() {
            expect( path.normalize( 'here/./there' ) ).toEqual( 'here/there' );
            expect( path.normalize( './here/there' ) ).toEqual( 'here/there' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'resolves parent ("..") references', function() {
            expect( path.normalize( 'here/../there' ) ).toEqual( 'there' );
            expect( path.normalize( '../here/there' ) ).toEqual( '../here/there' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'keeps absolute paths and urls intact', function() {
            expect( path.normalize( 'http://localhost/here/../there' ) )
               .toEqual( 'http://localhost/there' );
            expect( path.normalize( 'http://localhost/../here/there' ) )
               .toEqual( 'http://localhost/../here/there' );
         } );

      } );

      describe( 'relative( from, path )', function() {

         it( 'removes common ancestors from paths', function() {
            expect( path.relative( '/there', '/there/here' ) ).toEqual( 'here' );
            expect( path.relative( '/there', '/there' ) ).toEqual( '.' );
         } );

         it( 'traverses parent directories until a common path is found', function() {
            expect( path.relative( '/there/somewhere', '/there/here' ) ).toEqual( '../here' );
            expect( path.relative( '/there', '/here' ) ).toEqual( '../here' );
         } );

         it( 'resolves paths on the same host', function() {
            expect( path.relative( 'http://localhost/there/somewhere', '/here' ) )
               .toEqual( '../../here' );
            expect( path.relative( 'http://localhost/here', 'http://localhost/there' ) )
               .toEqual( '../there' );
         } );

         it( 'throws an error for paths that are not absolute', function() {
            expect( function() { path.relative( 'here', 'there' ); } )
               .toThrow();
         } );
      } );

   } );

} );
