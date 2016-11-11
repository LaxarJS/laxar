/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import assert from '../utilities/assert';
import { create as createJsonValidator } from '../utilities/json_validator';
import { forEach, setPath } from '../utilities/object';
import flowSchema from '../../static/schemas/flow';

const SESSION_KEY_TIMER = 'navigationTimer';
const DEFAULT_PLACE = '';

export const TARGET_SELF = '_self';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Module providing the flow controller factory.
 *
 * @module flow_controller
 * @private
 */

/**
 * Creates a flow controller that can load a flow definition, set up routes, and allows to navigate between
 * places. The flow controller triggers the setup and destruction of pages, and handles `navigateRequest`
 * events.
 *
 * @param {ArtifactProvider} artifactProvider
 *    an artifact provider, needed to fetch the flow definition
 * @param {Configuration} configuration
 *    a configuration instance, to determine the name of the flow to load
 * @param {EventBus} eventBus
 *    an event bus instance, used to subscribe to navigateRequest events, and to publish will/did-responses
 * @param {Logger} eventBus
 *    an event bus instance, used to subscribe to navigateRequest events, and to publish will/did-responses
 *
 * @return {FlowController}
 *    a flow controller instance
 */
export function create( artifactProvider, configuration, eventBus, log, pageService, router, timer ) {

   const COLLABORATOR_ID = 'AxFlowController';
   const availablePlaces = {};

   let activeParameters = {};
   let activePlace;
   let navigationInProgress = false;
   let requestedTarget = null;

   eventBus.subscribe( 'navigateRequest', ( { target, data } ) => {
      if( navigationInProgress ) { return; }
      requestedTarget = target;
      navigateToTarget( target, { ...activeParameters, ...data } );
   }, { subscriber: COLLABORATOR_ID } );

   return {
      placeForTarget,
      loadFlow
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function loadFlow() {
      const flowName = configuration.ensure( 'flow.name' );
      return artifactProvider.forFlow( flowName ).definition()
         .then( flow => {
            validateFlowJson( flow );
            router.registerRoutes(
               assembleRoutes( flow ),
               createFallbackHandler( flow )
            );
         } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function navigateToTarget( targetOrPlaceId, parameters, redirectFrom = null ) {
      const place = placeForTarget( targetOrPlaceId, redirectFrom );
      router.navigateTo(
         place.patterns,
         withoutRedundantParameters( place, parameters ),
         !!redirectFrom
      );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function handleRouteChange( place, routerParameters ) {
      const parameters = { ...place.defaultParameters, ...routerParameters };
      if( activePlace && place.id === activePlace.id && equals( parameters, activeParameters ) ) {
         navigationInProgress = false;
         log.trace( `Canceling navigation to "${place.id}". Already there with same parameters.` );
         return Promise.resolve();
      }
      if( navigationInProgress ) {
         log.trace( `Canceling navigation to "${place.id}". Navigation already in progress.` );
         return Promise.resolve();
      }
      navigationInProgress = true;

      const fromPlace = activePlace ? activePlace.targets[ TARGET_SELF ] : '';
      const navigationTimer = timer.started( {
         label: `navigation (${fromPlace} -> ${place.targets[ TARGET_SELF ]})`,
         persistenceKey: SESSION_KEY_TIMER
      } );

      const event = {
         target: requestedTarget || place.id,
         place: place.id,
         data: parameters
      };
      requestedTarget = null;

      const options = { sender: COLLABORATOR_ID };
      return eventBus.publish( `willNavigate.${event.target}`, event, options )
         .then( () => {
            if( activePlace && place.id === activePlace.id ) {
               activeParameters = parameters;
               return Promise.resolve();
            }

            return pageService.controller().tearDownPage()
               .then( () => {
                  log.setTag( 'PLCE', place.id );
                  activeParameters = parameters;
                  activePlace = place;
                  return pageService.controller().setupPage( place.page );
               } );
         } )
         .then( () => {
            navigationInProgress = false;
            navigationTimer.stopAndLog( 'didNavigate' );
            return eventBus.publish( `didNavigate.${event.target}`, event, options );
         } )
         .catch( err => {
            log.error( `Failed to navigate to place "${place.id}". Error: [0]\n`, err.stack );
            return Promise.reject( err );
         } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function placeForTarget( targetOrPlaceId, place = activePlace ) {
      let placeId = place.targets[ targetOrPlaceId ];
      if( placeId == null ) {
         placeId = targetOrPlaceId;
      }
      assert.state(
         placeId in availablePlaces,
         `Unknown target or place "${targetOrPlaceId}". Current place: "${place.id}"`
      );
      return availablePlaces[ placeId ];
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createFallbackHandler( flow ) {
      const { redirectOn, places } = flow;
      return path => {
         log.warn( `Received request for unknown route "${path}".` );
         if( redirectOn.unknownPlace in places ) {
            log.trace( `- Redirecting to error place ("${redirectOn.unknownPlace}").` );
            handleRouteChange( places[ redirectOn.unknownPlace ], {} );
         }
         else if( DEFAULT_PLACE in places ) {
            log.trace( `- Redirecting to default place ("${DEFAULT_PLACE}").` );
            handleRouteChange( places[ DEFAULT_PLACE ], {} );
         }
         else {
            log.trace( '- Got no unknownPlace redirect and no default place. Doing nothing.' );
         }
      };
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function assembleRoutes( { places } ) {
      const routeMap = {};
      forEach( places, ( place, placeId ) => {
         place.id = placeId;
         place.patterns = place.patterns || [ `/${placeId}` ];
         setPath( place, `targets.${TARGET_SELF}`, place.id );

         const { id, patterns, page, redirectTo } = place;
         availablePlaces[ id ] = place;

         if( redirectTo ) {
            patterns.forEach( pattern => {
               routeMap[ pattern ] = parameters => {
                  navigateToTarget( redirectTo, parameters, place );
               };
            } );
            return;
         }

         if( !page ) {
            log.error( `flow: invalid empty place: ${id}` );
            return;
         }

         patterns.forEach( pattern => {
            routeMap[ pattern ] = parameters => {
               handleRouteChange( place, parameters );
            };
         } );
      } );
      return routeMap;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function validateFlowJson( flowJson ) {
      const errors = createJsonValidator( flowSchema ).validate( flowJson );
      if( errors.length ) {
         log.error(
            'LaxarJS flow controller: Failed validating flow definition:\n[0]',
            errors.map( ({ message }) => ` - ${message}` ).join( '\n' )
         );
         throw new Error( 'Illegal flow.json format' );
      }
   }

}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function withoutRedundantParameters( place, parameters ) {
   const { defaultParameters = {} } = place;
   const remainingParameters = {};
   forEach( parameters, ( value, key ) => {
      if( !( key in defaultParameters ) || defaultParameters[ key ] !== value ) {
         remainingParameters[ key ] = value;
      }
   } );
   return remainingParameters;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function equals( a, b ) {
   const aKeys = Object.keys( a );
   const bKeys = Object.keys( b );
   return aKeys.length === bKeys.length && aKeys.every( key => key in b && a[ key ] === b[ key ] );
}
