/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../utilities/object'
], function( object ) {
   'use strict';

   function transformV3V4Recursively( schema, parentKey, parentSchema, originalParentSchema ) {
      var resultingSchema = {};

      Object.keys( schema ).forEach( function( key ) {

         var value = schema[ key ];

         switch( key ) {
            case 'required':
               if( value !== true ) {
                  break;
               }

               if( isNamedProperty( parentKey, originalParentSchema ) && !( 'default' in schema ) ) {
                  if( !( 'required' in parentSchema ) ) {
                     parentSchema.required = [];
                  }
                  parentSchema.required.push( parentKey );
               }
               break;

            case 'items':
               resultingSchema[ key ] = transformV3V4Recursively( value, key, resultingSchema, schema );
               break;

            case 'additionalProperties':
               if( typeof value === 'object' ) {
                  resultingSchema[ key ] = transformV3V4Recursively( value, key, resultingSchema, schema );
               }
               else {
                  resultingSchema[ key ] = value;
               }
               break;

            case 'properties':
            case 'patternProperties':
               resultingSchema[ key ] = {};
               object.forEach( value, function( patternSchema, pattern ) {
                  resultingSchema[ key ][ pattern ] =
                     transformV3V4Recursively( patternSchema, pattern, resultingSchema, schema );
               } );
               break;

            default:
               resultingSchema[ key ] = value;

         }

      } );

      // LaxarJS specific: transform "not required" to "allow null"
      if( isNamedProperty( parentKey, originalParentSchema ) && !schema.required ) {
         var propertyType = resultingSchema.type;
         if( typeof propertyType === 'string' && propertyType !== 'null' ) {
            resultingSchema.type = [ propertyType, 'null' ];
         }
         else if( Array.isArray( propertyType ) && propertyType.indexOf( 'null' ) === -1 ) {
            propertyType.push( 'null' );
         }
      }

      return resultingSchema;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function prohibitAdditionalPropertiesRecursively( schema ) {
      if( ( 'properties' in schema || 'patternProperties' in schema ) &&
         !( 'additionalProperties' in schema ) ) {
         schema.additionalProperties = false;
      }

      if( 'properties' in schema ) {
         Object.keys( schema.properties ).forEach( function( name ) {
            prohibitAdditionalPropertiesRecursively( schema.properties[ name ] );
         } );
      }

      if( 'additionalProperties' in schema && typeof schema.additionalProperties === 'object' ) {
         prohibitAdditionalPropertiesRecursively( schema.additionalProperties );
      }

      if( 'patternProperties' in schema ) {
         Object.keys( schema.patternProperties ).forEach( function( pattern ) {
            prohibitAdditionalPropertiesRecursively( schema.patternProperties[ pattern ] );
         } );
      }

      if( 'items' in schema ) {
         prohibitAdditionalPropertiesRecursively( schema.items );
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function isNamedProperty( key, parentSchema ) {
      return parentSchema &&
         schemaAllowsType( parentSchema, 'object' ) &&
         object.path( parentSchema, 'properties.' + key );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function schemaAllowsType( schema, type ) {
      var schemaType = schema.type;
      if( typeof schemaType === 'string' ) {
         return schemaType === type;
      }
      if( Array.isArray( schemaType ) ) {
         return schemaType.indexOf( type ) !== -1;
      }

      return true;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {

      transformV3ToV4: function( schema ) {
         return transformV3V4Recursively( schema );
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      prohibitAdditionalProperties: function( schema ) {
         prohibitAdditionalPropertiesRecursively( schema );
      }

   };

} );
