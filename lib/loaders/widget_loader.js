/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../logging/log',
   '../utilities/path',
   '../utilities/assert',
   '../utilities/object',
   '../utilities/string',
   './paths',
   './features_provider',
   '../widget_adapters/adapters'
], function( log, path, assert, object, string, paths, featuresProvider, adapters ) {
   'use strict';

   var TYPE_WIDGET = 'widget';
   var TYPE_ACTIVITY = 'activity';
   var TECHNOLOGY_ANGULAR = 'angular';

   var INVALID_ID_MATCHER = /[^A-Za-z0-9-_\.]/g;

   /**
    *
    * @param q
    * @param fileResourceProvider
    * @param themeManager
    * @param cssLoader
    * @param eventBus
    * @returns {{load: Function}}
    */
   function create( q, fileResourceProvider, themeManager, cssLoader, eventBus ) {

      assert( q ).isNotNull();
      assert( fileResourceProvider ).hasType( Object ).isNotNull();
      assert( themeManager ).hasType( Object ).isNotNull();
      assert( cssLoader ).hasType( Object ).isNotNull();
      assert( eventBus ).hasType( Object ).isNotNull();

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Load a widget using an appropriate adapter
       *
       * First, get the given widget's specification to validate and instantiate the widget features.
       * Then, instantiate a widget adapter matching the widget's technology. Using the adapter, create the
       * widget controller. The adapter is returned and can be used to attach the widget to the DOM, or to
       * destroy it.
       *
       * @param {Object} widgetConfiguration
       *    a widget instance configuration (as used in page definitions) to instantiate the widget from
       *
       * @returns {Promise} a promise for a widget adapter, with an already instantiated controller
       */
      function load( widgetConfiguration ) {
         var widgetJsonPath = path.join( paths.WIDGETS, widgetConfiguration.widget, 'widget.json' );
         var promise = fileResourceProvider.provide( widgetJsonPath );

         return promise
            .then( function( specification ) {
               var integration = object.options( specification.integration, {
                  type: TYPE_WIDGET,
                  technology: TECHNOLOGY_ANGULAR
               } );
               var type = integration.type;
               var technology = integration.technology;

               // Handle legacy widget code:
               if( type === TECHNOLOGY_ANGULAR ) {
                  type = TYPE_WIDGET;
               }
               if( type !== TYPE_WIDGET && type !== TYPE_ACTIVITY ) {
                  throwError( widgetConfiguration, 'unknown integration type ' + type );
               }

               var throwWidgetError = throwError.bind( null, widgetConfiguration );
               var features =
                  featuresProvider.featuresForWidget( specification, widgetConfiguration, throwWidgetError );
               var anchorElement = document.createElement( 'DIV' );
               anchorElement.className = camelCaseToDashed( specification.name );
               anchorElement.id = 'widget__' + widgetConfiguration.id;
               var assetResolver = createAssetResolverForWidget( specification, widgetConfiguration );

               var widgetEventBus = createEventBusForWidget( eventBus, specification, widgetConfiguration );
               var adapter = adapters.getFor( technology ).create( {
                  anchorElement: anchorElement,
                  assetResolver: assetResolver,
                  context: {
                     eventBus: widgetEventBus,
                     features: features,
                     id: createIdGeneratorForWidget( widgetConfiguration.id ),
                     widget: {
                        area: widgetConfiguration.area,
                        id: widgetConfiguration.id,
                        path: widgetConfiguration.widget
                     }
                  },
                  release: widgetEventBus.release,
                  specification: specification
               } );
               adapter.createController();
               return adapter;
            }, function( err ) {
               var message = 'Could not load spec for widget [0] from [1]: [2]';
               log.error( message, widgetConfiguration.widget, widgetJsonPath, err );
            } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function createAssetResolverForWidget( widgetSpecification, widgetConfiguration ) {

         return {
            loadCss: cssLoader.load.bind( cssLoader ),
            provide: fileResourceProvider.provide.bind( fileResourceProvider ),
            resolve: resolve
         };

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function resolve() {
            var technicalName = widgetConfiguration.widget.split( '/' ).pop();
            var widgetPath = path.join( paths.WIDGETS, widgetConfiguration.widget );
            var htmlFile = technicalName + '.html';
            var cssFile = path.join( 'css/', technicalName + '.css' );

            var promises = [];
            promises.push( themeManager.urlProvider(
               path.join( paths.THEMES, '[theme]', 'widgets', widgetConfiguration.widget ),
               path.join( widgetPath, '[theme]' )
            ).provide( [ htmlFile, cssFile ] ) );

            promises = promises.concat( ( widgetSpecification.controls || [] )
               .map( function( controlReference ) {
                  var name = controlReference.split( '/' ).pop();
                  return themeManager.urlProvider(
                     path.join( paths.THEMES, '[theme]', controlReference ),
                     path.join( require.toUrl( controlReference ), '[theme]' )
                  ).provide( [ path.join( 'css/', name + '.css' ) ] );
               } ) );

            return q.all( promises )
               .then( function( results ) {
                  var widgetUrls = results[ 0 ];
                  var cssUrls = results.slice( 1 )
                     .map( function( urls ) { return urls[ 0 ]; } )
                     .concat( widgetUrls.slice( 1 ) )
                     .filter( function( url ) { return !!url; } );

                  return {
                     templateUrl: widgetUrls[0] || '',
                     cssFileUrls: cssUrls
                  };
               } );
         }
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      return {
         load: load
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function camelCaseToDashed( str ) {
      return str.replace( /[A-Z]/g, function( character, offset ) {
         return ( offset > 0 ? '-' : '' ) + character.toLowerCase();
      } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function throwError( widgetConfiguration, message ) {
      throw new Error( string.format(
         'Error loading widget "[widget]" (id: "[id]"): [0]', [ message ], widgetConfiguration
      ) );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createIdGeneratorForWidget( widgetId ) {
      var charCodeOfA = 'a'.charCodeAt( 0 );
      function fixLetter( l ) {
         // We map invalid characters deterministically to valid lower case letters. Thereby a collision of
         // two ids with different invalid characters at the same positions is less likely to occur.
         return String.fromCharCode( charCodeOfA + l.charCodeAt( 0 ) % 26 );
      }

      var prefix = ( 'widget__' + widgetId + '_' ).replace( INVALID_ID_MATCHER, fixLetter );
      return function( localId ) {
         return prefix + (''+localId).replace( INVALID_ID_MATCHER, fixLetter );
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createEventBusForWidget( eventBus, widgetSpecification, widgetConfiguration ) {

      var collaboratorId = 'widget.' + widgetSpecification.name + '#' + widgetConfiguration.id;

      function forward( to ) {
         return function() {
            return eventBus[ to ].apply( eventBus, arguments );
         };
      }

      function augmentOptions( optionalOptions ) {
         return object.options( optionalOptions, { sender: collaboratorId } );
      }

      var subscriptions = [];
      function unsubscribe( subscriber ) {
         eventBus.unsubscribe( subscriber );
      }

      return {
         addInspector: forward( 'addInspector' ),
         setErrorHandler: forward( 'setErrorHandler' ),
         setMediator: forward( 'setMediator' ),
         unsubscribe: unsubscribe,
         subscribe: function( eventName, subscriber, optionalOptions ) {
            subscriptions.push( subscriber );

            var options = object.options( optionalOptions, { subscriber: collaboratorId } );

            eventBus.subscribe( eventName, subscriber, options );
         },
         publish: function( eventName, optionalEvent, optionalOptions ) {
            return eventBus.publish( eventName, optionalEvent, augmentOptions( optionalOptions ) );
         },
         publishAndGatherReplies: function( eventName, optionalEvent, optionalOptions ) {
            return eventBus.publishAndGatherReplies( eventName, optionalEvent, augmentOptions( optionalOptions ) );
         },
         release: function() {
            subscriptions.forEach( unsubscribe );
         }
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {
      create: create
   };

} );
