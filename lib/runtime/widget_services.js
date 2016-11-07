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
             * area helper service instance
             *
             * @type {AxAreaHelper}
             */
            axAreaHelper: null,

            /**
             * widget asset accessor instance
             *
             * @type {AxAssets}
             */
            axAssets: null,

            /**
             * interface to the configuration the application was bootstrapped with
             *
             * @type {Configuration}
             */
            axConfiguration: null,

            /**
             * context information and service wrapper for the widget that can for example be used with
             * [LaxarJS Patterns](https://github.com/LaxarJS/laxar-patterns)
             * @type {AxContext}
             */
            axContext: null,
            axEventBus: null,
            axFeatures: null,
            axFlowService: null,
            axGlobalEventBus: null,

            /**
             * the global logger instance
             *
             * @type {Logger}
             */
            axGlobalLog: null,
            axGlobalStorage: null,
            axHeartbeat: null,
            axI18n: null,
            axId: null,

            /**
             * the widget logger instance TODO
             *
             * @type {Logger}
             */
            axLog: null,
            axStorage: null,
            axTooling: null,
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
          * @type {AxFeatures}
          * @memberof AxContext
          */
         features: services.axFeatures,

         /**
          * The unique id generator function. This is the same as {@link #axId}.
          *
          * @type {AxId}
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
          * - `area`:
          *
          * @type {Object}
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
      return {
         local: storage.getLocalStorage( namespace ),
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
