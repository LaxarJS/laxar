/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import log from '../log';
import { log as consoleChannel } from '../console_channel';
import * as object from  '../../utilities/object';

describe( 'A logger', () => {

   let logger_;
   let spyChannel;

   beforeEach( () => {
      spyChannel = jasmine.createSpy( 'spyChannel' );
      logger_ = log.create();
      logger_.removeLogChannel( consoleChannel );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'defines shortcut log methods', () => {

      beforeEach( () => {
         spyOn( logger_, 'log' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      Object.keys( log.level ).forEach( levelName => {

         it( 'for log level ' + levelName, () => {
            logger_[ levelName.toLowerCase() ]( 'message' );

            expect( logger_.log ).toHaveBeenCalledWith( logger_.level[ levelName ], 'message' );
         } );

      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'supports log channels', () => {

      let lateSpyChannel;

      beforeEach( () => {
         lateSpyChannel = jasmine.createSpy( 'lateSpyChannel' );

         logger_.addLogChannel( spyChannel );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'that instantly receive log messages', () => {
         logger_.error( 'some error' );
         logger_.info( 'some info' );

         expect( spyChannel ).toHaveBeenCalledWith( {
            id: 0,
            level: 'ERROR',
            text: 'some error',
            replacements: [],
            time: jasmine.any( Date ),
            tags: {},
            sourceInfo: jasmine.any( Object )
         } );
         expect( spyChannel ).toHaveBeenCalledWith( {
            id: 1,
            level: 'INFO',
            text: 'some info',
            replacements: [],
            time: jasmine.any( Date ),
            tags: {},
            sourceInfo: jasmine.any( Object )
         } );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'that no longer receive messages when removed', () => {
         logger_.error( 'some error' );
         logger_.removeLogChannel( spyChannel );
         logger_.info( 'some info' );

         expect( spyChannel.calls.count() ).toBe( 1 );
         expect( spyChannel ).toHaveBeenCalledWith( {
            id: 0,
            level: 'ERROR',
            text: 'some error',
            replacements: [],
            time: jasmine.any( Date ),
            tags: {},
            sourceInfo: jasmine.any( Object )
         } );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'and queues the configured amount of log messages', () => {

         beforeEach( () => {
            for( let i = 0; i < 150; ++i ) {
               logger_.error( 'error ' + i );
            }
         } );

         //////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'to deliver them to channels registered later', () => {
            logger_.addLogChannel( lateSpyChannel );

            expect( lateSpyChannel.calls.count() ).toBe( 100 );
            expect( lateSpyChannel.calls.argsFor(0)[0].id ).toBe( 50 );
            expect( lateSpyChannel.calls.argsFor(99)[0].id ).toBe( 149 );
         } );

      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'supporting tags', () => {

      beforeEach( () => {
         logger_.addLogChannel( spyChannel );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'allows to add tags', () => {
         logger_.addTag( 'TAG', 'tag_value' );
         logger_.addTag( 'TAG2', 'tag2_value' );

         expect( logger_.gatherTags() ).toEqual( {
            TAG: 'tag_value',
            TAG2: 'tag2_value'
         } );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'allows to remove tags', () => {
         logger_.addTag( 'TAG', 'tag_value' );
         logger_.addTag( 'TAG2', 'tag2_value' );
         expect( logger_.gatherTags() ).toEqual( {
            TAG: 'tag_value',
            TAG2: 'tag2_value'
         } );

         logger_.removeTag( 'TAG2' );
         expect( logger_.gatherTags() ).toEqual( {
            TAG: 'tag_value'
         } );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'adds all currently active tags to a log message', () => {
         logger_.addTag( 'TAG', 'tag_value' );
         logger_.addTag( 'TAG', 'tag_value2' );
         logger_.addTag( 'TAG2', 'tag2_value' );

         logger_.error( 'some error' );

         expect( spyChannel.calls.argsFor(0)[0].tags ).toEqual( {
            TAG: 'tag_value;tag_value2',
            TAG2: 'tag2_value'
         } );
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'with message objects', () => {

      let firstMessage;
      let secondMessage;

      beforeEach( () => {
         logger_.addLogChannel( spyChannel );

         logger_.error( 'this [0] is [1]. Data: [2]', 'situation', 'bad', { cars: 10 } );
         logger_.info( 'its [0]', 'okay' );

         firstMessage = spyChannel.calls.argsFor(0)[0];
         secondMessage = spyChannel.calls.argsFor(1)[0];
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'containing an array of provided replacement data', () => {
         expect( firstMessage.replacements ).toEqual( [ 'situation', 'bad', { cars: 10 } ] );
         expect( secondMessage.replacements ).toEqual( [ 'okay' ] );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'having an increasing id', () => {
         expect( firstMessage.id ).toEqual( 0 );
         expect( secondMessage.id ).toEqual( 1 );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'having source information where the call happened', () => {
         // due to the very different quality of stack information available across browsers a better test
         // is not possible here.
         expect( firstMessage.sourceInfo.file ).toBeDefined();
         expect( firstMessage.sourceInfo.line ).toBeDefined();
         expect( firstMessage.sourceInfo.char ).toBeDefined();
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'supports to set a threshold', () => {

      const ASSERTION_PREFIX = 'Assertion error: State does not hold. Details: ';
      let lateSpyChannel;

      beforeEach( () => {
         lateSpyChannel = jasmine.createSpy( 'lateSpyChannel' );

         logger_.addLogChannel( spyChannel );
         logger_.setLogThreshold( logger_.level.WARN );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'throwing an error when trying to set one that doesn\'t exist', () => {
         expect( () => { logger_.setLogThreshold( 'BOGUS' ); } )
            .toThrow( new Error( ASSERTION_PREFIX + 'Unsupported log threshold "BOGUS".' ) );
         expect( () => { logger_.setLogThreshold( true ); } )
            .toThrow( new Error( 'Assertion error: Expected value to be an instance of "Number" but was "Boolean".' ) );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'by name', () => {
         expect( () => { logger_.setLogThreshold( 'WARN' ); } ).not.toThrow();
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'by number', () => {
         expect( () => { logger_.setLogThreshold( 200 ); } ).not.toThrow();
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'ignoring messages below that threshold', () => {
         logger_.trace( 'I was left here for tracing purposes only' );
         expect( spyChannel ).not.toHaveBeenCalled();

         logger_.addLogChannel( lateSpyChannel );
         expect( lateSpyChannel ).not.toHaveBeenCalled();
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'delivering and buffering messages having the configured threshold', () => {
         logger_.warn( 'Let op!' );
         expect( spyChannel ).toHaveBeenCalled();

         logger_.addLogChannel( lateSpyChannel );
         expect( lateSpyChannel ).toHaveBeenCalled();
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'delivering and buffering messages having the configured threshold', () => {
         logger_.fatal( 'Zombie apocalypse! Let\'s do something stupid.' );
         expect( spyChannel ).toHaveBeenCalled();

         logger_.addLogChannel( lateSpyChannel );
         expect( lateSpyChannel ).toHaveBeenCalled();
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'respects the configured threshold', () => {
         logger_.setLogThreshold( 'error' );
         logger_.warn( 'Let op!' );
         expect( spyChannel ).not.toHaveBeenCalled();

         logger_.setLogThreshold( 'WARN' );
         logger_.warn( 'Let op!' );
         expect( spyChannel ).toHaveBeenCalled();
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'configured with custom levels', () => {

      const global = new Function( 'return this' )();

      beforeEach( () => {

         // TODO this since "get" is readonly since using es6 modules. This is obsolete as soon as
         // every module has to expose a create function for fresh creation and dependency injection
         object.setPath( global, 'laxar.logging.levels', { NOTICE: 350, HELL: 666 } );

         logger_ = log.create();
         logger_.removeLogChannel( consoleChannel );
         logger_.addLogChannel( spyChannel );
      } );

      afterEach( () => {
         delete global.laxar;
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'compares them to the threshold when logging', () => {
         logger_.setLogThreshold( 'error' );
         logger_.notice( 'Let op!' );
         expect( spyChannel ).not.toHaveBeenCalled();

         logger_.setLogThreshold( 'fatal' );
         logger_.hell( 'Let op! Drempels!' );
         expect( spyChannel ).toHaveBeenCalled();
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'allows to use them as a threshold', () => {
         logger_.setLogThreshold( 'notice' );
         logger_.info( 'Let op!' );
         expect( spyChannel ).not.toHaveBeenCalled();

         logger_.warn( 'Let op! Drempels!' );
         expect( spyChannel ).toHaveBeenCalled();
      } );

   } );

} );
