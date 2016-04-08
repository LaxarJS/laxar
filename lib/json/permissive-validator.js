/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   './schema',
   '../utilities/object'
], function( schemaUtils, objectUtils ) {
   'use strict';

   function expand( schema, value ) {
      if( value === null ) {
         return;
      }

      expandItems( schema, value );
      // :TODO: correctly interpret array-valued items, and additionalItems

      var seen = {};
      expandProperties( schema, value, seen );
      expandPatternProperties( schema, value, seen );
      expandAdditionalProperties( schema, value, seen );
   }

   function expandItems( schema, value, seen ) {
      var itemsSchema = schema.items;
      if( typeof( itemsSchema ) === 'object' ) {
         if( Array.isArray( value ) ) {
            value.forEach( function( itemValue ) {
               expand( itemsSchema, itemValue );
            } );
         }
      }
   }

   function expandProperties( schema, value, seen ) {
      var properties = schema.properties;
      if( typeof( properties ) !== 'object' ) { return; }
      for( var key in properties ) {
         if( properties.hasOwnProperty( key ) ) {
            seen[ key ] = true;
            var propertySchema = properties[ key ];
            descend( propertySchema, value, key );
         }
      }
   }

   function expandPatternProperties( schema, value, seen ) {
      var patternProperties = schema.patternProperties;
      if( typeof( patternProperties ) !== 'object' ) { return; }
      for( var key in patternProperties ) {
         if( patternProperties.hasOwnProperty( key ) ) {
            var regexp;
            for( var key in value ) {
               if( seen[ key ] ) { continue; }
               regexp = regexp || new RegExp( key );
               if( regexp.test( key ) ) {
                  seen[ key ] = true;
                  var propertySchema = patternProperties[ key ];
                  descend( propertySchema, value, key );
               }
            }
         }
      }
   }

   function expandAdditionalProperties( schema, value, seen ) {
      var additionalPropertiesSchema = schema.additionalProperties;
      if( typeof( additionalPropertiesSchema ) !== 'object' ) { return; }
      for( var key in value ) {
         if( seen[ key ] ) { continue; }
         seen[ key ] = true;
         descend( additionalProperties, value, key );
      }
   }

   function descend( innerSchema, value, key ) {
      if( value.hasOwnProperty( key ) && value[ key ] !== undefined ) {
         expand( innerSchema, value[ key ] );
      }
      else if( innerSchema.default !== undefined ) {
         value[ key ] = innerSchema.default;
      }
   }

   function create( schema, options ) {
      return {
         addFormat: function() {},
         validate: function( jsonValue ) {
            expand( schema, jsonValue );
            return { errors: [] };
         }
      };
   }

   return {
      create: create
   };

} );
