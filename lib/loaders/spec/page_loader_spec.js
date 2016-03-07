/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../page_loader',
   'q_mock',
   '../../testing/http_mock',
   '../../utilities/object',
   './data/pages',
   './data/pages_with_compositions',
   './data/compositions'
], function( pageLoaderModule, q, httpMock, object, pages, pagesWithCompositions, compositions ) {
   'use strict';

   describe( 'A PageLoader', function() {

      var httpClient;
      var baseUrl;
      var pageLoader;
      var resolvedSpy;
      var rejectedSpy;

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      beforeEach( function() {
         jasmine.Clock.useMock();

         httpClient = httpMock.create( q );
         baseUrl = 'http://assets/';
         pageLoader = pageLoaderModule.create( q, httpClient, baseUrl );
         resolvedSpy = jasmine.createSpy( 'resolvedSpy' );
         rejectedSpy = jasmine.createSpy( 'rejectedSpy' );

         [ pages, pagesWithCompositions, compositions ].forEach( function( asset ) {
            object.forEach( asset, function( assetData, assetName ) {
               httpClient.respondWith( baseUrl + assetName + '.json', object.deepClone( assetData ) );
            } );
         } );

         addMatchers( this );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'throws if created with missing requirements', function() {
         expect( function() { pageLoaderModule.create(); } ).toThrow();
         expect( function() { pageLoaderModule.create( q ); } ).toThrow();
         expect( function() { pageLoaderModule.create( q, httpClient ); } ).toThrow();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'does not throw if it is created with the correct requirements', function() {
         expect( function() { pageLoaderModule.create( q, httpClient, baseUrl ); } ).not.toThrow();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'has a method to load a page', function() {
         expect( typeof pageLoader.loadPage ).toEqual( 'function' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when loading a simple page', function() {

         var resolvedPage;
         beforeEach( function() {
            resolvedPage = object.deepClone( pages.basePage );
            resolvedPage.name = 'basePage';
            resolvedPage.selfLink = 'http://assets/basePage.json';
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns a rejected promise for a page that does not exist', function() {
            loadExamplePage( 'iDontExist' );

            expect( rejectedSpy ).toHaveBeenCalledWithError(
               'Error loading page "iDontExist": ' +
               'Page could not be found at location "http://assets/iDontExist.json"'
            );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns the loaded page', function() {
            loadExamplePage( 'basePage' );

            expect( resolvedSpy ).toHaveBeenCalledWith( resolvedPage );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns the loaded page, even if a json suffix is used', function() {
            loadExamplePage( 'basePage.json' );

            expect( resolvedSpy ).toHaveBeenCalledWith( resolvedPage );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'generates widget ids where they are missing', function() {
            loadExamplePage( 'pageWithMissingWidgetIds' );

            var page = resolvedSpy.calls[0].args[0];
            expect( page.areas.area1[0].id ).toEqual( 'id1' );
            expect( page.areas.area1[1].id ).toEqual( 'widget2-id1' );
            expect( page.areas.area1[2].id ).toEqual( 'widget3-id0' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'detects duplicate widget ids in the same area', function() {
            loadExamplePage( 'pageWithDuplicateWidgetIdsInSameArea' );

            expect( rejectedSpy ).toHaveBeenCalledWithError(
               'Error loading page "pageWithDuplicateWidgetIdsInSameArea": Duplicate widget ID(s): id1'
            );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'detects duplicate widget ids in different areas', function() {
            loadExamplePage( 'pageWithDuplicateWidgetIdsInDifferentAreas' );

            expect( rejectedSpy ).toHaveBeenCalledWithError(
               'Error loading page "pageWithDuplicateWidgetIdsInDifferentAreas": ' +
               'Duplicate widget ID(s): id1, id2'
            );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'omits widgets that are disabled (#24)', function() {
            loadExamplePage( 'pageWithDisabledWidgets' );

            var page = resolvedSpy.calls[0].args[0];
            expect( page.areas.area1.length ).toEqual( 1 );
            expect( page.areas.area1[0].id ).toEqual( 'id2' );

            expect( page.areas.area2.length ).toEqual( 0 );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when a page extends another page', function() {

         it( 'returns the combined pages', function() {
            loadExamplePage( 'derivedPage' );

            var page = resolvedSpy.calls[0].args[0];
            expect( page.layout ).toEqual( 'someLayout' );
            expect( page.areas.area1[0] ).toEqual( { widget: 'someWidgetPath1', id: 'id1' } );
            expect( page.areas.area1[1] ).toEqual( { widget: 'someWidgetPath2', id: 'id2' } );
            expect( page.areas.area1[2] ).toEqual( { widget: 'someWidgetPath4', id: 'id4' } );
            expect( page.areas.area2[0] ).toEqual( { widget: 'someWidgetPath3', id: 'id3' } );
            expect( page.areas.area3[0] ).toEqual( { widget: 'someWidgetPath5', id: 'id5' } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns the combined pages, even if a json suffix is used', function() {
            loadExamplePage( 'derivedPageWithJsonSuffix' );

            var page = resolvedSpy.calls[0].args[0];
            expect( page.layout ).toEqual( 'someLayout' );
            expect( page.areas.area1[0] ).toEqual( { widget: 'someWidgetPath1', id: 'id1' } );
            expect( page.areas.area1[1] ).toEqual( { widget: 'someWidgetPath2', id: 'id2' } );
            expect( page.areas.area1[2] ).toEqual( { widget: 'someWidgetPath4', id: 'id4' } );
            expect( page.areas.area2[0] ).toEqual( { widget: 'someWidgetPath3', id: 'id3' } );
            expect( page.areas.area3[0] ).toEqual( { widget: 'someWidgetPath5', id: 'id5' } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'generates widget ids where they are missing', function() {
            loadExamplePage( 'pageWithMissingWidgetIdsAndInheritance' );

            var page = resolvedSpy.calls[0].args[0];
            expect( page.areas.area1.length ).toBe( 6 );
            expect( page.areas.area1[0].id ).toEqual( 'id1' );
            expect( page.areas.area1[1].id ).toEqual( 'widget2-id1' );
            expect( page.areas.area1[2].id ).toEqual( 'widget3-id0' );
            expect( page.areas.area1[3].id ).toEqual( 'id2' );
            expect( page.areas.area1[4].id ).toEqual( 'widget2-id3' );
            expect( page.areas.area1[5].id ).toEqual( 'widget3-id2' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'detects if both pages define a layout', function() {
            loadExamplePage( 'pageWithLayoutExtendingOtherPageWithLayout' );

            expect( rejectedSpy ).toHaveBeenCalledWithError(
               'Error loading page "pageWithLayoutExtendingOtherPageWithLayout": ' +
               'Page overwrites layout set by base page "pageWithLayout'
            );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'detects direct cycles during extension', function() {
            loadExamplePage( 'pageThatExtendsItself' );

            expect( rejectedSpy ).toHaveBeenCalledWithError(
               'Error loading page "pageThatExtendsItself": ' +
               'Cycle in page extension detected: pageThatExtendsItself -> pageThatExtendsItself'
            );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'detects indirect cycles during extension', function() {
            loadExamplePage( 'cyclicPage3' );

            expect( rejectedSpy ).toHaveBeenCalledWithError(
               'Error loading page "cyclicPage3": ' +
               'Cycle in page extension detected: cyclicPage3 -> cyclicPage2 -> cyclicPage1 -> cyclicPage3'
            );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'detects duplicate widget ids', function() {
            loadExamplePage( 'derivedPageWithDuplicateIds' );

            expect( rejectedSpy ).toHaveBeenCalledWithError(
               'Error loading page "derivedPageWithDuplicateIds": Duplicate widget ID(s): id1, id3'
            );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'correctly respects insertBeforeId in extending page', function() {
            loadExamplePage( 'derivedPageWithInsertBeforeId' );

            var page = resolvedSpy.calls[0].args[0];
            expect( page.areas.area1.length ).toBe( 3 );
            expect( page.areas.area1[0].id ).toEqual( 'id1' );
            expect( page.areas.area1[1].id ).toEqual( 'id4' );
            expect( page.areas.area1[2].id ).toEqual( 'id2' );

            expect( page.areas.area2.length ).toBe( 2 );
            expect( page.areas.area2[0].id ).toEqual( 'id5' );
            expect( page.areas.area2[1].id ).toEqual( 'id3' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'detects if no widget with id matching insertBeforeId exists', function() {
            loadExamplePage( 'derivedPageWithNonExistingInsertBeforeId' );

            expect( rejectedSpy ).toHaveBeenCalledWithError(
               'Error loading page "derivedPageWithNonExistingInsertBeforeId": ' +
               'No id found that matches insertBeforeId value "idXXX"'
            );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'extends is resolved relative to the extending page (at least in ATP33)', function() {
            loadExamplePage( 'category/page' );

            var page = resolvedSpy.calls[0].args[0];
            expect( page.areas.one ).toBeDefined();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'omits widgets that are disabled in the extended page (#24)', function() {
            loadExamplePage( 'pageWithDisabledWidgetsInExtendedPage' );

            var page = resolvedSpy.calls[0].args[0];
            expect( page.areas.area1.length ).toEqual( 1 );
            expect( page.areas.area1[0].id ).toEqual( 'id2' );

            expect( page.areas.area2.length ).toEqual( 1 );
            expect( page.areas.area2[0].id ).toEqual( 'id4' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when a page uses compositions', function() {

         it( 'loads simple compositions into the area it is used in, while prefixing all ids used within the composition', function() {
            loadExamplePage( 'pageWithSimpleComposition' );

            var page = resolvedSpy.calls[0].args[0];
            expect( page.areas.area1.length ).toBe( 5 );
            expect( page.areas.area1[0] ).toEqual( { widget: 'someWidgetPath1', id: 'id1' } );
            expect( page.areas.area1[1] ).toEqual( { widget: 'laxarjs/test_widget', id: 'simpleComposition-id0-idx1' } );
            expect( page.areas.area1[2] ).toEqual( { widget: 'laxarjs/test_widget2', id: 'testWidget2-id2' } );
            expect( page.areas.area1[3] ).toEqual( { widget: 'laxarjs/test_widget2', id: 'testWidget2-id1' } );
            expect( page.areas.area1[4] ).toEqual( { widget: 'someWidgetPath1', id: 'id2' } );

            expect( page.areas.area2.length ).toBe( 1 );
            expect( page.areas.area2[0] ).toEqual( { widget: 'someWidgetPath1', id: 'id3' } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'merges areas existing in the composition and the page', function() {
            loadExamplePage( 'pageWithCompositionWithAdditionalAreas' );

            var page = resolvedSpy.calls[0].args[0];
            expect( page.areas.area2.length ).toBe( 2 );
            expect( page.areas.area2[0] ).toEqual( { widget: 'someWidgetPath1', id: 'id3' } );
            expect( page.areas.area2[1] )
               .toEqual( { widget: 'laxarjs/test_widget2', id: 'compositionWithAdditionalAreas-id0-idx2' } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'adds additional areas of the composition to the page, while prefixing all widget-areas within the composition', function() {
            loadExamplePage( 'pageWithCompositionWithAdditionalAreas' );

            var page = resolvedSpy.calls[0].args[0];
            expect( page.areas['compositionWithAdditionalAreas-id0-idx2.content'].length ).toBe( 1 );
            expect( page.areas['compositionWithAdditionalAreas-id0-idx2.content'][0] )
               .toEqual( { widget: 'laxarjs/test_widget3', id: 'compositionWithAdditionalAreas-id0-idx3' } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'replaces feature expressions with provided features and overwritten defaults', function() {
            loadExamplePage( 'pageWithCompositionWithFeaturesOverwritingDefaults' );

            var page = resolvedSpy.calls[0].args[0];
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
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'replaces feature expressions with provided features and omitted defaults', function() {
            loadExamplePage( 'pageWithCompositionWithFeaturesOmittingDefaults' );

            var page = resolvedSpy.calls[0].args[0];
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
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'compositions within compositions are resolved', function() {
            loadExamplePage( 'pageWithCompositionWithEmbeddedComposition' );

            var page = resolvedSpy.calls[0].args[0];
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
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'merges configured features of type array with internal predefined items', function() {
            loadExamplePage( 'pageWithCompositionWithMergedFeatures' );

            var page = resolvedSpy.calls[0].args[0];
            expect( page.areas.area1[0].features ).toEqual( {
               close: {
                  onActions: [ 'closeIt', 'myComposition+internalClose', 'closeAgain', 'needMoreCloseActions' ]
               }
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'detects direct cycles in compositions', function() {
            loadExamplePage( 'pageWithCompositionWithDirectCycle' );

            expect( rejectedSpy ).toHaveBeenCalledWithError(
               'Error loading page "pageWithCompositionWithDirectCycle": ' +
               'Cycle in compositions detected: compositionWithDirectCycle -> compositionWithDirectCycle'
            );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'detects indirect cycles in compositions', function() {
            loadExamplePage( 'pageWithCompositionWithCycle' );

            expect( rejectedSpy ).toHaveBeenCalledWithError(
               'Error loading page "pageWithCompositionWithCycle": ' +
               'Cycle in compositions detected: compositionWithCycle -> compositionWithCycle2 -> compositionWithCycle'
            );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'escapes topics and ids generated from compositions in subfolder correctly', function() {
            loadExamplePage( 'pageWithCompositionInSubFolder' );

            var page = resolvedSpy.calls[0].args[0];
            var widget = page.areas.area1[0];
            expect( widget.id ).toEqual( 'compositionInSubfolder-id0-myWidget3' );
            expect( widget.features.xy.resource ).toEqual( 'compositionInSubfolder+id0+myResource' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'replaces replacements in keys for widget features', function() {
            loadExamplePage( 'pageWithCompositionWithReplacementsInKeys' );

            var page = resolvedSpy.calls[0].args[0];
            var widget1 = page.areas.area1[0];
            var widget2 = page.areas.area2[0];

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
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'allows generation of negated flags', function() {
            loadExamplePage( 'pageWithCompositionWithNegatedGeneratedFlagName' );

            var page = resolvedSpy.calls[0].args[0];
            var widget = page.areas.area1[0];

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
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'omits compositions that are disabled (#24)', function() {
            loadExamplePage( 'pageWithDisabledComposition' );

            var page = resolvedSpy.calls[0].args[0];
            expect( page.areas.area1.length ).toBe( 2 );
            expect( page.areas.area1[0] ).toEqual( { widget: 'someWidgetPath1', id: 'id1' } );
            expect( page.areas.area1[1] ).toEqual( { widget: 'someWidgetPath1', id: 'id2' } );

            expect( page.areas.area2.length ).toBe( 1 );
            expect( page.areas.area2[0] ).toEqual( { widget: 'someWidgetPath1', id: 'id3' } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'omits widgets that are disabled within compositions (#24)', function() {
            loadExamplePage( 'pageWithCompositionWithDisabledWidgets' );

            var page = resolvedSpy.calls[0].args[0];
            expect( page.areas.area1.length ).toBe( 3 );
            expect( page.areas.area1[0] ).toEqual( { widget: 'someWidgetPath1', id: 'id1' } );
            expect( page.areas.area1[1] ).toEqual( { widget: 'laxarjs/test_widget2', id: 'testWidget2-id1' } );
            expect( page.areas.area1[2] ).toEqual( { widget: 'someWidgetPath1', id: 'id2' } );

            expect( page.areas.area2.length ).toBe( 1 );
            expect( page.areas.area2[0] ).toEqual( { widget: 'someWidgetPath1', id: 'id3' } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'removes undefined values in widget features due to missing configuration of according composition feature (#29)', function() {
            loadExamplePage( 'pageWithFeaturesOfCompositionNotConfigured' );

            var page = resolvedSpy.calls[0].args[0];
            expect( Object.keys( page.areas.area1[0].features.anything ) ).toEqual( [] );
            expect( page.areas.area1[0].features.open.onActions ).toEqual( [] );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'does not transform null values of widget feature configuration inside of compositions (#28)', function() {
            loadExamplePage( 'pageWithCompositionWithNullFeatures' );

            var page = resolvedSpy.calls[0].args[0];
            expect( page.areas.area1[0].features.anything.resource ).toBe( null );
            expect( page.areas.area1[0].features.open.onActions[0] ).toBe( null );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'throws an error for duplicate composition ids (#30)', function() {
            loadExamplePage( 'pageWithDuplicateIdForCompositions' );

            expect( rejectedSpy ).toHaveBeenCalledWithError(
               'Error loading page "pageWithDuplicateIdForCompositions": Duplicate composition ID(s): broken'
            );
         } );

         it( 'accepts compositions without "." entry', function () {
            loadExamplePage( 'pageWithDotlessComposition' );
            expect( resolvedSpy ).toHaveBeenCalled();
            var page = resolvedSpy.calls[0].args[0];

            // expect that console has no compositions
            object.forEach( page.areas, function( area ) {
               object.forEach( area, function( pageItem ) {
                  expect( pageItem.composition ).toBeUndefined();
               } );
            } );
         } );

         it( 'accepts insertBeforeId in compositions', function () {
            loadExamplePage( 'pageWithCompositionWithInsertBeforeId' );
            expect( resolvedSpy ).toHaveBeenCalled();
            var page = resolvedSpy.calls[0].args[0];
            var testArea = page.areas.test;
            expect( testArea.length ).toBe( 2 );
            expect( testArea[0].widget.indexOf( 'before' ) === 0 ).toBeTruthy();
            expect( testArea[1].widget.indexOf( 'after' ) === 0 ).toBeTruthy();
         } );

         it( 'resolves ids correctly', function () {
            loadExamplePage( 'pageWithBrokenCompositionWithInsertBeforeId' );

            expect( resolvedSpy ).toHaveBeenCalled();
            var area = resolvedSpy.calls[0].args[0].areas.test;

            expect( area.length ).toBe(4);
            expect( area[0].widget ).toBe( 'before' );
            expect( area[1].widget ).toBe( 'after' );
            expect( area[2].widget ).toBe( 'before2' );
            expect( area[3].widget ).toBe( 'after2' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when loading an invalid page', function() {

         it( 'an exception leading to a rejected promise is thrown', function() {
            loadExamplePage( 'invalidPage' );

            expect( rejectedSpy ).toHaveBeenCalled();
            expect( rejectedSpy.calls[0].args[0].message ).toEqual(
               'Error loading page "invalidPage": Schema validation failed: ' +
               '\n - String does not match pattern: ^[a-z][a-zA-Z0-9_]*$. Path: "$.areas.testArea[0].id".' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function loadExamplePage( pageName ) {
         var p = pageLoader.loadPage( pageName );
         p.then( resolvedSpy, rejectedSpy );
         jasmine.Clock.tick( 0 );
         return p;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function addMatchers( self ) {
         self.addMatchers( {
            toHaveBeenCalledWithError: function( expectedMessage ) {
               if( !this.actual.isSpy ) {
                  this.message = function () {
                     return 'Need a spy object.';
                  };
                  return false;
               }

               if( !this.actual.calls.length ) {
                  this.message = function () {
                     return 'Expected spy ' + this.actual.name +
                        ' to have been called with an error with message "' + expectedMessage +
                        '" but it has never been called';
                  };
                  return false;
               }

               var callMessages = [];
               var correctCalls = this.actual.calls.filter( function( call ) {
                  callMessages.push( '[ "' + call.args.join( '", "' ) + '" ]' );
                  var arg = call.args[0];
                  return call.args.length === 1 && arg instanceof Error && arg.message === expectedMessage;
               }, null );

               this.message = function () {
                  return 'Expected spy ' + this.actual.name +
                     ' to have been called with an error with message "' + expectedMessage +
                     '" but it was called with: [ ' + callMessages.join( ', ' ) + ' ]';
               };
               return correctCalls.length > 0;
            }
         } );
      }

   } );

} );
