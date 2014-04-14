/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../object'
], function( object ) {
   'use strict';

   describe( 'Object utilities', function() {

      describe( 'path( Object, String[, default] )', function() {

         var obj;

         beforeEach( function() {
            obj = {
               zero: null,
               one: {
                  two: 2
               },
               three: 3,
               arr: [ {
                  name: 'Peter'
               }, {
                  name: 'Hans'
               } ]
            };
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns the given value if it exists', function() {
            expect( object.path( obj, 'one.two' ) ).toBe( 2 );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns the default value if it does not exist', function() {
            expect( object.path( obj, 'one.twoo', 666 ) ).toBe( 666 );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns the default value if any part of the path is falsy', function() {
            expect( object.path( obj, 'zero.one', 666 ) ).toBe( 666 );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns the default value if any part of the path is not an object', function() {
            expect( object.path( obj, 'one.two.three', 666 ) ).toBe( 666 );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns undefined if it does not exist and no default is given', function() {
            expect( object.path( obj, 'one.twoo' ) ).not.toBeDefined();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'can resolve array indices within paths', function() {
            expect( object.path( obj, 'arr.0.name' ) ).toEqual( 'Peter' );
            expect( object.path( obj, 'arr.1.name' ) ).toEqual( 'Hans' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'setPath( Object, String, Object )', function() {

         var obj;

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         beforeEach( function() {
            obj = {
               listOfStrings: [ 'A', 'B', 'C' ],
               level1: {
                  value: 'ABC',
                  level2: {
                     value: 'DEF'
                  }
               }
            };

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'adds non existing array elements at the specified position, setting intermediate values to null', function() {
            object.setPath( obj, 'listOfStrings.5', 'Y' );

            expect( obj.listOfStrings[4] ).toBe( null );
            expect( obj.listOfStrings[5] ).toEqual( 'Y' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'adds non existing paths for arrays', function() {
            object.setPath( obj, 'lists.0.objects.4.value', 'B' );

            expect( obj.lists.length ).toBe( 1 );
            expect( obj.lists[0].objects.length ).toBe( 5 );
            expect( obj.lists[0].objects[0] ).toBe( null );
            expect( obj.lists[0].objects[1] ).toBe( null );
            expect( obj.lists[0].objects[2] ).toBe( null );
            expect( obj.lists[0].objects[3] ).toBe( null );
            expect( obj.lists[0].objects[4].value ).toEqual( 'B' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'deepFreeze( Object[, recursive] )', function() {

         if( typeof Object.freeze !== 'function' || /phantom/i.test( navigator.userAgent ) ) {
            // skip tests if the freezing isn't supported by the underlying JavaScript engine
            it( 'is not supported by this JavaScript engine', function() {} );
            return;
         }

         var oneDim;
         var multiDim;
         var origFreeze;

         beforeEach( function() {
            oneDim = {
               name: 'Hans',
               age: 12
            };

            multiDim = {
               wife: {
                  name: 'Gisela',
                  age: 65
               },
               car: {
                  manufacturer: 'Mercedes',
                  color: 'grey'
               },
               pets: ['dog', 'cat']
            };

            spyOn( Object, 'freeze' ).andCallThrough();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns the one dimensional object with all properties it had before', function() {
            var frozen = object.deepFreeze( oneDim );
            expect( frozen.name ).toEqual( 'Hans' );
            expect( frozen.age ).toEqual( 12 );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns the multi dimensional object with all properties it had before', function() {
            var frozen = object.deepFreeze( multiDim );
            expect( frozen.wife.name ).toEqual( 'Gisela' );
            expect( frozen.wife.age ).toEqual( 65 );
            expect( frozen.car.manufacturer ).toEqual( 'Mercedes' );
            expect( frozen.car.color ).toEqual( 'grey' );
            expect( frozen.pets ).toEqual( ['dog', 'cat'] );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns a one dimensional object, that cannot be modified', function() {
            var frozen = object.deepFreeze( oneDim );
            expect( function() {
               frozen.name = 'Peter';
            } ).toThrow();
            expect( function() {
               frozen.age = 12;
            } ).toThrow();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns a multi dimensional object, that cannot be modified', function() {
            var frozen = object.deepFreeze( multiDim, true );
            expect( function() {
               frozen.wife.name = 'Margarete';
            } ).toThrow();
            expect( function() {
               frozen.car.color = 'red';
            } ).toThrow();
            expect( function() {
               frozen.pets[1] = 'snake';
            } ).toThrow();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'ignores already frozen objects', function() {

            var frozen = object.deepFreeze( oneDim );
            expect( Object.freeze.callCount ).toBe( 1 );

            object.deepFreeze( frozen );
            expect( Object.freeze.callCount ).toBe( 1 );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'deepClone( Object )', function() {

         var obj;
         var clone;

         beforeEach( function() {
            obj = {
               wife: {
                  name: 'Gisela',
                  age: 65
               },
               car: {
                  manufacturer: 'Mercedes',
                  color: 'grey'
               },
               pets: ['dog', 'cat'],

               aNullValue: null,

               anUndefinedValue: undefined

            };

            clone = object.deepClone( obj );
            clone.wife.name = 'Henrietta';
            clone.pets.push( 'mouse' );
            clone.pets[0] = 'tiger';
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'creates a deep clone such that subsequent modifications to the clone do not affect the original object', function() {
            expect( obj.wife.name ).toEqual( 'Gisela' );
            expect( obj.pets ).toEqual( ['dog', 'cat'] );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns null as is', function() {
            expect( clone.aNullValue ).toBeNull();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns undefined as is', function() {
            expect( clone.anUndefinedValue ).toBeUndefined();
         } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'map( obj, mapFunction )', function() {

         it( 'returns a new object were each value is mapped according to the mapping function', function() {
            expect( object.map( { a: 12, b: 13 }, function( val, key ) {
               return [ key + '_', val + 20 ];
            } ) ).toEqual( { a_: 32, b_: 33 } );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'forEach( obj, iteratorFunction )', function() {

         var iteratorSpy;

         beforeEach( function() {
            iteratorSpy = jasmine.createSpy( 'iteratorSpy' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'calls an iterator function for each entry in an object', function() {
            var obj = {
               one: 'eins',
               two: 'zwei',
               three: 3
            };
            object.forEach( obj, iteratorSpy );

            expect( iteratorSpy ).toHaveBeenCalledWith( 'eins', 'one', obj );
            expect( iteratorSpy ).toHaveBeenCalledWith( 'zwei', 'two', obj );
            expect( iteratorSpy ).toHaveBeenCalledWith( 3, 'three', obj );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'calls an iterator function for each entry in an array', function() {
            var arr = [ 'eins', 'zwei', 3 ];
            object.forEach( [ 'eins', 'zwei', 3 ], iteratorSpy );

            expect( iteratorSpy ).toHaveBeenCalledWith( 'eins', 0, arr );
            expect( iteratorSpy ).toHaveBeenCalledWith( 'zwei', 1, arr );
            expect( iteratorSpy ).toHaveBeenCalledWith( 3, 2, arr );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'extend( target, source1, source2, ... )', function() {

         var one;
         var two;
         var three;

         beforeEach( function() {
            one = {
               color: 'red'
            };
            two = {
               cake: 'lie'
            };
            three = {
               color: 'green',
               meal: 'steak'
            };
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'merges the properties from the sources into the target', function() {
            var target = {};
            object.extend( target, one, two );

            expect( target ).toEqual( {
               color: 'red',
               cake: 'lie'
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'overwrites properties existing in earlier sources', function() {
            var target = {};
            object.extend( target, one, two, three );

            expect( target ).toEqual( {
               color: 'green',
               cake: 'lie',
               meal: 'steak'
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns the new target for functional application', function() {
            expect( object.extend( {}, one, two ) ).toEqual( {
               color: 'red',
               cake: 'lie'
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'gracefully ignores null or undefined sources', function() {
            var target = {};
            object.extend( target, null, one, undefined, two );

            expect( target ).toEqual( {
               color: 'red',
               cake: 'lie'
            } );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'options( options, defaults )', function() {

         var options;
         var defaults;

         beforeEach( function() {
            options = {
               pollingMillis: 200
            };
            defaults = {
               pollingMillis: 100,
               pollingTimeout: 1000
            };
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns options where missing properties are filled with given defaults', function() {
            expect( object.options( options, defaults ) ).toEqual( {
               pollingMillis: 200,
               pollingTimeout: 1000
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'doesn\'t modify the passed options', function() {
            object.options( options, defaults );
            expect( options.pollingTimeout ).toBeUndefined();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'can handle null or undefined options', function() {
            expect( object.options( null, defaults ) ).toEqual( {
               pollingMillis: 100,
               pollingTimeout: 1000
            } );
            expect( object.options( void 0, defaults ) ).toEqual( {
               pollingMillis: 100,
               pollingTimeout: 1000
            } );
         } );

      } );

   } );

} );
