/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../text'
], function( Text ) {
   'use strict';

   describe( 'Text', function() {

      it( 'has a method format()', function() {
         expect( typeof Text.format ).toBe( 'function' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'has a method argument()', function() {
         expect( typeof Text.argument ).toBe( 'function' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      // format()
      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      describe( 'format( String formatString, [...] )', function() {

         it( 'takes a format string and and arbitrary number of optional arguments', function() {
            // No test
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'leaves a string without any placeholders unchanged', function() {
            var testString = 'This is a test';
            expect( Text.format( testString ) ).toBe( testString );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'replaces positional placeholders (e.g. [0]) with the respective arguments', function() {
            expect( Text.format( 'Hello, [0]!', 'World' ) ).toBe( 'Hello, World!' );
            expect( Text.format( 'Hello, [1] [0]!', 'World', 'cruel' ) ).toBe( 'Hello, cruel World!' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'treats escaped characters as normal text', function() {
            expect( Text.format( 'Hello, \\[0]', 4711 ) ).toEqual( 'Hello, [0]' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'throws an error if a positional placeholder references a non-existing argument', function() {
            var test = function() { Text.format( 'Hello, [0]' ); };
            expect( test ).toThrow();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'can format integral numbers without an explicit formatter', function() {
            expect( Text.format( '[0]', 4711 ) ).toBe( '4711' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'can format boolean values without an explicit formatter', function() {
            expect( Text.format( '[0]', true ) ).toBe( 'true' );
            expect( Text.format( '[0]', false ) ).toBe( 'false' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'can format String values without an explicit formatter', function() {
            expect( Text.format( '[0]', 'Hello!' ) ).toBe( 'Hello!' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'formats any object using its getFormatter() method if it has one', function() {
            var object = {
               'getFormatter' : function() {
                  return {
                     'format': function() {
                        return 'It works!';
                     }
                  };
               }
            };

            expect( Text.format( '[0]', object ) ).toBe( 'It works!' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'formats any object using its toString() method if it has one', function() {
            var object = {
               'toString' : function() {
                  return 'It works!';
               }
            };

            expect( Text.format( '[0]', object ) ).toBe( 'It works!' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'accepts combinations of positional and named arguments', function() {
            var text = Text.format( '[1], [who]!', Text.argument( 'who', 'World' ), 'Hello' );
            expect( text).toBe( 'Hello, World!' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'passes the actual format part of the format string to the object\'s formatter', function() {
            var object = {
               'getFormatter' : function() {
                  return {
                     'format': function( value, genericFormat ) {
                        return '(' + genericFormat.toString() + ')';
                     }
                  };
               }
            };

            var result = Text.format( 'ABC[0:%.3x]DEF', object );
            expect( result ).toBe( 'ABC(%.3x)DEF' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'chooses the object\'s formatter over its toString() method if both exist', function() {
            var object = {
               'getFormatter' : function() {
                  return {
                     'toString': function() {
                        return 'toString()';
                     },

                     'format': function( value, genericFormat ) {
                        return 'format()';
                     }
                  };
               }
            };

            var result = Text.format( '[0:%3.5x]', object );
            expect( result ).toBe( 'format()' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'has a pre-defined formatter for strings using the %s specifier', function() {
            var result = Text.format( 'Hello, [0:%s]!', 'World' );
            expect( result ).toBe( 'Hello, World!' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'has a pre-defined formatter for numbers using the %f specifier', function() {
            var result = Text.format( 'The value is [0:%.2f]!', 47.1234 );
            expect( result ).toBe( 'The value is 47.12!' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'has a pre-defined formatter for objects using the %o specifier', function() {
            var result = Text.format( 'The value is [0:%o]!', { Hello: 'Object' } );
            expect( result ).toBe( 'The value is {"Hello":"Object"}!' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'throws an error if a format is used that is not understood by the standard formatters', function() {
            var test = function() {
               return Text.format( 'The value is [0:%.2x]!', 47.1234 );
            };

            expect( test ).toThrow();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'pads strings with leading spaces if the value is shorter than the requested length', function() {
            var result = Text.format( 'A[0:%5s]', '345' );
            expect( result ).toBe( 'A  345' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'cuts off strings at the right side if the value is longer than the requested length', function() {
            var result = Text.format( '[0:%.3s]', '12345' );
            expect( result ).toBe( '123' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'can resolve named arguments by their positional index', function() {
            var result = Text.format( '[1]', '123', Text.argument( 'something', '456' ) );
            expect( result ).toBe( '456' );
         } );
      } );


      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      // argument()
      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      describe( 'argument( String name, Object value )', function() {
         it( 'creates a TextArgument using the specified name and value', function() {
            var textArgument = Text.argument( 'x', 4711 );

            expect( textArgument.name ).toBe( 'x' );
            expect( textArgument.value ).toBe( 4711 );
         } );
      } );
   } );


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   // TextArgument
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   describe( 'TextArgument', function() {
      it( 'has an attribute "name" of type String', function() {
         var textArgument = Text.argument( 'x', 4711 );
         expect( textArgument.name ).toBeDefined();
         expect( typeof textArgument.name ).toBe( 'string' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'has an attribute "value"', function() {
         var textArgument = Text.argument( 'x', 4711 );
         expect( textArgument.value ).toBeDefined();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'has a method "getFormatter()"', function() {
         var textArgument = Text.argument( 'x', 4711 );
         expect( typeof textArgument.getFormatter ).toBe( 'function' );
      } );


      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      // getFormatter()
      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      describe( 'getFormatter()', function() {
         it( 'returns an instance of Formatter', function() {
            expect( typeof Text.argument( 'x', 'y' ).getFormatter ).toBe( 'function' );
         } );
      } );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   // Formatter
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   describe( 'Formatter', function() {
      it( 'has a function "format()', function() {
         var formatter = Text.argument( 'x', 'y').getFormatter();
         expect( typeof formatter.format ).toBe( 'function' );
      } );


      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      // Formatter.format()
      ////////////////////////////////////////////////////////////////////////////////////////////////////////
      describe( 'format( Object value, [GenericFormat genericformat] )', function() {
         it( 'formats the given value using the specified format (if defined and not null)', function() {
            // No test
         } );
      } );
   } );

} );