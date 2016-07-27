/**
* Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { deepClone } from '../utilities/object';

export const MOCK_THEME = 'mock.theme';

const NOT_FOUND = { content: null };

export function create( themeName = MOCK_THEME ) {

   const buckets = {};

   return {
      forFlow: mockProvider( 'flows', [ 'descriptor' ], [ 'definition' ] ),
      forTheme: mockProvider( 'themes', [ 'assets', 'descriptor' ] ),
      forPage: mockProvider( 'pages', [ 'descriptor' ], [ 'definition' ] ),
      forLayout: mockProvider( 'layouts', [ 'descriptor', 'assets' ] ),
      forWidget: mockProvider( 'widgets', [ 'descriptor', 'assets', 'module' ] ),
      forControl: mockProvider( 'controls', [ 'descriptor', 'assets', 'module' ] )
   };

   function mockProvider( bucket, keys = [], cloneKeys = [] ) {
      const provide = ref => {
         const artifactPromise = ( buckets[ bucket ] && buckets[ bucket ][ ref ] ) ?
            Promise.resolve( buckets[ bucket ][ ref ] ) :
            Promise.reject( new Error( `Artifact ${ref} not found in ${bucket}` ) );

         const api = {};

         [ 'definition', 'module', 'descriptor' ].forEach( key => {
            if( cloneKeys.includes( key ) ) {
               api[ key ] = () => artifactPromise.then( _ => deepClone( _[ key ] ) );
            }
            else if( keys.includes( key ) ) {
               api[ key ] = () => artifactPromise.then( _ => _[ key ] );
            }
         } );

         if( keys.includes( 'assets' ) ) {
            const lookup = name => {
               return ({ assets = {} }) => {
                  return assets[ name ] || NOT_FOUND;
               };
            };

            const lookupForTheme = name => {
               return ({ assets = {} }) => {
                  const themedAssets = assets[ themeName ];
                  if( themedAssets && themedAssets[ name ] ) {
                     return themedAssets[ name ];
                  }
                  return NOT_FOUND;
               };
            };

            const provide = ({ content }) => content || null;
            const provideUrl = ({ url }) => url || null;

            api.asset = name => artifactPromise
               .then( lookup( name ) )
               .then( provide );

            api.assetUrl = name => artifactPromise
               .then( lookup( name ) )
               .then( provideUrl );

            api.assetForTheme = name => artifactPromise
               .then( lookupForTheme( name ) )
               .then( provide );

            api.assetUrlForTheme = name => artifactPromise
               .then( lookupForTheme( name ) )
               .then( provideUrl );
         }

         return api;
      };

      provide.mock = ( ref, artifact ) => {
         buckets[ bucket ] = buckets[ bucket ] || {};
         buckets[ bucket ][ ref ] = artifact;
      };

      return provide;
   }
}
