/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

/**
 * A modified version of LaxarJS v2 that helps to transition from a v1 to a v2 application.
 *
 * It behaves like LaxarJS v2.x, but adds exports for `configuration`, `i18n`, `log` and `storage`.
 * When each of these global exports is used by application code for the first time, a warning is logged.
 */

import { assert, bootstrap as laxarBootstrap, instances, object, string } from './laxar';
import { create as createBrowser } from './lib/runtime/browser';
import { create as createConfiguration } from './lib/runtime/configuration';
import { create as createI18n } from './lib/i18n/i18n';
import { create as createLog, BLACKBOX, level } from './lib/logging/log';
import { create as createStorage } from './lib/runtime/storage';

const preBootstrapServices = createPreBootstrapServices();
services().log.warn(
   'Compatibility: LaxarJS is loaded in 1.x-compatibility mode. ' +
   'You should fix any deprecation warnings and then change your build to use regular laxarjs.'
);
const warningsShown = {};
let firstInstance;

export { assert, object, string, instances };
export const configuration = createFallback( 'configuration', 'axConfiguration' );
export const i18n = createFallback( 'i18n', 'axI18n' );
export const log = createFallback( 'log', 'axLog', BLACKBOX );
log.level = level;
export const storage = createFallback( 'storage', 'axStorage' );

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function bootstrap( ...args ) {
   const result = laxarBootstrap( ...args );
   if( !firstInstance ) {
      const first = _ => _[ Object.keys( _ )[ 0 ] ];
      firstInstance = first( instances() );
   }
   else if( !jasmine ) {
      services().log.warn(
         'Compatibility: Trying to bootstrap multiple LaxarJS instances in compatibility mode may cause ' +
         'undefined behavior.'
      );
   }
   return result;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function services() {
   return firstInstance || preBootstrapServices;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createFallback( apiName, injectionName, ...passArgs ) {
   const fallback = {};
   // eslint-disable-next-line guard-for-in
   for( const method in services()[ apiName ] ) {
      fallback[ method ] = proxy( method );
   }
   return fallback;

   function proxy( method ) {
      return ( ...args ) => {
         const service = services()[ apiName ];
         if( !warningsShown[ apiName ] ) {
            const message =
               `Deprecation: avoid using laxar.${apiName}: ` +
               `Use the ${injectionName} injection.`;
            services().log.warn( message, BLACKBOX );
            warningsShown[ apiName ] = true;
         }
         return service[ method ]( ...args, ...passArgs );
      };
   }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createPreBootstrapServices() {
   const browser = createBrowser();
   const configuration = createConfiguration( window.laxar || { logging: { threshold: 'DEBUG' } } );
   const i18n = createI18n( configuration );
   const log = createLog( configuration, browser );
   const storage = createStorage( configuration, browser );

   return {
      configuration,
      i18n,
      log,
      storage
   };
}
