/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [], function() {
   'use strict';

   /**
    * Constructor for Assert.
    * 
    * @param {*} subject
    *    the object assertions are made for
    * @param {String} [optionalDetails]
    *    details that should be printed whenever no details are given for an assertion method
    *
    * @constructor
    */
   function Assertion( subject, optionalDetails ) {
      this.subject_ = subject;
      this.details_ = optionalDetails || null;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Throws an error if the subject is `null` or `undefined`.
    *
    * @param {String} [optionalDetails]
    *    details to append to the error message
    *
    * @return {Assertion}
    *    this instance
    */
   Assertion.prototype.isNotNull = function isNotNull( optionalDetails ) {
      if( typeof this.subject_ === 'undefined' || this.subject_ === null ) {
         fail( 'Expected value to be defined and not null.', optionalDetails || this.details_ );
      }

      return this;
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Throws an error if the subject is not of the given type. No error is thrown for `null` or `undefined`.
    *
    * @param {Function} type
    *    the expected type of the subject
    * @param {String} [optionalDetails]
    *    details to append to the error message
    *
    * @return {Assertion}
    *    this instance
    */
   Assertion.prototype.hasType = function hasType( type, optionalDetails ) {
      if( typeof this.subject_ === 'undefined' || this.subject_ === null ) {
         return this;
      }

      if( typeof type !== 'function' ) {
         fail( 'type must be a constructor function. Got ' + ( typeof type ) + '.' );
      }

      if( !checkType( this.subject_, type ) ) {
         var actualString = functionName( this.subject_.constructor );
         var expectedString = functionName( type );

         fail( 'Expected value to be an instance of "' + expectedString + '" but was "' + actualString + '".',
               optionalDetails || this.details_ );
      }

      return this;
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Throws an error if the subject is no object or the given property is not defined on it.
    *
    * @param {String} property
    *    the property that is expected for the subject
    * @param {String} [optionalDetails]
    *    details to append to the error message
    *
    * @return {Assertion}
    *    this instance
    */
   Assertion.prototype.hasProperty = function hasProperty( property, optionalDetails ) {
      if( typeof this.subject_ !== 'object' ) {
         fail( 'value must be an object. Got ' + ( typeof this.subject_ ) + '.' );
      }

      if( !( property in this.subject_ ) ) {
         fail( 'value is missing mandatory property "' + property + '".', optionalDetails || this.details_ );
      }

      return this;
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function fail( message, optionalDetails ) {
      if( optionalDetails ) {
         message += ' Details: ' + optionalDetails;
      }
      throw new Error( 'Assertion error: ' + message );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var TYPE_TO_CONSTRUCTOR = {
      'string': String,
      'number': Number,
      'boolean': Boolean,
      'function': Function
   };
   function checkType( subject, type ) {
      if( typeof subject === 'object' ) {
         return subject instanceof type;
      }

      var actualType = TYPE_TO_CONSTRUCTOR[ typeof subject ];
      return actualType === type;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   // Matching whitespaces at the beginning is necessary for Internet Explorer ...
   var FUNCTION_NAME_MATCHER = /^[\s]*function ([^\(]*)\(/i;
   function functionName( func ) {
      var match = FUNCTION_NAME_MATCHER.exec( func.toString() );
      return match[1].length ? match[1] : 'anonymous';
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Creates and returns a mew `Assertion` instance for the given `subject`.
    *
    * @param {*} subject
    *    the object assertions are made for
    * @param {String} [optionalDetails]
    *    details that should be printed whenever no details are given for an assertion method
    *
    * @return {Assertion}
    *    the assertion instance
    */
   function assert( subject, optionalDetails ) {
      return new Assertion( subject, optionalDetails );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Marks a code path as erroneous if reached by throwing an error.
    *
    * @param {String} [optionalDetails]
    *    details to append to the error message
    */
   assert.codeIsUnreachable = function codeIsUnreachable( optionalDetails ) {
      fail( 'Code should be unreachable!', optionalDetails );
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Throws an error if the given expression is falsy.
    *
    * @param {*} expression
    *    the expression to test for truthyness
    * @param {String} [optionalDetails]
    *    details to append to the error message
    */
   assert.state = function state( expression, optionalDetails ) {
      if( !expression ) {
         fail( 'State does not hold.', optionalDetails );
      }
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return assert;

} );
