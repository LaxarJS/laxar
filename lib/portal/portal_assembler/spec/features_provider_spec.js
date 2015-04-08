/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../features_provider'
], function( featuresProvider ) {
   'use strict';

   describe( 'A features-provider', function() {

      describe( 'can determine the current set of features for a widget instance', function() {

         var widgetSpecification;
         var onlyRequiredConfiguration;
         var allConfiguration;

         beforeEach( function() {
            widgetSpecification = {
               features: {
                  button: {
                     type: 'object',
                     properties: {
                        label: {
                           type: 'string',
                           'default': 'hit me'
                        },
                        action: {
                           type: 'string',
                           format: 'topic',
                           required: true
                        }
                     }
                  },
                  headline: {
                     type: 'object',
                     properties: {
                        enabled: {
                           type: 'boolean',
                           'default': false
                        }
                     }
                  }
               }
            };

            onlyRequiredConfiguration = {
               features: {
                  button: {
                     action: 'punch'
                  }
               }
            };

            allConfiguration = {
               features: {
                  button: {
                     label: 'push the button',
                     action: 'panic'
                  },
                  headline: {
                     enabled: true
                  }
               }
            };
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'where no specified features lead to no configured features', function() {
            expect( featuresForWidget( {}, {} ) ).toEqual( {} );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'where specifing only required features, defaults are used', function() {
            expect( featuresForWidget( widgetSpecification, onlyRequiredConfiguration ) )
               .toEqual( {
                  button: {
                     label: 'hit me',
                     action: 'punch'
                  },
                  headline: {
                     enabled: false
                  }
               } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'where specifing all features the defaults are overwritten', function() {
            expect( featuresForWidget( widgetSpecification, allConfiguration ) )
               .toEqual( allConfiguration.features );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'where missing required features lead to an error', function() {
            var badConf = {
               features: {}
            };

            expect( function() {
               featuresForWidget( widgetSpecification, badConf );
            } ).toThrow( 'Problem: Validation for widget features failed. Errors: ' +
                         '\n - Missing required property: action. Path: "$.button.action".' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'where using a wrong type for a property leads to an error', function() {
            onlyRequiredConfiguration.features.button.label = true;

            expect( function() {
               featuresForWidget( widgetSpecification, onlyRequiredConfiguration );
            } ).toThrow( 'Problem: Validation for widget features failed. Errors: ' +
                         '\n - Invalid type: boolean should be one of string,null. Path: "$.button.label".' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'where using an invalid topic format leads to an error', function() {
            onlyRequiredConfiguration.features.button.action = 'underscore_is_forbidden';

            expect( function() {
               featuresForWidget( widgetSpecification, onlyRequiredConfiguration );
            } ).toThrow( 'Problem: Validation for widget features failed. Errors: ' +
                         '\n - Value does not satisfy format: topic. Path: "$.button.action".' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'when features are specified as complete draft v4 JSON schema (#34)', function() {
            var v4Spec = {
               features: {
                  $schema: 'http://json-schema.org/draft-04/schema#',
                  type: 'object',
                  properties: {
                     featureOne: {
                        type: 'object',
                        required: [ 'x' ],
                        properties: {
                           x: {
                              type: 'string'
                           }
                        }
                     }
                  }
               }
            };
            var config = {
               features: {
                  featureOne: {
                     x: 'abc'
                  }
               }
            };

            expect( featuresForWidget( v4Spec, clone( config ) ) )
               .toEqual( config.features );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'with custom JSON schema formats for widget configuration', function() {

         var widgetSpec;
         var configuration;

         beforeEach( function() {
            widgetSpec = {
               features: {
                  testFeature: {
                     type: 'object',
                     properties: {
                        i18nLabel: {
                           type: [ 'string', 'object' ],
                           format: 'localization'
                        },
                        someLanguageTag: {
                           type: 'string',
                           format: 'language-tag'
                        },
                        resourceByAction: {
                           type: 'object',
                           format: 'topic-map',
                           additionalProperties: {
                              type: 'string',
                              format: 'topic'
                           }
                        },
                        someSubTopic: {
                           type: 'string',
                           format: 'sub-topic'
                        },
                        onSomeFlags: {
                           type: 'array',
                           items: {
                              type: 'string',
                              format: 'flag-topic'
                           }
                        }
                     }
                  }
               }
            };

            configuration = {
               features: {
                  testFeature: {
                     i18nLabel: {
                        'de': 'test',
                        'en_US': 'more test'
                     },
                     someLanguageTag: 'de_AT-x-laxar',
                     resourceByAction: {
                        'myAction': 'myResource',
                        'myAction-ok': 'myResource+stuff'
                     },
                     someSubTopic: 'a+sub+topic',
                     onSomeFlags: [ 'positive', '!oh-so-negated' ]
                  }
               }
            };
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'checks the "localization" format', function() {
            var config = clone( configuration );
            expect( function() { featuresForWidget( widgetSpec, config ); } ).not.toThrow();

            config = clone( configuration );
            config.features.testFeature.i18nLabel[ 'bad tag' ] = 'bad tag';
            expect( function() { featuresForWidget( widgetSpec, config ); } ).toThrow();

            config = clone( configuration );
            config.features.testFeature.i18nLabel[ 'en-x-toosoon-US' ] = 'bad tag';
            expect( function() { featuresForWidget( widgetSpec, config ); } ).toThrow();

            config = clone( configuration );
            config.features.testFeature.i18nLabel[ 'en-US-x-trailing' ] = 'ok';
            expect( function() { featuresForWidget( widgetSpec, config ); } ).not.toThrow();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'checks the "language-tag" format', function() {
            var config = clone( configuration );
            expect( function() { featuresForWidget( widgetSpec, config ); } ).not.toThrow();

            config = clone( configuration );
            config.features.testFeature.someLanguageTag = 'bad tag';
            expect( function() { featuresForWidget( widgetSpec, config ); } ).toThrow();

            config = clone( configuration );
            config.features.testFeature.someLanguageTag = 'en-x-toosoon-US';
            expect( function() { featuresForWidget( widgetSpec, config ); } ).toThrow();

            config = clone( configuration );
            config.features.testFeature.someLanguageTag = 'en-US-x-trailing';
            expect( function() { featuresForWidget( widgetSpec, config ); } ).not.toThrow();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'checks the "topic-map" format', function() {
            var config = clone( configuration );
            expect( function() { featuresForWidget( widgetSpec, config ); } ).not.toThrow();

            config = clone( configuration );
            config.features.testFeature.resourceByAction[ 'bad action' ] = 'something';
            expect( function() { featuresForWidget( widgetSpec, config ); } ).toThrow();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'checks the "topic" format', function() {
            var config = clone( configuration );
            expect( function() { featuresForWidget( widgetSpec, config ); } ).not.toThrow();

            config = clone( configuration );
            config.features.testFeature.resourceByAction[ 'myAction' ] = 'my_bad';
            expect( function() { featuresForWidget( widgetSpec, config ); } ).toThrow();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'checks the "sub-topic" format', function() {
            var config = clone( configuration );
            expect( function() { featuresForWidget( widgetSpec, config ); } ).not.toThrow();

            config = clone( configuration );
            config.features.testFeature.someSubTopic = 'not-a-sub';
            expect( function() { featuresForWidget( widgetSpec, config ); } ).toThrow();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'checks the "flag-topic" format', function() {
            var config = clone( configuration );
            expect( function() { featuresForWidget( widgetSpec, config ); } ).not.toThrow();

            config = clone( configuration );
            config.features.testFeature.onSomeFlags = [ 'not a flag topic' ];
            expect( function() { featuresForWidget( widgetSpec, config ); } ).toThrow();
         } );

      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function featuresForWidget( specification, configuration ) {
      return featuresProvider.featuresForWidget( specification, configuration, function throwError( message ) {
         throw new Error( 'Problem: ' + message );
      } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function clone( obj ) {
      return JSON.parse( JSON.stringify( obj ) );
   }

} );
