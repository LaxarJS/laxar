/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import assert from '../utilities/assert';
import { create as createAreaHelper, findWidgetAreas } from './area_helper';
import { create as createLayoutWidgetAdapter } from './layout_widget_adapter';



export function create(
      eventBus,
      pageLoader,
      layoutLoader,
      widgetLoader,
      localeManager,
      visibilityManager,
      log,
      debugEventBus
   ) {

   assert( eventBus ).isNotNull();
   assert( pageLoader ).isNotNull();
   assert( layoutLoader ).isNotNull();
   assert( widgetLoader ).isNotNull();
   assert( localeManager ).isNotNull();
   assert( visibilityManager ).isNotNull();
   assert( debugEventBus ).isNotNull();

   let pageController;

   const pageServiceApi = {
      createControllerFor: ( pageElement, instanceContext ) => {
         assert.state( !pageController, 'Cannot create a page controller more than once.' );
         // assert.state(
         //    pageElement instanceof HTMLElement,
         //    'A page controller can only be created for a valid DOM element.'
         // );
         assert( instanceContext ).hasType( Object ).isNotNull();

         pageController = createPageController( pageElement, instanceContext );
         return pageController;
      },


      controller: () => pageController
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function createPageController( pageElement, /* bootstrappingItemMeta */ instanceContext ) {

      let areaHelper = null;
      const api = {
         setupPage,
         tearDownPage,
         areaHelper() {
            return areaHelper;
         }
      };
      const publishDebugInfo = ( event, data ) => {
         debugEventBus.publish( `${event}.${instanceContext.instance}.${instanceContext.item}`, {
            itemMeta: instanceContext,
            ...data
         } );
      };

      /** Delay between sending didLifeCycle and attaching widget templates. */
      const WIDGET_ATTACH_DELAY_MS = 5;
      const COLLABORATOR_ID = 'AxPageController';
      const LIFECYCLE_EVENT = { lifecycleId: 'default' };
      const EVENT_OPTIONS = { sender: COLLABORATOR_ID };
      const DEFAULT_AREAS = [
         { name: 'axActivities', hidden: true },
         { name: 'axPopups' },
         { name: 'axPopovers' }
      ];

      let activeWidgetAdapterWrappers = [];
      let cleanUpLayout = () => {};
      let activePage = null;

      //pageElement.innerHTML += '';

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function setupPage( pageName ) {
         assert( pageName ).hasType( String ).isNotNull();

         publishDebugInfo( 'willLoad.page', { page: pageName } );

         return pageLoader.load( pageName )
            .then( page => {
               areaHelper = createAreaHelper( page, log );
               visibilityManager.setAreaHelper( areaHelper );

               const layoutPromise = layoutLoader.load( page.layout )
                  .then( layoutInfo => {
                     cleanUpLayout = renderLayout( pageElement, areaHelper, layoutInfo );
                  } );

               localeManager.subscribe();
               const layoutWidget = widget => layoutWidgetAdapterFor( areaHelper, widget );

               // instantiate controllers wrapped by widget adapters
               const widgetPromises = widgetsForPage( page )
                  .map( widget => 'layout' in widget ?
                     layoutWidget( widget ) :
                     widgetLoader.load( widget, {}, instanceContext, pageElement ) );

               return Promise.all( [ ...widgetPromises, layoutPromise ] )
                  .then( results => results.slice( 0, -1 ) );
            } )
            .then( widgetAdapterWrappers => {
               publishDebugInfo( 'didLoad.page', { page: pageName } );

               activePage = pageName;
               activeWidgetAdapterWrappers = widgetAdapterWrappers;
            } )
            .then( localeManager.initialize )
            .then( () => {
               return eventBus.publishAndGatherReplies(
                  'beginLifecycleRequest.default', LIFECYCLE_EVENT, EVENT_OPTIONS
               );
            } )
            .then( visibilityManager.initialize )
            // Give the widgets (a little) time to settle on the event bus before $digesting and painting:
            .then( () => delay( WIDGET_ATTACH_DELAY_MS ) )
            .then( () => areaHelper.attachWidgets( activeWidgetAdapterWrappers ) );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function tearDownPage() {
         visibilityManager.unsubscribe();
         localeManager.unsubscribe();

         publishDebugInfo( 'willUnload.page', { page: activePage } );

         return eventBus
            .publishAndGatherReplies( 'endLifecycleRequest.default', LIFECYCLE_EVENT, EVENT_OPTIONS )
            .then( () => {
               const pageName = activePage;
               activeWidgetAdapterWrappers.forEach( wrapper => wrapper.destroy() );
               activeWidgetAdapterWrappers = [];
               activePage = null;

               publishDebugInfo( 'didUnload.page', { page: pageName } );
               cleanUpLayout();
               cleanUpLayout = () => {};
            } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function widgetsForPage( page ) {
         return Object.keys( page.areas ).reduce( ( widgets, areaName ) => {
            const areaWidgets = page.areas[ areaName ];
            return areaWidgets.reduce( ( widgets, widget ) => {
               widget.area = areaName;
               return [ ...widgets, widget ];
            }, widgets );
         }, [] );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function layoutWidgetAdapterFor( areaHelper, widget ) {
         return layoutLoader.load( widget.layout )
            .then( ({ className, html }) => {
               const adapter = createLayoutWidgetAdapter( areaHelper, className, {
                  area: widget.area,
                  id: widget.id,
                  path: widget.layout
               } );

               return {
                  id: widget.id,
                  adapter,
                  destroy: adapter.destroy,
                  templatePromise: Promise.resolve( html )
               };
            } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function renderLayout( pageElement, areaHelper, layoutInfo ) {
         addClass( pageElement, layoutInfo.className );
         pageElement.innerHTML = pageElement.innerHTML + layoutInfo.html;

         const areas = findWidgetAreas( pageElement );
         const deregisterFuncs = Object.keys( areas )
            .map( areaName => areaHelper.register( areaName, areas[ areaName ] ) );
         DEFAULT_AREAS.forEach( area => {
            if( areaHelper.exists( area.name ) ) {
               return;
            }
            let node = {
               outerHTML:`<div ${area.name}></div>`,
               innerHTML: '',
               children: [],
               appendChild: ( el ) => {
                  node.children.push( el );
               }
            }; //document.createElement( 'div' );
            if( area.hidden ) {
               node.outerHTML = '<div style="display: none;"></div>'; //<node.style.display = 'none';
            }
            deregisterFuncs.push( areaHelper.register( area.name, node, area.name ) );
            pageElement.appendChild( node );
         } );
         return () => {
            deregisterFuncs.forEach( func => func() );
            removeClass( pageElement, layoutInfo.className );
         };
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      return api;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return pageServiceApi;

}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function addClass( element, cssClass ) {
   if( element.classList ) {
      element.classList.add( cssClass );
      return;
   }
   element.className += ` ${cssClass}`;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function removeClass( element, cssClass ) {
   if( element.classList ) {
      element.classList.remove( cssClass );
      return;
   }
   element.className = element.className
      .split( ' ' )
      .map( c => c.trim() )
      .filter( c => c !== cssClass )
      .join( ' ' );
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function delay( ms ) {
   return new Promise( resolve => setTimeout( resolve, ms ) );
}
