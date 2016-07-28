/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import jjv from 'jjv';
import jjve from 'jjve';
import { prohibitAdditionalProperties } from './schema';

export const JSON_SCHEMA_V4_URI = 'http://json-schema.org/draft-04/schema#';

/**
 * Creates and returns a new JSON validator for schema draft version 4.
 * Version detection for v4 takes place by checking if the `$schema` property of the root schema equals the
 * uri `http://json-schema.org/draft-04/schema#`.
 * Missing or other values for `$schema` will lead to an error.
 *
 * It returns an object with `validate` function, accepting the object to validate against the `jsonSchema`,
 * and it returns an array containing all errors found.
 * If the array is empty, no errors were found.
 * If `optionalOptions.useDefault` was set to `true`, calling the `valdate` will modify the argument object
 * by adding missing default values.
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
   const options = {
      prohibitAdditionalProperties: false,
      ...optionalOptions
   };
   env.defaultOptions = {
      ...env.defaultOptions,
      ...options
   };

   if( !( '$schema' in jsonSchema ) ) {
      throw new Error( 'Missing schema version. Use the $schema property to define it.' );
   }

   if( jsonSchema.$schema !== JSON_SCHEMA_V4_URI ) {
      throw new Error(
         `Unsupported schema version "${jsonSchema.$schema}". Only V4 is supported: "${JSON_SCHEMA_V4_URI}".`
      );
   }

   if( options.prohibitAdditionalProperties ) {
      prohibitAdditionalProperties( jsonSchema );
   }

   const origValidate = env.validate;

   env.validate = object => {
      const result = origValidate.call( env, jsonSchema, object );
      return !result ? [] : jjve( env )( jsonSchema, object, result )
         .map( err => ({ ...err, message: `${err.message}. Path: "${err.path}".` }) );
   };

   return env;
}
