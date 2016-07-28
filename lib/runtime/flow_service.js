/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import pageRouter from 'page';
import { create as createJsonValidator } from '../json/validator';
import assert from '../utilities/assert';
import * as object from '../utilities/object';
import * as path from '../utilities/path';
import flowSchema from '../../static/schemas/flow';

const SESSION_KEY_TIMER = 'navigationTimer';

const DEFAULT_PLACE = '';

export const TARGET_SELF = '_self';

export function create(
      log,
      timer,
      fileResourceProvider,
      eventBus,
      configuration,
      browser,
      pageService,
      router = pageRouter ) {

   const flowController = createFlowController();

   const api = {
      controller: () => flowController,
      constructPath,
      constructAnchor,
      constructAbsoluteUrl
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Constructs a path, that is compatible to the expected arguments of `path()` from `path.js`. If a target
    * is given as first argument, this is resolved using the currently active place.
    *
    * @param {String} targetOrPlace
    *    the target or place id to construct the url for
    * @param {Object} [optionalParameters]
    *    optional map of place parameters. Missing parameters are taken from the parameters that were
    *    passed to the currently active place
    *
    * @return {string}
    *    the generated path
    *
    * @memberOf axFlowService
    */
   function constructPath( targetOrPlace, optionalParameters ) {
      const newParameters = object.options( optionalParameters, flowController.parameters() );
      const placeName = flowController.placeNameForNavigationTarget( targetOrPlace, flowController.place() );
      const place = flowController.places()[ placeName ];

      return place.expectedParameters.reduce( ( location, parameterName ) => {
         return `${location}/${encodePlaceParameter( newParameters[ parameterName ] )}`;
      }, `/${placeName}` );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Constructs a path and prepends a `#` to make it directly usable as relative link within an
    * application. If a target is given as first argument, this is resolved using the currently active
    * place.
    *
    * @param {String} targetOrPlace
    *    the target or place id to construct the url for
    * @param {Object} [optionalParameters]
    *    optional map of place parameters. Missing parameters are taken from the parameters that were
    *    passed to the currently active place
    *
    * @return {string}
    *    the generated anchor
    *
    * @memberOf axFlowService
    */
   function constructAnchor( targetOrPlace, optionalParameters ) {
      return `#!${constructPath( targetOrPlace, optionalParameters )}`;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Constructs an absolute url to the given target or place using the given parameters application. If
    * a target is given as first argument, this is resolved using the currently active place.
    *
    * @param {String} targetOrPlace
    *    the target or place id to construct the url for
    * @param {Object} [optionalParameters]
    *    optional map of place parameters. Missing parameters are taken from the parameters that were
    *    passed to the currently active place
    *
    * @return {string}
    *    the generated url
    *
    * @memberOf axFlowService
    */
   function constructAbsoluteUrl( targetOrPlace, optionalParameters ) {
      const fullUrl = browser.location().href;
      const removeIndex = Math.min( fullUrl.indexOf( '#' ), fullUrl.indexOf( '?' ) );
      return ( removeIndex === -1 ? fullUrl : fullUrl.substr( 0, removeIndex ) ) +
         constructAnchor( targetOrPlace, optionalParameters );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createFlowController() {

      const COLLABORATOR_ID = 'AxFlowController';
      let availablePlaces = {};
      let activeParameters = {};
      let activePlace;
      let navigationInProgress = false;
      let requestedTarget = TARGET_SELF;

      const controllerApi = {
         places: () => availablePlaces,
         place: () => object.deepClone( activePlace ),
         parameters: () => object.deepClone( activeParameters || {} ),
         placeNameForNavigationTarget,
         loadFlow: flowJson => {
            const flowFile = path.normalize( flowJson );
            return loadFlow( flowFile, handleRouteChange )
               .then( places => {
                  availablePlaces = object.deepFreeze( places );
                  router.base( configuration.get( 'baseHref', browser.location().pathname ) );
                  router.start( configuration.get( 'flow.router', { hashbang: true, dispatch: true } ) );
                  return availablePlaces;
               } );
         }
      };

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      eventBus.subscribe( 'navigateRequest', ( { target, data: parameters } ) => {
         if( navigationInProgress ) {
            return;
         }

         requestedTarget = target;
         router( constructPath( target, parameters ) );
      }, { subscriber: COLLABORATOR_ID } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function handleRouteChange( place, context ) {
         const parameters = decodeParametersFromContext( context );
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
            .then( () => eventBus.publish( `didNavigate.${requestedTarget}`, navigateEvent, options ) )
            .then( () => {
               requestedTarget = TARGET_SELF;
               navigationInProgress = false;
               navigationTimer.stopAndLog( 'didNavigate' );
            }, err => {
               navigationInProgress = false;
               navigationTimer.stopAndLog( 'didNavigate' );
               log.error( `Failed to navigate to place "${place.id}". Error: [0]`, err );
               throw err;
            } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function placeNameForNavigationTarget( targetOrPlaceName, place ) {
         const placeName = object.path( place, `targets.${targetOrPlaceName}`, targetOrPlaceName );
         assert.state(
            placeName in availablePlaces,
            `Unknown target or place "${targetOrPlaceName}". Current place: "${place.id}"`
         );
         return placeName;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      return controllerApi;

   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function loadFlow( flowFile, routeRequestHandler ) {

      return fileResourceProvider.provide( flowFile )
         .then( flow => {
            validateFlowJson( flow );
            const places = processPlaceParameters( flow.places );
            const globalRedirects = flow.redirectOn;

            object.forEach( places, ( place, routeName ) => {
               if( place.redirectTo ) {
                  router.redirect( `/${routeName}`, `/${place.redirectTo}` );
                  return;
               }

               if( place.entryPoints ) {
                  router.redirect( `/${routeName}`, routeByEntryPoint( place.entryPoints ) );
                  return;
               }

               if( place.exitPoint ) {
                  router( `/${routeName}`, context => {
                     const exitFunction = configuration.get( `flow.exitPoints.${place.exitPoint}` );
                     if( !exitFunction ) {
                        log.error( `Exit point "${place.exitPoint}" does not exist for place "${place.id}"` );
                        return;
                     }

                     exitFunction( decodeParametersFromContext( context ) );
                  } );
                  return;
               }

               if( !place.page ) {
                  log.error( `flow: invalid empty place: ${place.id}` );
                  if( globalRedirects.error in places ) {
                     router( `/${routeName}`, context => {
                        log.trace(
                           `Navigation to empty place ${place.id} redirected to ` +
                           `error place ("${globalRedirects.unknownPlace}").`
                        );
                        routeRequestHandler( places[ globalRedirects.error ], context );
                     } );
                  }
                  else {
                     log.trace(
                        `No error place configured: Navigation to empty place ${place.id} cancelled.`
                     );
                  }
                  return;
               }

               router( `/${routeName}`, context => routeRequestHandler( place, context ) );
            } );

            // setup handling of non existing routes
            router( '*', context => {
               log.warn( `Received request for unknown route "${context.path}".` );
               if( globalRedirects.unknownPlace in places ) {
                  log.trace( `- Redirecting to error place ("${globalRedirects.unknownPlace}").` );
                  routeRequestHandler( places[ globalRedirects.unknownPlace ], context );
               }
               else if( DEFAULT_PLACE in places ) {
                  log.trace( `- Redirecting to default place ("${DEFAULT_PLACE}").` );
                  routeRequestHandler( places[ DEFAULT_PLACE ], context );
               }
               else {
                  log.trace( '- Got no unknown place and no default place. Doing nothing.' );
               }
            } );

            return places;

            //////////////////////////////////////////////////////////////////////////////////////////////////

            function routeByEntryPoint( possibleEntryPoints ) {
               const entryPoint = configuration.get( 'flow.entryPoint', {
                  target: 'default',
                  parameters: {}
               } );
               const placeName = possibleEntryPoints[ entryPoint.target ];
               assert( placeName, `No place found for entry point (target: ${entryPoint.target})` )
                  .hasType( String )
                  .isNotNull();

               const targetPlace = places[ placeName ];
               const parameters = entryPoint.parameters || {};

               return targetPlace.expectedParameters.reduce( ( uri, parameterName ) => {
                  return `${uri}/${encodePlaceParameter( parameters[ parameterName ] )}`;
               }, `/${placeName}` );
            }
         } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function validateFlowJson( flowJson ) {
      const errors = createJsonValidator( flowSchema ).validate( flowJson );

      if( errors.length ) {
         log.error( 'Failed validating flow file:\n[0]', errors.map( _ => ` - ${_.message}` ).join( '\n' ) );
         throw new Error( 'Illegal flow.json format' );
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return api;

}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function decodeParametersFromContext( { params } ) {
   const parameters = {};
   Object.keys( params || {} ).forEach( key => {
      parameters[ key ] = decodePlaceParameter( params[ key ] );
   } );
   return parameters;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function encodePlaceParameter( value ) {
   return value == null ? '_' : value;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function decodePlaceParameter( value ) {
   return value === '_' ? null : value;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

const ROUTE_PARAMS_MATCHER = /\/:([^\/]+)/ig;

function processPlaceParameters( places ) {
   const processedRoutes = {};

   object.forEach( places, ( place, placeName ) => {
      place.expectedParameters = [];
      place.id = placeName;

      if( !place.targets ) {
         place.targets = {};
      }
      if( !place.targets[ TARGET_SELF ] ) {
         place.targets[ TARGET_SELF ] = placeName.split( /\/:/ )[ 0 ];
      }

      let matches;
      while( ( matches = ROUTE_PARAMS_MATCHER.exec( placeName ) ) ) {
         const routeNameWithoutParams = placeName.substr( 0, matches.index );

         place.expectedParameters.push( matches[ 1 ] );

         processedRoutes[ routeNameWithoutParams ] = place;
      }
      processedRoutes[ placeName ] = place;
   } );

   return processedRoutes;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function equals( a, b ) {
   const aKeys = Object.keys( a );
   const bKeys = Object.keys( b );
   return aKeys.length === bKeys.length && aKeys.every( key => key in b && a[ key ] === b[ key ] );
}
