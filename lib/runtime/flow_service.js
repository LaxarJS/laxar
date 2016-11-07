/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import pageRouter from 'page';
import { create as createJsonValidator } from '../utilities/json_validator';
import assert from '../utilities/assert';
import * as object from '../utilities/object';
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
      router = pageRouter ) {

   const origin = originFromLocation( browser.location() );
   const routerConfiguration = configuration.get( 'flow.router', {} );
   const queryEnabled = configuration.get( 'flow.query.enabled', false );

   const {
      base = fallbackBase( routerConfiguration, origin ),
      ...pageOptions
   } = routerConfiguration;
   const useHashbang = pageOptions.hashbang;
   const absoluteBase = browser.resolve( base, origin );

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
    *    the target or place id to construct a URL for
    * @param {Object} [optionalParameters]
    *    optional map of place parameters. Missing parameters are taken from the parameters that were
    *    passed to the currently active place
    *
    * @return {string}
    *    the generated absolute URL
    *
    * @memberOf axFlowService
    */
   function constructAbsoluteUrl( targetOrPlace, optionalParameters ) {
      const routingPath = constructPath( targetOrPlace, optionalParameters );
      return useHashbang ? `${absoluteBase}#!${routingPath}` : `${absoluteBase}${routingPath}`;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Constructs a path that can be resolved within the current routing context.
    *
    * @param {String} targetOrPlace
    *    the target or place ID to construct the URL for
    * @param {Object} [optionalParameters]
    *    optional map of place parameters. Missing parameters are taken from the parameters that were
    *    passed to the currently active place
    *
    * @return {string}
    *    the generated URL, with parameter values encoded into path segments and/or query parameters
    *
    * @memberOf axFlowService
    * @private
    */
   function constructPath( targetOrPlace, optionalParameters ) {
      const newParameters = { ...flowController.parameters(), ...optionalParameters };
      const placeName = flowController.placeNameForNavigationTarget( targetOrPlace, flowController.place() );
      const place = flowController.places()[ placeName ];

      let location = `/${placeName}`;
      place.expectedParameters.forEach( parameterName => {
         location += `/${encodeSegment( newParameters[ parameterName ] )}`;
         delete newParameters[ parameterName ];
      }, `/${placeName}` );

      if( queryEnabled ) {
         const query = [];
         Object.keys( newParameters ).forEach( parameterName => {
            const value = newParameters[ parameterName ];
            // TODO (#380) the `{}` should actually be provided by the JSON schema processor
            const defaultValue = ( place.queryParameters || {} )[ parameterName ];
            if( value == null || value === defaultValue ) {
               return;
            }
            const encodedKey = encodeURIComponent( parameterName );
            if( value === true ) {
               query.push( encodedKey );
               return;
            }
            if( value === false && !defaultValue ) {
               return;
            }
            query.push( `${encodedKey}=${encodeURIComponent( value )}` );
         } );

         if( query.length ) {
            location += `?${query.join( '&' )}`;
         }
      }

      return location;
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
         loadFlow: () => {
            const flowName = configuration.ensure( 'flow.name' );
            return loadFlow( flowName, handleRouteChange )
               .then( places => {
                  availablePlaces = object.deepFreeze( places );
                  router.base( base );
                  router.start( pageOptions );
                  return availablePlaces;
               } );
         }
      };

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      eventBus.subscribe( 'navigateRequest', ( { target, data: parameters } ) => {
         if( navigationInProgress ) { return; }
         requestedTarget = target;
         router( constructPath( target, parameters ) );
      }, { subscriber: COLLABORATOR_ID } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function handleRouteChange( place, context ) {
         const parameters = collectParameters( place, context );
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

      return controllerApi;

   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Calculate a fallback if `flow.router.base` is not configured.
    *
    * When using hashbang-URLs, the base prefix can be calculated from the current path.
    * Otherwise, the directory of the document base-URL is used as a prefix for all routes
    * (directory = everything up to the final slash).
    *
    * @param {Object} routerConfiguration
    *    the router configuration under path `flow.router`
    *
    * @return {String}
    *    a base path to generate absolute links for application places
    *
    * @private
    */
   function fallbackBase( routerConfiguration ) {
      return routerConfiguration.hashbang ?
         browser.location().pathname :
         browser.resolve( '.' ).replace( /\/$/, '' );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function loadFlow( flowName, routeRequestHandler ) {

      return artifactProvider.forFlow( flowName ).definition()
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

                     exitFunction( collectParameters( place, context ) );
                  } );
                  return;
               }

               if( !place.page ) {
                  log.error( `flow: invalid empty place: ${place.id}` );
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
               const entryPoint = configuration.ensure( 'flow.entryPoint' );
               const placeName = possibleEntryPoints[ entryPoint.target ];
               assert( placeName, `No place found for entry point (target: ${entryPoint.target})` )
                  .hasType( String )
                  .isNotNull();

               const targetPlace = places[ placeName ];
               // TODO (#380) the `{}` should actually be provided by the JSON schema processor
               const parameters = entryPoint.parameters || {};

               return targetPlace.expectedParameters.reduce( ( uri, parameterName ) => {
                  return `${uri}/${encodeSegment( parameters[ parameterName ] )}`;
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

}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function originFromLocation({ protocol, hostname, port }) {
   return `${protocol}://${hostname}${port ? `:${port}` : ''}`;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function collectParameters( place, context ) {
   const { querystring = '', params = {} } = context;
   const { queryParameters = {} } = place;

   const parameters = {};
   Object.keys( queryParameters ).forEach( key => {
      parameters[ key ] = queryParameters[ key ];
   } );
   if( querystring.length ) {
      querystring.split( '&' )
         .map( _ => _.split( '=' ).map( decodeURIComponent ) )
         .forEach( ([ key, value ]) => {
            parameters[ key ] = value !== undefined ? value : true;
         } );
   }
   Object.keys( params ).forEach( key => {
      parameters[ key ] = decodeSegment( params[ key ] );
   } );
   return parameters;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Encode a value for use as a path segment in routing.
 *
 * Usually, values are simply URL-encoded, but there are special cases:
 *
 *  - `null` and `undefined` are encoded as '_',
 *  - other non-string values are converted to strings before URL encoding,
 *  - slashes ('/') are double-encoded to '%252F', so that page.js ignores them during route matching.
 *
 * When decoded, for use in didNavigate events, the original values will be restored, except for:
 *  - non-string input values, which will always be decoded into strings,
 *  - `undefined` values which will be decoded to `null`.
 *
 * @param {*} value
 *   the parameter to encode
 * @return {String}
 *   the encoded value, for use as a path segment in URLs
 *
 * @private
 */
function encodeSegment( value ) {
   return value == null ? '_' : encodeURIComponent( value ).replace( /%2F/g, '%252F' );
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Decodes a place parameter value from a path segment, for use in didNavigate event.
 *
 * Usually, this reverses the application of {#encodeSegment} after the browser has decoded a URL, except for:
 *  - path-segments based on non-string input values, which will always be decoded into strings,
 *  - path-segments based on `undefined` values which will be decoded to `null`.
 *
 * Note that while the browser has already performed URL-decoding, this function replaces `%2F` into `/` to
 * be compatible with the double-encoding performaed by {#encodeSegment}.
 *
 * @param {String} value
 *   the encoded parameter segment to decode
 * @return {String}
 *   the decoded value, for use as a path segment in URLs
 *
 * @private
 */
function decodeSegment( value ) {
   return value === '_' || value == null ? null : value.replace( /%2F/g, '/' );
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
