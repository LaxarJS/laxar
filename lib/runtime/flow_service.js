/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createJsonValidator } from '../utilities/json_validator';
import assert from '../utilities/assert';
import { deepClone, forEach, setPath } from '../utilities/object';
import flowSchema from '../../static/schemas/flow';

const SESSION_KEY_TIMER = 'navigationTimer';

const DEFAULT_PLACE = '';

export const TARGET_SELF = '_self';

export function create(
      log,
      timer,
      artifactProvider,
      eventBus,
      configuration,
      browser,
      pageService,
      router ) {

   const flowController = createFlowController();
   const api = {
      controller: () => flowController,
      constructAbsoluteUrl
   };

   return api;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Constructs an absolute URL to the given target or place using the given parameters. If a target is
    * given as first argument, it is resolved using the currently active place.
    *
    * @param {String} targetOrPlace
    *    the target or place ID to construct a URL for
    * @param {Object} [optionalParameters]
    *    optional map of place parameters. Missing parameters are taken from the parameters that were
    *    passed to the currently active place
    *
    * @return {string}
    *    the generated absolute URL
    *
    * @memberOf axFlowService
    */
   function constructAbsoluteUrl( targetOrPlace, optionalParameters = {} ) {
      const placeId = flowController.placeIdForNavigationTarget( targetOrPlace, flowController.place() );
      const place = flowController.places()[ placeId ];
      return router.constructAbsoluteUrl(
         place.patterns,
         withoutRedundantParameters( optionalParameters, place.defaultParameters )
      );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createFlowController() {

      const COLLABORATOR_ID = 'AxFlowController';
      const availablePlaces = {};
      let activeParameters = {};
      let activePlace;
      let navigationInProgress = false;
      let requestedTarget = null;

      const controllerApi = {
         places: () => availablePlaces,
         place: () => deepClone( activePlace ),
         parameters: () => deepClone( activeParameters || {} ),
         placeIdForNavigationTarget,
         loadFlow: () => {
            const flowName = configuration.ensure( 'flow.name' );
            return loadFlow( flowName, handleRouteChange )
               .then( flow => {
                  router.registerRoutes(
                     assembleRoutes( flow ),
                     createFallbackHandler( flow )
                  );
               } );
         }
      };

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      eventBus.subscribe( 'navigateRequest', ( { target, data } ) => {
         if( navigationInProgress ) { return; }
         requestedTarget = target;
         navigateToTarget( target, data );
      }, { subscriber: COLLABORATOR_ID } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function navigateToTarget( targetOrPlaceId, parameters, replaceHistory = false ) {
         const placeId = placeIdForNavigationTarget( targetOrPlaceId, activePlace );
         const place = availablePlaces[ placeId ];
         router.navigateTo(
            place.patterns || [ placeId ],
            withoutRedundantParameters( parameters, place.defaultParameters ),
            replaceHistory
         );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

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
         if( !requestedTarget ) {
            requestedTarget = place.id;
         }

         const fromPlace = activePlace ? activePlace.targets[ TARGET_SELF ] : '';
         const navigationTimer = timer.started( {
            label: `navigation (${fromPlace} -> ${place.targets[ TARGET_SELF ]})`,
            persistenceKey: SESSION_KEY_TIMER
         } );

         const navigateEvent = {
            target: requestedTarget,
            place: place.id,
            data: parameters
         };
         const options = { sender: COLLABORATOR_ID };
         return eventBus.publish( `willNavigate.${requestedTarget}`, navigateEvent, options )
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
                  } )
                  .then( () => pageService.controller().setupPage( place.page ) );
            } )
            .then( () => {
               navigationInProgress = false;
               navigationTimer.stopAndLog( 'didNavigate' );
            } )
            .then( () => eventBus.publish( `didNavigate.${requestedTarget}`, navigateEvent, options ) )
            .then( () => {
               requestedTarget = null;
            }, err => {
               requestedTarget = null;
               log.error( `Failed to navigate to place "${place.id}". Error: [0]\n`, err.stack );
               return Promise.reject( err );
            } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function placeIdForNavigationTarget( targetOrPlaceId, place ) {
         let placeId = place.targets[ targetOrPlaceId ];
         if( placeId == null ) {
            placeId = targetOrPlaceId;
         }
         assert.state(
            placeId in availablePlaces,
            `Unknown target or place "${targetOrPlaceId}". Current place: "${place.id}"`
         );
         return placeId;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function loadFlow( flowName ) {
         return artifactProvider.forFlow( flowName ).definition()
            .then( flow => {
               validateFlowJson( flow );
               return flow;
            } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

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

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function assembleRoutes( { places } ) {
         const routeMap = {};
         forEach( places, ( place, placeId ) => {
            const patterns = place.patterns || [ placeId ];
            place.id = placeId;
            setPath( place, `targets.${TARGET_SELF}`, place.id );
            if( place.redirectTo ) {
               patterns.forEach( pattern => {
                  routeMap[ pattern ] = parameters => {
                     navigateToTarget( place.redirectTo, parameters, true );
                  };
               } );
               return;
            }

            if( !place.page ) {
               log.error( `flow: invalid empty place: ${place.id}` );
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

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      return controllerApi;

   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function validateFlowJson( flowJson ) {
      const errors = createJsonValidator( flowSchema ).validate( flowJson );

      if( errors.length ) {
         log.error( 'Failed validating flow file:\n[0]', errors.map( _ => ` - ${_.message}` ).join( '\n' ) );
         throw new Error( 'Illegal flow.json format' );
      }
   }

}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function withoutRedundantParameters( parameters, defaultParameters ) {
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
