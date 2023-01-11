define( [
   'json!../widget.json',
   'laxar-mocks',
   'angular-mocks'
], function( descriptor, axMocks, ngMocks ) {
   'use strict';

   describe( 'An ExampleWidget', function() {

      var $httpBackend;
      var widgetDom;

      // 2. Test Setup
      beforeEach( axMocks.createSetupForWidget( descriptor, {
         knownMissingResources: [ 'ax-i18n-control.css' ]
      } ) );

      // 3. Widget Configuration
      beforeEach( function() {
         axMocks.widget.configure( {
            example: {
               resource: 'exampleResource',
               action: 'exampleAction'
            }
         } );
      } );

      // 4. Loading the Widget
      beforeEach( axMocks.widget.load );

      beforeEach( function() {
         // 5. Optional: Rendering the Widget DOM
         widgetDom = axMocks.widget.render();

         // 6. Optional: Mocking an AngularJS Injection
         ngMocks.inject( function( $injector ) {
            $httpBackend = $injector.get( '$httpBackend' );
         } );

         // 7.  Optional: Simulating Startup Events
         axMocks.triggerStartupEvents();
      } );

      // 8. Tests
      it( 'subscribes to didReplace events for the search resource', function() {
         expect( axMocks.widget.axEventBus.subscribe )
            .toHaveBeenCalledWith( 'didReplace.exampleResource', jasmine.any( Function ) );
      } );

      // 9. Test Tear-Down
      afterEach( axMocks.tearDown );

   } );

} );