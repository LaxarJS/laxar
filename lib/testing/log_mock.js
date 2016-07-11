/**
* Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { tabulate } from '../utilities/object';
import { level } from '../logging/log';

export function create() {
   return tabulate(
      method => jasmine.createSpy( `log.${method}` ),
      Object.keys( level ).map( _ => _.toLowerCase() ).concat( [ 'setTag' ] )
   );
}
