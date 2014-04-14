/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../text/text',
   '../utilities/object'
], function( Text, objectUtils ) {
   'use strict';

   var ERRORS = {
      REQUIRED_PROPERTY_MISSING: {
         code: 0,
         message: 'Required property "[propertyName]" is missing.'
      },
      INVALID_PROPERTY_TYPE: {
         code: 1,
         message: 'Property "[propertyName]" is not of an allowed type.'
      },
      UNEXPECTED_PROPERTY: {
         code: 2,
         message: 'Property "[propertyName]" was not expected.'
      },
      BOUNDS_VIOLATION: {
         code: 3,
         message: 'The value [propertyValue] of property "[propertyName]" violates the specified bounds.'
      },
      NOT_AN_ALLOWED_VALUE: {
         code: 4,
         message: 'The value [propertyValue] is not allowed for property "[propertyName]".'
      },
      DUPLICATE_VALUES: {
         code: 5,
         message: 'The property "[propertyName]" contains duplicate items but was specified to be unique.'
      },
      DIVISIBLE_BY_VIOLATION: {
         code: 6,
         message: 'The property "[propertyName]" violates the specified "divisibleBy" restriction.'
      }
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var TYPE_VALIDATORS = {
      'string' : function( object ) {
         return typeof object === 'string';
      },

      'number' : function( object ) {
         return typeof object === 'number';
      },

      'integer' : function( object ) {
         return typeof object === 'number' && object % 1 === 0;
      },

      'boolean' : function( object ) {
         return typeof object === 'boolean';
      },

      'object' : function( object ) {
         return typeof object === 'object';
      },

      'array' : function( object ) {
         return Array.isArray( object );
      },

      'null' : function( object ) {
         return object === null;
      },

      'any' : function() {
         return true;
      }
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function JsonValidator( jsonSchema, options ) {
      this.jsonSchema = jsonSchema;
      this.options = objectUtils.options( options, {
         prohibitAdditionalProperties: false
      } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Validates a json object against the configured JSON schema.
    *
    * @param {Object} jsonData
    *    the json data to validate
    *
    * @return {object}
    *    a report structure
    */
   JsonValidator.prototype.validate = function( jsonData ) {
      this.errorReport = {
         errors: []
      };

      validateObject( this, this.jsonSchema, '', jsonData );
      return this.errorReport;
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function formatError( error, propertySchema, propertyName, propertyValue ) {
      var propertyType = propertyValue ? typeof propertyValue : 'undefined';
      var expectedType = propertySchema ? propertySchema.type : 'undefined';

      if( Array.isArray( expectedType ) ) {
         expectedType = '(one of) ' + expectedType;
      }

      return Text.format( error.message,
         Text.argument( 'expectedPropertyType', expectedType ),
         Text.argument( 'propertyType', propertyType ),
         Text.argument( 'propertyValue', propertyValue ),
         Text.argument( 'propertyName', propertyName ) );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function hasDefault( propertySchema ) {
      return typeof propertySchema[ 'default' ] !== 'undefined';
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function addError( errorReport, error, propertySchema, propertyName, property ) {
      errorReport.errors.push( {
         code: error.code,
         message: formatError( error, propertySchema, propertyName, property )
      } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function checkIfValueHasType( expectedType, value )  {
      // If the specified type in the schema is not one of the basic types, any actual property type is valid
      if( !( expectedType in TYPE_VALIDATORS ) ) {
         return true;
      }

      return true === TYPE_VALIDATORS[ expectedType ]( value );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function hasType( expectedType, value ) {
      if( Array.isArray( expectedType ) ) {
         for( var i=0; i < expectedType.length; ++i ) {
            if( checkIfValueHasType( expectedType[ i ], value ) ) {
               return true;
            }
         }

         return false;
      }

      return checkIfValueHasType( expectedType, value );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function validateType( self, propertySchema, propertyName, jsonProperty )  {
      if( ( 'type' in propertySchema && !hasType( propertySchema.type, jsonProperty ) ) ||
         ( 'disallow' in propertySchema &&  hasType( propertySchema.disallow, jsonProperty ) ) ) {

         addError(
            self.errorReport,
            ERRORS.INVALID_PROPERTY_TYPE,
            propertySchema,
            propertyName,
            jsonProperty
         );

         return false;
      }

      return true;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function validateValue( self, propertySchema, propertyName, jsonProperty )  {
      if( Array.isArray( propertySchema[ 'enum' ] ) ) {
         var allowedValues = propertySchema[ 'enum' ];

         for( var i = 0; i < allowedValues.length; ++i ) {
            if( allowedValues[ i ] === jsonProperty ) {
               return true;
            }
         }

         addError(
            self.errorReport,
            ERRORS.NOT_AN_ALLOWED_VALUE,
            propertySchema,
            propertyName,
            jsonProperty
         );

         return false;
      }

      if( 'pattern' in propertySchema ) {
         var regExp  = new RegExp( propertySchema.pattern );
         var matches = regExp.exec( jsonProperty );

         if( !matches ) {
            addError(
               self.errorReport,
               ERRORS.NOT_AN_ALLOWED_VALUE,
               propertySchema,
               propertyName,
               jsonProperty
            );
         }

         return false;
      }

      if( 'divisibleBy' in propertySchema ) {
         if( jsonProperty % propertySchema.divisibleBy !== 0 ) {
            addError(
               self.errorReport,
               ERRORS.DIVISIBLE_BY_VIOLATION,
               propertySchema,
               propertyName,
               jsonProperty
            );
            return false;
         }
      }

      return true;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function findDuplicatesInArray( array ) {
      function sort( object ) {
         if( Array.isArray( object ) ) {
            return object.sort();
         }

         if( object === null || typeof object !== 'object' ) {
            return object;
         }

         var sorted = [];

         Object.keys( object ).sort().forEach( function( key, value ) {
            sorted.push( { k: key, v: sort( value ) } );
         } );

         return sorted;
      }

      var tempArray = [];
      var duplicates = [];
      array.forEach( function( item, index ) {
         var str = JSON.stringify( sort( item ) );
         if( tempArray.indexOf( str ) === -1 ) {
            tempArray.push( str );
         }
         else {
            duplicates.push( item );
         }
      } );

      return duplicates;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function validateArray( self, propertySchema, propertyName, items ) {
      var result = true;
      var itemSchema = propertySchema.items;

      for( var i=0; i < items.length; ++i ) {
         var itemName = propertyName + '[' + i + ']';

         if( !validatePropertyFromSchema( self, itemSchema, itemName, items[ i ] ) ) {
            result = false;
         }
      }

      if( result === true && propertySchema.uniqueItems === true ) {
         var duplicates = findDuplicatesInArray( items );

         if( duplicates.length > 0 ) {
            addError(
               self.errorReport,
               ERRORS.DUPLICATE_VALUES,
               propertySchema,
               propertyName,
               items
            );

            return false;
         }
      }

      return result;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function findMatchingPropertySchema( patternProperties, propertyName ) {
      var result = null;

      objectUtils.forEach( patternProperties, function( propertySchema, pattern ) {
         if( null !== result ) {
            return;
         }

         var regExp  = new RegExp( '^' + pattern + '$' );
         var matches = regExp.exec( propertyName );

         if( matches && 0 < matches.length ) {
            result = propertySchema;
         }
      } );

      return result;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function validateBounds( self, propertySchema, propertyName, jsonProperty ) {
      if( ( isNumber( propertySchema.minimum ) && jsonProperty < propertySchema.minimum ) ||
         ( isNumber( propertySchema.maximum ) && jsonProperty > propertySchema.maximum ) ||
         ( isNumber( propertySchema.exclusiveMinimum ) && jsonProperty <= propertySchema.exclusiveMinimum ) ||
         ( isNumber( propertySchema.exclusiveMaximum ) && jsonProperty >= propertySchema.exclusiveMaximum ) ||
         ( isNumber( propertySchema.minItems ) && jsonProperty.length < propertySchema.minItems ) ||
         ( isNumber( propertySchema.maxItems ) && jsonProperty.length > propertySchema.maxItems ) ||
         ( isNumber( propertySchema.minLength ) && jsonProperty.length < propertySchema.minLength ) ||
         ( isNumber( propertySchema.maxLength ) && jsonProperty.length > propertySchema.maxLength ) ) {

         addError(
            self.errorReport,
            ERRORS.BOUNDS_VIOLATION,
            propertySchema,
            propertyName,
            jsonProperty
         );

         return false;
      }

      return true;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function validatePropertyFromSchema( self, propertySchema, propertyName, property ) {
      if( property === null ) {
         return validateValue( self, propertySchema, propertyName, property );
      }

      if( !validateType( self, propertySchema, propertyName, property ) ) {
         return false;
      }

      if( !validateBounds( self, propertySchema, propertyName, property ) ) {
         return false;
      }

      if( propertySchema.type === 'array' ) {
         return validateArray( self, propertySchema, propertyName, property );
      }

      if( propertySchema.type === 'object' ) {
         return validateObject( self, propertySchema, propertyName, property );
      }

      return validateValue( self, propertySchema, propertyName, property );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function validatePropertiesFromSchema( self, checkList, objectSchema, objectName, object ) {
      var result = true;

      // Check explicit properties from schema first ...
      if( 'properties' in objectSchema ) {
         objectUtils.forEach( objectSchema.properties, function( propertySchema, propertyName ) {
            if( propertyName in object ) {
               var property = object[ propertyName ];
               delete checkList[ propertyName ];

               result = validatePropertyFromSchema( self, propertySchema, propertyName, property );
            }
            else if( propertySchema.required && !hasDefault( propertySchema ) ) {
               addError(
                  self.errorReport,
                  ERRORS.REQUIRED_PROPERTY_MISSING,
                  propertySchema,
                  propertyName,
                  undefined
               );

               result = false;
            }
         } );
      }

      return result;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function validatePropertiesFromPatterns( self, checkList, objectSchema, objectName, object ) {
      var result = true;

      if( 'patternProperties' in objectSchema ) {
         objectUtils.forEach( object, function( property, propertyName ) {
            if( !( propertyName in checkList ) ) {
               return;
            }

            var propertySchema = findMatchingPropertySchema( objectSchema.patternProperties, propertyName );
            if( propertySchema !== null ) {
               delete checkList[ propertyName ];
               if( !validatePropertyFromSchema( self, propertySchema, propertyName, property ) ) {
                  result = false;
               }
            }
         } );
      }

      return result;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function validateAdditionalProperties( self, checkList, objectSchema, objectName, object ) {
      if( self.options.prohibitAdditionalProperties && !( 'additionalProperties' in objectSchema ) ) {
         objectSchema.additionalProperties = false;
      }

      if( !( 'additionalProperties' in objectSchema ) ) {
         return true;
      }

      var result = true;

      if( objectSchema.additionalProperties === false ) {
         objectUtils.forEach( checkList, function( doNotCare, propertyName ) {
            addError(
               self.errorReport,
               ERRORS.UNEXPECTED_PROPERTY,
               null,
               propertyName,
               object
            );

            result = false;
         } );

         return result;
      }

      // if additionalProperties is defined and is no boolean it is a schema that defines all additional props
      objectUtils.forEach( checkList, function( donNotCare, propertyName ) {
         result = validatePropertyFromSchema(
            self,
            objectSchema.additionalProperties,
            propertyName,
            object[ propertyName ]
         );
      } );

      return result;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function validateObject( self, objectSchema, objectName, object ) {
      // The checklist is used to find properties without a schema to validate them.
      var checkList = objectUtils.map( object, function( property, propertyName ) {
         return [ propertyName, true ];
      } );

      // Check explicit properties from schema first ...
      var result = validatePropertiesFromSchema( self, checkList, objectSchema, objectName, object );

      // If there is a matching property pattern, we must validate against it.
      if( !validatePropertiesFromPatterns( self, checkList, objectSchema, objectName, object ) ) {
         result = false;
      }

      if( !validateAdditionalProperties( self, checkList, objectSchema, objectName, object ) ) {
         result = false;
      }

      return result;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function isNumber( number ) {
      return typeof number === 'number';
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {

      /**
       * Creates and returns a new JSON validator.
       *
       * @param {Object} jsonSchema
       *    the JSON schema to use when validating
       * @param {Object} [options]
       *    an optional set of options
       * @param {Boolean} options.prohibitAdditionalProperties
       *    sets additionalProperties to false if not defined otherwise for the according object schema
       *
       * @return {JsonValidator}
       *    a new instance of JsonValidator
       */
      create: function( jsonSchema, options ) {
         return new JsonValidator( jsonSchema, options );
      },

      REQUIRED_PROPERTY_MISSING: ERRORS.REQUIRED_PROPERTY_MISSING.code,
      INVALID_PROPERTY_TYPE:     ERRORS.INVALID_PROPERTY_TYPE.code,
      UNEXPECTED_PROPERTY:       ERRORS.UNEXPECTED_PROPERTY.code,
      BOUNDS_VIOLATION:          ERRORS.BOUNDS_VIOLATION.code,
      NOT_AN_ALLOWED_VALUE:      ERRORS.NOT_AN_ALLOWED_VALUE.code,
      DUPLICATE_VALUES:          ERRORS.DUPLICATE_VALUES.code,
      DIVISIBLE_BY_VIOLATION:    ERRORS.DIVISIBLE_BY_VIOLATION.code
   };

} );
