/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../log_context',
   '../../utilities/storage'
], function( logContext, storage ) {
   'use strict';

   describe( 'A LogContext', function() {

      var logContext_;

      beforeEach( function() {
         logContext_ = logContext.create();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'automatically adds a tag for the application instance id', function() {
         expect( logContext_.gatherTags() ).toEqual( {
            INST: jasmine.any( String )
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 're-uses an existing instance ID from session storage', function() {
         storage.getSessionStorage().setItem( 'ax.log.tags.INST', '4711' );
         logContext_ = logContext.create();
         expect( logContext_.gatherTags() ).toEqual( {
            INST: '4711'
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'automatically has a root scope', function() {
         expect( logContext_.scopes_.length ).toBe( 1 );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'prohibits deleting the root scope', function() {
         expect( function() { logContext_.leaveScope(); } ).toThrow();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'allows adding and deleting scopes', function() {
         logContext_.enterScope();
         expect( logContext_.scopes_.length ).toBe( 2 );

         logContext_.enterScope();
         expect( logContext_.scopes_.length ).toBe( 3 );

         logContext_.leaveScope();
         expect( logContext_.scopes_.length ).toBe( 2 );

         logContext_.leaveScope();
         expect( logContext_.scopes_.length ).toBe( 1 );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'allows adding log tags to the current scope', function() {
         logContext_.addTag( 'TAG', 'tag_value' );
         expect( logContext_.scopes_[0] ).toEqual( {
            tags: {
               INST: jasmine.any( String ),
               TAG: 'tag_value'
            }
         } );

         logContext_.addTag( 'TAG', 'tag_value2' );
         logContext_.addTag( 'TAG2', 'tag2_value' );
         expect( logContext_.scopes_[0] ).toEqual( {
            tags: {
               INST: jasmine.any( String ),
               TAG: 'tag_value;tag_value2',
               TAG2: 'tag2_value'
            }
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'allows setting log tags on the current scope', function() {
         logContext_.setTag( 'TAG', 'tag_value' );
         expect( logContext_.scopes_[0] ).toEqual( {
            tags: {
               INST: jasmine.any( String ),
               TAG: 'tag_value'
            }
         } );

         logContext_.setTag( 'TAG', 'tag_value2' );
         logContext_.setTag( 'TAG2', 'tag2_value' );
         expect( logContext_.scopes_[0] ).toEqual( {
            tags: {
               INST: jasmine.any( String ),
               TAG: 'tag_value2',
               TAG2: 'tag2_value'
            }
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'throws an error if the key is no string', function() {
         expect( function() { logContext_.addTag( null, 'x' ); } ).toThrow();
         expect( function() { logContext_.addTag( 12, 'x' ); } ).toThrow();
         expect( function() { logContext_.addTag( {}, 'x' ); } ).toThrow();
         expect( function() { logContext_.addTag( true, 'x' ); } ).toThrow();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'has a method to collect tags from all scopes', function() {
         logContext_.addTag( 'TAG', 'tag_value' );
         logContext_.enterScope();
         logContext_.addTag( 'TAG2', 'tag2_value' );
         expect( logContext_.gatherTags() ).toEqual( {
            INST: jasmine.any( String ),
            TAG: 'tag_value',
            TAG2: 'tag2_value'
         } );

         logContext_.enterScope();
         logContext_.addTag( 'TAG', 'tag_value2' );
         expect( logContext_.gatherTags() ).toEqual( {
            INST: jasmine.any( String ),
            TAG: 'tag_value;tag_value2',
            TAG2: 'tag2_value'
         } );

         logContext_.leaveScope();
         expect( logContext_.gatherTags() ).toEqual( {
            INST: jasmine.any( String ),
            TAG: 'tag_value',
            TAG2: 'tag2_value'
         } );

         logContext_.leaveScope();
         expect( logContext_.gatherTags() ).toEqual( {
            INST: jasmine.any( String ),
            TAG: 'tag_value'
         } );
      } );

   } );

} );
