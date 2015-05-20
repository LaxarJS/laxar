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

   var DEFAULT_INTEGRATION = { type: TYPE_WIDGET, technology: TECHNOLOGY_ANGULAR };

   var ID_SEPARATOR = '-';
   var INVALID_ID_MATCHER = /[^A-Za-z0-9_\.-]/g;

   /**
    * @typedef {{then: Function}} Promise
    *
    * @param q
    * @param fileResourceProvider
    * @param themeManager
    * @param cssLoader
    * @param eventBus
    * @returns {{load: Function}}
    */
   function create( q, fileResourceProvider, themeManager, cssLoader, eventBus ) {

      return {
         load: load
      };

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
       * @return {Promise} a promise for a widget adapter, with an already instantiated controller
       */
      function load( widgetConfiguration ) {
         var widgetPath = widgetConfiguration.widget;
         var widgetJsonPath = path.join( paths.WIDGETS, widgetPath, 'widget.json' );

         return fileResourceProvider.provide( widgetJsonPath )
            .then( function( specification ) {
               var integration = object.options( specification.integration, DEFAULT_INTEGRATION );
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
               anchorElement.id = 'ax' + ID_SEPARATOR + widgetConfiguration.id;
               var widgetEventBus = createEventBusForWidget( eventBus, specification, widgetConfiguration );

               var adapter = adapters.getFor( technology ).create( {
                  anchorElement: anchorElement,
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
                  specification: specification
               } );
               adapter.createController();

               return {
                  id: widgetConfiguration.id,
                  adapter: adapter,
                  destroy: function() {
                     widgetEventBus.release();
                     adapter.destroy();
                  },
                  templatePromise: loadAssets( widgetPath, integration, specification )
               };

            }, function( err ) {
               var message = 'Could not load spec for widget [0] from [1]: [2]';
               log.error( message, widgetPath, widgetJsonPath, err );
            } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      /**
       * Locates and loads the widget HTML template for this widget (if any) as well as any CSS stylesheets
       * used by this widget or its controls.
       *
       * @param widgetReferencePath
       *    The path suffix used to look up the widget, as given in the instance configuration.
       * @param integration
       *    Details on the integration type and technology: Activities do not require assets.
       * @param widgetSpecification
       *    The widget specification, used to find out if any controls need to be loaded.
       *
       * @return {Promise<String>}
       *    A promise that will be resolved with the contents of any HTML template for this widget, or with
       *    `null` if there is no template (for example, if this is an activity).
       */
      function loadAssets( widgetReferencePath, integration, widgetSpecification ) {

         return integration.type === TYPE_ACTIVITY ? q.when( null ) : resolve().then( function( urls ) {
            urls.cssFileUrls.forEach( function( url ) { cssLoader.load( url ); } );
            return urls.templateUrl ? fileResourceProvider.provide( urls.templateUrl ) : null;
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function resolve() {
            var technicalName = widgetReferencePath.split( '/' ).pop();
            var widgetPath = path.join( paths.WIDGETS, widgetReferencePath );
            var htmlFile = technicalName + '.html';
            var cssFile = path.join( 'css/', technicalName + '.css' );

            var promises = [];
            promises.push( themeManager.urlProvider(
               path.join( widgetPath, '[theme]' ),
               path.join( paths.THEMES, '[theme]', 'widgets', widgetReferencePath )
            ).provide( [ htmlFile, cssFile ] ) );

            promises = promises.concat( ( widgetSpecification.controls || [] )
               .map( function( controlReference ) {
                  // By appending a path now and .json afterwards, trick RequireJS into generating the
                  // correct descriptor path when loading from a 'package'.
                  var controlLocation = path.normalize( require.toUrl( path.join( controlReference, 'control' ) ) );
                  var descriptorUrl = controlLocation + '.json';
                  return fileResourceProvider.provide( descriptorUrl ).then( function( descriptor ) {
                     // LaxarJS 1.x style control (name determined from descriptor):
                     var name = camelCaseToDashed( descriptor.name );
                     return themeManager.urlProvider(
                        path.join( controlLocation.replace( /\/control$/, '' ), '[theme]' ),
                        path.join( paths.THEMES, '[theme]', 'controls', name )
                     ).provide( [ path.join( 'css/',  name + '.css' ) ] );
                  },
                  function() {
                     // LaxarJS 0.x style controls (no descriptor, uses AMD path as name):
                     var name = controlReference.split( '/' ).pop();
                     return themeManager.urlProvider(
                        path.join( require.toUrl( controlReference ), '[theme]' ),
                        path.join( paths.THEMES, '[theme]', controlReference )
                     ).provide( [ path.join( 'css/', name + '.css' ) ] );
                  } );
               } ) );

            return q.all( promises )
               .then( function( results ) {
                  var widgetUrls = results[ 0 ];
                  var cssUrls = results.slice( 1 )
                     .map( function( urls ) { return urls[ 0 ]; } )
                     .concat( widgetUrls.slice( 1 ) )
                     .filter( function( url ) { return !!url; } );

                  return {
                     templateUrl: widgetUrls[ 0 ] || '',
                     cssFileUrls: cssUrls
                  };
               } );
         }
      }
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

      var prefix = 'ax' + ID_SEPARATOR + widgetId.replace( INVALID_ID_MATCHER, fixLetter ) + ID_SEPARATOR;
      return function( localId ) {
         return prefix + ( '' + localId ).replace( INVALID_ID_MATCHER, fixLetter );
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
