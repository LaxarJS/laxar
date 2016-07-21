/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import { create as createPageService } from '../page_service';
import { create as createEventBusMock } from '../../testing/event_bus_mock';
import { createCollectors as createCollectorsMock } from '../../testing/tooling_mock';
import pageData from './data/page_data';


describe( 'A page service instance', () => {

   let pageService;
   let eventBusMock;
   let pageLoaderMock;
   let layoutLoaderMock;
   let widgetLoaderMock;
   let localeManagerMock;
   let visibilityManagerMock;
   let pagesCollectorMock;
   let createdAdapterWrappers;

   beforeEach( () => {
      eventBusMock = createEventBusMock( f => { window.setTimeout( f, 0 ); } );

      pageLoaderMock = jasmine.createSpyObj( 'pageLoader', [ 'load' ] );
      pageLoaderMock.load.and.returnValue( Promise.resolve( pageData.page ) );

      layoutLoaderMock = jasmine.createSpyObj( 'layoutLoader', [ 'load' ] );
      layoutLoaderMock.load.and.returnValue( Promise.resolve( pageData.layout ) );

      widgetLoaderMock = jasmine.createSpyObj( 'widgetLoader', [ 'load' ] );
      createdAdapterWrappers = [];
      widgetLoaderMock.load.and.callFake( conf => {
         createdAdapterWrappers.push( {
            id: conf.id,
            adapter: jasmine.createSpyObj(
               'dummyWidgetAdapter', [ 'destroy', 'domAttachTo' ]
            ),
            destroy: jasmine.createSpy( 'adapter.destroy' ),
            templatePromise: Promise.resolve( '' )
         } );
         return Promise.resolve( createdAdapterWrappers[ createdAdapterWrappers.length - 1 ] );
      } );
      localeManagerMock =
         jasmine.createSpyObj( 'localeManager', [ 'initialize', 'subscribe', 'unsubscribe' ] );
      visibilityManagerMock =
         jasmine.createSpyObj( 'visibilityManager', [ 'initialize', 'setAreaHelper', 'unsubscribe' ] );
      pagesCollectorMock = createCollectorsMock().pages;

      pageService = createPageService(
         eventBusMock,
         pageLoaderMock,
         layoutLoaderMock,
         widgetLoaderMock,
         localeManagerMock,
         visibilityManagerMock,
         pagesCollectorMock
      );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'throws when initializing with non DOM element', () => {
      expect( () => pageService.createControllerFor( {} ) )
         .toThrow( new Error(
            'Assertion error: State does not hold. ' +
            'Details: A page controller can only be created for a valid DOM element.'
         ) );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'throws when initialized more than once', () => {
      expect( () => pageService.createControllerFor( document.createElement( 'DIV' ) ) ).not.toThrow();
      expect( () => pageService.createControllerFor( document.createElement( 'DIV' ) ) )
         .toThrow( new Error(
            'Assertion error: State does not hold. ' +
            'Details: Cannot create a page controller more than once.'
         ) );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   it( 'returns the controller after creation', () => {
      const controller = pageService.createControllerFor( document.createElement( 'DIV' ) );
      expect( controller.setupPage ).toBeDefined();
      expect( controller.tearDownPage ).toBeDefined();
      expect( pageService.controller() ).toBe( controller );
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'provides a page controller that', () => {

      const EVENT_OPTIONS = { sender: 'AxPageController' };
      let pageElement;
      let pageController;

      beforeEach( () => {
         pageElement = document.createElement( 'DIV' );
         pageElement.innerHTML = '<span>hello there</span>';
         pageController = pageService.createControllerFor( pageElement );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'that initially clears its page element', () => {
         expect( pageElement.children.length ).toBe( 0 );
         expect( pageElement.innerHTML ).toEqual( '' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'throws if asked to setup a page with wrong argument', () => {
         expect( () => pageController.setupPage() ).toThrow();
         expect( () => pageController.setupPage( {} ) ).toThrow();
         expect( () => pageController.setupPage( true ) ).toThrow();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when asked to setup a page', () => {

         let areaHelper;
         let areaDeregisterMock;

         beforeEach( done => {
            areaDeregisterMock = jasmine.createSpy( 'area.deregister' );
            visibilityManagerMock.setAreaHelper.and.callFake( _ => {
               areaHelper = _;
               spyOn( areaHelper, 'attachWidgets' ).and.callThrough();
               const origRegister = areaHelper.register;
               spyOn( areaHelper, 'register' ).and.callFake( (...args) => {
                  origRegister.apply( areaHelper, args );
                  return areaDeregisterMock;
               } );
            } );
            pageController.setupPage( 'editor' ).then( done, done.fail );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'requests loading of the page', () => {
            expect( pageLoaderMock.load ).toHaveBeenCalledWith( 'editor' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'provides the visibility manager with an area helper instance for the page', () => {
            expect( visibilityManagerMock.setAreaHelper ).toHaveBeenCalledWith( areaHelper );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'requests loading of the layout', () => {
            expect( layoutLoaderMock.load ).toHaveBeenCalledWith( pageData.page.layout );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'lets the locale manager subscribe to changeLocaleRequest events', () => {
            expect( localeManagerMock.subscribe ).toHaveBeenCalled();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'requests loading of all widgets', () => {
            expect( widgetLoaderMock.load )
               .toHaveBeenCalledWith( { area: 'testArea1', id: 'id1', widget: 'someWidgetRef1' } );
            expect( widgetLoaderMock.load )
               .toHaveBeenCalledWith( { area: 'testArea2', id: 'id3', widget: 'someWidgetRef2' } );
            expect( widgetLoaderMock.load )
               .toHaveBeenCalledWith( { area: 'nestedLayout.content', id: 'id4', widget: 'someWidgetRef3' } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'creates a layout widget adapter for nested layouts', () => {
            // Cannot test if createLayoutWidgetAdapter was called ...
            expect( layoutLoaderMock.load ).toHaveBeenCalledWith( pageData.page.areas.testArea1[ 1 ].layout );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'lets the locale manager publish initial events', () => {
            expect( localeManagerMock.initialize ).toHaveBeenCalled();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'announces the begin of the lifecycle for the current page', () => {
            expect( eventBusMock.publishAndGatherReplies ).toHaveBeenCalledWith(
               'beginLifecycleRequest.default', { lifecycleId: 'default' }, EVENT_OPTIONS
            );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'asks the visibility manager to initialize itself', () => {
            expect( visibilityManagerMock.initialize ).toHaveBeenCalled();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'renders the layout for the page', () => {
            const [ layoutNode ] = Array.from( pageElement.childNodes );
            expect( layoutNode.nodeName.toLowerCase() ).toEqual( 'section' );

            const [ firstArea, secondArea, popupsArea ] = Array.from( layoutNode.childNodes );
            expect( firstArea.nodeName.toLowerCase() ).toEqual( 'div' );
            expect( firstArea.getAttribute( 'ax-widget-area' ) ).toEqual( 'testArea1' );
            expect( secondArea.nodeName.toLowerCase() ).toEqual( 'div' );
            expect( secondArea.getAttribute( 'ax-widget-area' ) ).toEqual( 'testArea2' );
            expect( popupsArea.nodeName.toLowerCase() ).toEqual( 'div' );
            expect( popupsArea.getAttribute( 'ax-widget-area' ) ).toEqual( 'popups' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'sets the css class for the layout on the page element', () => {
            expect( pageElement.className ).toEqual( pageData.layout.className );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'automatically adds only missing default widget areas', () => {
            const [ , activitiesArea, popoversArea, empty ] = Array.from( pageElement.childNodes );

            expect( activitiesArea.nodeName.toLowerCase() ).toEqual( 'div' );
            expect( activitiesArea.getAttribute( 'ax-widget-area' ) ).toEqual( 'activities' );
            expect( activitiesArea.style.display ).toEqual( 'none' );
            expect( popoversArea.nodeName.toLowerCase() ).toEqual( 'div' );
            expect( popoversArea.getAttribute( 'ax-widget-area' ) ).toEqual( 'popovers' );
            expect( empty ).not.toBeDefined();

            expect( areaHelper.register ).toHaveBeenCalledWith( 'activities', activitiesArea );
            expect( areaHelper.register ).toHaveBeenCalledWith( 'popovers', popoversArea );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'asks the area helper to attach all widgets to the DOM', () => {
            expect( areaHelper.attachWidgets ).toHaveBeenCalledWith( [
               createdAdapterWrappers[ 0 ],
               jasmine.any( Object ), // the layout widget adapter wrapper created internally
               createdAdapterWrappers[ 1 ],
               createdAdapterWrappers[ 2 ]
            ] );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'when asked to tear the page down again', () => {

            beforeEach( done => {
               pageController.tearDownPage().then( done, done.fail );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'tells the visibility manager to unsubscribe from visibility events', () => {
               expect( visibilityManagerMock.unsubscribe ).toHaveBeenCalled();
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'tells the locale manager to unsubscribe from locale events', () => {
               expect( localeManagerMock.unsubscribe ).toHaveBeenCalled();
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'announces the end of the lifecycle for the current page', () => {
               expect( eventBusMock.publishAndGatherReplies ).toHaveBeenCalledWith(
                  'endLifecycleRequest.default', { lifecycleId: 'default' }, EVENT_OPTIONS
               );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'tells all active widget adapter wrappers to destroy their state', () => {
               expect( createdAdapterWrappers[ 0 ].destroy ).toHaveBeenCalled();
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'calls all deregister functions returned by the area helper', () => {
               // all areas except the one in the nested layout which we mocked away
               expect( areaDeregisterMock.calls.count() ).toBe( 5 );
            } );

         } );

      } );

   } );

} );
