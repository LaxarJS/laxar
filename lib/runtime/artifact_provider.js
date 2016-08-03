/**
* Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import assert from '../utilities/assert';
import { deepClone } from '../utilities/object';
import { join } from '../utilities/path';

const NOT_FOUND = { content: null };

export function create( artifacts, browser, configuration, log ) {

   const baseUrl = configuration.ensure( 'base' );

   const [ themeRef, themeName ] = ( themeRef => {
      const themeIndex = artifacts.aliases.themes[ themeRef ];
      const theme = artifacts.themes[ themeIndex ];
      if( !theme ) {
         log.error( `The configured theme ${themeRef} is not available.` );
         return [ 'default', 'default.theme' ];
      }
      return [ themeRef, theme.descriptor.name ];
   } )( configuration.ensure( 'theme' ) );

   return {
      forFlow: makeProvider( 'flows', [ 'descriptor' ], [ 'definition' ] ),
      forTheme: makeProvider( 'themes', [ 'descriptor', 'assets' ] ).bind( null, themeRef ),
      forPage: makeProvider( 'pages', [ 'descriptor' ], [ 'definition' ] ),
      forLayout: makeProvider( 'layouts', [ 'descriptor', 'assets' ] ),
      forWidget: makeProvider( 'widgets', [ 'descriptor', 'assets', 'module' ] ),
      forControl: makeProvider( 'controls', [ 'descriptor', 'assets', 'module' ] )
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function makeProvider( bucket, keys = [], cloneKeys = [] ) {
      return ref => {
         const api = {};
         const index = artifacts.aliases[ bucket ][ ref ];
         const artifactPromise = index === undefined ?
            Promise.reject( new Error( `Artifact ${ref} not found in ${bucket}` ) ) :
            Promise.resolve( artifacts[ bucket ][ index ] );

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
               assert( name ).hasType( String ).isNotNull();
               return ({ assets = {} }) => {
                  return assets[ name ] || NOT_FOUND;
               };
            };

            const lookupForTheme = name => {
               assert( name ).hasType( String ).isNotNull();
               return ({ assets = {} }) => {
                  const themedAssets = assets[ themeName ];
                  if( themedAssets && themedAssets[ name ] ) {
                     return themedAssets[ name ];
                  }
                  const defaultAssets = assets[ 'default.theme' ];
                  if( defaultAssets && defaultAssets[ name ] ) {
                     return defaultAssets[ name ];
                  }
                  return NOT_FOUND;
               };
            };

            const provide = ({ url, content }) => {
               if( content == null && url ) {
                  return browser.fetch( join( baseUrl, url ) ).then( _ => _.text() );
               }
               return content || null;
            };

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
   }
}
