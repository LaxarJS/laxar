/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createPageLoader } from '../page_loader';
import { create as createFrpMock } from '../../testing/file_resource_provider_mock';
import { deepClone, forEach } from '../../utilities/object';
import pages from './data/pages';
import pagesWithCompositions from './data/pages_with_compositions';
import compositions from './data/compositions';

describe( 'A PageLoader', () => {

   let frpMock;
   let baseUrl;
   let pageLoader;

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   beforeEach( () => {
      baseUrl = 'http://assets/';
      const files = {};
      [ pages, pagesWithCompositions, compositions ].forEach( asset => {
         forEach( asset, ( assetData, assetName ) => {
            files[ `${baseUrl}${assetName}.json` ] = deepClone( assetData );
         } );
      } );
      frpMock = createFrpMock( files );
      pageLoader = createPageLoader( baseUrl, frpMock );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'throws if created with missing requirements', () => {
      expect( () => { createPageLoader(); } ).toThrow();
      expect( () => { createPageLoader( '' ); } ).toThrow();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'does not throw if it is created with the correct requirements', () => {
      expect( () => { createPageLoader( baseUrl, frpMock ); } ).not.toThrow();
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'has a method to load a page', () => {
      expect( typeof pageLoader.load ).toEqual( 'function' );
   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when loading a simple page', () => {

      let resolvedPage;
      beforeEach( () => {
         resolvedPage = deepClone( pages.basePage );
         resolvedPage.name = 'basePage';
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'rejects for a page that does not exist', done => {
         pageLoader.load( 'iDontExist' )
            .then( done.fail, err => {
               expect( err ).toEqual( new Error(
                  'Error loading page "iDontExist": ' +
                  'Page could not be found at location "http://assets/iDontExist.json"'
               ) );
            } )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'resolves with the loaded page', done => {
         pageLoader.load( 'basePage' )
            .then( page => expect( page ).toEqual( resolvedPage ) )
            .then( done, done.fail );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'resolves with the loaded page, even if a json suffix is used', done => {
         pageLoader.load( 'basePage.json' )
            .then( page => expect( page ).toEqual( resolvedPage ) )
            .then( done, done.fail );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'generates widget ids where they are missing', done => {
         pageLoader.load( 'pageWithMissingWidgetIds' )
            .then( expectUniqueWidgetIds )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'checks that widget ids are unique', done => {
         pageLoader.load( 'pageWithIdConflict' )
            .then( done.fail, done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'detects duplicate widget ids in the same area', done => {
         pageLoader.load( 'pageWithDuplicateWidgetIdsInSameArea' )
            .then( done.fail, err => {
               expect( err ).toEqual( new Error(
                  'Error loading page "pageWithDuplicateWidgetIdsInSameArea": ' +
                  'Duplicate widget/composition ID(s): id1'
               ) );
            } )
            .then( done, done.fail );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'detects duplicate widget ids in different areas', done => {
         pageLoader.load( 'pageWithDuplicateWidgetIdsInDifferentAreas' )
            .then( done.fail, err => {
               expect( err ).toEqual( new Error(
                  'Error loading page "pageWithDuplicateWidgetIdsInDifferentAreas": ' +
                  'Duplicate widget/composition ID(s): id1, id2'
               ) );
            } )
            .then( done, done.fail );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'omits widgets that are disabled (#24)', done => {
         pageLoader.load( 'pageWithDisabledWidgets' )
            .then( page => {
               expect( page.areas.area1.length ).toEqual( 1 );
               expect( page.areas.area1[0].id ).toEqual( 'id2' );
               expect( page.areas.area2.length ).toEqual( 0 );
            } )
            .then( done );
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when a page extends another page', () => {

      it( 'returns the combined pages', done => {
         pageLoader.load( 'derivedPage' )
            .then( page => {
               expect( page.layout ).toEqual( 'someLayout' );
               expect( page.areas.area1[0] ).toEqual( { widget: 'someWidgetPath1', id: 'id1' } );
               expect( page.areas.area1[1] ).toEqual( { widget: 'someWidgetPath2', id: 'id2' } );
               expect( page.areas.area1[2] ).toEqual( { widget: 'someWidgetPath4', id: 'id4' } );
               expect( page.areas.area2[0] ).toEqual( { widget: 'someWidgetPath3', id: 'id3' } );
               expect( page.areas.area3[0] ).toEqual( { widget: 'someWidgetPath5', id: 'id5' } );
            } )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'returns the combined pages, even if a json suffix is used', done => {
         pageLoader.load( 'derivedPageWithJsonSuffix' )
            .then( page => {
               expect( page.layout ).toEqual( 'someLayout' );
               expect( page.areas.area1[0] ).toEqual( { widget: 'someWidgetPath1', id: 'id1' } );
               expect( page.areas.area1[1] ).toEqual( { widget: 'someWidgetPath2', id: 'id2' } );
               expect( page.areas.area1[2] ).toEqual( { widget: 'someWidgetPath4', id: 'id4' } );
               expect( page.areas.area2[0] ).toEqual( { widget: 'someWidgetPath3', id: 'id3' } );
               expect( page.areas.area3[0] ).toEqual( { widget: 'someWidgetPath5', id: 'id5' } );
            } )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'generates widget ids where they are missing', done => {
         pageLoader.load( 'pageWithMissingWidgetIdsAndInheritance' )
            .then( page => {
               expect( page.areas.area1.length ).toBe( 6 );
               expect( page.areas.area1[0].id ).toEqual( 'id1' );
               expect( page.areas.area1[3].id ).toEqual( 'id2' );
               expectUniqueWidgetIds( page );
            } )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'detects if both pages define a layout', done => {
         pageLoader.load( 'pageWithLayoutExtendingOtherPageWithLayout' )
            .then( done.fail, err => {
               expect( err ).toEqual( new Error(
                  'Error loading page "pageWithLayoutExtendingOtherPageWithLayout": ' +
                  'Page overwrites layout set by base page "pageWithLayout'
               ) );
            } )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'detects direct cycles during extension', done => {
         pageLoader.load( 'pageThatExtendsItself' )
            .then( done.fail, err => {
               expect( err ).toEqual( new Error(
                  'Error loading page "pageThatExtendsItself": ' +
                  'Cycle in page extension detected: pageThatExtendsItself -> pageThatExtendsItself'
               ) );
            } )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'detects indirect cycles during extension', done => {
         pageLoader.load( 'cyclicPage3' )
            .then( done.fail, err => {
               expect( err ).toEqual( new Error(
                  'Error loading page "cyclicPage3": ' +
                  'Cycle in page extension detected: cyclicPage3 -> cyclicPage2 -> cyclicPage1 -> cyclicPage3'
               ) );
            } )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'detects duplicate widget ids', done => {
         pageLoader.load( 'derivedPageWithDuplicateIds' )
            .then( done.fail, err => {
               expect( err ).toEqual( new Error(
                  'Error loading page "derivedPageWithDuplicateIds": Duplicate widget/composition ID(s): id1, id3'
               ) );
            } )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'correctly respects insertBeforeId in extending page', done => {
         pageLoader.load( 'derivedPageWithInsertBeforeId' )
            .then( page => {
               expect( page.areas.area1.length ).toBe( 3 );
               expect( page.areas.area1[0].id ).toEqual( 'id1' );
               expect( page.areas.area1[1].id ).toEqual( 'id4' );
               expect( page.areas.area1[2].id ).toEqual( 'id2' );

               expect( page.areas.area2.length ).toBe( 2 );
               expect( page.areas.area2[0].id ).toEqual( 'id5' );
               expect( page.areas.area2[1].id ).toEqual( 'id3' );
            } )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'detects if no widget with id matching insertBeforeId exists', done => {
         pageLoader.load( 'derivedPageWithNonExistingInsertBeforeId' )
            .then( done.fail, err => {
               expect( err ).toEqual( new Error(
                  'Error loading page "derivedPageWithNonExistingInsertBeforeId": ' +
                  'No id found that matches insertBeforeId value "idXXX"'
               ) );
            } )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'extends is resolved relative to the extending page (at least in ATP33)', done => {
         pageLoader.load( 'category/page' )
            .then( page => expect( page.areas.one ).toBeDefined() )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'omits widgets that are disabled in the extended page (#24)', done => {
         pageLoader.load( 'pageWithDisabledWidgetsInExtendedPage' )
            .then( page => {
               expect( page.areas.area1.length ).toEqual( 1 );
               expect( page.areas.area1[0].id ).toEqual( 'id2' );

               expect( page.areas.area2.length ).toEqual( 1 );
               expect( page.areas.area2[0].id ).toEqual( 'id4' );
            } )
            .then( done );
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when a page uses compositions', () => {

      it( 'loads simple compositions into the area it is used in, while prefixing all ids used within the composition', done => {
         pageLoader.load( 'pageWithSimpleComposition' )
            .then( page => {
               expect( page.areas.area1.length ).toBe( 5 );
               expect( page.areas.area1[0] ).toEqual( { widget: 'someWidgetPath1', id: 'id1' } );
               expect( page.areas.area1[1] ).toEqual( { widget: 'laxarjs/test_widget', id: 'simpleComposition-id0-idx1' } );
               expect( page.areas.area1[2] ).toEqual( { widget: 'laxarjs/test_widget2', id: 'testWidget2-id2' } );
               expect( page.areas.area1[3] ).toEqual( { widget: 'laxarjs/test_widget2', id: 'testWidget2-id1' } );
               expect( page.areas.area1[4] ).toEqual( { widget: 'someWidgetPath1', id: 'id2' } );

               expect( page.areas.area2.length ).toBe( 1 );
               expect( page.areas.area2[0] ).toEqual( { widget: 'someWidgetPath1', id: 'id3' } );
            } )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'merges areas existing in the composition and the page', done => {
         pageLoader.load( 'pageWithCompositionWithAdditionalAreas' )
            .then( page => {
               expect( page.areas.area2.length ).toBe( 2 );
               expect( page.areas.area2[0] ).toEqual( { widget: 'someWidgetPath1', id: 'id3' } );
               expect( page.areas.area2[1] )
                  .toEqual( { widget: 'laxarjs/test_widget2', id: 'compositionWithAdditionalAreas-id0-idx2' } );
            } )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'adds additional areas of the composition to the page, while prefixing all widget-areas within the composition', done => {
         pageLoader.load( 'pageWithCompositionWithAdditionalAreas' )
            .then( page => {
               expect( page.areas['compositionWithAdditionalAreas-id0-idx2.content'].length ).toBe( 1 );
               expect( page.areas['compositionWithAdditionalAreas-id0-idx2.content'][0] )
                  .toEqual( { widget: 'laxarjs/test_widget3', id: 'compositionWithAdditionalAreas-id0-idx3' } );
            } )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'replaces feature expressions with provided features and overwritten defaults', done => {
         pageLoader.load( 'pageWithCompositionWithFeaturesOverwritingDefaults' )
            .then( page => {
               expect( page.areas.area1.length ).toBe( 1 );
               expect( page.areas.area1[0] ).toEqual( {
                  widget: 'laxarjs/test_widget1',
                  id: 'compositionWithFeaturesDefined-id0-idx1',
                  features: {
                     open: { onActions: [ 'openAction' ] },
                     close: { onActions: [ 'close', 'cancelAction' ] }
                  }
               } );

               expect( page.areas.areaX.length ).toBe( 1 );
               expect( page.areas.areaX[0] ).toEqual( {
                  widget: 'laxarjs/test_widget2',
                  id: 'testWidget2-id1',
                  features: {
                     importantFeature: {
                        resource: 'cars',
                        attribute: 'entries'
                     }
                  }
               } );
            } )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'replaces feature expressions with provided features and omitted defaults', done => {
         pageLoader.load( 'pageWithCompositionWithFeaturesOmittingDefaults' )
            .then( page => {
               expect( page.areas.area1.length ).toBe( 1 );
               expect( page.areas.area1[0] ).toEqual( {
                  widget: 'laxarjs/test_widget1',
                  id: 'compositionWithFeaturesDefined-id0-idx1',
                  features: {
                     open: { onActions: [ 'openAction' ] },
                     close: { onActions: [ 'close', 'cancelAction' ] }
                  }
               } );

               expect( page.areas.areaX.length ).toBe( 1 );
               expect( page.areas.areaX[0] ).toEqual( {
                  widget: 'laxarjs/test_widget2',
                  id: 'testWidget2-id1',
                  features: {
                     importantFeature: {
                        resource: 'compositionWithFeaturesDefined+id0+myResource',
                        attribute: 'entries'
                     }
                  }
               } );
            } )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'compositions within compositions are resolved', done => {
         pageLoader.load( 'pageWithCompositionWithEmbeddedComposition' )
            .then( page => {
               expect( page.areas.area1.length ).toBe( 2 );
               expect( page.areas.area1[0] ).toEqual( {
                  widget: 'laxarjs/test_widget1',
                  id: 'compositionWithEmbeddedComposition-id0-myComposition-idx1',
                  features: {
                     open: { onActions: [ 'openAction' ] },
                     close: { onActions: [ 'shutdownAction' ] }
                  }
               } );
               expect( page.areas.area1[1] ).toEqual( {
                  widget: 'laxarjs/test_widget2',
                  id: 'testWidget2-id1'
               } );

               expect( page.areas.areaX.length ).toBe( 1 );
               expect( page.areas.areaX[0] ).toEqual( {
                  widget: 'laxarjs/test_widget2',
                  id: 'testWidget2-id2',
                  features: {
                     importantFeature: {
                        resource: 'plane',
                        attribute: 'entries'
                     }
                  }
               } );
            } )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'merges configured features of type array with internal predefined items', done => {
         pageLoader.load( 'pageWithCompositionWithMergedFeatures' )
            .then( page => {
               expect( page.areas.area1[0].features ).toEqual( {
                  close: {
                     onActions: [ 'closeIt', 'myComposition+internalClose', 'closeAgain', 'needMoreCloseActions' ]
                  }
               } );
            } )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'detects direct cycles in compositions', done => {
         pageLoader.load( 'pageWithCompositionWithDirectCycle' )
            .then( done.fail, err => {
               expect( err ).toEqual( new Error(
                  'Error loading page "pageWithCompositionWithDirectCycle": ' +
                  'Cycle in compositions detected: compositionWithDirectCycle -> compositionWithDirectCycle'
               ) );
            } )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'detects indirect cycles in compositions', done => {
         pageLoader.load( 'pageWithCompositionWithCycle' )
            .then( done.fail, err => {
               expect( err ).toEqual( new Error(
                  'Error loading page "pageWithCompositionWithCycle": ' +
                  'Cycle in compositions detected: compositionWithCycle -> compositionWithCycle2 -> compositionWithCycle'
               ) );
            } )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'escapes topics and ids generated from compositions in subfolder correctly', done => {
         pageLoader.load( 'pageWithCompositionInSubFolder' )
            .then( page => {
               const widget = page.areas.area1[0];
               expect( widget.id ).toEqual( 'compositionInSubfolder-id0-myWidget3' );
               expect( widget.features.xy.resource ).toEqual( 'compositionInSubfolder+id0+myResource' );
            } )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'replaces replacements in keys for widget features', done => {
         pageLoader.load( 'pageWithCompositionWithReplacementsInKeys' )
            .then( page => {
               const widget1 = page.areas.area1[0];
               const widget2 = page.areas.area2[0];

               expect( widget1.features ).toEqual( {
                  childResources: {
                     something: 'efficientFrontier'
                  }
               } );
               expect( widget2.features ).toEqual( {
                  actions: {
                     'myComposition+applyAction': [ 'first', 'myComposition+second' ]
                  }
               } );
            } )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'allows generation of negated flags', done => {
         pageLoader.load( 'pageWithCompositionWithNegatedGeneratedFlagName' )
            .then( page => {
               const widget = page.areas.area1[0];

               expect( widget.features ).toEqual( {
                  buttons: [
                     {
                        action: 'one',
                        hideOn: [ 'myComposition+contentsShowing' ]
                     },
                     {
                        action: 'two',
                        hideOn: [ '!myComposition+contentsShowing' ]
                     }
                  ]
               } );
            } )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'omits compositions that are disabled (#24)', done => {
         pageLoader.load( 'pageWithDisabledComposition' )
            .then( page => {
               expect( page.areas.area1.length ).toBe( 2 );
               expect( page.areas.area1[0] ).toEqual( { widget: 'someWidgetPath1', id: 'id1' } );
               expect( page.areas.area1[1] ).toEqual( { widget: 'someWidgetPath1', id: 'id2' } );

               expect( page.areas.area2.length ).toBe( 1 );
               expect( page.areas.area2[0] ).toEqual( { widget: 'someWidgetPath1', id: 'id3' } );
            } )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'omits widgets that are disabled within compositions (#24)', done => {
         pageLoader.load( 'pageWithCompositionWithDisabledWidgets' )
            .then( page => {
               expect( page.areas.area1.length ).toBe( 3 );
               expect( page.areas.area1[0] ).toEqual( { widget: 'someWidgetPath1', id: 'id1' } );
               expect( page.areas.area1[1] ).toEqual( { widget: 'laxarjs/test_widget2', id: 'testWidget2-id1' } );
               expect( page.areas.area1[2] ).toEqual( { widget: 'someWidgetPath1', id: 'id2' } );

               expect( page.areas.area2.length ).toBe( 1 );
               expect( page.areas.area2[0] ).toEqual( { widget: 'someWidgetPath1', id: 'id3' } );
            } )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'removes undefined values in widget features due to missing configuration of according composition feature (#29)', done => {
         pageLoader.load( 'pageWithFeaturesOfCompositionNotConfigured' )
            .then( page => {
               expect( Object.keys( page.areas.area1[0].features.anything ) ).toEqual( [] );
               expect( page.areas.area1[0].features.open.onActions ).toEqual( [] );
            } )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'does not transform null values of widget feature configuration inside of compositions (#28)', done => {
         pageLoader.load( 'pageWithCompositionWithNullFeatures' )
            .then( page => {
               expect( page.areas.area1[0].features.anything.resource ).toBe( null );
               expect( page.areas.area1[0].features.open.onActions[0] ).toBe( null );
            } )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'throws an error for duplicate composition ids (#30)', done => {
         pageLoader.load( 'pageWithDuplicateIdForCompositions' )
            .then( done.fail, err => {
               expect( err ).toEqual( new Error(
                  'Error loading page "pageWithDuplicateIdForCompositions": Duplicate widget/composition ID(s): broken'
               ) );
            } )
            .then( done );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'accepts compositions without "." entry', done => {
         pageLoader.load( 'pageWithDotlessComposition' )
            .then( page => {
               forEach( page.areas, area => {
                  forEach( area, pageItem => {
                     expect( pageItem.composition ).toBeUndefined();
                  } );
               } );
            } )
            .then( done, done.fail );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'accepts insertBeforeId in compositions', done => {
         pageLoader.load( 'pageWithCompositionWithInsertBeforeId' )
            .then( ({ areas }) => {
               expect( areas.test.length ).toBe( 2 );
               expect( areas.test[0].widget.indexOf( 'before' ) ).toBe( 0 );
               expect( areas.test[1].widget.indexOf( 'after' ) ).toBe( 0 );
            } )
            .then( done, done.fail );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'resolves ids correctly', done => {
         pageLoader.load( 'pageWithBrokenCompositionWithInsertBeforeId' )
            .then( ({ areas }) => {
               expect( areas.test.length ).toBe(4);
               expect( areas.test[0].widget ).toBe( 'before' );
               expect( areas.test[1].widget ).toBe( 'after' );
               expect( areas.test[2].widget ).toBe( 'before2' );
               expect( areas.test[3].widget ).toBe( 'after2' );
            } )
            .then( done, done.fail );
      } );

      /////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'checks widget and composition ids for uniqueness', done => {
         pageLoader.load( 'pageWithIdConflictWidgetVsComposition' )
            .then( done.fail, done );
      } );

   } );

   ////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when loading an invalid page', () => {

      let rejectedSpy;

      beforeEach( done => {
         rejectedSpy = jasmine.createSpy( 'rejectedSpy' ).and.callFake( done );
         pageLoader.load( 'invalidPage' ).then( done, rejectedSpy );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'rejects the load-promise', () => {
         expect( rejectedSpy ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides a useful error message', () => {
         expect( rejectedSpy.calls.argsFor(0)[0].message ).toEqual(
            'Error loading page "invalidPage": Schema validation failed: ' +
            '\n - String does not match pattern: ^[a-z][a-zA-Z0-9_]*$. Path: "$.areas.testArea[0].id".' );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when loading a page with invalid composition feature configureation', () => {

      let rejectedSpy;

      beforeEach( done => {
         rejectedSpy = jasmine.createSpy( 'rejectedSpy' ).and.callFake( done );
         pageLoader.load( 'pageWithFeaturesOfCompositionBadlyConfigured' ).then( done, rejectedSpy );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'rejects the load-promise', () => {
         expect( rejectedSpy ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides a useful error message', () => {
         expect( rejectedSpy.calls.argsFor(0)[0].message ).toEqual(
            'Error loading page "pageWithFeaturesOfCompositionBadlyConfigured":' +
            ' Error loading composition "compositionWithFeaturesWithoutDefaults"' +
            ' (id: "compositionWithFeaturesWithoutDefaults-id0").' +
            ' Validation of feature-configuration failed. Errors: \n' +
            ' - Invalid type: integer should be string. Path: "$.something.resource".' );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function expectUniqueWidgetIds( page ) {
      const seenIds = {};
      forEach( page.areas, function( widgetList ) {
         forEach( widgetList, function( widgetSpec ) {
            if( widgetSpec.hasOwnProperty( 'widget' ) ) {
               expect( widgetSpec.id ).toBeDefined();
               expect( seenIds.hasOwnProperty( widgetSpec['id'] ) ).toBe( false );
            }
            seenIds[ widgetSpec.id ] = true;
         } );
      } );
   }

} );
