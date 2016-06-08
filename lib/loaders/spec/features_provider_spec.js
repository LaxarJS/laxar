/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import * as featuresProvider from '../features_provider';
import { deepClone } from '../../utilities/object';

describe( 'A features-provider', () => {

   describe( 'can determine the current set of features for a widget instance', () => {

      let widgetSpecification;
      let onlyRequiredConfiguration;
      let allConfiguration;

      beforeEach( () => {
         widgetSpecification = {
            features: {
               '$schema': 'http://json-schema.org/draft-04/schema#',
               type: 'object',
               properties: {
                  button: {
                     type: 'object',
                     required: [ 'action' ],
                     properties: {
                        label: {
                           type: [ 'string', 'null' ],
                           'default': 'hit me'
                        },
                        action: {
                           type: 'string',
                           format: 'topic'
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

      it( 'where no specified features lead to no configured features', () => {
         expect( featuresForWidget( {}, {} ) ).toEqual( {} );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'where specifing only required features, defaults are used', () => {
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

      it( 'where specifing all features the defaults are overwritten', () => {
         expect( featuresForWidget( widgetSpecification, allConfiguration ) )
            .toEqual( allConfiguration.features );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'where missing required features lead to an error', () => {
         const badConf = {
            features: {}
         };

         expect( () => {
            featuresForWidget( widgetSpecification, badConf );
         } ).toThrow( new Error( 'Problem: Validation of feature-configuration failed. Errors: ' +
                      '\n - Missing required property: action. Path: "$.button.action".' ) );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'where using a wrong type for a property leads to an error', () => {
         onlyRequiredConfiguration.features.button.label = true;

         expect( () => {
            featuresForWidget( widgetSpecification, onlyRequiredConfiguration );
         } ).toThrow( new Error( 'Problem: Validation of feature-configuration failed. Errors: ' +
                      '\n - Invalid type: boolean should be one of string,null. Path: "$.button.label".' ) );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'where using an invalid topic format leads to an error', () => {
         onlyRequiredConfiguration.features.button.action = 'underscore_is_forbidden';

         expect( () => {
            featuresForWidget( widgetSpecification, onlyRequiredConfiguration );
         } ).toThrow( new Error( 'Problem: Validation of feature-configuration failed. Errors: ' +
                      '\n - Value does not satisfy format: topic. Path: "$.button.action".' ) );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'when features are specified as complete draft v4 JSON schema (#34)', () => {
         const v4Spec = {
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
         const config = {
            features: {
               featureOne: {
                  x: 'abc'
               }
            }
         };

         expect( featuresForWidget( v4Spec, deepClone( config ) ) )
            .toEqual( config.features );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'when features are specified as v4 and top-level defaults need to be inferred', () => {
         const v4Spec = {
            features: {
               $schema: 'http://json-schema.org/draft-04/schema#',
               type: 'object',
               properties: {
                  featureOne: {
                     type: 'object',
                     properties: {
                        x: {
                           type: 'string',
                           'default': 'hey'
                        }
                     }
                  },
                  featureTwo: {
                     type: 'object'
                  },
                  featureThree: {
                     type: 'array'
                  }
               }
            }
         };
         const config = {
            features: {}
         };

         expect( featuresForWidget( v4Spec, deepClone( config ) ) )
            .toEqual( {
               featureOne: { x: 'hey' },
               featureTwo: {},
               featureThree: []
            } );
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'with custom JSON schema formats for widget configuration', () => {

      let widgetSpec;
      let configuration;

      beforeEach( () => {
         widgetSpec = {
            features: {
               $schema: 'http://json-schema.org/draft-04/schema#',
               type: 'object',
               properties: {
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

      it( 'checks the "localization" format', () => {
         let config = deepClone( configuration );
         expect( () => { featuresForWidget( widgetSpec, config ); } ).not.toThrow();

         config = deepClone( configuration );
         config.features.testFeature.i18nLabel[ 'bad tag' ] = 'bad tag';
         expect( () => { featuresForWidget( widgetSpec, config ); } ).toThrow();

         config = deepClone( configuration );
         config.features.testFeature.i18nLabel[ 'en-x-toosoon-US' ] = 'bad tag';
         expect( () => { featuresForWidget( widgetSpec, config ); } ).toThrow();

         config = deepClone( configuration );
         config.features.testFeature.i18nLabel[ 'en-US-x-trailing' ] = 'ok';
         expect( () => { featuresForWidget( widgetSpec, config ); } ).not.toThrow();
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'checks the "language-tag" format', () => {
         let config = deepClone( configuration );
         expect( () => { featuresForWidget( widgetSpec, config ); } ).not.toThrow();

         config = deepClone( configuration );
         config.features.testFeature.someLanguageTag = 'bad tag';
         expect( () => { featuresForWidget( widgetSpec, config ); } ).toThrow();

         config = deepClone( configuration );
         config.features.testFeature.someLanguageTag = 'en-x-toosoon-US';
         expect( () => { featuresForWidget( widgetSpec, config ); } ).toThrow();

         config = deepClone( configuration );
         config.features.testFeature.someLanguageTag = 'en-US-x-trailing';
         expect( () => { featuresForWidget( widgetSpec, config ); } ).not.toThrow();
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'checks the "topic-map" format', () => {
         let config = deepClone( configuration );
         expect( () => { featuresForWidget( widgetSpec, config ); } ).not.toThrow();

         config = deepClone( configuration );
         config.features.testFeature.resourceByAction[ 'bad action' ] = 'something';
         expect( () => { featuresForWidget( widgetSpec, config ); } ).toThrow();
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'checks the "topic" format', () => {
         let config = deepClone( configuration );
         expect( () => { featuresForWidget( widgetSpec, config ); } ).not.toThrow();

         config = deepClone( configuration );
         config.features.testFeature.resourceByAction[ 'myAction' ] = 'my_bad';
         expect( () => { featuresForWidget( widgetSpec, config ); } ).toThrow();
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'checks the "sub-topic" format', () => {
         let config = deepClone( configuration );
         expect( () => { featuresForWidget( widgetSpec, config ); } ).not.toThrow();

         config = deepClone( configuration );
         config.features.testFeature.someSubTopic = 'not-a-sub';
         expect( () => { featuresForWidget( widgetSpec, config ); } ).toThrow();
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'checks the "flag-topic" format', () => {
         let config = deepClone( configuration );
         expect( () => { featuresForWidget( widgetSpec, config ); } ).not.toThrow();

         config = deepClone( configuration );
         config.features.testFeature.onSomeFlags = [ 'not a flag topic' ];
         expect( () => { featuresForWidget( widgetSpec, config ); } ).toThrow();
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function featuresForWidget( specification, configuration ) {
      return featuresProvider.featuresForWidget( specification, configuration, message => {
         throw new Error( 'Problem: ' + message );
      } );
   }

} );
