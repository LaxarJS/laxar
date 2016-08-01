/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createLogMock } from '../log_mock';

describe( 'A log mock', () => {

   let logMock;

   beforeEach( () => {
      logMock = createLogMock();
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'provides a `log`-compatible API', () => {
      expect( logMock.level ).toEqual( jasmine.any( Object ) );
      expect( logMock.log ).toEqual( jasmine.any( Function ) );

      expect( logMock.fatal ).toEqual( jasmine.any( Function ) );
      expect( logMock.error ).toEqual( jasmine.any( Function ) );
      expect( logMock.warn ).toEqual( jasmine.any( Function ) );
      expect( logMock.info ).toEqual( jasmine.any( Function ) );
      expect( logMock.debug ).toEqual( jasmine.any( Function ) );
      expect( logMock.trace ).toEqual( jasmine.any( Function ) );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'spies on the `log` methods', () => {
      logMock.log( 'INFO', 'hey' );
      expect( logMock.log ).toHaveBeenCalled();
      logMock.error( 'oh my!' );
      expect( logMock.error ).toHaveBeenCalled();
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'exposes the default log levels', () => {
      expect( logMock.level.FATAL ).toEqual( jasmine.any( Number ) );
      expect( logMock.level.ERROR ).toEqual( jasmine.any( Number ) );
      expect( logMock.level.WARN ).toEqual( jasmine.any( Number ) );
      expect( logMock.level.INFO ).toEqual( jasmine.any( Number ) );
      expect( logMock.level.DEBUG ).toEqual( jasmine.any( Number ) );
      expect( logMock.level.TRACE ).toEqual( jasmine.any( Number ) );
      expect( logMock.level.STATISTICS ).not.toBeDefined();
   } );

} );
