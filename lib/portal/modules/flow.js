/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'angular',
   'angular-route',
   '../../logging/log',
   '../../json/validator',
   '../../utilities/object',
   '../../utilities/timer',
   '../../utilities/path',
   '../paths',
   'json!../../../static/schemas/flow.json'
], function( ng, ngRoute, log, jsonValidator, object, timer, path, paths, flowSchema ) {
   'use strict';

   var module = ng.module( 'laxar.portal.flow', [ 'ngRoute' ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var $routeProvider_;

   module.config( [ '$routeProvider', function( $routeProvider ) {
      $routeProvider_ = $routeProvider;
   } ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var fileResourceProvider_;
   var exitPoints_;
   var entryPoint_;

   module.run( [
      '$route', 'Configuration', 'FileResourceProvider',

      function( $route, configuration, fileResourceProvider ) {
         fileResourceProvider_ = fileResourceProvider;

         entryPoint_ = configuration.get( 'portal.flow.entryPoint' );
         exitPoints_ = configuration.get( 'portal.flow.exitPoints' );

         // idea for lazy loading routes using $routeProvider and $route.reload() found here:
         // https://groups.google.com/d/msg/angular/mrcy_2BZavQ/Mqte8AvEh0QJ
         loadFlow( path.normalize( paths.FLOW_JSON ) ).then( function() {
            $route.reload();
         } );
      } ]
   );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var SESSION_KEY_TIMER = 'navigationTimer';
   var TARGET_SELF = '_self';

   var activeTarget_ = TARGET_SELF;
   var activePlace_ = null;
   var activeParameters_ = {};

   var places_;
   var previousNavigateRequestSubscription_;
   var navigationInProgress_ = false;
   var navigationTimer_;

   var eventOptions = { sender: 'FlowController' };
   var subscriberOptions = { subscriber: 'FlowController' };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   module.controller( 'portal.FlowController', [
      '$window', '$location', '$routeParams', 'place', 'EventBus', 'axFlowService', 'axPageService',

      function FlowController( $window, $location, $routeParams, place, eventBus, flowService, pageService ) {
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
         activeParameters_ = decodeExpectedPlaceParameters( $routeParams, place );

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
         var didNavigateEvent =  object.options( { data: {}, place: place.id }, navigateEvent );

         eventBus.publish( 'willNavigate.' + activeTarget_, navigateEvent, eventOptions )
            .then( function() {
               didNavigateEvent.data = activeParameters_;

               if( place === previousPlace ) {
                  return finishNavigation( activeTarget_, didNavigateEvent );
               }

               return pageService.controller().tearDownPage()
                  .then( function() {
                     navigationTimer_ = timer.resumedOrStarted( {
                        label: [ 'loadTimer (', place.target ? place.target._self : place.id, ')'].join( '' ),
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
               log.error( error );
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
            if( newPlace.triggerBrowserReload || event.triggerBrowserReload ) {
               triggerReload( flowService.constructAbsoluteUrl( event.target, event.data ) );
               return;
            }

            var newPath = flowService.constructPath( event.target, event.data );
            if( newPath !== $location.path() ) {
               // this will instantiate another flow controller
               $location.path( newPath );
               meta.unsubscribe();
            }
            else {
               // nothing to do:
               navigationInProgress_ = false;
            }
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function triggerReload( targetLocation ) {
            eventBus.publish( 'willNavigate.' + activeTarget_, navigateEvent, eventOptions )
               .then( function() {
                  return pageService.controller().tearDownPage();
               } )
               .then( function() {
                  // Prevent angular from entering a loop of location changes during digest
                  // by pretending that we have already navigated. This is actually true, because
                  // we do navigate ourselves using location.reload.
                  $location.absUrl = function() {
                     return $window.location.href;
                  };

                  $window.location.href = targetLocation;
                  $window.location.reload();
               } );
         }

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         function finishNavigation( currentTarget_, didNavigateEvent ) {
            eventBus.subscribe( 'navigateRequest', handleNavigateRequest, subscriberOptions );
            log.context.setTag( 'PLCE', place.id );
            previousNavigateRequestSubscription_ = handleNavigateRequest;
            navigationInProgress_ = false;
            return eventBus.publish( 'didNavigate.' + currentTarget_, didNavigateEvent, eventOptions );
         }

      }
   ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   module.factory( 'axFlowService', [ '$location', function( $location ) {

      var flowService = {

         /**
          * Constructs a path, that is compatible to the expected arguments of `$location.path()` from
          * AngularJS. If a target is given as first argument, this is resolved using the currently active
          * place.
          *
          * @param {String} targetOrPlace
          *    the target or place id to construct the url for
          * @param {Object} [optionalParameters]
          *    optional map of place parameters. Missing parameters are taken from the parameters passed to
          *    the currently active place
          *
          * @return {string}
          *    the generated path
          */
         constructPath: function( targetOrPlace, optionalParameters ) {
            var newParameters = object.options( optionalParameters, activeParameters_ || {} );
            var placeName = placeNameForNavigationTarget( targetOrPlace, activePlace_ );
            var place = places_[ placeName ];
            var location = '/' + placeName;

            object.forEach( place.expectedParameters, function( parameterName ) {
               location += '/' + encodePlaceParameter( newParameters[ parameterName ] );
            } );

            return location;
         },

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         /**
          * Constructs a path and prepends a `#` to make it directly usable as relative link within an
          * application. If a target is given as first argument, this is resolved using the currently active
          * place.
          *
          * @param {String} targetOrPlace
          *    the target or place id to construct the url for
          * @param {Object} [optionalParameters]
          *    optional map of place parameters. Missing parameters are taken from the parameters passed to
          *    the currently active place
          *
          * @return {string}
          *    the generated anchor
          */
         constructAnchor: function( targetOrPlace, optionalParameters ) {
            return '#' + flowService.constructPath( targetOrPlace, optionalParameters );
         },

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         /**
          * Constructs an absolute url to the given target or place using the given parameters application. If
          * a target is given as first argument, this is resolved using the currently active place.
          *
          * @param {String} targetOrPlace
          *    the target or place id to construct the url for
          * @param {Object} [optionalParameters]
          *    optional map of place parameters. Missing parameters are taken from the parameters passed to
          *    the currently active place
          *
          * @return {string}
          *    the generated url
          */
         constructAbsoluteUrl: function( targetOrPlace, optionalParameters ) {
            var absUrl = $location.absUrl().split( '#' )[0];
            return absUrl + flowService.constructAnchor( targetOrPlace, optionalParameters );
         },

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         /**
          * Returns a copy of the currently active place.
          *
          * @return {Object}
          *    the currently active place
          */
         place: function() {
            return object.deepClone( activePlace_ );
         }

      };

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      return flowService;

   } ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function decodeExpectedPlaceParameters( parameters, place ) {
      return object.map( place.expectedParameters, function( parameterName ) {
         return [ parameterName, decodePlaceParameter( parameters[ parameterName ] ) ];
      } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function placeNameForNavigationTarget( targetOrPlaceName, activePlace ) {
      var placeName = object.path( activePlace, 'targets.' + targetOrPlaceName, targetOrPlaceName );
      if( placeName in places_ ) {
         return placeName;
      }

      log.error( 'Unknown target or place "[0]".', targetOrPlaceName );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function encodePlaceParameter( value ) {
      if( value == null ) {
         return '_';
      }
      return typeof value === 'string' ? value.replace( /\//g, '%2F' ) : value;
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
               redirectTo: '/entry'
            } );
         } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function assembleRoute( routeName, place ) {
      if( place.redirectTo ) {
         $routeProvider_.when( '/' + routeName, {
            redirectTo: place.redirectTo
         } );
         return;
      }

      if( place.entryPoints ) {
         $routeProvider_.when( '/' + routeName, {
            redirectTo: routeByEntryPoint( place.entryPoints )
         } );
         return;
      }

      if( !place.page && !place.exitPoint ) {
         log.warn( 'flow: invalid empty place: [0]', place.id );
         return;
      }

      $routeProvider_.when( '/' + routeName, {
         template: '<!---->',
         controller: 'portal.FlowController',
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
            uri += '/' + encodePlaceParameter( parameters[ parameterName ] );
         } );

         return uri;
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var ROUTE_PARAMS_MATCHER = /\/:([^\/]+)/ig;

   function processPlaceParameters( places ) {
      var processedRoutes = {};

      object.forEach( places, function( place, placeName ) {
         place.expectedParameters = [];
         place.id = placeName;

         if( !place.targets ) {
            place.targets = {};
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
            return flow.places;
         }, function( err ) {
            throw new Error( 'Failed to load "' + flowFile + '". Cause: ' + err );
         } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function validateFlowJson( flowJson ) {
      var result = jsonValidator.create( flowSchema ).validate( flowJson );

      if( result.errors.length ) {
         result.errors.forEach( function( error ) {
            log.error( '[0]', error.message );
         } );

         throw new Error( 'Illegal flow.json format' );
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return module;

} );
