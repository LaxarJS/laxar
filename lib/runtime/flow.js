/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/**
 * The *flow* module is responsible for the handling of all tasks regarding navigation and routing and as such
 * is part of the LaxarJS core. It is your communication partner on the other end of the event bus for
 * `navigateRequest`, `willNavigate` and `didNavigate` events. For application developers it additionally
 * provides the `axFlowService`, which can be used for some flow specific tasks.
 *
 * @module flow
 */
define( [
   'angular',
   'angular-route',
   '../logging/log',
   '../json/validator',
   '../utilities/object',
   '../utilities/configuration',
   '../utilities/timer',
   '../utilities/path',
   '../loaders/paths',
   'json!../../static/schemas/flow.json'
], function( ng, ngRoute, log, jsonValidator, object, configuration, timer, path, paths, flowSchema ) {
   'use strict';

   var module = ng.module( 'axFlow', [ 'ngRoute' ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var $routeProvider_;
   var html5Mode_;
   var routePrefix_;
   var exitPoints_;
   var entryPoint_;
   var queryEnabled_;

   module.config( [ '$routeProvider', '$locationProvider', function( $routeProvider, $locationProvider ) {
      html5Mode_ = configuration.get( 'flow.router.html5Mode', false );
      $locationProvider.html5Mode( html5Mode_ );
      $routeProvider_ = $routeProvider;
   } ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var fileResourceProvider_;

   module.run( [ '$route', 'axFileResourceProvider', function( $route, fileResourceProvider ) {
      activeParameters_ = {};
      activeTarget_ = TARGET_SELF;
      activePlace_ = null;

      fileResourceProvider_ = fileResourceProvider;
      routePrefix_ = configuration.get( 'flow.router.base', '' );
      entryPoint_ = configuration.get( 'flow.entryPoint' );
      exitPoints_ = configuration.get( 'flow.exitPoints' );
      queryEnabled_ = configuration.get( 'flow.query.enabled', false );

      // idea for lazy loading routes using $routeProvider and $route.reload() found here:
      // https://groups.google.com/d/msg/angular/mrcy_2BZavQ/Mqte8AvEh0QJ
      loadFlow( path.normalize( paths.FLOW_JSON ) ).then( function() {
         $route.reload();
      } );
   } ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var SESSION_KEY_TIMER = 'navigationTimer';
   var TARGET_SELF = '_self';

   var activeTarget_;
   var activePlace_;
   var activeParameters_;

   var places_;
   var previousNavigateRequestSubscription_;
   var navigationInProgress_ = false;
   var navigationTimer_;

   var eventOptions = { sender: 'AxFlowController' };
   var subscriberOptions = { subscriber: 'AxFlowController' };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   module.controller( 'AxFlowController', [
      '$location', '$routeParams', 'place', 'axGlobalEventBus', 'axFlowService', 'axPageService',

      function FlowController( $location, $routeParams, place, eventBus, flowService, pageService ) {
         // The flow controller is instantiated on route change by AngularJS. It then announces the start of
         // navigation ("willNavigate") and initiates loading of the new page. As soon as the new page is
         // loaded, the "didNavigate" event finishes the navigation logic. The flow controller then starts to
         // listen for subsequent navigateRequests.
         if( previousNavigateRequestSubscription_ ) {
            eventBus.unsubscribe( previousNavigateRequestSubscription_ );
            previousNavigateRequestSubscription_ = null;
         }

         var previousPlace = activePlace_;
         activePlace_ = place;
         activeParameters_ = collectParameters( $routeParams, place, $location.search() );

         if( typeof place.exitPoint === 'string' ) {
            var exit = place.exitPoint;
            if( exitPoints_ && typeof exitPoints_[ exit ] === 'function' ) {
               exitPoints_[ exit ]( activeParameters_ );
               return;
            }
            throw new Error( 'Exitpoint "' + exit + '" does not exist.' );
         }

         navigationInProgress_ = true;
         var navigateEvent = { target: activeTarget_ };
         var didNavigateEvent = object.options(
            { data: {}, place: place.id },
            navigateEvent
         );

         eventBus.publish( 'willNavigate.' + activeTarget_, navigateEvent, eventOptions )
            .then( function() {
               didNavigateEvent.data = activeParameters_;

               if( place === previousPlace ) {
                  return finishNavigation( activeTarget_, didNavigateEvent );
               }

               return pageService.controller().tearDownPage()
                  .then( function() {
                     navigationTimer_ = timer.resumedOrStarted( {
                        label: [ 'loadTimer (', place.target ? place.target._self : place.id, ')' ].join( '' ),
                        persistenceKey: SESSION_KEY_TIMER
                     } );
                     return pageService.controller().setupPage( place.page );
                  } )
                  .then( function() {
                     return finishNavigation( activeTarget_, didNavigateEvent );
                  } )
                  .then( function() {
                     navigationTimer_.stopAndLog( 'didNavigate' );
                  } );
            } )
            .then( null, function( error ) {
               log.error( 'Error during navigation: [0]', error );
            } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function handleNavigateRequest( event, meta ) {
            if( navigationInProgress_ ) {
               // make sure that at most one navigate request be handled at the same time
               return;
            }
            navigationInProgress_ = true;

            activeTarget_ = event.target;
            var placeName = placeNameForNavigationTarget( activeTarget_, place );
            var newPlace = places_[ placeName ];

            navigationTimer_ = timer.started( {
               label: [
                  'navigation (', place ? place.targets._self : '', ' -> ', newPlace.targets._self, ')'
               ].join( '' ),
               persistenceKey: SESSION_KEY_TIMER
            } );

            var newUrl = constructUrl( event.target, event.data );
            if( newUrl !== $location.url() ) {
               // this will instantiate another flow controller
               $location.url( newUrl );
               meta.unsubscribe();
            }
            else {
               // nothing to do:
               navigationInProgress_ = false;
            }
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function finishNavigation( currentTarget_, didNavigateEvent ) {
            eventBus.subscribe( 'navigateRequest', handleNavigateRequest, subscriberOptions );
            log.setTag( 'PLCE', place.id );
            if( previousNavigateRequestSubscription_ ) {
               eventBus.unsubscribe( previousNavigateRequestSubscription_ );
            }
            previousNavigateRequestSubscription_ = handleNavigateRequest;
            navigationInProgress_ = false;
            return eventBus.publish( 'didNavigate.' + currentTarget_, didNavigateEvent, eventOptions );
         }

      }
   ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * A service providing some flow specific tasks that may be useful from within widgets.
    *
    * @name axFlowService
    * @injection
    */
   module.factory( 'axFlowService', [ '$location', '$browser', function( $location, $browser ) {

      var flowService = {

         /**
          * Constructs a path, that is compatible to the expected arguments of `$location.path()` from
          * AngularJS. If a target is given as first argument, this is resolved using the currently active
          * place.
          *
          * Deprecation Notice: this will probably create invalid links if using query parameters. Use
          * constructAbsoluteUrl instead.
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
          * @deprecated
          *    see description for details
          *
          * @memberOf axFlowService
          */
         constructPath: function( targetOrPlace, optionalParameters ) {
            return constructUrl( targetOrPlace, optionalParameters ).split( '?' )[ 0 ];
         },

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         /**
          * Constructs a path and prepends a `#` to make it directly usable as relative link within an
          * application. If a target is given as first argument, this is resolved using the currently active
          * place.
          *
          * Deprecation Notice: this will probably create invalid links if using html5 routing. Use
          * constructAbsoluteUrl instead, which also works for hash-based URLs.
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
          * @deprecated
          *    see description for details
          *
          * @memberOf axFlowService
          */
         constructAnchor: function( targetOrPlace, optionalParameters ) {
            return '#' + constructUrl( targetOrPlace, optionalParameters );
         },

         /////////////////////////////////////////////////////////////////////////////////////////////////////

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
         constructAbsoluteUrl: function( targetOrPlace, optionalParameters ) {
            if( html5Mode_ && html5Mode_.enabled !== false ) {
               var origin = $location.absUrl().replace( $location.url(), '' );
               return origin + $browser.baseHref().replace( /\/$/, '' ) +
                   constructUrl( targetOrPlace, optionalParameters );
            }
            else {
               var absUrl = $location.absUrl().split( '#' )[0];
               return absUrl + flowService.constructAnchor( targetOrPlace, optionalParameters );
            }
         },

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         /**
          * Returns a copy of the currently active place.
          *
          * Deprecation Notice: will be removed in LaxarJS v2 without replacement. Subscribe to `didNavigate`
          * for the relevant information.
          *
          * @return {Object}
          *    the currently active place
          *
          * @deprecated
          *    see description for details
          *
          * @memberOf axFlowService
          */
         place: function() {
            return object.deepClone( activePlace_ );
         }

      };

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      return flowService;

   } ] );


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Encode a value for use as a path segment in routing.
    *
    * Usually, values are simply URL-encoded, but there are special cases:
    *
    *  - `null` and `undefined` are encoded as '_',
    *  - other non-string values are (obviously) encoded into strings,
    *  - slashes ('/') are double-encoded to '%252F', so that AngularJS ignores them during route matching.
    *
    * When decoded for use in didNavigate events, the original values will be restored, except for non-string
    * input values, which will always be decoded into strings.
    */
   function encodeSegment( segment ) {
      return segment == null ? '_' : encodeURIComponent( segment ).replace( /%2F/g, '%252F' );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function collectParameters( parameters, place, searchOptions ) {
      var result = object.options( searchOptions, place.queryParameters );
      ng.forEach( place.expectedParameters, function( parameterName ) {
         result[ parameterName ] = decodePlaceParameter( parameters[ parameterName ] );
      } );
      return result;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function placeNameForNavigationTarget( targetOrPlaceName, activePlace ) {
      var placeName = object.path( activePlace, 'targets.' + targetOrPlaceName, routePrefix_ + targetOrPlaceName );
      if( placeName in places_ ) {
         return placeName;
      }
      log.error( 'Unknown target or place "[0]".', targetOrPlaceName );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function constructUrl( targetOrPlace, optionalParameters ) {
      var newParameters = object.options( optionalParameters, activeParameters_ || {} );
      var placeName = placeNameForNavigationTarget( targetOrPlace, activePlace_ );
      var place = places_[ placeName ];
      var location = '/' + placeName;

      place.expectedParameters.forEach( function( parameterName ) {
         location += '/' + encodeSegment( newParameters[ parameterName ] );
         delete newParameters[ parameterName ];
      } );

      if( queryEnabled_ ) {
         var query = [];
         ng.forEach( newParameters, function( value, parameterName ) {
            var defaultValue = place.queryParameters[ parameterName ];
            if( value == null || value === defaultValue ) {
               return;
            }
            var encodedKey = encodeURIComponent( parameterName );
            if( value === true ) {
               query.push( encodedKey );
               return;
            }
            if( value === false && !defaultValue ) {
               return;
            }
            query.push( encodedKey + '=' + encodeURIComponent( value ) );
         } );

         if( query.length ) {
            location += '?' + query.join( '&' );
         }
      }
      return location;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function decodePlaceParameter( value ) {
      if( value == null || value === '' || value === '_' ) {
         return null;
      }
      return typeof value === 'string' ? value.replace( /%2F/g, '/' ) : value;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////
   //
   // Flow Loading tasks
   //
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function loadFlow( flowFile ) {
      return fetchPlaces( flowFile )
         .then( function( places ) {
            places_ = processPlaceParameters( places );

            object.forEach( places_, function( place, routeName ) {
               assembleRoute( routeName, place );
            } );

            $routeProvider_.otherwise( {
               redirectTo: '/' + routePrefix_ + 'entry'
            } );
         } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function assembleRoute( routeName, place ) {
      if( place.redirectTo ) {
         $routeProvider_.when( '/' + routeName, {
            redirectTo: routePrefix_ + place.redirectTo
         } );
         return;
      }

      if( place.entryPoints ) {
         var route = routeByEntryPoint( place.entryPoints );
         $routeProvider_.when( '/' + routeName, {
            redirectTo: route != null ? ( routePrefix_ + route ) : route
         } );
         return;
      }

      if( !place.page && !place.exitPoint ) {
         log.warn( 'flow: invalid empty place: [0]', place.id );
         return;
      }

      $routeProvider_.when( '/' + routeName, {
         template: '<!---->',
         controller: 'AxFlowController',
         resolve: {
            place: function() {
               return place;
            }
         }
      } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function routeByEntryPoint( possibleEntryPoints ) {
      var entryPoint = entryPoint_ || { target: 'default', parameters: {} };

      var placeName = possibleEntryPoints[ entryPoint.target ];
      if( placeName ) {
         var targetPlace = places_[ placeName ];
         var uri = placeName;
         var parameters = entryPoint.parameters || {};

         object.forEach( targetPlace.expectedParameters, function( parameterName ) {
            uri += '/' + encodeSegment( parameters[ parameterName ] );
         } );

         return uri;
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var ROUTE_PARAMS_MATCHER = /\/:([^\/]+)/ig;

   function processPlaceParameters( places ) {
      var processedRoutes = {};

      object.forEach( places, function( place, placeSuffix ) {
         var placeName = routePrefix_ + placeSuffix;

         place.expectedParameters = [];
         place.id = placeName;

         if( routePrefix_ ) {
            ng.forEach( place.targets, function( targetPlaceSuffix, target ) {
               place.targets[ target ] = routePrefix_ + place.targets[ target ];
            } );
         }
         if( !place.targets[ TARGET_SELF ] ) {
            place.targets[ TARGET_SELF ] = placeName.split( /\/:/ )[0];
         }

         var matches;
         while( ( matches = ROUTE_PARAMS_MATCHER.exec( placeName ) ) ) {
            var routeNameWithoutParams = placeName.substr( 0, matches.index );

            place.expectedParameters.push( matches[ 1 ] );

            processedRoutes[ routeNameWithoutParams ] = place;
         }
         processedRoutes[ placeName ] = place;
      } );

      return processedRoutes;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function fetchPlaces( flowFile ) {
      return fileResourceProvider_.provide( flowFile )
         .then( function( flow ) {
            validateFlowJson( flow );
            return flow.places; // JSON.parse( JSON.stringify( flow.places ) );
         }, function( err ) {
            throw new Error( 'Failed to load "' + flowFile + '". Cause: ' + err );
         } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function validateFlowJson( flowJson ) {
      var result = jsonValidator.create( flowSchema, { useDefault: true } ).validate( flowJson );

      if( result.errors.length ) {
         result.errors.forEach( function( error ) {
            log.error( 'Failed validating flow file: [0]', error.message );
         } );

         throw new Error( 'Illegal flow.json format' );
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return module;

} );
