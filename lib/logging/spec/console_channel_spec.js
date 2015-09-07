/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../console_channel',
   '../log'
], function( consoleChannel, log ) {
   'use strict';

   describe( 'A console logger', function() {

      var logger_;
      var origConsole_;

      beforeEach( function() {
         origConsole_ = window.console;
         window.console = {};

         logger_ = log.create();
         logger_.addLogChannel( consoleChannel );
         logger_.setLogThreshold( 'TRACE' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      afterEach( function() {
         window.console = origConsole_;
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'will silently ignore if console doesn\'t exist', function() {
         window.console = null;
         expect( function() { logger_.error( 'some error' ); } ).not.toThrow();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'will silently ignore if console.log doesn\'t exist', function() {
         expect( function() { logger_.error( 'some error' ); } ).not.toThrow();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when console.log is available', function() {

         beforeEach( function() {
            window.console.log = jasmine.createSpy( 'console.log' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'will fall back to console.log if a specific log method does not exist', function()  {
            logger_.error( 'some error' );

            expect( window.console.log ).toHaveBeenCalled();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'will use the appropriate console method if it exists', function() {
            window.console.debug = jasmine.createSpy( 'console.debug' );

            logger_.debug( 'Open file handles: 2001' );

            expect( window.console.log ).not.toHaveBeenCalled();
            expect( window.console.debug ).toHaveBeenCalled();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'will map trace to console.log because of different semantics (log level vs stack trace)', function() {
            window.console.trace = jasmine.createSpy( 'console.trace' );

            logger_.trace( 'Opening database connection' );

            expect( window.console.trace ).not.toHaveBeenCalled();
            expect( window.console.log ).toHaveBeenCalled();
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'processes the message object and', function() {

         var logArgs;

         beforeEach( function() {
            window.console.error = jasmine.createSpy( 'console.error' );
            logger_.error( 'this [0:%o] is a [1:%s:flip] [0]. Data: [2:anonymize]!', 'situation', 'bad', { cars: 10 } );

            logArgs = window.console.error.calls[0].args;
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'prefixes the message with the level name', function() {
            expect( logArgs[0].substr( 0, 6 ) ).toEqual( 'ERROR:' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'appends source information', function() {
            expect( logArgs.pop() ).toMatch( /\(@.+:.+\)$/ );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'splits the message at the replacement marks and inserts the replacement value at the position for the argument list, ignoring type specifiers and mapping functions', function() {
            logArgs.shift();
            logArgs.pop();

            expect( logArgs ).toEqual( [
               'this ', 'situation', ' is a ', 'bad', ' ', 'situation', '. Data: ',  { cars: 10 }, '!'
            ] );
         } );

      } );

   } );
} );
