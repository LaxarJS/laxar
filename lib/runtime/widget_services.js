/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import assert from '../utilities/assert';
import * as object from '../utilities/object';
import { BLACKBOX } from '../logging/log';

const INVALID_ID_MATCHER = /[^A-Za-z0-9_\.-]/g;
const ID_SEPARATOR = '-';

export function create(
   configuration,
   globalEventBus,
   flowService,
   log,
   heartbeat,
   i18n,
   pageService,
   storage,
   toolingProviders
) {

   return {
      forWidget( specification, widgetConfiguration, features, decorators = {} ) {
         const { id: widgetId } = widgetConfiguration;
         const { name: widgetName } = specification;

         const instances = {
            axAreaHelper: null,
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
            axTooling: null
         };

         const services = { ...instances };
         const releaseHandlers = [];

         registerServiceFactory(
            'axAreaHelper',
            () => createAreaHelperForWidget( widgetId ),
            () => { instances.axAreaHelper.release(); }
         );
         registerService( 'axConfiguration', configuration );
         registerServiceFactory(
            'axContext',
            () => createContextForWidget( widgetConfiguration, widgetId, services )
         );
         registerServiceFactory(
            'axEventBus',
            () => createEventBusForWidget( globalEventBus, widgetName, widgetId ),
            () => { instances.axEventBus.release(); }
         );
         registerService( 'axFeatures', features );
         registerService( 'axFlowService', flowService );
         registerService( 'axGlobalEventBus', globalEventBus );
         registerService( 'axGlobalLog', log );
         registerService( 'axGlobalStorage', storage );
         registerService( 'axHeartbeat', heartbeat );
         registerService( 'axI18n', i18n );
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
         registerService( 'axTooling', toolingProviders );

         return {
            services,
            releaseServices() {
               releaseHandlers.forEach( f => { f(); } );
            }
         };

         function registerService( name, instance ) {
            const decorate = decorators[ name ];
            instances[ name ] = services[ name ] = decorate ? decorate( instance ) : instance;
         }

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
         register( localAreaName, element ) {
            assert( localAreaName ).hasType( String ).isNotNull();
            assert( element ).hasType( Object ).isNotNull();

            const areaName = `${widgetId}.${localAreaName}`;
            const areaHelper = pageService.controller().areaHelper();
            deregisterFuncs.push( areaHelper.register( areaName, element ) );
         },
         release() {
            deregisterFuncs.forEach( _ => { _(); } );
         }
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createLoggerForWidget( logger, widgetName, widgetId ) {
      const newLogger = Object.create( logger );
      newLogger.log = ( level, message, ...rest ) =>
         logger.log( level, enrich( message ), ...rest, BLACKBOX );
      Object.keys( logger.level )
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

      function forward( to ) {
         return ( ...args ) => eventBus[ to ]( ...args );
      }

      function augmentOptions( optionalOptions ) {
         return object.options( optionalOptions, { sender: collaboratorId } );
      }

      const subscriptions = [];
      function unsubscribe( subscriber ) {
         eventBus.unsubscribe( subscriber );
      }

      return {
         addInspector: forward( 'addInspector' ),
         setErrorHandler: forward( 'setErrorHandler' ),
         setMediator: forward( 'setMediator' ),
         unsubscribe,
         subscribe( eventName, subscriber, optionalOptions ) {
            subscriptions.push( subscriber );

            const options = object.options( optionalOptions, { subscriber: collaboratorId } );

            eventBus.subscribe( eventName, subscriber, options );
         },
         publish( eventName, optionalEvent, optionalOptions ) {
            return eventBus.publish( eventName, optionalEvent, augmentOptions( optionalOptions ) );
         },
         publishAndGatherReplies( eventName, optionalEvent, optionalOptions ) {
            return eventBus
               .publishAndGatherReplies( eventName, optionalEvent, augmentOptions( optionalOptions ) );
         },
         release() {
            subscriptions.forEach( unsubscribe );
         }
      };
   }

}
