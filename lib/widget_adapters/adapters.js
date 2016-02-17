/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import * as plainAdapter from './plain_adapter';

const adapters = {
   [ plainAdapter.technology ]: plainAdapter
};

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
