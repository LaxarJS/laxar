/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../../json/validator',
   '../../json/json_patch_compatibility',
   '../../logging/log',
   '../../utilities/path',
   '../../utilities/assert',
   '../../utilities/object',
   '../paths',
   './widget_resolvers/angular_widget_resolver',
   './widgets_json'
], function(
   jsonValidator,
   jsonPatchCompatibility,
   log,
   path,
   assert,
   object,
   paths,
   angularWidgetResolver,
   widgetsJson
) {
   'use strict';

   var themeManager_;
   var fileResourceProvider_;
   var q_;

   var widgetResolvers_ = {};
   var widgetSpecificationCache_ = {};

   var VALID_ID_MATCHER = /[^A-Za-z0-9-_\.]/g;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function resolveWidget( widgetSpecificationPath, theme, optionalOptions ) {

      var options = object.options( optionalOptions, {
         ignoreCache: false
      } );

      if( !options.ignoreCache && widgetSpecificationPath in widgetSpecificationCache_ ) {
         return q_.when( widgetSpecificationCache_[ widgetSpecificationPath ] );
      }

      var promise;
      if( widgetSpecificationPath in widgetsJson ) {
         promise = q_.when( widgetsJson[ widgetSpecificationPath ] );
      }
      else {
         var widgetJson = path.join( paths.WIDGETS, widgetSpecificationPath, 'widget.json' );
         promise = fileResourceProvider_.provide( widgetJson );
      }

      return promise
         .then( function( specification ) {
            var type = specification.integration.type;

            if( !( type in widgetResolvers_ ) ) {
               throw new Error( 'unknown integration type ' + type );
            }

            return widgetResolvers_[ type ].resolve( widgetSpecificationPath, specification, theme );
         } )
         .then( function( resolvedWidget ) {
            widgetSpecificationCache_[ widgetSpecificationPath ] = resolvedWidget;
            return resolvedWidget;
         } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function featuresForWidget( widgetSpecification, widgetConfiguration ) {
      if( !( 'features' in widgetSpecification ) || widgetSpecification.features == null ) {
         return {};
      }

      var featureConfiguration = widgetConfiguration.features || {};
      var featuresSpec = widgetSpecification.features;
      if( !( '$schema' in featuresSpec ) ) {
         // we assume an "old style" feature specification (i.e. first level type specification is omitted)
         // if no schema version was defined.
         featuresSpec = {
            $schema: 'http://json-schema.org/draft-03/schema#',
            type: 'object',
            properties: widgetSpecification.features
         };
      }

      object.forEach( widgetSpecification.features, function( feature, name ) {
         // ensure that simple object features are at least defined
         if( feature.type === 'object' && !( name in featureConfiguration ) ) {
            featureConfiguration[ name ] = {};
         }
      } );

      var validator = createFeaturesValidator( featuresSpec );
      var report = validator.validate( featureConfiguration );

      if( report.errors.length > 0 ) {
         var message = 'Validation for widget features failed (Widget-ID ' +
            widgetConfiguration.id + '). Errors: ';

         report.errors.forEach( function( error ) {
            message += '\n - ' + error.message.replace( /\[/g, '\\[' );
         } );

         throw new Error( message );
      }

      deriveFirstLevelDefaults( featureConfiguration, featuresSpec );

      return featureConfiguration;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var TOPIC_IDENTIFIER = '([a-z][+a-zA-Z0-9]*|[A-Z][+A-Z0-9]*)';

   var SUB_TOPIC_FORMAT = new RegExp( '^' + TOPIC_IDENTIFIER + '$' );
   var TOPIC_FORMAT = new RegExp( '^(' + TOPIC_IDENTIFIER + '(-' + TOPIC_IDENTIFIER + ')*)$' );
   var FLAG_TOPIC_FORMAT = new RegExp( '^[!]?(' + TOPIC_IDENTIFIER + '(-' + TOPIC_IDENTIFIER + ')*)$' );

   // simplified RFC-5646 language-tag matcher with underscore/dash relaxation:
   // the parts are: language *("-"|"_" script|region|variant) *("-"|"_" extension|privateuse)
   var LANGUAGE_TAG_FORMAT = /^[a-z]{2,8}([-_][a-z0-9]{2,8})*([-_][a-z0-9][-_][a-z0-9]{2,8})*$/i;

   function createFeaturesValidator( featuresSpec ) {
      var validator = jsonValidator.create( featuresSpec, {
         prohibitAdditionalProperties: true,
         useDefault: true
      } );

      // allows 'mySubTopic0815', 'MY_SUB_TOPIC+OK' and variations:
      validator.addFormat( 'sub-topic', function( subTopic ) {
         return ( typeof subTopic !== 'string' ) || SUB_TOPIC_FORMAT.test( subTopic );
      } );

      // allows 'myTopic', 'myTopic-mySubTopic-SUB_0815+OK' and variations:
      validator.addFormat( 'topic', function( topic ) {
         return ( typeof topic !== 'string' ) || TOPIC_FORMAT.test( topic );
      } );

      // allows 'myTopic', '!myTopic-mySubTopic-SUB_0815+OK' and variations:
      validator.addFormat( 'flag-topic', function( flagTopic ) {
         return ( typeof flagTopic !== 'string' ) || FLAG_TOPIC_FORMAT.test( flagTopic );
      } );

      // allows 'de_DE', 'en-x-laxarJS' and such:
      validator.addFormat( 'language-tag', function( languageTag ) {
         return ( typeof languageTag !== 'string' ) || LANGUAGE_TAG_FORMAT.test( languageTag );
      } );

      // checks that object keys have the 'topic' format
      validator.addFormat( 'topic-map', function( topicMap ) {
         return ( typeof topicMap !== 'object' ) || Object.keys( topicMap ).every( function( topic ) {
            return TOPIC_FORMAT.test( topic );
         } );
      } );

      // checks that object keys have the 'language-tag' format
      validator.addFormat( 'localization', function( localization ) {
         return ( typeof localization !== 'object' ) || Object.keys( localization ).every( function( tag ) {
            return LANGUAGE_TAG_FORMAT.test( tag );
         } );
      } );
      return validator;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function deriveFirstLevelDefaults( configuration, schema ) {
      Object.keys( schema.properties ).forEach( function( name ) {
         var propertySchema = schema.properties[ name ];
         var entry = configuration[ name ];

         if( 'properties' in propertySchema ) {
            Object.keys( propertySchema.properties ).forEach( function( secondLevelName ) {
               var secondLevelSchema = propertySchema.properties[ secondLevelName ];
               if( 'default' in secondLevelSchema && ( !entry || !( secondLevelName in entry ) ) ) {
                  object.setPath( configuration, name + '.' + secondLevelName, secondLevelSchema[ 'default' ] );
               }
            } );
         }
      } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createIdGeneratorForWidget( widget ) {
      var charCodeOfA = 'a'.charCodeAt( 0 );
      return function( localId ) {
         return 'widget__' + widget.id + '_' + (''+localId).replace( VALID_ID_MATCHER, function( l ) {
            // We map invalid characters deterministically to valid lower case letters. Thereby a collision of
            // two ids with different invalid characters at the same positions is less likely to occur.
            return String.fromCharCode( charCodeOfA + l.charCodeAt( 0 ) % 26 );
         } );
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createEventBusForWidget( eventBus, widget ) {
      var collaboratorId = 'widget.' + widget.specification.name + '#' + widget.id;
      var jsonPatchCompatible = (widget.specification.compatibility || []).indexOf( 'json-patch' ) !== -1;

      function forward( to ) {
         return function() {
            eventBus[ to ].apply( eventBus, arguments );
         };
      }

      function augmentOptions( optionalOptions ) {
         return object.options( optionalOptions, { sender: collaboratorId } );
      }

      widget.__subscriptions = [];

      return {
         addInspector: forward( 'addInspector' ),
         setErrorHandler: forward( 'setErrorHandler' ),
         setMediator: forward( 'setMediator' ),
         unsubscribe: function( subscriber ) {
            if( typeof subscriber.__compatibilitySubscriber === 'function' ) {
               eventBus.unsubscribe( subscriber.__compatibilitySubscriber );
               delete subscriber.__compatibilitySubscriber;
            }
            else {
               eventBus.unsubscribe( subscriber );
            }
         },
         subscribe: function( eventName, subscriber, optionalOptions ) {
            if( eventName.indexOf( 'didUpdate.' ) === 0 ) {
               subscriber = ensureJsonPatchCompatibility( jsonPatchCompatible, subscriber );
            }

            widget.__subscriptions.push( subscriber );

            var options = object.options( optionalOptions, { subscriber: collaboratorId } );

            return eventBus.subscribe( eventName, subscriber, options );
         },
         publish: function( eventName, optionalEvent, optionalOptions ) {
            if( eventName.indexOf( 'didUpdate.' ) === 0 && optionalEvent && 'data' in optionalEvent ) {
               log.develop(
                     'Widget "[0]" published didUpdate-event using deprecated attribute "data" (event: [1]).\n' +
                     '   Change this to "patches" immediately.',
                  collaboratorId,
                  eventName
               );
            }
            return eventBus.publish( eventName, optionalEvent, augmentOptions( optionalOptions ) );
         },
         publishAndGatherReplies: function( eventName, optionalEvent, optionalOptions ) {
            return eventBus.publishAndGatherReplies( eventName, optionalEvent, augmentOptions( optionalOptions ) );
         }
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function ensureJsonPatchCompatibility( jsonPatchCompatible, subscriber ) {
      if( typeof subscriber.__compatibilitySubscriber === 'function' ) {
         return subscriber.__compatibilitySubscriber;
      }

      var compatibilitySubscriber = function( event, meta ) {
         if( !jsonPatchCompatible && 'patches' in event && !( 'updates' in event ) ) {
            event.updates = jsonPatchCompatibility.jsonPatchToUpdatesMap( event.patches );
         }
         else if( jsonPatchCompatible && !( 'patches' in event ) ) {
            event.patches = [];
            if( 'data' in event ) {
               event.patches.push( { op: 'replace', path: '', value: event.data } );
            }
            if( 'updates' in event ) {
               event.patches =
                  event.patches.concat( jsonPatchCompatibility.updatesMapToJsonPatch( event.updates ) );
            }
         }
         return subscriber( event, meta );
      };
      subscriber.__compatibilitySubscriber = compatibilitySubscriber;
      return compatibilitySubscriber;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function processWidgetsForPage( page ) {
      var widgets = [];
      object.forEach( page.areas, function( area, areaName ) {
         area.forEach( function( widget ) {
            widgets.push( object.extend( {
               area: areaName,
               pageIdHash: areaName + '.' + widget.widget + '.' + widget.id
            }, widget ) );
         } );
      } );
      return widgets;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function widgetMergeInfo( activeWidgets, requestedWidgets ) {
      var activeKeys = activeWidgets.map( function( widget ) { return widget.pageIdHash; } );
      var requestedKeys = requestedWidgets.map( function( widget ) { return widget.pageIdHash; } );

      var mergeInfo = {
         unload: [],
         numberOfWidgetsToLoad: 0,
         load: []
      };

      var union = requestedKeys.concat( activeKeys.filter( function( activeKey ) {
         return requestedKeys.indexOf( activeKey ) === -1;
      } ) );

      union.forEach( function( key ) {
         var indexInActive = activeKeys.indexOf( key );
         var indexInRequested = requestedKeys.indexOf( key );
         if( indexInRequested > -1 ) {
            mergeInfo.load.push( {
               requested: requestedWidgets[ indexInRequested ],
               existing: indexInActive > -1 ? activeWidgets[ indexInActive ] : null
            } );

            if( indexInActive === -1 ) {
               ++mergeInfo.numberOfWidgetsToLoad;
            }
         }
         else {
            mergeInfo.unload.push( activeWidgets[ indexInActive ] );
         }
      } );

      return mergeInfo;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {

      resolveWidget: resolveWidget,
      createIdGeneratorForWidget: createIdGeneratorForWidget,
      createEventBusForWidget: createEventBusForWidget,
      featuresForWidget: featuresForWidget,
      processWidgetsForPage: processWidgetsForPage,
      widgetMergeInfo: widgetMergeInfo,

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      addWidgetResolver: function addWidgetResolver( type, resolver ) {
         widgetResolvers_[ type ] = resolver;
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      addDefaultWidgetResolvers: function() {
         angularWidgetResolver.init( themeManager_, q_ );
         this.addWidgetResolver( 'angular', angularWidgetResolver );
      },

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      init: function( themeManager, fileResourceProvider, q ) {
         assert( themeManager ).isNotNull( 'Need a theme manager.' );
         assert( fileResourceProvider ).isNotNull( 'Need a file resource provider' );
         assert( q ).isNotNull( 'Need a promise factory implementation conforming to $q' );

         themeManager_ = themeManager;
         fileResourceProvider_ = fileResourceProvider;
         q_ = q;

         // This actually is a workaround for tests to have an empty cache for each test run.
         widgetSpecificationCache_ = {};
      }

   };

} );
