/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../../json/validator',
   '../../json/instantiator',
   '../../logging/log',
   '../../utilities/path',
   '../../utilities/assert',
   '../../utilities/object',
   '../paths',
   './widget_resolvers/angular_widget_resolver',
   './widgets_json'
], function(
   jsonValidator,
   jsonInstantiator,
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
      var features = {};

      if( 'features' in widgetSpecification ) {

         var featureConfiguration = widgetConfiguration.features || {};
         var featuresSpec = {
            type: 'object',
            properties: widgetSpecification.features
         };

         object.forEach( widgetSpecification.features, function( feature, name ) {
            // ensure that simple object features are at least defined
            if( feature.type === 'object' && !( name in featureConfiguration ) ) {
               featureConfiguration[ name ] = {};
            }
         } );

         var validator = jsonValidator.create( featuresSpec, { prohibitAdditionalProperties: true } );
         var report = validator.validate( featureConfiguration );

         if( report.errors.length > 0 ) {
            var message = 'Validation for widget features failed (Widget-ID ' +
               widgetConfiguration.id + '). Errors:';

            report.errors.forEach( function( error ) {
               message += '\n   - ' + error.message;
            } );

            throw new Error( message );
         }

         features = jsonInstantiator.instantiate( featuresSpec, featureConfiguration );
      }

      return features;
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
      var sender = 'widget.' + widget.specification.name + '#' + widget.id;
      function forward( to ) {
         return function() {
            return eventBus[ to ].apply( eventBus, arguments );
         };
      }
      function augmentEvent( optionalEvent ) {
         var event = object.options( optionalEvent, {} );
         event.sender = sender;
         return event;
      }
      widget.__subscriptions = [];

      return {
         addInspector: forward( 'addInspector' ),
         setErrorHandler: forward( 'setErrorHandler' ),
         setMediator: forward( 'setMediator' ),
         unsubscribe: forward( 'unsubscribe' ),
         subscribe: function( eventName, subscriber ) {
            widget.__subscriptions.push( subscriber );
            return eventBus.subscribe( eventName, subscriber, sender );
         },
         publish: function( eventName, optionalEvent, optionalOptions ) {
            if( eventName.indexOf( 'didUpdate.' ) === 0 && optionalEvent && 'data' in optionalEvent ) {
               log.develop(
                  'Widget "[0]" published didUpdate-event using deprecated attribute "data" (event: [1]).\n' +
                     '   Change this to "updates" immediately.',
                  sender,
                  eventName
               );
            }
            return eventBus.publish( eventName, augmentEvent( optionalEvent ), optionalOptions );
         },
         publishAndGatherReplies: function( eventName, optionalEvent, optionalOptions ) {
            return eventBus.publishAndGatherReplies( eventName, augmentEvent( optionalEvent ), optionalOptions );
         }
      };
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
