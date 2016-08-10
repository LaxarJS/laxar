/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import assert from '../utilities/assert';
import { BLACKBOX } from '../logging/log';
import { create as createI18n } from './widget_services_i18n';
import { create as createVisibility } from './widget_services_visibility';

const INVALID_ID_MATCHER = /[^A-Za-z0-9_\.-]/g;
const ID_SEPARATOR = '-';

export function create(
   artifactProvider,
   configuration,
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
            axAreaHelper: null,
            axAssets: null,
            axConfiguration: null,
            axContext: null,
            axEventBus: null,
            axFeatures: null,
            axFlowService: null,
            axGlobalEventBus: null,
            axGlobalLog: null,
            axGlobalStorage: null,
            axHeartbeat: null,
            axI18n: null,
            axId: null,
            axLog: null,
            axStorage: null,
            axTooling: null,
            axVisibility: null
         };

         const services = { ...instances };
         const releaseHandlers = [];

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
         registerServiceFactory(
            'axEventBus',
            () => createEventBusForWidget( services.axGlobalEventBus, widgetName, widgetId ),
            () => { instances.axEventBus.release(); }
         );
         registerService( 'axFeatures', features );
         registerService( 'axFlowService', flowService );
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
      return {
         eventBus: services.axEventBus,
         features: services.axFeatures,
         id: services.axId,
         log: services.axLog,
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
      return {
         fullName( localAreaName ) {
            assert( localAreaName || null ).hasType( String ).isNotNull();
            return qualify( localAreaName );
         },
         localName( fullAreaName ) {
            assert( fullAreaName ).hasType( String ).isNotNull();
            return unqualify( fullAreaName );
         },
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
      const assetService = name => widgetArtifacts.asset( name );
      assetService.url = name => widgetArtifacts.assetUrl( name );
      assetService.forTheme = name => widgetArtifacts.assetForTheme( name );
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
         // two ids with different invalid characters at the same positions is less likely to occur.
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
