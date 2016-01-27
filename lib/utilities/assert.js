/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/**
 * The *assert* module provides some simple assertion methods for type checks, truthyness tests and guards
 * invalid code paths.
 *
 * When requiring `laxar`, it is available as `laxar.assert`.
 *
 * @module assert
 */


/**
 * Constructor for an Assertion.
 *
 * @param {*} subject
 *    the object assertions are made for
 * @param {String} [optionalDetails]
 *    details that should be printed in case no specific details are given for an assertion method
 *
 * @constructor
 * @private
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
      fail( `type must be a constructor function. Got ${typeof type}.` );
   }

   if( !checkType( this.subject_, type ) ) {
      var actualString = functionName( this.subject_.constructor );
      var expectedString = functionName( type );

      fail( `Expected value to be an instance of "${expectedString}" but was "${actualString}".`,
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
      fail( `value must be an object. Got ${typeof this.subject_}.` );
   }

   if( !( property in this.subject_ ) ) {
      fail( `value is missing mandatory property "${property }".`, optionalDetails || this.details_ );
   }

   return this;
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function fail( message, optionalDetails ) {
   if( optionalDetails ) {
      message += ' Details: ' +
         ( typeof optionalDetails === 'object' ? JSON.stringify( optionalDetails ) : optionalDetails );
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

var FUNCTION_NAME_MATCHER = /^function ([^\(]*)\(/i;
function functionName( func ) {
   var match = FUNCTION_NAME_MATCHER.exec( func.toString().trim() );
   return match[1].length ? match[1] : 'n/a';
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates and returns a new `Assertion` instance for the given `subject`.
 *
 * **Note**: this function is no member of the module, but the module itself. Thus when using `assert` via
 * laxar, `assert` is will be no simple object, but this function having the other functions as
 * properties.
 *
 * Example:
 * ```js
 * define( [ 'laxar' ], function( ax ) {
 *    ax.assert( ax.assert ).hasType( Function );
 *    ax.assert.state( typeof ax.assert.codeIsUnreachable === 'function' );
 * } );
 * ```
 *
 * @param {*} subject
 *    the object assertions are made for
 * @param {String} [optionalDetails]
 *    details that should be printed in case no specific details are given when calling an assertion method
 *
 * @return {Assertion}
 *    the assertion instance
 */
function assert( subject, optionalDetails ) {
   return new Assertion( subject, optionalDetails );
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Marks a code path as erroneous by throwing an error when reached.
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

export default assert;
export const codeIsUnreachable = assert.codeIsUnreachable;
export const state = assert.state;
