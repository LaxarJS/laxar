define( [
   'json!../widget.json',
   'laxar-testing',
   'angular-mocks'
], function( descriptor, testing, ngMocks ) {
   'use strict';

   describe( 'An ExampleWidget', function() {

      var $httpBackend;
      var widgetDom;

      // 2. Test Setup
      beforeEach( testing.createSetupForWidget( descriptor, {
         knownMissingResources: [ 'ax-i18n-control.css' ]
      } ) );

      // 3. Widget Configuration
      beforeEach( function() {
         testing.widget.configure( {
            example: {
               resource: 'exampleResource',
               action: 'exampleAction'
            }
         } );
      } );

      // 4. Loading the Widget
      beforeEach( testing.widget.load );

      beforeEach( function() {
         // 5. Optional: Rendering the Widget DOM
         widgetDom = testing.widget.render();

         // 6. Optional: Mocking an AngularJS Injection
         ngMocks.inject( function( $injector ) {
            $httpBackend = $injector.get( '$httpBackend' );
         } );

         // 7.  Optional: Simulating Startup Events
         testing.triggerStartupEvents();
      } );

      // 8. Tests
      it( 'subscribes to didReplace events for the search resource', function() {
         expect( testing.widget.axEventBus.subscribe )
            .toHaveBeenCalledWith( 'didReplace.exampleResource', jasmine.any( Function ) );
      } );

      // 9. Test Tear-Down
      afterEach( testing.tearDown );

   } );

} );