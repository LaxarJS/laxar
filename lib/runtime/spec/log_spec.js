/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

import { create as createBrowserMock } from '../../testing/browser_mock';
import { create as createConfigurationMock } from '../../testing/configuration_mock';
import { create, createConsoleChannel, levels, BLACKBOX } from '../log';

describe( 'A logger', () => {

   let configurationMock;
   let configurationValues;
   let logger;
   let spyChannel;

   beforeEach( () => {
      configurationValues = { 'logging.threshold': 'INFO' };
      spyChannel = jasmine.createSpy( 'spyChannel' );
      configurationMock = createConfigurationMock( configurationValues );
      logger = create( configurationMock );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'defines shortcut log methods', () => {

      beforeEach( () => {
         spyOn( logger, 'log' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      Object.keys( levels ).forEach( levelName => {

         it( `for log level ${levelName}`, () => {
            logger[ levelName.toLowerCase() ]( 'message' );

            expect( logger.log ).toHaveBeenCalledWith( logger.levels[ levelName ], 'message', BLACKBOX );
         } );

      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'supports log channels', () => {

      let lateSpyChannel;

      beforeEach( () => {
         lateSpyChannel = jasmine.createSpy( 'lateSpyChannel' );

         logger.addLogChannel( spyChannel );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'that instantly receive log messages', () => {
         logger.error( 'some error' );
         logger.info( 'some info' );

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

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'that no longer receive messages when removed', () => {
         logger.error( 'some error' );
         logger.removeLogChannel( spyChannel );
         logger.info( 'some info' );

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

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'and queues the configured amount of log messages', () => {

         beforeEach( () => {
            for( let i = 0; i < 150; ++i ) {
               logger.error( `error ${i}` );
            }
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'to deliver them to channels registered later', () => {
            logger.addLogChannel( lateSpyChannel );

            expect( lateSpyChannel.calls.count() ).toBe( 100 );
            expect( lateSpyChannel.calls.argsFor(0)[ 0 ].id ).toBe( 50 );
            expect( lateSpyChannel.calls.argsFor(99)[ 0 ].id ).toBe( 149 );
         } );

      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'supporting tags', () => {

      beforeEach( () => {
         logger.addLogChannel( spyChannel );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'allows to add tags', () => {
         logger.addTag( 'TAG', 'tag_value' );
         logger.addTag( 'TAG2', 'tag2_value' );

         expect( logger.gatherTags() ).toEqual( {
            TAG: 'tag_value',
            TAG2: 'tag2_value'
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'allows to remove tags', () => {
         logger.addTag( 'TAG', 'tag_value' );
         logger.addTag( 'TAG2', 'tag2_value' );
         expect( logger.gatherTags() ).toEqual( {
            TAG: 'tag_value',
            TAG2: 'tag2_value'
         } );

         logger.removeTag( 'TAG2' );
         expect( logger.gatherTags() ).toEqual( {
            TAG: 'tag_value'
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'adds all currently active tags to a log message', () => {
         logger.addTag( 'TAG', 'tag_value' );
         logger.addTag( 'TAG', 'tag_value2' );
         logger.addTag( 'TAG2', 'tag2_value' );

         logger.error( 'some error' );

         expect( spyChannel.calls.argsFor(0)[ 0 ].tags ).toEqual( {
            TAG: 'tag_value;tag_value2',
            TAG2: 'tag2_value'
         } );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'with message objects', () => {

      let firstMessage;
      let secondMessage;

      beforeEach( () => {
         logger.addLogChannel( spyChannel );

         logger.error( 'this [0] is [1]. Data: [2]', 'situation', 'bad', { cars: 10 } );
         logger.info( 'its [0]', 'okay' );

         firstMessage = spyChannel.calls.argsFor(0)[ 0 ];
         secondMessage = spyChannel.calls.argsFor(1)[ 0 ];
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'containing an array of provided replacement data', () => {
         expect( firstMessage.replacements ).toEqual( [ 'situation', 'bad', { cars: 10 } ] );
         expect( secondMessage.replacements ).toEqual( [ 'okay' ] );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'having an increasing id', () => {
         expect( firstMessage.id ).toEqual( 0 );
         expect( secondMessage.id ).toEqual( 1 );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'having source information where the call happened', () => {
         // due to the very different quality of stack information available across browsers a better test
         // is not possible here.
         expect( firstMessage.sourceInfo.file ).toBeDefined();
         expect( firstMessage.sourceInfo.line ).toBeDefined();
         expect( firstMessage.sourceInfo.char ).toBeDefined();
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'supports to set a threshold', () => {

      const ASSERTION_PREFIX = 'Assertion error: State does not hold. Details: ';
      let lateSpyChannel;

      beforeEach( () => {
         lateSpyChannel = jasmine.createSpy( 'lateSpyChannel' );

         logger.addLogChannel( spyChannel );
         logger.setLogThreshold( logger.levels.WARN );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'throwing an error when trying to set one that doesn\'t exist', () => {
         expect( () => { logger.setLogThreshold( 'BOGUS' ); } )
            .toThrow( new Error( `${ASSERTION_PREFIX}Unsupported log threshold "BOGUS".` ) );
         expect( () => { logger.setLogThreshold( true ); } )
            .toThrow( new Error(
               'Assertion error: Expected value to be an instance of "Number" but was "Boolean".'
            ) );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'by name', () => {
         expect( () => { logger.setLogThreshold( 'WARN' ); } ).not.toThrow();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'by number', () => {
         expect( () => { logger.setLogThreshold( 200 ); } ).not.toThrow();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'ignoring messages below that threshold', () => {
         logger.trace( 'I was left here for tracing purposes only' );
         expect( spyChannel ).not.toHaveBeenCalled();

         logger.addLogChannel( lateSpyChannel );
         expect( lateSpyChannel ).not.toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'delivering and buffering messages having the configured threshold', () => {
         logger.warn( 'Let op!' );
         expect( spyChannel ).toHaveBeenCalled();

         logger.addLogChannel( lateSpyChannel );
         expect( lateSpyChannel ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'delivering and buffering messages having the configured threshold', () => {
         logger.fatal( 'Zombie apocalypse! Let\'s do something stupid.' );
         expect( spyChannel ).toHaveBeenCalled();

         logger.addLogChannel( lateSpyChannel );
         expect( lateSpyChannel ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'respects the configured threshold', () => {
         logger.setLogThreshold( 'error' );
         logger.warn( 'Let op!' );
         expect( spyChannel ).not.toHaveBeenCalled();

         logger.setLogThreshold( 'WARN' );
         logger.warn( 'Let op!' );
         expect( spyChannel ).toHaveBeenCalled();
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'configured with custom levels', () => {

      beforeEach( () => {
         configurationValues[ 'logging.levels' ] = { NOTICE: 350, HELL: 666 };
         logger = create( configurationMock );
         logger.addLogChannel( spyChannel );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'compares them to the threshold when logging', () => {
         logger.setLogThreshold( 'error' );
         logger.notice( 'Let op!' );
         expect( spyChannel ).not.toHaveBeenCalled();

         logger.setLogThreshold( 'fatal' );
         logger.hell( 'Let op! Drempels!' );
         expect( spyChannel ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'allows to use them as a threshold', () => {
         logger.setLogThreshold( 'notice' );
         logger.info( 'Let op!' );
         expect( spyChannel ).not.toHaveBeenCalled();

         logger.warn( 'Let op! Drempels!' );
         expect( spyChannel ).toHaveBeenCalled();
      } );

   } );

} );

describe( 'A console log channel', () => {

   let browserMock;
   let consoleChannel;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'without a console', () => {

      beforeEach( () => {
         browserMock = createBrowserMock( { consoleMock: null } );
         consoleChannel = createConsoleChannel( browserMock );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'will silently ignore log messages', () => {
         const message = messageItem( 'some problem', { level: 'ERROR' } );
         expect( () => consoleChannel( message ) ).not.toThrow();
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'with a console, but without console.log', () => {

      beforeEach( () => {
         browserMock = createBrowserMock( { console: {} } );
         consoleChannel = createConsoleChannel( browserMock );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'will silently ignore log messages', () => {
         const message = messageItem( 'some problem', { level: 'ERROR' } );
         expect( () => consoleChannel( message ) ).not.toThrow();
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when *only* console.log is available', () => {

      let errorSpy;
      let logSpy;

      beforeEach( () => {
         logSpy = jasmine.createSpy( 'console.log' );
         errorSpy = jasmine.createSpy( 'console.error' );
         browserMock = createBrowserMock( { consoleMock: { log: logSpy, error: errorSpy } } );
         consoleChannel = createConsoleChannel( browserMock );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'will fall back to console.log if a specific lower-level log method does not exist', () => {
         consoleChannel( messageItem( 'some warning', { level: 'WARN' } ) );
         expect( logSpy ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'will fall back to console.error for log.fatal', () => {
         consoleChannel( messageItem( 'something fatal', { level: 'FATAL' } ) );
         expect( errorSpy ).toHaveBeenCalled();
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when a full console is available', () => {

      let log;
      let debug;
      let trace;

      beforeEach( () => {
         browserMock = createBrowserMock();
         log = browserMock.console().log;
         debug = browserMock.console().debug;
         trace = browserMock.console().trace;
         consoleChannel = createConsoleChannel( browserMock );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'will use the appropriate console methods', () => {
         consoleChannel( messageItem( 'some debug information', { level: 'DEBUG' } ) );
         expect( log ).not.toHaveBeenCalled();
         expect( debug ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'will map trace to console.log because of different semantics (log level vs stack trace)', () => {
         consoleChannel( messageItem( 'Opening database connection', { level: 'TRACE' } ) );
         expect( trace ).not.toHaveBeenCalled();
         expect( log ).toHaveBeenCalled();
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when processing a message object', () => {

      let logArgs;

      beforeEach( () => {
         browserMock = createBrowserMock();
         consoleChannel = createConsoleChannel( browserMock );

         const item = messageItem( 'this [0:%o] is a [1:%s:flip] [0]. Data: [2:anonymize]!', {
            replacements: [ 'situation', 'bad', { cars: 10 } ],
            level: 'ERROR'
         } );
         consoleChannel( item );
         logArgs = browserMock.console().error.calls.argsFor( 0 );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'prefixes the message with the level name', () => {
         expect( logArgs[ 0 ].substr( 0, 6 ) ).toEqual( 'ERROR:' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'appends source information', () => {
         expect( logArgs[ 0 ] ).toMatch( /\(@.+:.+\)$/ );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it(
         'converts the replacement markers to console-compatible interpolation specifiers, using type ' +
         'specifiers if they are present, otherwise infering the format from the replacement', () => {
         expect( logArgs ).toEqual( [
            'ERROR: this %o is a %s %s. Data: %o! (@ a.js:100)', 'situation', 'bad', 'situation', { cars: 10 }
         ] );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function messageItem( text, optionalOptions = {} ) {
      const {
         level = 'ERROR',
         replacements = [],
         sourceInfo = { file: 'a.js', line: 100 }
      } = optionalOptions;
      return { text, level, replacements, sourceInfo };
   }

} );
