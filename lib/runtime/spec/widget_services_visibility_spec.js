import { create as createWidgetServicesVisibility } from '../widget_services_visibility';
import { create as createWidgetServicesAreaHelperMock } from '../../testing/widget_services_area_helper_mock';
import { create as createEventBusMock } from '../../testing/event_bus_mock';

describe( 'axVisibility', () => {

   let axVisibility;
   let eventBus;
   let context;
   let areaHelper;

   describe( 'created with dependencies', () => {

      beforeEach( () => {
         eventBus = createEventBusMock();
         context = {
            widget: {
               id: 'myWidget',
               area: 'containerArea'
            },
            eventBus
         };
         areaHelper = createWidgetServicesAreaHelperMock( context );
         axVisibility = createWidgetServicesVisibility( context, areaHelper );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides a method directly query widget visibility', () => {
         expect( axVisibility.isVisible ).toBeDefined();
         expect( axVisibility.isVisible() ).toBe( false );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when underlying visibility state has changed', () => {

         beforeEach( () => {
            areaHelper.isVisible = () => true;
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'provides the updated widget visibility upon request, even if events are not observed', () => {
            expect( axVisibility.isVisible() ).toBe( true );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides methods to observe widget visibility', () => {
         expect( axVisibility.onShow ).toBeDefined();
         expect( axVisibility.onHide ).toBeDefined();
         expect( axVisibility.onChange ).toBeDefined();
         expect( axVisibility.track ).toBeDefined();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides methods to control area visibility', () => {
         expect( axVisibility.updateAreaVisibility ).toBeDefined();
         expect( axVisibility.updateWidgetVisibility ).toBeDefined();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'provides methods to unsubscribe from view changes', () => {
         expect( axVisibility.unsubscribe ).toBeDefined();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'does not immediately subscribe to visibility changes', () => {
         expect( eventBus.subscribe ).not.toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'asked to track widget visibility on the context', () => {

         beforeEach( () => {
            axVisibility.track();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'sets the initial value of `context.isVisible` to false', () => {
            expect( context.isVisible ).toBeDefined();
            expect( context.isVisible ).toBe( false );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'subscribes to visibility changes', () => {
            expect( eventBus.subscribe ).toHaveBeenCalledWith(
               'didChangeAreaVisibility.containerArea',
               jasmine.any( Function )
            );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'when a visibility state was received through an event', () => {

            beforeEach( () => {
               eventBus.publish( 'didChangeAreaVisibility.containerArea.true', {
                  area: 'containerArea',
                  visible: true
               } );
               eventBus.flush();
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'updates the tracker property `isVisible`', () => {
               expect( context.isVisible ).toBe( true );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            describe( 'when another event is received', () => {

               beforeEach( () => {
                  eventBus.publish( 'didChangeAreaVisibility.containerArea.false', {
                     area: 'containerArea',
                     visible: false
                  } );
                  eventBus.flush();
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'updates `isVisible` again', () => {
                  expect( context.isVisible ).toBe( false );
               } );

            } );

         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'asked to track widget visibility under a custom name', () => {

         beforeEach( () => {
            axVisibility.track( 'showing' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'uses that name for the tracking property', () => {
            expect( context.showing ).toBeDefined();
            expect( context.showing ).toBe( false );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'when a visibility state was received through an event', () => {

            beforeEach( () => {
               eventBus.publish( 'didChangeAreaVisibility.containerArea.true', {
                  area: 'containerArea',
                  visible: true
               } );
               eventBus.flush();
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'updates the custom tracker property', () => {
               expect( context.showing ).toBeDefined();
               expect( context.showing ).toBe( true );
            } );

         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'asked to notify a callback on show', () => {

         let showSpy;

         beforeEach( () => {
            showSpy = jasmine.createSpy();
            axVisibility.onShow( showSpy );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'subscribes to visibility changes', () => {
            expect( eventBus.subscribe ).toHaveBeenCalledWith(
               'didChangeAreaVisibility.containerArea',
               jasmine.any( Function )
            );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'when a new visibility state was received through an event', () => {

            beforeEach( () => {
               eventBus.publish( 'didChangeAreaVisibility.containerArea.true', {
                  area: 'containerArea',
                  visible: true
               } );
               eventBus.flush();
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'runs the callback', () => {
               expect( showSpy ).toHaveBeenCalledWith( true );
            } );

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'when the same visibility state was received through an event', () => {

            beforeEach( () => {
               eventBus.publish( 'didChangeAreaVisibility.containerArea.false', {
                  area: 'containerArea',
                  visible: false
               } );
               eventBus.flush();
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'does not run the callback', () => {
               expect( showSpy ).not.toHaveBeenCalled();
            } );

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'when the callback was unsubscribed, and a new visibility state was published', () => {

            beforeEach( () => {
               axVisibility.unsubscribe( showSpy );
               eventBus.publish( 'didChangeAreaVisibility.containerArea.true', {
                  area: 'containerArea',
                  visible: true
               } );
               eventBus.flush();
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'does not run the callback', () => {
               expect( showSpy ).not.toHaveBeenCalled();
            } );

         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'asked to notify a callback on hide and on change', () => {

         let spy;

         beforeEach( () => {
            spy = jasmine.createSpy();
            axVisibility.onHide( spy );
            axVisibility.onChange( spy );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'subscribes to visibility changes', () => {
            expect( eventBus.subscribe ).toHaveBeenCalledWith(
               'didChangeAreaVisibility.containerArea',
               jasmine.any( Function )
            );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'when the widget is shown through an event', () => {

            beforeEach( () => {
               eventBus.publish( 'didChangeAreaVisibility.containerArea.true', {
                  area: 'containerArea',
                  visible: true
               } );
               eventBus.flush();
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'runs the callback once', () => {
               expect( spy ).toHaveBeenCalledWith( true );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            describe( 'and then hidden through an event', () => {

               beforeEach( () => {
                  spy.calls.reset();
                  eventBus.publish( 'didChangeAreaVisibility.containerArea.false', {
                     area: 'containerArea',
                     visible: false
                  } );
                  eventBus.flush();
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'runs the callback twice', () => {
                  expect( spy.calls.count() ).toEqual( 2 );
                  expect( spy.calls.argsFor( 0 ) ).toEqual( [ false ] );
                  expect( spy.calls.argsFor( 1 ) ).toEqual( [ false ] );
               } );

            } );

         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'asked to update area visibility', () => {

         beforeEach( () => {
            axVisibility.updateAreaVisibility( {
               areaA: true,
               areaB: false
            } );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'publishes a change-request for modified area on the event bus, adding the prefix', () => {
            expect( eventBus.publish ).toHaveBeenCalledWith(
               'changeAreaVisibilityRequest.myWidget.areaA.true',
               { area: 'myWidget.areaA', visible: true },
               jasmine.any( Object )
            );
            expect( eventBus.publish ).toHaveBeenCalledWith(
               'changeAreaVisibilityRequest.myWidget.areaB.false',
               jasmine.any( Object ),
               jasmine.any( Object )
            );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'subscribes to area visibility requests for any widget areas', () => {
            expect( eventBus.subscribe ).toHaveBeenCalledWith(
               'changeAreaVisibilityRequest.myWidget',
               jasmine.any( Function )
            );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'asked to update area visibility again', () => {

            beforeEach( () => {
               eventBus.publish.calls.reset();
               eventBus.subscribe.calls.reset();
               axVisibility.updateAreaVisibility( {
                  areaA: true,
                  areaB: true
               } );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'publishes a change-request for modified area on the event bus, adding the prefix', () => {
               expect( eventBus.publish ).toHaveBeenCalledWith(
                  'changeAreaVisibilityRequest.myWidget.areaB.true',
                  { area: 'myWidget.areaB', visible: true },
                  jasmine.any( Object )
               );
               expect( eventBus.publish ).not.toHaveBeenCalledWith(
                  'changeAreaVisibilityRequest.myWidget.areaA.true',
                  jasmine.any( Object ),
                  jasmine.any( Object )
               );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'does not subscribe to area visibility requests again', () => {
               expect( eventBus.subscribe ).not.toHaveBeenCalledWith(
                  'changeAreaVisibilityRequest.myWidget',
                  jasmine.any( Function )
               );
            } );

         } );

      } );

   } );

} );
