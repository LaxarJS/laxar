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
   '../../utilities/storage',
   '../portal_assembler/page_loader',
   '../paths',
   '../timer',
   'json!../../../static/schemas/flow.json'
], function( ng, ngRoute, log, jsonValidator, object, storage, PageLoader, paths, timer, flowSchema ) {
   'use strict';

   var module = ng.module( 'laxar.portal.flow', [ 'ngRoute' ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var $routeProvider_;

   module.config( [ '$routeProvider', function( $routeProvider ) {
      $routeProvider_ = $routeProvider;
   } ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var $http_;
   var $q_;
   var fileResourceProvider_;
   var configLocales_;
   var exitPoints_;
   var entryPoint_;

   module.run( [
      '$route', '$http', '$q', 'Configuration', 'FileResourceProvider',

      function( $route, $http, $q, Configuration, fileResourceProvider ) {
         $http_ = $http;
         fileResourceProvider_ = fileResourceProvider;
         $q_ = $q;
         configLocales_ = Configuration.get( 'locales', {} );
         entryPoint_ = Configuration.get( 'entryPoint' );
         exitPoints_ = Configuration.get( 'exitPoints' );

         // idea for lazy loading routes using $routeProvider and $route.reload() found here:
         // https://groups.google.com/d/msg/angular/mrcy_2BZavQ/Mqte8AvEh0QJ
         loadFlow( paths.FLOW_JSON ).then( function() {
            $route.reload();
         } );
      } ]
   );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var BREAK_PROMISE_CHAIN_ARGUMENT = 'BREAK_PROMISE_CHAIN';
   var TARGET_SELF = '_self';
   var places_;
   var previousPlaceParameters_;
   var currentTarget_ = TARGET_SELF;

   module.controller( 'portal.FlowController', [
      '$window', '$location', '$routeParams', '$rootScope', 'place', 'EventBus', 'ThemeManager',

      function FlowController( $window, $location, $routeParams, $rootScope, place, eventBus, themeManager ) {
         // The flow controller is instantiated on routechange by angularjs. It then starts to listen for
         // subsequent navigateRequests. It then directly claims to start navigation ("willNavigate") and
         // requests loading of the new page (currently the PageController listens to this request). As soon
         // as the new page is loaded, the "didNavigate" event finishes the navigation logic.

         var previousPlace = $rootScope.place;
         $rootScope.place = place;
         var page = place.page;

         eventBus.subscribe( 'navigateRequest', function navigateRequestHandler( event, actions ) {
            currentTarget_ = event.target;
            var placeName = findPlaceForNavigationTarget( event.target, place );
            var parameters = object.extend( {}, previousPlaceParameters_ || {}, event.data || {} );
            var newPlace = places_[ placeName ];
            navigationTimer.start( place, newPlace );
            if( newPlace.triggerBrowserReload || event.triggerBrowserReload ) {
               eventBus.publish( 'willNavigate.' + currentTarget_, navigateEvent, eventOptions )
                  .then( function() {
                     return eventBus.publishAndGatherReplies( 'endLifecycleRequest.default', lifecycleEvent );
                  } )
                  .then( function() {
                     var path = constructLocation( placeName, parameters );
                     var url = '' + $window.location.href;
                     var newUrl = url.split( '#' )[ 0 ] + '#' + path;
                     // Prevent angular from entering a loop of location changes during digest
                     // by pretending that we have already navigated. This is actually true, because
                     // we do navigate ourselves using location.reload.
                     $location.absUrl = function() {
                        return $window.location.href;
                     };

                     $window.location.href = newUrl;
                     $window.location.reload();
                  } );
               return;
            }

            var newPath = constructLocation( placeName, parameters );
            if( newPath !== $location.path() ) {
               $location.path( newPath );
               actions.unsubscribe();
            }
         }, { subscriber: 'FlowController' } );

         if( typeof place.exitFunction === 'string' ) {
            var exit = place.exitFunction;
            if( exitPoints_ && typeof exitPoints_[ exit ] === 'function' ) {
               var placeParameters = constructNavigationParameters( $routeParams, place );
               exitPoints_[ exit ]( placeParameters );
               return;
            }

            throw new Error( 'Exitpoint "' + exit + '" does not exist.' );
         }

         var eventOptions = { sender: 'FlowController' };
         var navigateEvent = { target: currentTarget_ };
         var didNavigateEvent =  object.options( { data: {}, place: place.id }, navigateEvent );
         var lifecycleEvent = { lifecycleId: 'default' };

         eventBus.subscribe( 'changeLocaleRequest', function( event ) {
            var payload = {
               locale: event.locale,
               languageTag: event.languageTag
            };
            eventBus.publish( 'didChangeLocale.' + event.locale, payload, eventOptions );
         }, { subscriber: 'FlowController' } );

         eventBus.publish( 'willNavigate.' + currentTarget_, navigateEvent, eventOptions )
            .then( function() {
               if( place !== previousPlace ) {
                  return eventBus.publishAndGatherReplies(
                     'endLifecycleRequest.default',
                     lifecycleEvent,
                     eventOptions
                  );
               }
            } )
            .then( function() {
               var parameters = constructNavigationParameters( $routeParams, place );
               didNavigateEvent.data = parameters;
               previousPlaceParameters_ = parameters;

               if( place === previousPlace ) {
                  eventBus.publish( 'didNavigate.' + currentTarget_, didNavigateEvent, eventOptions );
                  return $q_.reject( BREAK_PROMISE_CHAIN_ARGUMENT );
               }
            } )
            .then( function() {
               navigationTimer.resumeOrCreate( place );
               return eventBus.publishAndGatherReplies( 'loadPageRequest', { page: page }, eventOptions );
            } )
            .then( function() {
               ng.forEach( configLocales_, function( tag, locale ) {
                  var event = { locale: locale, languageTag: tag };
                  eventBus.publish( 'didChangeLocale.' + locale, event, eventOptions );
               } );
               var theme = themeManager.getTheme();
               return eventBus.publish( 'didChangeTheme.' + theme, { theme: theme }, eventOptions );
            } )
            .then( function() {
               navigationTimer.stop();
               return eventBus.publishAndGatherReplies(
                  'beginLifecycleRequest.default',
                  lifecycleEvent,
                  eventOptions );
            } )
            .then( function() {
               eventBus.publish( 'didNavigate.' + currentTarget_, didNavigateEvent, eventOptions );
            }, function( error ) {
               if( error !== BREAK_PROMISE_CHAIN_ARGUMENT ) {
                  log.error( error );
               }
            } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

      }
   ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var navigationTimer = (function() {
      var SESSION_KEY = 'FlowManager';
      var SESSION_KEY_TIMER = 'navigationTimer';
      var sessionStore = storage.getSessionStorage( SESSION_KEY );

      return {
         start: start,
         resumeOrCreate: resumeOrCreate,
         stop: stop
      };

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function start( from, to ) {
         var label = [
            'navigation (', from ? from.targets._self : '', ' -> ', to.targets._self, ')'
         ].join( '' );
         var t = timer.startedTimer( label );
         sessionStore.setItem( SESSION_KEY_TIMER, t.save() );
         return t;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function resumeOrCreate( place ) {
         var timerData = sessionStore.getItem( SESSION_KEY_TIMER );
         var t;
         if( timerData ) {
            t = timer.resume( timerData );
         }
         else {
            var label = [ 'loadTimer (', place.target ? place.target._self : place.id, ')' ].join( '' );
            t = timer.startedTimer( label );
         }
         sessionStore.setItem( SESSION_KEY_TIMER, t.save() );
         return t;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function stop() {
         var timerData = sessionStore.getItem( SESSION_KEY_TIMER );
         if( timerData ) {
            var t = timer.resume( timerData );
            t.stopAndLog( 'beginLifecycleRequest' );
            sessionStore.removeItem( SESSION_KEY_TIMER );
         }
      }

   } )();

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function constructNavigationParameters( $routeParams, place ) {
      var placeParameters = {};
      var params = place.fixedParameters || $routeParams;
      object.forEach( place.expectedParameters, function( parameterName ) {
         if( typeof params[ parameterName ] === 'undefined' ) {
            placeParameters[ parameterName ] = null;
         }
         else {
            placeParameters[ parameterName ] = decodePlaceParameter( params[ parameterName ] );
         }
      } );

      return placeParameters;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function constructLocation( placeName, parameters ) {
      var place = places_[ placeName ];
      var location = '/' + placeName;

      object.forEach( place.expectedParameters, function( parameterName ) {
         location += '/';
         if( parameterName in parameters && parameters[ parameterName ] !== null ) {
            location += encodePlaceParameter( parameters[ parameterName ] );
         }
      } );

      return location;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function findPlaceForNavigationTarget( targetOrRoute, activePlace ) {
      if( 'targets' in activePlace ) {
         var targets = activePlace.targets;
         if( targetOrRoute in targets ) {
            return findPlaceForNavigationTarget( targets[ targetOrRoute ], activePlace );
         }
      }

      if( targetOrRoute in places_ ) {
         return targetOrRoute;
      }

      log.error( 'unknown target or place "[0]".', targetOrRoute );
   }

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

         object.forEach( targetPlace.expectedParameters, function( parameterName ) {
            var param = entryPoint.parameters[ parameterName ] || '';
            uri += '/' + encodePlaceParameter( param );
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
      var pageLoader = PageLoader.create( $q_, $http_, paths.PAGES, fileResourceProvider_ );

      return $http_.get( flowFile )
         .then( function( response ) {
            var flow = response.data;
            var promises = [];

            validateFlowJson( flow );

            object.forEach( flow.places, function( place ) {
               if( !place.page ) {
                  return;
               }

               var pageUrl = place.page;
               var loadPagePromise = pageLoader.loadPage( pageUrl );

               promises.push( loadPagePromise );

               loadPagePromise
                  .then( function( page ) {
                     place.page = page;
                     place.page.url = pageUrl;
                  }, function( err ) {
                     log.error( 'Failed to load page "[0]":\n[1]', place.page, err );
                  } );
            } );

            return $q_.all( promises ).then( function() {
               return flow.places;
            } );
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

   function encodePlaceParameter( value ) {
      return typeof value === 'string' ? value.replace( /\//g, '%2F' ) : value;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function decodePlaceParameter( value ) {
      return typeof value === 'string' ? value.replace( /%2F/g, '/' ) : value;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return module;

} );
