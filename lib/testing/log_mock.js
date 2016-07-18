/**
* Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { tabulate } from '../utilities/object';
import { level, create as createLog } from '../logging/log';

export function create() {
   const logger = createLog( { get: () => {} }, false );
   return { level, ...tabulate(
      method => jasmine.createSpy( `log.${method}` ),
      Object.keys( logger.constructor.prototype )
   ) };
}
