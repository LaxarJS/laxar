/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

/**
 * Allows to create mock implementations of {@link Log}, compatible to the "axLog" and "axGlobalLog"
 * injections.
 *
 * @module log_mock
 */

import { tabulate } from '../utilities/object';
import { levels, create as createLog } from '../runtime/log';
import { create as createConfigurationMock } from './configuration_mock';

/**
 * Creates a log mock that does not actually log anywhere, but can be spied upon.
 *
 * @return {AxLog}
 *    a fresh mock instance
 */
export function create() {
   const config = createConfigurationMock( { 'logging.threshold': 'INFO' } );
   const logger = createLog( config, false );
   return { levels, ...tabulate(
      method => jasmine.createSpy( `log.${method}` ),
      Object.keys( logger.constructor.prototype )
   ) };
}
