/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createConsoleChannel } from '../console_channel';
import { create as createBrowserMock } from '../../testing/browser_mock';

describe( 'A console log channel', () => {

   let browserMock_;
   let consoleChannel_;

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'without a console', () => {

      beforeEach( () => {
         browserMock_ = createBrowserMock( { console: null } );
         consoleChannel_ = createConsoleChannel( browserMock_ );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'will silently ignore log messages', () => {
         const message = messageItem( 'some problem', { level: 'ERROR' } );
         expect( () => consoleChannel_( message ) ).not.toThrow();
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'with a console, but without console.log', () => {

      beforeEach( () => {
         browserMock_ = createBrowserMock( { console: {} } );
         consoleChannel_ = createConsoleChannel( browserMock_ );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'will silently ignore log messages', () => {
         const message = messageItem( 'some problem', { level: 'ERROR' } );
         expect( () => consoleChannel_( message ) ).not.toThrow();
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when *only* console.log is available', () => {

      let logSpy;

      beforeEach( () => {
         logSpy = jasmine.createSpy( 'console.log' );
         browserMock_ = createBrowserMock( { console: { log: logSpy } } );
         consoleChannel_ = createConsoleChannel( browserMock_ );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'will fall back to console.log if a specific log method does not exist', () => {
         consoleChannel_( messageItem( 'some error' ) );
         expect( logSpy ).toHaveBeenCalled();
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when a full console is available', () => {

      let log;
      let debug;
      let trace;

      beforeEach( () => {
         browserMock_ = createBrowserMock();
         log = browserMock_.console().log;
         debug = browserMock_.console().debug;
         trace = browserMock_.console().trace;
         consoleChannel_ = createConsoleChannel( browserMock_ );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'will use the appropriate console methods', () => {
         consoleChannel_( messageItem( 'some debug information', { level: 'DEBUG' } ) );
         expect( log ).not.toHaveBeenCalled();
         expect( debug ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'will map trace to console.log because of different semantics (log level vs stack trace)', () => {
         consoleChannel_( messageItem( 'Opening database connection', { level: 'TRACE' } ) );
         expect( trace ).not.toHaveBeenCalled();
         expect( log ).toHaveBeenCalled();
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when processing a message object', () => {

      let logArgs;

      beforeEach( () => {
         browserMock_ = createBrowserMock();
         consoleChannel_ = createConsoleChannel( browserMock_ );

         const item = messageItem( 'this [0:%o] is a [1:%s:flip] [0]. Data: [2:anonymize]!', {
            replacements: [ 'situation', 'bad', { cars: 10 } ],
            level: 'ERROR'
         } );
         consoleChannel_( item );
         logArgs = browserMock_.console().error.calls.argsFor( 0 );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'prefixes the message with the level name', () => {
         expect( logArgs[ 0 ].substr( 0, 6 ) ).toEqual( 'ERROR:' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'appends source information', () => {
         expect( logArgs.pop() ).toMatch( /\(@.+:.+\)$/ );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it(
         'splits the message at the replacement marks and inserts the replacement value at the position ' +
         'for the argument list, ignoring type specifiers and mapping functions', () => {
         logArgs.shift();
         logArgs.pop();
         expect( logArgs ).toEqual( [
            'this ', 'situation', ' is a ', 'bad', ' ', 'situation', '. Data: ', { cars: 10 }, '!'
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
