/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createJsonValidator } from '../utilities/json_validator';
import * as object from '../utilities/object';

// JSON schema formats:
const TOPIC_IDENTIFIER = '([a-z][+a-zA-Z0-9]*|[A-Z][+A-Z0-9]*)';
const SUB_TOPIC_FORMAT = new RegExp( `^${TOPIC_IDENTIFIER}$` );
const TOPIC_FORMAT = new RegExp( `^(${TOPIC_IDENTIFIER}(-${TOPIC_IDENTIFIER})*)$` );
const FLAG_TOPIC_FORMAT = new RegExp( `^[!]?(${TOPIC_IDENTIFIER}(-${TOPIC_IDENTIFIER})*)$` );
// simplified RFC-5646 language-tag matcher with underscore/dash relaxation:
// the parts are: language *("-"|"_" script|region|constiant) *("-"|"_" extension|privateuse)
const LANGUAGE_TAG_FORMAT = /^[a-z]{2,8}([-_][a-z0-9]{2,8})*([-_][a-z0-9][-_][a-z0-9]{2,8})*$/i;

///////////////////////////////////////////////////////////////////////////////////////////////////////////

export function featuresForWidget( widgetSpecification, widgetConfiguration, throwError ) {
   if( !widgetSpecification.features || Object.keys( widgetSpecification.features ).length === 0 ) {
      return {};
   }

   const featureConfiguration = widgetConfiguration.features || {};
   const featuresSpec = widgetSpecification.features;
   const validator = createFeaturesValidator( featuresSpec );

   object.forEach( featuresSpec.properties, ( feature, name ) => {
      // ensure that simple object/array features are at least defined
      if( name in featureConfiguration ) {
         return;
      }

      if( feature.type === 'object' ) {
         featureConfiguration[ name ] = {};
      }
      else if( feature.type === 'array' ) {
         featureConfiguration[ name ] = [];
      }
   } );

   const errors = validator.validate( featureConfiguration );

   if( errors.length ) {
      const message = errors.reduce(
         ( message, error ) => `${message}\n - ${error.message.replace( /\[/g, '\\[' )}`,
         'Validation of feature-configuration failed. Errors: '
      );

      throwError( message );
   }

   return featureConfiguration;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function createFeaturesValidator( featuresSpec ) {
   const validator = createJsonValidator( featuresSpec, {
      prohibitAdditionalProperties: true,
      useDefault: true
   } );

   // allows 'mySubTopic0815', 'MY_SUB_TOPIC+OK' and constiations:
   validator.addFormat( 'sub-topic', subTopic => {
      return ( typeof subTopic !== 'string' ) || SUB_TOPIC_FORMAT.test( subTopic );
   } );

   // allows 'myTopic', 'myTopic-mySubTopic-SUB_0815+OK' and constiations:
   validator.addFormat( 'topic', topic => {
      return ( typeof topic !== 'string' ) || TOPIC_FORMAT.test( topic );
   } );

   // allows 'myTopic', '!myTopic-mySubTopic-SUB_0815+OK' and constiations:
   validator.addFormat( 'flag-topic', flagTopic => {
      return ( typeof flagTopic !== 'string' ) || FLAG_TOPIC_FORMAT.test( flagTopic );
   } );

   // allows 'de_DE', 'en-x-laxarJS' and such:
   validator.addFormat( 'language-tag', languageTag => {
      return ( typeof languageTag !== 'string' ) || LANGUAGE_TAG_FORMAT.test( languageTag );
   } );

   // checks that object keys have the 'topic' format
   validator.addFormat( 'topic-map', topicMap => {
      return ( typeof topicMap !== 'object' ) ||
         Object.keys( topicMap ).every( topic => TOPIC_FORMAT.test( topic ) );
   } );

   // checks that object keys have the 'language-tag' format
   validator.addFormat( 'localization', localization => {
      return ( typeof localization !== 'object' ) ||
         Object.keys( localization ).every( tag => LANGUAGE_TAG_FORMAT.test( tag ) );
   } );

   return validator;
}
