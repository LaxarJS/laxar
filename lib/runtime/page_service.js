/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

export function create() {

   let pageController;

   return {
      controller: function() {
         return pageController;
      },
      registerPageController: function( controller ) {
         pageController = controller;
         return function() {
            pageController = null;
         };
      },
      controllerForScope: function( /* scope */ ) {
         return pageController;
      }
   };

}

export function createPageController( pageContainer ) {

}
