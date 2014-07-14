/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../page_loader',
   'q_mock',
   '../../../testing/http_mock',
   '../../../utilities/object',
   './data/pages',
   './data/mixins',
   './data/pages_with_compositions',
   './data/compositions'
], function( pageLoaderModule, q, httpMock, object, pages, mixins, pagesWithCompositions, compositions ) {
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

         [ pages, pagesWithCompositions, compositions, mixins ].forEach( function( asset ) {
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
               'Page "iDontExist" could not be found at location "http://assets/iDontExist.json".'
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
            expect( page.areas.area1[1].id ).toEqual( 'widget2__id0' );
            expect( page.areas.area1[2].id ).toEqual( 'widget3__id1' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'detects duplicate widget ids in the same area', function() {
            loadExamplePage( 'pageWithDuplicateWidgetIdsInSameArea' );

            expect( rejectedSpy ).toHaveBeenCalledWithError(
               'Duplicate widget ID(s) in page "pageWithDuplicateWidgetIdsInSameArea": id1.'
            );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'detects duplicate widget ids in different areas', function() {
            loadExamplePage( 'pageWithDuplicateWidgetIdsInDifferentAreas' );

            expect( rejectedSpy ).toHaveBeenCalledWithError(
               'Duplicate widget ID(s) in page "pageWithDuplicateWidgetIdsInDifferentAreas": id1, id2.'
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
            expect( page.areas.area1[1].id ).toEqual( 'widget2__id0' );
            expect( page.areas.area1[2].id ).toEqual( 'widget3__id1' );
            expect( page.areas.area1[3].id ).toEqual( 'id2' );
            expect( page.areas.area1[4].id ).toEqual( 'widget2__id2' );
            expect( page.areas.area1[5].id ).toEqual( 'widget3__id3' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'detects if both pages define a layout', function() {
            loadExamplePage( 'pageWithLayoutExtendingOtherPageWithLayout' );

            expect( rejectedSpy ).toHaveBeenCalledWithError(
               'Page "pageWithLayoutExtendingOtherPageWithLayout" overwrites layout set by page "pageWithLayout".'
            );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'detects direct cycles during extension', function() {
            loadExamplePage( 'pageThatExtendsItself' );

            expect( rejectedSpy ).toHaveBeenCalledWithError(
               'Cycle in page extension detected: pageThatExtendsItself -> pageThatExtendsItself.'
            );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'detects indirect cycles during extension', function() {
            loadExamplePage( 'cyclicPage3' );

            expect( rejectedSpy ).toHaveBeenCalledWithError(
               'Cycle in page extension detected: cyclicPage3 -> cyclicPage2 -> cyclicPage1 -> cyclicPage3.'
            );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'detects duplicate widget ids', function() {
            loadExamplePage( 'derivedPageWithDuplicateIds' );

            expect( rejectedSpy ).toHaveBeenCalledWithError(
               'Duplicate widget ID(s) in page "derivedPageWithDuplicateIds": id1, id3.'
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
               'No id found that matches insertBeforeId value "idXXX" in page "derivedPageWithNonExistingInsertBeforeId".'
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

      describe( 'when a page uses mixins', function() {

         it( 'loads the mixin into the according page, supporting id generation', function() {
            loadExamplePage( 'pageWithMixins' );

            var page = resolvedSpy.calls[0].args[0];
            expect( page.areas.area1.length ).toBe( 3 );
            expect( page.areas.area1[0] ).toEqual( { widget: 'someWidgetPath1', id: 'id1' } );
            expect( page.areas.area1[1] ).toEqual( { widget: 'some_widget1', id: 'someWidgetId1' } );
            expect( page.areas.area1[2] ).toEqual( { widget: 'some_widget2', id: 'some_widget2__id0' } );

            expect( page.areas.area2.length ).toBe( 2 );
            expect( page.areas.area2[0] ).toEqual( { widget: 'mixin2/some_widget1', id: 'mixin2WidgetId1' } );
            expect( page.areas.area2[1] ).toEqual( { widget: 'mixin2/some_widget2', id: 'some_widget2__id1' } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'supports inheritance and insertBeforeId', function() {
            loadExamplePage( 'derivedPageWithMixinsAndInsertBeforeId' );

            var page = resolvedSpy.calls[0].args[0];
            expect( page.areas.area1.length ).toBe( 5 );
            expect( page.areas.area1[0] ).toEqual( { widget: 'some_widget1', id: 'someWidgetId1' } );
            expect( page.areas.area1[1] ).toEqual( { widget: 'some_widget2', id: 'some_widget2__id0' } );
            expect( page.areas.area1[2] ).toEqual( { widget: 'someWidgetPath1', id: 'id1' } );
            expect( page.areas.area1[3] ).toEqual( { widget: 'mixin2/some_widget1', id: 'mixin2WidgetId1' } );
            expect( page.areas.area1[4] ).toEqual( { widget: 'mixin2/some_widget2', id: 'some_widget2__id1' } );
            expect( page.areas.area2.length ).toBe( 0 );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'omits mixins that are disabled (#24)', function() {
            loadExamplePage( 'pageWithDisabledMixin' );

            var page = resolvedSpy.calls[0].args[0];
            expect( page.areas.area1.length ).toBe( 1 );
            expect( page.areas.area1[0] ).toEqual( { widget: 'someWidgetPath1', id: 'id1' } );

            expect( page.areas.area2.length ).toBe( 1 );
            expect( page.areas.area2[0] ).toEqual( { widget: 'someWidgetPath3', id: 'id3' } );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when a page uses compositions', function() {

         it( 'loads simple compositions into the area it is used in, while prefixing all ids used within the composition', function() {
            loadExamplePage( 'pageWithSimpleComposition' );

            var page = resolvedSpy.calls[0].args[0];
            expect( page.areas.area1.length ).toBe( 5 );
            expect( page.areas.area1[0] ).toEqual( { widget: 'someWidgetPath1', id: 'id1' } );
            expect( page.areas.area1[1] ).toEqual( { widget: 'portal/test_widget', id: 'simpleComposition__id0__idx1' } );
            expect( page.areas.area1[2] ).toEqual( { widget: 'portal/test_widget2', id: 'test_widget2__id1' } );
            expect( page.areas.area1[3] ).toEqual( { widget: 'portal/test_widget2', id: 'test_widget2__id2' } );
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
               .toEqual( { widget: 'portal/test_widget2', id: 'compositionWithAdditionalAreas__id0__idx2' } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'adds additional areas of the composition to the page, while prefixing all widget-areas within the composition', function() {
            loadExamplePage( 'pageWithCompositionWithAdditionalAreas' );

            var page = resolvedSpy.calls[0].args[0];
            expect( page.areas['compositionWithAdditionalAreas__id0__idx2.content'].length ).toBe( 1 );
            expect( page.areas['compositionWithAdditionalAreas__id0__idx2.content'][0] )
               .toEqual( { widget: 'portal/test_widget3', id: 'compositionWithAdditionalAreas__id0__idx3' } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'replaces feature expressions with provided features and overwritten defaults', function() {
            loadExamplePage( 'pageWithCompositionWithFeaturesOverwritingDefaults' );

            var page = resolvedSpy.calls[0].args[0];
            expect( page.areas.area1.length ).toBe( 1 );
            expect( page.areas.area1[0] ).toEqual( {
               widget: 'portal/test_widget1',
               id: 'compositionWithFeaturesDefined__id0__idx1',
               features: {
                  open: { onActions: [ 'openAction' ] },
                  close: { onActions: [ 'close', 'cancelAction' ] }
               }
            } );

            expect( page.areas.areaX.length ).toBe( 1 );
            expect( page.areas.areaX[0] ).toEqual( {
               widget: 'portal/test_widget2',
               id: 'test_widget2__id1',
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
               widget: 'portal/test_widget1',
               id: 'compositionWithFeaturesDefined__id0__idx1',
               features: {
                  open: { onActions: [ 'openAction' ] },
                  close: { onActions: [ 'close', 'cancelAction' ] }
               }
            } );

            expect( page.areas.areaX.length ).toBe( 1 );
            expect( page.areas.areaX[0] ).toEqual( {
               widget: 'portal/test_widget2',
               id: 'test_widget2__id1',
               features: {
                  importantFeature: {
                     resource: 'compositionWithFeaturesDefinedId0MyResource',
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
               widget: 'portal/test_widget1',
               id: 'compositionWithEmbeddedComposition__id0__myComposition__idx1',
               features: {
                  open: { onActions: [ 'openAction' ] },
                  close: { onActions: [ 'shutdownAction' ] }
               }
            } );
            expect( page.areas.area1[1] ).toEqual( {
               widget: 'portal/test_widget2',
               id: 'test_widget2__id1'
            } );

            expect( page.areas.areaX.length ).toBe( 1 );
            expect( page.areas.areaX[0] ).toEqual( {
               widget: 'portal/test_widget2',
               id: 'test_widget2__id2',
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
                  onActions: [ 'closeIt', 'myCompositionInternalClose', 'closeAgain', 'needMoreCloseActions' ]
               }
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'detects direct cycles in compositions', function() {
            loadExamplePage( 'pageWithCompositionWithDirectCycle' );

            expect( rejectedSpy ).toHaveBeenCalledWithError(
               'Cycle in compositions detected: compositionWithDirectCycle -> compositionWithDirectCycle.'
            );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'detects indirect cycles in compositions', function() {
            loadExamplePage( 'pageWithCompositionWithCycle' );

            expect( rejectedSpy ).toHaveBeenCalledWithError(
               'Cycle in compositions detected: compositionWithCycle -> compositionWithCycle2 -> compositionWithCycle.'
            );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'escapes topics and ids generated from compositions in subfolder correctly (jira ATP-7919)', function() {
            loadExamplePage( 'pageWithCompositionInSubFolder' );

            var page = resolvedSpy.calls[0].args[0];
            var widget = page.areas.area1[0];
            expect( widget.id ).toEqual( 'composition_in_subfolder__id0__myWidget3' );
            expect( widget.features.xy.resource ).toEqual( 'compositionInSubfolderId0MyResource' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'replaces replacements in keys for widget features (jira ATP-7959)', function() {
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
                  myCompositionApplyAction: [ 'first', 'myCompositionSecond' ]
               }
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'allows generation of negated flags (jira ATP-8000)', function() {
            loadExamplePage( 'pageWithCompositionWithNegatedGeneratedFlagName' );

            var page = resolvedSpy.calls[0].args[0];
            var widget = page.areas.area1[0];

            expect( widget.features ).toEqual( {
               buttons: [
                  {
                     action: 'one',
                     hideOn: [ 'myCompositionHoldingsShowing' ]
                  },
                  {
                     action: 'two',
                     hideOn: [ '!myCompositionHoldingsShowing' ]
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
            expect( page.areas.area1[1] ).toEqual( { widget: 'portal/test_widget2', id: 'test_widget2__id1' } );
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
               'Duplicate composition ID(s) in page "pageWithDuplicateIdForCompositions": broken.'
            );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when loading an invalid page', function() {

         it( 'an exception leading to a rejected promise is thrown (jira ATP-7955)', function() {
            loadExamplePage( 'invalidPage' );

            expect( rejectedSpy ).toHaveBeenCalled();
            expect( rejectedSpy.calls[0].args[0].message )
               .toEqual( 'Schema validation of page "invalidPage" failed: ' +
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
