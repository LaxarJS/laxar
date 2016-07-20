/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
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
   storage,
   toolingProviders
) {

   return {
      forWidget( specification, widgetConfiguration, features ) {
         const { id: widgetId } = widgetConfiguration;
         const { name: widgetName } = specification;
         const context = {
            eventBus: createEventBusForWidget( globalEventBus, widgetName, widgetId ),
            features,
            id: createIdGeneratorForWidget( widgetId ),
            log: createLoggerForWidget( log, widgetName, widgetId ),
            widget: {
               area: widgetConfiguration.area,
               id: widgetId,
               path: widgetConfiguration.widget
            }
         };

         return {
            services: {
               axConfiguration: configuration,
               axContext: context,
               axEventBus: context.eventBus,
               axFeatures: features,
               axFlowService: flowService,
               axGlobalEventBus: globalEventBus,
               axGlobalLog: log,
               axGlobalStorage: storage,
               axHeartbeat: heartbeat,
               axI18n: i18n,
               axId: context.id,
               axLog: context.log,
               axStorage: createStorageForWidget( storage, widgetId ),
               axTooling: toolingProviders
            },
            releaseServices() {
               context.eventBus.release();
            }
         };
      }
   };

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
