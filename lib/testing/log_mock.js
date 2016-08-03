/**
* Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { tabulate } from '../utilities/object';
import { level, create as createLog } from '../logging/log';
import { create as createConfigurationMock } from './configuration_mock';

export function create() {
   const config = createConfigurationMock( { 'logging.threshold': 'INFO' } );
   const logger = createLog( config, false );
   return { level, ...tabulate(
      method => jasmine.createSpy( `log.${method}` ),
      Object.keys( logger.constructor.prototype )
   ) };
}
