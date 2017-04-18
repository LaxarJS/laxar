/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [], function() {
   'use strict';

   function ValidationError() {
   }

   function expand( schema, value ) {
      if( !schema.hasOwnProperty( 'type' ) ) {
         return;
      }

      if( schema.type === 'array' ) {
         if( !Array.isArray( value ) ) {
            throw new ValidationError();
         }
         if( schema.hasOwnProperty( 'items' ) ) {
            expandItems( schema, value );
         }
         // :TODO: correctly interpret array-valued items, and additionalItems
      }

      if( schema.type === 'object' ) {
         if( typeof value !== 'object' ) {
            throw new ValidationError();
         }
         expandProperties( schema, value );
         expandPatternProperties( schema, value );
         expandAdditionalProperties( schema, value );
      }
   }

   function expandItems( schema, value ) {
      var itemsSchema = schema.items;
      if( typeof( itemsSchema ) === 'object' ) {
         if( Array.isArray( value ) ) {
            value.forEach( function( itemValue ) {
               expand( itemsSchema, itemValue );
            } );
         }
      }
   }

   function expandProperties( schema, value ) {
      var properties = schema.properties;
      if( typeof( properties ) !== 'object' ) { return; }
      for( var key in properties ) {
         if( properties.hasOwnProperty( key ) ) {
            var propertySchema = properties[ key ];
            descend( propertySchema, value, key );
         }
      }
   }

   function expandPatternProperties( schema, value ) {
      var patternProperties = schema.patternProperties;
      if( typeof( patternProperties ) !== 'object' ) { return; }
      for( var pattern in patternProperties ) {
         if( patternProperties.hasOwnProperty( pattern ) ) {
            var propertySchema = patternProperties[ pattern ];
            var regexp = new RegExp( pattern );
            for( var key in value ) {
               if( value.hasOwnProperty( key ) ) {
                  if( regexp.test( key ) ) {
                     descend( propertySchema, value, key );
                  }
               }
            }
         }
      }
   }

   function expandAdditionalProperties( schema, value ) {
      var additionalPropertiesSchema = schema.additionalProperties;
      if( typeof( additionalPropertiesSchema ) !== 'object' ) { return; }
      for( var key in value ) {
         if( value.hasOwnProperty( key ) ) {
            descend( additionalPropertiesSchema, value, key );
         }
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
