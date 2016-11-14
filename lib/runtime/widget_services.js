/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

/**
 * Factory for the services that are available to the controller of a widget, regardless of the underlying
 * view framework.
 *
 * @module widget_services
 */

import assert from '../utilities/assert';
import { BLACKBOX } from '../runtime/log';
import { create as createI18n } from './widget_services_i18n';
import { create as createVisibility } from './widget_services_visibility';

const INVALID_ID_MATCHER = /[^A-Za-z0-9_\.-]/g;
const ID_SEPARATOR = '-';

export function create(
   artifactProvider,
   configuration,
   controlLoader,
   globalEventBus,
   flowService,
   log,
   heartbeat,
   pageService,
   storage,
   toolingProviders
) {

   const i18nOptions = configuration.ensure( 'i18n' );

   return {
      forWidget( specification, widgetConfiguration, features, decorators = {} ) {
         const { id: widgetId } = widgetConfiguration;
         const { name: widgetName } = specification;

         const instances = {
            /**
             * Area helper service instance.
             *
             * @type {AxAreaHelper}
             */
            axAreaHelper: null,

            /**
             * widget asset accessor instance.
             *
             * @type {AxAssets}
             */
            axAssets: null,

            /**
             * Interface to the configuration the application was bootstrapped with.
             *
             * @type {Configuration}
             */
            axConfiguration: null,

            /**
             * Context information and tiny service collection.
             *
             * @type {AxContext}
             */
            axContext: null,

            /**
             * The control loader api to provide access to control modules used by a widget.
             *
             * @type {ControlLoader}
             */
            axControls: null,

            /**
             * Event bus instance specifically enriched for a widget instance.
             *
             * @type {AxEventBus}
             */
            axEventBus: null,

            /**
             * The features the widget was configured with.
             * Its structure depends solely on the schema defined in the widget's descriptor file
             * (`widget.json`)
             *
             * @type {Object}
             */
            axFeatures: null,

            /**
             * Injection for the flow service.
             *
             * @type {FlowService}
             */
            axFlowService: null,

            /**
             * The global event bus instance of the application.
             * {@link axEventBus} should always be prefered over this, since for example unsubscribing from
             * event subscriptions on widget destruction needs be done manually and can lead to severe memory
             * leaks if omitted.
             * One valid use case could be an activity, that has permanent knowledge about the application's
             * state and lifetime, and for example adds an inspector to the event bus.
             *
             * @type {EventBus}
             */
            axGlobalEventBus: null,

            /**
             * The global logger instance.
             *
             * @type {Logger}
             */
            axGlobalLog: null,

            /**
             * The global storage factory.
             *
             * @type {StorageFactory}
             */
            axGlobalStorage: null,

            /**
             * The heartbeat instance.
             *
             * @type {Heartbeat}
             */
            axHeartbeat: null,

            /**
             * I18n api specifically for the widget instance.
             *
             * @type {AxI18n}
             */
            axI18n: null,

            /**
             * A function that generates page wide unique ids based on ids that are unique within the scope
             * of a widget.
             *
             * A common use case is the connection of a `label` HTML element and an `input` element via `for`
             * and `id` attributes.
             * For such cases ids should **always** be generated using this service.
             *
             * Example:
             * ```js
             * widgetDom.querySelector( 'label' ).setAttribute( 'for', axId( 'myField' ) );
             * widgetDom.querySelector( 'input' ).setAttribute( 'id', axId( 'myField' ) );
             * ```
             *
             * @param {String} localUniqueId
             *    an identifier that is unique within a widget
             *
             * @return {String}
             *    an identifier that is unique for the current page
             *
             * @type {Function}
             */
            axId: null,

            /**
             * The widget logger instance.
             * This is basically the same as the {@link #axGlobalLog}, but adds the name of the widget as
             * prefix and its id as suffix to every log message.
             *
             * @type {Logger}
             */
            axLog: null,

            /**
             * Ready to use storage apis for a widget.
             * All keys are namespaced by the widget id to limit visibility to this specific instance.
             *
             * @type {AxStorage}
             */
            axStorage: null,

            /**
             * Access to the tooling provider API.
             * TODO Fix the type (and document toolingProviders)
             *
             * @type {*}
             */
            axTooling: null,

            /**
             * Visibility services for a widget instance.
             * @type {AxVisibility}
             */
            axVisibility: null
         };

         const services = { ...instances };
         const releaseHandlers = [];


         const axFlowService = { ...flowService };
         delete axFlowService.controller;

         registerServiceFactory(
            'axAreaHelper',
            () => createAreaHelperForWidget( widgetId ),
            () => { instances.axAreaHelper.release(); }
         );
         registerServiceFactory(
            'axAssets',
            () => createAssetsServiceForWidget( widgetName )
         );
         registerService( 'axConfiguration', configuration );
         registerServiceFactory(
            'axContext',
            () => createContextForWidget( widgetConfiguration, widgetId, services )
         );
         registerService( 'axControls', controlLoader );
         registerServiceFactory(
            'axEventBus',
            () => createEventBusForWidget( services.axGlobalEventBus, widgetName, widgetId ),
            () => { instances.axEventBus.release(); }
         );
         registerService( 'axFeatures', features );
         registerService( 'axFlowService', axFlowService );
         registerService( 'axGlobalEventBus', globalEventBus );
         registerService( 'axGlobalLog', log );
         registerService( 'axGlobalStorage', storage );
         registerService( 'axHeartbeat', heartbeat );

         registerServiceFactory(
            'axI18n',
            () => createI18n( services.axContext, i18nOptions )
         );
         registerServiceFactory(
            'axId',
            () => createIdGeneratorForWidget( widgetId )
         );
         registerServiceFactory(
            'axLog',
            () => createLoggerForWidget( log, widgetName, widgetId )
         );
         registerServiceFactory(
            'axStorage',
            () => createStorageForWidget( storage, widgetId )
         );
         registerServiceFactory(
            'axVisibility',
            () => createVisibility( services.axContext, services.axAreaHelper )
         );
         registerService( 'axTooling', toolingProviders );

         return {
            services,
            releaseServices() {
               releaseHandlers.forEach( f => { f(); } );
            }
         };

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function registerService( name, instance ) {
            const decorate = decorators[ name ];
            instances[ name ] = services[ name ] = decorate ? decorate( instance ) : instance;
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function registerServiceFactory( name, factory, optionalRelease ) {
            Object.defineProperty(
               services,
               name, {
                  get: () => {
                     if( !instances[ name ] ) {
                        const decorate = decorators[ name ];
                        const instance = factory();
                        instances[ name ] = decorate ? decorate( instance ) : instance;
                        if( optionalRelease ) {
                           releaseHandlers.push( optionalRelease );
                        }
                     }
                     return instances[ name ];
                  }
               }
            );

         }
      }
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createContextForWidget( widgetConfiguration, widgetId, services ) {

      /**
       * This object encapsulates widget context information and provides access to the most important widget
       * specific service instances.
       * Most commonly this is used when working with
       * [LaxarJS Patterns](https://github.com/LaxarJS/laxar-patterns).
       *
       * @name AxContext
       * @constructor
       */
      return {

         /**
          * The event bus instance of the widget. This is the same as {@link #axEventBus}.
          *
          * @type {AxEventBus}
          * @memberof AxContext
          */
         eventBus: services.axEventBus,

         /**
          * The configured features of the widget. This is the same as {@link #axFeatures}.
          *
          * @type {Object}
          * @memberof AxContext
          */
         features: services.axFeatures,

         /**
          * The unique id generator function. This is the same as {@link #axId}.
          *
          * @type {Function}
          * @memberof AxContext
          */
         id: services.axId,

         /**
          * The widget local log instance. This is the same as {@link #axLog}.
          *
          * @type {AxLog}
          * @memberof AxContext
          */
         log: services.axLog,

         /**
          * Some information regarding the widget instance.
          *
          * The following fields are available:
          * - `area`: full name of the area the widget is located in
          * - `id`: the unique id of the widget on the page
          * - `path`: path of the widget that was used to reference it in the according page or composition.
          *    This is not the actual path on the file system, but most probably an alias known by the used
          *    module loader.
          *
          * @type {Object}
          * @memberof AxContext
          */
         widget: {
            area: widgetConfiguration.area,
            id: widgetId,
            path: widgetConfiguration.widget
         }
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createAreaHelperForWidget( widgetId ) {
      const deregisterFuncs = [];

      /**
       * @name AxAreaHelper
       * @constructor
       */
      return {
         /**
          * Looks up the global name of a widget area within a widget, as generated by LaxarJS.
          * This is the reverse of {@link #AxAreaHelper.localName()}.
          *
          * @param {String} localAreaName
          *    the widget-local name of the area
          *
          * @return {String}
          *    the globally valid name of the area
          *
          * @memberof AxAreaHelper
          */
         fullName( localAreaName ) {
            assert( localAreaName || null ).hasType( String ).isNotNull();
            return qualify( localAreaName );
         },

         /**
          * Returns the local part of a global area name.
          * This is the reverse of {@link #AxAreaHelper.fullName()}.
          *
          * @param {String} fullAreaName
          *    the global name of the area
          *
          * @return {String}
          *    the name of the area as it is known to the widget
          *
          * @memberof AxAreaHelper
          */
         localName( fullAreaName ) {
            assert( fullAreaName ).hasType( String ).isNotNull();
            return unqualify( fullAreaName );
         },

         /**
          * Registers a DOM element as area of a widget with the area helper.
          *
          * @param {String} localAreaName
          *    the widget-local name of the area
          * @param {HTMLElement} element
          *    the element to register as widget area
          *
          * @memberof AxAreaHelper
          */
         register( localAreaName, element ) {
            assert( localAreaName ).hasType( String ).isNotNull();
            assert( element ).hasType( Object ).isNotNull();
            const areaHelper = pageService.controller().areaHelper();
            deregisterFuncs.push( areaHelper.register( qualify( localAreaName ), element ) );
         },
         release() {
            deregisterFuncs.forEach( _ => { _(); } );
         }
      };

      function qualify( localAreaName ) {
         return `${widgetId}.${localAreaName}`;
      }

      function unqualify( fullAreaName ) {
         return fullAreaName.slice( widgetId.length + 1 );
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createAssetsServiceForWidget( widgetName ) {
      const widgetArtifacts = artifactProvider.forWidget( widgetName );

      /**
       * _Note:_ This service is a function with the {@link #AxAssets.url()}, {@link #AxAssets.forTheme()} and
       * {@link #AxAssets.urlForTheme()} functions as properties.
       *
       * Resolves an asset located directly in the widget folder or a subfolder of it.
       * Valid assets are all non-binary files like JSON or text files.
       * For binary files there exists the {@link #AxAssets.url} function.
       *
       * Example:
       * ```
       * function Controller( axAssets ) {
       *    axAssets( 'data.json' ).then( fileContent => { ... } );
       * }
       * ```
       *
       * @param {String} name
       *    name of the asset to resolve
       *
       * @return {Promise}
       *    promise for the asset
       *
       * @name AxAssets
       */
      const assetService = name => widgetArtifacts.asset( name );

      /**
       * Resolves the absolute url to the given asset located directly in the widget folder or a subfolder of
       * it.
       * This can then be safely used in e.g. `video` or `img` tags.
       *
       * Example:
       * ```
       * function Controller( axAssets ) {
       *    axAssets.url( 'tux.jpg' ).then( url => { img.src = url; } );
       * }
       * ```
       *
       * @param  {String} name
       *    name of the asset the url should be returned of
       *
       * @return {Promise}
       *    promise for the url
       *
       * @memberof AxAssets
       */
      assetService.url = name => widgetArtifacts.assetUrl( name );

      /**
       * Resolves an asset from one of the `*.theme` subfolders of the widget.
       * The folder from which the asset is taken, depends on the selected theme and the availability of the
       * file within that theme (See
       * [here](http://laxarjs.org/docs/laxar-latest/manuals/creating_themes/#how-the-runtime-finds-css) for
       * further information on theme asset lookup).
       * Valid assets are all non-binary files like JSON or text files.
       * For binary files there exists the {@link #AxAssets.urlForTheme} function.
       *
       * Example:
       * ```
       * function Controller( axAssets ) {
       *    axAssets.forTheme( 'some-template.html' ).then( template => { ... } );
       * }
       * ```
       *
       * @param {String} name
       *    name of the asset to resolve
       *
       * @return {Promise}
       *    promise for the asset
       *
       * @memberof AxAssets
       */
      assetService.forTheme = name => widgetArtifacts.assetForTheme( name );

      /**
       * Resolves the absolute url to the given asset from one of the `*.theme` subfolders of the widget.
       * This can then be safely used in e.g. `video` or `img` tags.
       * The folder from which the asset is taken, depends on the selected theme and the availability of the
       * file within that theme (See
       * [here](http://laxarjs.org/docs/laxar-latest/manuals/creating_themes/#how-the-runtime-finds-css) for
       * further information on theme asset lookup).
       *
       * Example:
       * ```
       * function Controller( axAssets ) {
       *    axAssets.urlForTheme( 'icon.jpg' ).then( url => { img.src = url; } );
       * }
       * ```
       *
       * @param  {String} name
       *    name of the asset the url should be returned of
       *
       * @return {Promise}
       *    promise for the url
       *
       * @memberof AxAssets
       */
      assetService.urlForTheme = name => widgetArtifacts.assetUrlForTheme( name );
      return assetService;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createLoggerForWidget( logger, widgetName, widgetId ) {
      const newLogger = Object.create( logger );
      newLogger.log = ( level, message, ...rest ) =>
         logger.log( level, enrich( message ), ...rest, BLACKBOX );
      Object.keys( logger.levels )
         .map( _ => _.toLowerCase() )
         .forEach( method => {
            newLogger[ method ] = ( message, ...rest ) =>
               logger[ method ]( enrich( message ), ...rest, BLACKBOX );
         } );
      return newLogger;

      function enrich( message ) {
         return `${widgetName}: ${message} (widget-id: ${widgetId})`;
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createStorageForWidget( storage, widgetId ) {
      const namespace = `widget-${widgetId}`;

      /**
       * Ready to use storage API for a single widget instance.
       * All keys are namespaced by the widget id to limit visibility to this specific instance.
       *
       * @name AxStorage
       * @constructor
       */
      return {
         /**
          * An instance of the storage api using the persistent `window.localStorage`.
          *
          * @type {StorageApi}
          * @memberof AxStorage
          */
         local: storage.getLocalStorage( namespace ),

         /**
          * An instance of the storage api using the non-persistent `window.sessionStorage`.
          *
          * @type {StorageApi}
          * @memberof AxStorage
          */
         session: storage.getSessionStorage( namespace )
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createIdGeneratorForWidget( widgetId ) {
      const charCodeOfA = 'a'.charCodeAt( 0 );
      function fixLetter( l ) {
         // We map invalid characters deterministically to valid lower case letters. Thereby a collision of
         // two IDs with different invalid characters at the same positions is less likely to occur.
         return String.fromCharCode( charCodeOfA + ( l.charCodeAt( 0 ) % 26 ) );
      }

      const prefix = `ax${ID_SEPARATOR}${widgetId.replace( INVALID_ID_MATCHER, fixLetter )}${ID_SEPARATOR}`;
      return localId => prefix + `${localId}`.replace( INVALID_ID_MATCHER, fixLetter );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createEventBusForWidget( eventBus, widgetName, widgetId ) {

      const collaboratorId = `widget.${widgetName}#${widgetId}`;
      const inspectorRemoveFunctions = [];
      const unsubscribeFunctions = [];

      /**
       * This is an extension of the global {@link event_bus#EventBus EventBus} by widget specific information
       * and tasks.
       * For example a combination of the widget's name and its id is always used as subscriber and sender
       * id.
       * Hence for example {@link event_bus#EventBus.publishAndGatherReplies EventBus.publishAndGatherReplies}
       * works without passing in any options.
       *
       * Additionally all subscriptions of a widget are removed as soon as the widget itself is destroyed.
       * So in practice a widget will receive no further events after the `endLifecycleRequest` event
       * processing has finished.
       *
       * The documentation for the events bus api can be found {@linkplain event_bus here}.
       *
       * @name AxEventBus
       * @constructor
       */
      return {
         addInspector( inspector ) {
            return makeAutoRemovable( inspectorRemoveFunctions, eventBus.addInspector( inspector ) );
         },
         unsubscribe( subscriber ) {
            return eventBus.unsubscribe( subscriber );
         },
         subscribe( eventName, subscriber, optionalOptions ) {
            const options = { ...optionalOptions, subscriber: collaboratorId };
            const unsubscribe = eventBus.subscribe( eventName, subscriber, options );

            return makeAutoRemovable( unsubscribeFunctions, unsubscribe );
         },
         publish( eventName, optionalEvent, optionalOptions ) {
            const options = { ...optionalOptions, sender: collaboratorId };
            return eventBus.publish( eventName, optionalEvent, options );
         },
         publishAndGatherReplies( eventName, optionalEvent, optionalOptions ) {
            const options = { ...optionalOptions, sender: collaboratorId };
            return eventBus.publishAndGatherReplies( eventName, optionalEvent, options );
         },
         release() {
            purgeAutoRemoveRegistries( inspectorRemoveFunctions, unsubscribeFunctions );
         }
      };

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function makeAutoRemovable( registry, removeFunction ) {
         registry.push( removeFunction );
         return () => {
            removeFunction();
            const index = registry.indexOf( removeFunction );
            if( index !== -1 ) {
               registry.splice( index, 1 );
            }
         };
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function purgeAutoRemoveRegistries( ...registries ) {
         registries.forEach( registry => {
            registry.forEach( _ => { _(); } );
            registry.length = 0;
         } );
      }

   }

}
