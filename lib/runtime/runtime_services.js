/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
/**
 * This module provides some services for AngularJS DI. Although it is fine to use these services in widgets,
 * most of them are primarily intended to be used internally by LaxarJS. Documentation is nevertheless of use
 * when e.g. they need to be mocked during tests.
 *
 * @module axRuntimeServices
 */
import ng from 'angular';
import log from '../logging/log';
import * as configuration from '../utilities/configuration';
// TODO remove. Only temporary
import { name as servicesName } from './services';

const module = ng.module( 'axRuntimeServices', [ servicesName ] );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

module.config( [ '$httpProvider', function( $httpProvider ) {
   if( configuration.get( CONFIG_KEY_HTTP_LOGGING_HEADER ) ) {
      $httpProvider.interceptors.push( 'axLogHttpInterceptor' );
   }
} ] );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * This is a scheduler for asynchronous tasks (like nodejs' `process.nextTick`)  trimmed for performance.
 * It is intended for use cases where many tasks are scheduled in succession within one JavaScript event
 * loop. It integrates into the AngularJS *$digest* cycle, while trying to minimize the amount of full
 * *$digest* cycles.
 *
 * For example in LaxarJS the global event bus instance ({@link axGlobalEventBus}) uses this service.
 *
 * @name axHeartbeat
 * @injection
 */
module.factory( 'axHeartbeat', [ 'axServices', services => services.axHeartbeat ] );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * A timestamp function, provided as a service to support the jasmine mock clock during testing. The
 * mock-free implementation simply uses `new Date().getTime()`. Whenever a simple timestamp is needed in a
 * widget, this service can be used to allow for hassle-free testing.
 *
 * Example:
 * ```js
 * Controller.$inject = [ 'axTimestamp' ];
 * function Controller( axTimestamp ) {
 *    var currentTimestamp = axTimestamp();
 * };
 * ```
 *
 * @name axTimestamp
 * @injection
 */
module.factory( 'axTimestamp', [ 'axServices', services => services.axTimestamp ] );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Provides access to the control-implementation-modules used by a widget.
 * Further documentation on the api can be found at the *controls_service* module api doc.
 *
 * @name axControls
 * @injection
 */
module.factory( 'axControls', [ 'axServices', services => services.axControls ] );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * The global event bus instance provided by the LaxarJS runtime. Widgets **should never** use this, as
 * subscriptions won't be removed when a widget is destroyed. Instead widgets should always either use the
 * `eventBus` property on their local `$scope` object or the service `axEventBus`. These take care of all
 * subscriptions on widget destructions and thus prevent from leaking memory and other side effects.
 *
 * This service instead can be used by other services, that live throughout the whole lifetime of an
 * application or take care of unsubscribing from events themselves. Further documentation on the api can
 * be found at the *event_bus* module api doc.
 *
 * @name axGlobalEventBus
 * @injection
 */
module.factory( 'axGlobalEventBus', [ 'axServices', services => services.axGlobalEventBus ] );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Provides access to the global configuration, otherwise accessible via the *configuration* module.
 * Further documentation can be found there.
 *
 * @name axConfiguration
 * @injection
 */
module.factory( 'axConfiguration', [ 'axServices', services => services.axConfiguration ] );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * A global, pre-configured file resource provider instance. Further documentation on the api can
 * be found at the *file_resource_provider* module api doc.
 *
 * This service has already all the file listings configured under `window.laxar.fileListings`. These can
 * either be uris to listing JSON files or already embedded JSON objects of the directory tree.
 *
 * @name axFileResourceProvider
 * @injection
 */
module.factory( 'axFileResourceProvider', [ 'axServices', services => services.axFileResourceProvider ]);

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Provides access to the configured theme and theme relevant assets via a theme manager instance. Further
 * documentation on the api can be found at the *theme_manager* module api doc.
 *
 * @name axThemeManager
 * @injection
 */
module.factory( 'axThemeManager', [ 'axServices', services => services.axThemeManager ] );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Loads a layout relative to the path `laxar-path-root` configured via RequireJS (by default
 * `/application/layouts`), taking the configured theme into account. If a CSS file is found, it will
 * directly be loaded into the page. A HTML template will instead get returned for manual insertion at the
 * correct DOM location. For this service there is also the companion directive *axLayout* available.
 *
 * Example:
 * ```js
 * myNgModule.directive( [ 'axLayoutLoader', function( axLayoutLoader ) {
 *    return {
 *       link: function( scope, element, attrs ) {
 *          axLayoutLoader.load( 'myLayout' )
 *             .then( function( layoutInfo ) {
 *                element.html( layoutInfo.html );
 *             } );
 *       }
 *    };
 * } ] );
 * ```
 *
 * @name axLayoutLoader
 * @injection
 */
module.factory( 'axLayoutLoader', [ 'axServices', services => services.axLayoutLoader ] );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * A service to load css files on demand during development. If a merged release css file has already been
 * loaded (marked with a `data-ax-merged-css` html attribute at the according `link` tag) or `useMergedCss`
 * is configured as `true`, the `load` method will simply be a noop. In the latter case the merged css file
 * will be loaded once by this service.
 *
 * @name axCssLoader
 * @injection
 */
module.factory( 'axCssLoader', [ 'axServices', services => services.axCssLoader ] );

///////////////////////////////////////////////////////////////////////////////////////////////////////////

module.factory( 'axLogHttpInterceptor', [ 'axConfiguration', function( configuration ) {
   const headerKey = configuration.get( CONFIG_KEY_HTTP_LOGGING_HEADER, null );
   return headerKey ? {
      request: function( config ) {
         let headerValue = '';
         ng.forEach( log.gatherTags(), function( tagValue, tagName ) {
            headerValue += `[${tagName}:${tagValue}]`;
         } );

         if( headerValue ) {
            if( config.headers[ headerKey ] ) {
               log.warn( 'axLogHttpInterceptor: Overwriting existing header "[0]"', headerKey );
            }
            config.headers[ headerKey ] = headerValue;
         }
         return config;
      }
   } : {};
} ] );

const CONFIG_KEY_HTTP_LOGGING_HEADER = 'logging.http.header';

///////////////////////////////////////////////////////////////////////////////////////////////////////////

export const name = module.name;
export default module;
