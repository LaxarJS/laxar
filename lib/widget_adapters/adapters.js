/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import * as plainAdapter from './plain_adapter';
import * as angularAdapter from './angular_adapter';

const adapters = {};
adapters[ plainAdapter.technology ] = plainAdapter;
adapters[ angularAdapter.technology ] = angularAdapter;

///////////////////////////////////////////////////////////////////////////////////////////////////////////

export function getFor( technology ) {
   return adapters[ technology ];
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

export function getSupportedTechnologies() {
   return Object.keys( adapters );
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

export function addAdapters( additionalAdapters ) {
   additionalAdapters.forEach( function( adapter ) {
      adapters[ adapter.technology ] = adapter;
   } );
}
