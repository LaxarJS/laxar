/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   'angular',
   '../../event_bus/event_bus',
   '../../i18n/i18n',
   '../../file_resource_provider/file_resource_provider',
   '../../logging/log',
   '../../language/language_shim',
   '../portal_assembler/layout_loader',
   '../paths',
   '../configuration',
   './theme_manager'
], function(
   ng,
   eventBus,
   i18n,
   fileResourceProvider,
   log,
   languageShim,
   layoutLoader,
   paths,
   configuration,
   themeManager
) {
   'use strict';

   var module = ng.module( 'laxar.portal_services', [] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   module.factory( 'EventBus', [ '$q', '$timeout', function( $q, $timeout ) {
      eventBus.init( $q, $timeout, $timeout );

      var bus = eventBus.create();
      bus.setErrorHandler( eventBusErrorHandler );

      return bus;
   } ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   module.factory( 'Configuration', [ function() {
      return configuration;
   } ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   module.factory( 'Language', [ 'EventBus', function() {
      return languageShim;
   } ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   module.factory( 'i18n', [ function() {
      return i18n;
   } ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   module.factory( 'FileResourceProvider', [ '$q', '$http', 'Configuration',
      function( $q, $http, Configuration ) {
         fileResourceProvider.init( $q, $http );

         var provider = fileResourceProvider.create( paths.PRODUCT );

         var listings = Configuration.get( 'fileListings' );
         if( listings ) {
            ng.forEach( listings, function( value, key ) {
               provider.setFileListingUri( key, value );
            } );
         }

         return provider;
      }
   ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   module.factory( 'ThemeManager', [
      'Configuration', 'FileResourceProvider', '$q', 'EventBus',

      function( configuration, fileResourceProvider, $q, eventBus ) {
         var manager = themeManager.create( fileResourceProvider, $q, configuration.get( 'theme' ) );

         eventBus.subscribe( 'changeThemeRequest', function( event ) {
            eventBus
               .publish( 'willChangeTheme.' + event.theme, {
                  theme: event.theme
               } )
               .then( function() {
                  manager.setTheme( event.theme );

                  var target = event.target || '_self';
                  eventBus.publish( 'navigateRequest.' + target, {
                     target: target,
                     triggerBrowserReload: true
                  } );

                  // didChangeTheme event is send in the FlowController after each beginLifecycleRequest event.
               } );
         } );

         return {
            getTheme: manager.getTheme.bind( manager ),
            findFiles: manager.findFiles.bind( manager ),
            urlProvider: manager.urlProvider.bind( manager )
         };
      }
   ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   module.factory( 'LayoutLoader', [ 'CssLoader', 'ThemeManager',
      function( cssLoader, themeManager ) {
         return layoutLoader.create( paths.LAYOUTS, cssLoader, themeManager );
      }
   ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   module.factory( 'CssLoader', [ 'Configuration', 'ThemeManager', function( Configuration, themeManager ) {
      var mergedCssFileLoaded = [].some.call( document.getElementsByTagName( 'link' ), function( link ) {
         return link.hasAttribute( 'data-ax-merged-css' );
      } );

      if( mergedCssFileLoaded ) {
         return { load: function() {} };
      }

      var loadedFiles = [];
      var loader = {
         load: function( url ) {

            if( loadedFiles.indexOf( url ) === -1 ) {
               if( hasStyleSheetLimit() ) {
                  // Here we most probably have an Internet Explorer having the limit of at most 31 stylesheets
                  // per page. As a workaround we use style tags with import statements. Each style tag may
                  // have 31 import statement. This gives us 31 * 31 = 961 possible stylesheets to include ...
                  // Link to the problem on microsoft.com: http://support.microsoft.com/kb/262161
                  // Solution based on ideas found here: http://john.albin.net/css/ie-stylesheets-not-loading

                  var styleManagerId = 'cssLoaderStyleSheet' + Math.floor( loadedFiles.length / 30 );
                  if( !document.getElementById( styleManagerId ) ) {
                     addHeadElement( 'style', {
                        type: 'text/css',
                        id: styleManagerId
                     } );
                  }

                  document.getElementById( styleManagerId ).styleSheet.addImport( url );
               }
               else {
                  addHeadElement( 'link', {
                     type: 'text/css',
                     id: 'cssLoaderStyleSheet' + loadedFiles.length,
                     rel: 'stylesheet',
                     href: url
                  } );
               }

               loadedFiles.push( url );
            }
         }
      };

      if( Configuration.get( 'useMergedCss' ) ) {
         loader.load( paths.PRODUCT + 'var/static/css/' + themeManager.getTheme() + '.theme.css' );

         return { load: function() {} };
      }

      return loader;

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function hasStyleSheetLimit() {
         if( typeof hasStyleSheetLimit.result !== 'boolean' ) {
            hasStyleSheetLimit.result = false;
            if( document.createStyleSheet ) {
               var uaMatch = navigator.userAgent.match( /MSIE ?(\d+(\.\d+)?)[^\d]/i );
               if( !uaMatch || parseFloat( uaMatch[1] ) < 10 ) {
                  // There is no feature test for this problem without running into it. We therefore test
                  // for a browser knowing document.createStyleSheet (should only be IE) and afterwards check,
                  // if it is a version prior to 10 as the problem is fixed since that version. In any other
                  // case we assume the worst case and trigger the hack for limited browsers.
                  hasStyleSheetLimit.result = true;
               }
            }
         }
         return hasStyleSheetLimit.result;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function addHeadElement( elementName, attributes ) {
         var element = document.createElement( elementName );
         ng.forEach( attributes, function( val, key ) {
            element[ key ] = val;
         } );
         document.getElementsByTagName( 'head' )[0].appendChild( element );
      }
   } ] );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   module.provider( '$exceptionHandler', function() {
      var handler = function( exception, cause ) {
         log.error( 'There was an exception: ' + exception.message + ', \nstack: ' );
         log.error( exception.stack + ', \n' );
         log.error( '  Cause: ' + cause );
      };

      this.$get = [ function() {
         return handler;
      } ];
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function eventBusErrorHandler( message, optionalErrorInformation ) {
      log.error( 'EventBus: ' + message );

      if( optionalErrorInformation ) {
         ng.forEach( optionalErrorInformation, function( info, title ) {
            log.error( '   - [0]: [1:%o]', title, info );
            if( info instanceof Error && info.stack ) {
               log.error( '   - Stacktrace: ' + info.stack );
            }
         } );
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return module;

} );
