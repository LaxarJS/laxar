/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

/**
 * Allows instantiate a mock implementations of {@link AxAssets}, compatible to the "axAssets" injection.
 *
 * @module widget_services_assets_mock
 */

import { deepClone } from '../utilities/object';

import { create as createArtifactProviderMock } from './artifact_provider_mock';

/**
 * Creates a mock for the "axAssets" injection of a widget.
 *
 * Usually the mock is created from a complete, generated assets entry, as described for the {@link AxAssets}
 * service.
 *
 * ```js
 * const artifactAssets = {
 *    'myMessages.json': { content: '{"yo":42}' },
 *    'default.theme': {
 *        'some.png': { url: '/path/to/some.png' }
 *    }
 * };
 * ```
 *
 * Assets are usually retrieved by the widget under test through the `axAssets` injection, or
 * programmatically like this:
 *
 * ```js
 * import { createAxAssetsMock } from 'laxar/laxar-widget-service-mocks';
 * const axAssetsMock = createAxAssetsMock( artifactAssets, 'other.theme' );
 * console.log( JSON.parse( axAssetsMock( 'myMessages.json' ) ) );  // output: { yo: 42 }
 * console.log( assetsMock.urlForTheme( 'some.png' ) );  // output: "/path/to/some.png"
 * ```
 *
 * From the test, the mock may be inspected using jasmine:
 *
 * ```js
 * import { createAxAssetsMock } from 'laxar/laxar-widget-service-mocks';
 * const axAssetsMock = createAxAssetsMock( artifactAssets );
 * // ...
 * expect( axAssetsMock ).toHaveBeenCalledWith( 'myMessages.json' );
 * expect( axAssetsMock.url ).toHaveBeenCalledWith( '/some/url' );
 * ```
 *
 * The specified assets/themedAssets may be replaced afterwards using the `.mock...` methods.
 * Instead of a complete entry, a user-defined entry containing just `assets` and/or `themedAssets` may be
 * used instead. Also, instead of the "default.theme", a custom theme may be passed. In this case, make sure
 * that the mock entry passed to `create` reflects this. Or use the mock
 *
 * ```js
 * import { createAxAssetsMock } from 'laxar/laxar-widget-service-mocks';
 * const axAssetsMock = createAxAssetsMock( artifactAssets, 'other.theme' );
 * console.log( assetsMock.urlForTheme( 'some.png' ) );  // output: null
 * axAssetsMock.mock( 'myMessages.json', '{"yo": 7}' );
 * axAssetsMock.mockUrlForTheme( 'some.png', "/path/to/some/other.png" );
 * console.log( JSON.parse( axAssetsMock( 'myMessages.json' ) ) );  // output: { yo: 7 }
 * console.log( assetsMock.urlForTheme( 'some.png' ) );  // output: "/path/to/some/other.png"
 * ```
 *
 * @param {Object} [artifactAssets={}]
 *    the assets entry to base the mock on
 * @param {String} [theme='default.theme']
 *    the theme name to use. For portability, keeping the default is recommended.
 * @param {String} [artifactName='mock-widget']
 *    the artifact name, only relevant for error messages
 *
 * @return {AxAssetsMock}
 *    a mock of `axAssets` that can be spied and/or mocked with additional assets
 */
export function create( artifactAssets = {}, theme = 'default.theme', artifactName = 'mock-widget' ) {

   const assets = deepClone( artifactAssets );

   const artifactsProviderMock = createArtifactProviderMock( theme );
   artifactsProviderMock.forWidget.mock( artifactName, {
      descriptor: { name: artifactName },
      assets
   } );
   const widgetArtifactsMock = artifactsProviderMock.forWidget( artifactName );
   const spy = ( name, backend ) => jasmine.createSpy( name ).and.callFake( backend );

   /**
    * An AxAssets-compatible mock.
    *
    * See {@link #create} for usage details.
    *
    * @name AxAssetsMock
    * @constructor
    * @extends AxAssets
    */
   const assetServiceMock = spy( 'axAssets', widgetArtifactsMock.asset );

   assetServiceMock.url = spy( 'axAssets.url', widgetArtifactsMock.assetUrl );
   assetServiceMock.forTheme = spy( 'axAssets.forTheme', widgetArtifactsMock.assetForTheme );
   assetServiceMock.urlForTheme = spy( 'axAssets.urlForTheme', widgetArtifactsMock.assetUrlForTheme );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Mock a regular asset.
    *
    * @param {String} path
    *    the asset path to mock
    * @param {String} content
    *    the asset contents that the mock should provide. Omit to discard the asset content.
    *
    * @memberof AxAssetsMock
    */
   assetServiceMock.mock = ( path, content ) => {
      assets[ path ] = assets[ path ] || {};
      assets[ path ].content = content;
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Mock a regular asset URL.
    *
    * @param {String} path
    *    the asset path to mock
    * @param {String} [url]
    *    the asset URL to provide. Omit to discard the asset URL.
    *
    * @memberof AxAssetsMock
    */
   assetServiceMock.mockUrl = ( path, url ) => {
      assets[ path ] = assets[ path ] || {};
      assets[ path ].url = url;
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Mock an asset for the current theme.
    *
    * @param {String} path
    *    the theme-dependent asset path to mock
    * @param {String} [content]
    *    the asset content to provide. Omit to discard the asset content.
    *
    * @memberof AxAssetsMock
    */
   assetServiceMock.mockForTheme = ( path, content ) => {
      const themedAssets = assets[ theme ] = assets[ theme ] || {};
      themedAssets[ path ] = themedAssets[ path ] || {};
      themedAssets[ path ].content = content;
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Mock an asset URL for the current theme.
    *
    * @param {String} path
    *    the theme-dependent asset path to mock
    * @param {String} [url]
    *    the asset URL to provide. Omit to discard the asset URL.
    *
    * @memberof AxAssetsMock
    */
   assetServiceMock.mockUrlForTheme = ( path, url ) => {
      const themedAssets = assets[ theme ] = assets[ theme ] || {};
      themedAssets[ path ] = themedAssets[ path ] || {};
      themedAssets[ path ].url = url;
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return assetServiceMock;
}
