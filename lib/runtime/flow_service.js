/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createJsonValidator } from '../utilities/json_validator';
import assert from '../utilities/assert';
import { deepClone, forEach } from '../utilities/object';
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
      const placeName = flowController.placeNameForNavigationTarget( targetOrPlace, flowController.place() );
      const place = flowController.places()[ placeName ];
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
      let requestedTarget = TARGET_SELF;

      const controllerApi = {
         places: () => availablePlaces,
         place: () => deepClone( activePlace ),
         parameters: () => deepClone( activeParameters || {} ),
         placeNameForNavigationTarget,
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

      eventBus.subscribe( 'navigateRequest', ( { target, data: parameters } ) => {
         if( navigationInProgress ) { return; }
         requestedTarget = target;
         const placeName = placeNameForNavigationTarget( target, activePlace );
         const place = availablePlaces[ placeName ];
         router.navigateTo(
            place.patterns || [ placeName ],
            withoutRedundantParameters( parameters, place.defaultParameters )
         );
      }, { subscriber: COLLABORATOR_ID } );

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
               requestedTarget = TARGET_SELF;
            }, err => {
               log.error( `Failed to navigate to place "${place.id}". Error: [0]\n`, err.stack );
               return Promise.reject( err );
            } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function placeNameForNavigationTarget( targetOrPlaceName, place ) {
         let placeName = place.targets[ targetOrPlaceName ];
         if( placeName == null ) {
            placeName = targetOrPlaceName;
         }
         assert.state(
            placeName in availablePlaces,
            `Unknown target or place "${targetOrPlaceName}". Current place: "${place.id}"`
         );
         return placeName;
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
         forEach( places, ( place, placeName ) => {
            const patterns = place.patterns || [ placeName ];
            if( place.redirectTo ) {
               patterns.forEach( pattern => {
                  routeMap[ pattern ] = parameters => {
                     // TODO: add defaultParameters
                     // TODO: router.navigateTo( ..., true )
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
   object.forEach( parameters, ( value, key ) => {
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
