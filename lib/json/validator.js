/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import jjv from 'jjv';
import jjve from 'jjve';
import * as schema from './schema';
import * as objectUtils from '../utilities/object';

const JSON_SCHEMA_V4_URI = 'http://json-schema.org/draft-04/schema#';

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function transformResult( result, schema, object, env ) {

   if( !result ) {
      return {
         errors: []
      };
   }

   const messageGenerator = jjve( env );

   return {
      errors: messageGenerator( schema, object, result )
         .map( function( error ) {
            return objectUtils.options( {
               message: error.message + '. Path: "' + error.path + '".'
            }, error );
         } )
   };
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates and returns a new JSON validator for schema draft version 4. Minimal conversion from v3 to v4
 * is builtin, but it is strongly advised to create new schemas using the version 4 draft. Version
 * detection for v4 is realized by checking if the `$schema` property of the root schema equals the
 * uri `http://json-schema.org/draft-04/schema#`. If the `$schema` property is missing or has a
 * different value, v3 is assumed.
 * See https://github.com/json-schema/json-schema/wiki/ChangeLog for differences between v3 and v4.
 *
 * @param {Object} jsonSchema
 *    the JSON schema to use when validating
 * @param {Object} [optionalOptions]
 *    an optional set of options
 * @param {Boolean} optionalOptions.prohibitAdditionalProperties
 *    sets additionalProperties to false if not defined otherwise for the according object schema
 * @param {Boolean} optionalOptions.checkRequired
 *    (jjv option) if `true` it reports missing required properties, otherwise it allows missing
 *    required properties. Default is `true`
 * @param {Boolean} optionalOptions.useDefault
 *    (jjv option) If true it modifies the validated object to have the default values for missing
 *    non-required fields. Default is `false`
 * @param {Boolean} optionalOptions.useCoerce
 *    (jjv option) if `true` it enables type coercion where defined. Default is `false`
 * @param {Boolean} optionalOptions.removeAdditional
 *    (jjv option) if `true` it removes all attributes of an object which are not matched by the
 *    schema's specification. Default is `false`
 *
 *
 * @return {Object}
 *    a new instance of JsonValidator
 */
export function create( jsonSchema, optionalOptions ) {

   const env = jjv();
   const options = objectUtils.options( optionalOptions, {
      prohibitAdditionalProperties: false
   } );
   env.defaultOptions = objectUtils.options( options, env.defaultOptions );

   if( !( '$schema' in jsonSchema ) ) {
      throw new Error( 'Missing schema version. Use the $schema property to define it.' );
   }

   if( jsonSchema.$schema !== JSON_SCHEMA_V4_URI ) {
      throw new Error(
         `Unsupported schema version "${jsonSchema.$schema}". Only V4 is supported: "${JSON_SCHEMA_V4_URI}".`
      );
   }

   if( options.prohibitAdditionalProperties ) {
      schema.prohibitAdditionalProperties( jsonSchema );
   }

   const origValidate = env.validate;

   env.validate = function( object ) {
      const result = origValidate.call( env, jsonSchema, object );
      return transformResult( result, jsonSchema, object, env );
   };

   return env;
}

export { JSON_SCHEMA_V4_URI };
