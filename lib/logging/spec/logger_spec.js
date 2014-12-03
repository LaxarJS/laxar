/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../logger',
   '../level'
], function( logger, level ) {
   'use strict';

   describe( 'A logger', function() {

      var logger_;
      var spyChannel;

      beforeEach( function() {
         spyChannel = jasmine.createSpy( 'spyChannel' );
         logger_ = logger.create();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'defines shortcut log methods', function() {

         beforeEach( function() {
            spyOn( logger_, 'log' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         Object.keys( level ).forEach( function( levelName ) {

            it( 'for log level ' + levelName, function() {
               logger_[ levelName.toLowerCase() ]( 'message' );

               expect( logger_.log ).toHaveBeenCalledWith( level[ levelName ], 'message' );
            } );

         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'supports log channels', function() {

         var lateSpyChannel;

         beforeEach( function() {
            lateSpyChannel = jasmine.createSpy( 'lateSpyChannel' );

            logger_.addLogChannel( spyChannel );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'that instantly receive log messages', function() {
            logger_.error( 'some error' );
            logger_.info( 'some info' );

            expect( spyChannel ).toHaveBeenCalledWith( {
               id: 0,
               level: 'ERROR',
               text: 'some error',
               replacements: [],
               time: jasmine.any( Date ),
               tags: { INST: jasmine.any( String ) },
               sourceInfo: jasmine.any( Object )
            } );
            expect( spyChannel ).toHaveBeenCalledWith( {
               id: 1,
               level: 'INFO',
               text: 'some info',
               replacements: [],
               time: jasmine.any( Date ),
               tags: { INST: jasmine.any( String ) },
               sourceInfo: jasmine.any( Object )
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'no longer receive messages when removed', function() {
            logger_.error( 'some error' );
            logger_.removeLogChannel( spyChannel );
            logger_.info( 'some info' );

            expect( spyChannel.calls.length ).toBe( 1 );
            expect( spyChannel ).toHaveBeenCalledWith( {
               id: 0,
               level: 'ERROR',
               text: 'some error',
               replacements: [],
               time: jasmine.any( Date ),
               tags: { INST: jasmine.any( String ) },
               sourceInfo: jasmine.any( Object )
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'and queues the configured amount of log messages', function() {

            beforeEach( function() {
               for( var i = 0; i < 150; ++i ) {
                  logger_.error( 'error ' + i );
               }
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'to deliver them to channels registered later', function() {
               logger_.addLogChannel( lateSpyChannel );

               expect( lateSpyChannel.calls.length ).toBe( 100 );
               expect( lateSpyChannel.calls[0].args[0].id ).toBe( 50 );
               expect( lateSpyChannel.calls[99].args[0].id ).toBe( 149 );
            } );

         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'has a context', function() {

         beforeEach( function() {
            logger_.addLogChannel( spyChannel );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'supporting scopes and tags', function() {
            // see log_context_spec.js for more tests regarding the context

            logger_.context.addTag( 'TAG', 'tag_value' );
            logger_.context.enterScope();

            logger_.context.addTag( 'TAG2', 'tag2_value' );
            expect( logger_.context.gatherTags() ).toEqual( {
               INST: jasmine.any( String ),
               TAG: 'tag_value',
               TAG2: 'tag2_value'
            } );

            logger_.context.leaveScope();
            expect( logger_.context.gatherTags() ).toEqual( {
               INST: jasmine.any( String ),
               TAG: 'tag_value'
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'adds all currently active tags to a log message', function() {
            logger_.context.addTag( 'TAG', 'tag_value' );
            logger_.context.addTag( 'TAG', 'tag_value2' );
            logger_.context.addTag( 'TAG2', 'tag2_value' );

            logger_.error( 'some error' );

            expect( spyChannel.calls[0].args[0].tags ).toEqual( {
               INST: jasmine.any( String ),
               TAG: 'tag_value;tag_value2',
               TAG2: 'tag2_value'
            } );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'with message objects', function() {

         var firstMessage;
         var secondMessage;

         beforeEach( function() {
            logger_.addLogChannel( spyChannel );

            logger_.error( 'this [0] is [1]. Data: [2]', 'situation', 'bad', { cars: 10 } );
            logger_.info( 'its [0]', 'okay' );

            firstMessage = spyChannel.calls[0].args[0];
            secondMessage = spyChannel.calls[1].args[0];
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'containing an array of provided replacement data', function() {
            expect( firstMessage.replacements ).toEqual( [ 'situation', 'bad', { cars: 10 } ] );
            expect( secondMessage.replacements ).toEqual( [ 'okay' ] );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'having an increasing id', function() {
            expect( firstMessage.id ).toEqual( 0 );
            expect( secondMessage.id ).toEqual( 1 );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'having source information where the call happened', function() {
            // due to the very different quality of stack information available across browsers a better test
            // is not possible here.
            expect( firstMessage.sourceInfo.file ).toBeDefined();
            expect( firstMessage.sourceInfo.line ).toBeDefined();
            expect( firstMessage.sourceInfo.char ).toBeDefined();
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'supports set a threshold', function() {

         var ASSERTION_PREFIX = 'Assertion error: State does not hold. Details: ';
         var lateSpyChannel;

         beforeEach( function() {
            lateSpyChannel = jasmine.createSpy( 'lateSpyChannel' );

            logger_.addLogChannel( spyChannel );
            logger_.setLogThreshold( level.WARN );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'throwing an error when trying to set one that doesn\'t exist', function() {
            expect( function() { logger_.setLogThreshold( -1 ); } )
               .toThrow( ASSERTION_PREFIX + 'Unsupported log threshold -1.' );
            expect( function() { logger_.setLogThreshold( 11 ); } )
               .toThrow( ASSERTION_PREFIX + 'Unsupported log threshold 11.' );
            expect( function() { logger_.setLogThreshold( 5 ); } ).not.toThrow();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'ignoring messages below that threshold', function() {
            logger_.develop( 'I was left here for developers only' );
            expect( spyChannel ).not.toHaveBeenCalled();

            logger_.addLogChannel( lateSpyChannel );
            expect( lateSpyChannel ).not.toHaveBeenCalled();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'delivering and buffering messages having the configured threshold', function() {
            logger_.warn( 'Let op!' );
            expect( spyChannel ).toHaveBeenCalled();

            logger_.addLogChannel( lateSpyChannel );
            expect( lateSpyChannel ).toHaveBeenCalled();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'delivering and buffering messages having the configured threshold', function() {
            logger_.fatal( 'Zombie apocalypse! Let\'s do something stupid.' );
            expect( spyChannel ).toHaveBeenCalled();

            logger_.addLogChannel( lateSpyChannel );
            expect( lateSpyChannel ).toHaveBeenCalled();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'allows setting a threshold via string name', function() {
            logger_.setLogThreshold( 'error' );
            logger_.warn( 'Let op!' );
            expect( spyChannel ).not.toHaveBeenCalled();

            logger_.setLogThreshold( 'WARN' );
            logger_.warn( 'Let op!' );
            expect( spyChannel ).toHaveBeenCalled();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'throwing an error when trying to set one that doesn\'t exist', function() {
            expect( function() { logger_.setLogThreshold( 'BOGUS' ); } )
               .toThrow( ASSERTION_PREFIX + 'Unsupported log threshold "BOGUS".' );
            expect( function() { logger_.setLogThreshold( 'anything' ); } )
               .toThrow( ASSERTION_PREFIX + 'Unsupported log threshold "anything".' );
            expect( function() { logger_.setLogThreshold( 'AUDIT' ); } ).not.toThrow();
         } );

      } );

   } );

} );
