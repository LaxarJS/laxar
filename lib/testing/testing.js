/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   './http_mock',
   './jquery_mock',
   './matchers',
   './portal_mocks',
   './portal_mocks_angular',
   'q_mock',
   './run_spec'
], function( httpMock, jQueryMock, matchers, portalMocks, portalMocksAngular, qMock, runWidgetSpec ) {
   'use strict';

   return {
      httpMock: httpMock,
      jQueryMock: jQueryMock,
      matchers: matchers,
      portalMocks: portalMocks,
      portalMocksAngular: portalMocksAngular,
      qMock: qMock,
      runSpec: runWidgetSpec
   };

} );