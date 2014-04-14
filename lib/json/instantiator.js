/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../utilities/assert',
   '../utilities/object'
], function( assert, object ) {
   'use strict';

   function applyProperties( schema, jsonObject ) {
      var result = {};

      var remainingKeyCount = 0;

      var remainingKeys = object.map( jsonObject, function( propertyValue, propertyName ) {
         ++remainingKeyCount;
         return [ propertyName, propertyValue ];
      } );

      if( schema.properties ) {
         object.forEach( schema.properties, function( spec, key ) {
            if( key in jsonObject ) {
               delete remainingKeys[ key ];
               --remainingKeyCount;

               result[ key ] = applyBasedOnType( key, jsonObject, spec );
            }
            else if( 'default' in spec ) {
               result[ key ] = applyBasedOnType( key, jsonObject, spec );
            }
         } );
      }

      if( schema.patternProperties ) {
         object.forEach( schema.patternProperties, function( spec, pattern ) {
            if( remainingKeyCount === 0 ) {
               return;
            }

            var regExp = new RegExp( pattern );

            object.forEach( jsonObject, function( value, key ) {
               if( typeof remainingKeys[ key ] !== 'undefined' ) {
                  var matcherResult = regExp.exec( key );

                  if( matcherResult && matcherResult.length > 0 ) {
                     result[ key ] = applyBasedOnType( key, jsonObject, spec );

                     delete remainingKeys[ key ];
                     --remainingKeyCount;
                  }
               }
            } );
         } );
      }

      return result;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function applyBasedOnType( key, obj, spec ) {
      switch( spec.type ) {
         case 'array':
            return applyForArray( key, obj, spec );

         case 'object':
            return applyForObject( key, obj, spec );

         default:
            return applyForPrimitive( key, obj, spec );
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function applyForArray( key, obj, spec ) {
      if( key in obj ) {
         // If the items are of a complex type interpret those recursively ...
         if( spec.items.type === 'object' || spec.items.type === 'array' ) {
            return obj[ key ].map( function( arrayValue ) {
               return applyProperties( spec.items, arrayValue );
            } );
         }

         // ... otherwise simply return the list of primitives
         return obj[ key ];
      }

      return spec[ 'default' ];
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function applyForObject( key, obj, spec ) {
      if( key in obj ) {
         return applyProperties( spec, obj[ key ] );
      }

      return spec[ 'default' ];
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function applyForPrimitive( key, obj, spec ) {
      return key in obj ? obj[ key ] : spec[ 'default' ];
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      instantiate: function instantiate( schema, jsonObject ) {
         assert( schema, '"schema" must be a valid JSON schema.' ).hasType( Object ).isNotNull();
         assert( jsonObject, '"jsonObject" must be a valid JSON object.' ).hasType( Object ).isNotNull();

         return applyProperties( schema, jsonObject );
      }
   };
} );
