/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { log as consoleChannel } from '../console_channel';
import log from '../log';

describe( 'A console logger', () => {

   var logger_;
   var origConsole_;

   beforeEach( () => {
      origConsole_ = window.console;
      window.console = {};

      logger_ = log.create();
      logger_.addLogChannel( consoleChannel );
      logger_.setLogThreshold( 'TRACE' );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   afterEach( () => {
      window.console = origConsole_;
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'will silently ignore if console doesn\'t exist', () => {
      window.console = null;
      expect( () => logger_.error( 'some error' ) ).not.toThrow();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'will silently ignore if console.log doesn\'t exist', () => {
      expect( () => logger_.error( 'some error' ) ).not.toThrow();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when console.log is available', () => {

      beforeEach( () => {
         window.console.log = jasmine.createSpy( 'console.log' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'will fall back to console.log if a specific log method does not exist', () =>  {
         logger_.error( 'some error' );

         expect( window.console.log ).toHaveBeenCalled();
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'will use the appropriate console method if it exists', () => {
         window.console.debug = jasmine.createSpy( 'console.debug' );

         logger_.debug( 'Open file handles: 2001' );

         expect( window.console.log ).not.toHaveBeenCalled();
         expect( window.console.debug ).toHaveBeenCalled();
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'will map trace to console.log because of different semantics (log level vs stack trace)', () => {
         window.console.trace = jasmine.createSpy( 'console.trace' );

         logger_.trace( 'Opening database connection' );

         expect( window.console.trace ).not.toHaveBeenCalled();
         expect( window.console.log ).toHaveBeenCalled();
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'processes the message object and', () => {

      var logArgs;

      beforeEach( () => {
         window.console.error = jasmine.createSpy( 'console.error' );
         logger_.error( 'this [0:%o] is a [1:%s:flip] [0]. Data: [2:anonymize]!', 'situation', 'bad', { cars: 10 } );

         logArgs = window.console.error.calls.argsFor( 0 );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'prefixes the message with the level name', () => {
         expect( logArgs[0].substr( 0, 6 ) ).toEqual( 'ERROR:' );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'appends source information', () => {
         expect( logArgs.pop() ).toMatch( /\(@.+:.+\)$/ );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'splits the message at the replacement marks and inserts the replacement value at the position for the argument list, ignoring type specifiers and mapping functions', () => {
         logArgs.shift();
         logArgs.pop();

         expect( logArgs ).toEqual( [
            'this ', 'situation', ' is a ', 'bad', ' ', 'situation', '. Data: ',  { cars: 10 }, '!'
         ] );
      } );

   } );

} );
