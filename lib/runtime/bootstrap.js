/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

/**
 * Module providing bootstrapping machinery.
 *
 * @module bootstrap
 */

import assert from '../utilities/assert';

const TOPIC_SEGMENTS_MATCHER = /[^+a-z0-9]+/g;
const TOPIC_SEGMENTS_REPLACER = () => '+';

export function create(
   artifactProvider,
   configuration,
   debugEventBus,
   flowController,
   globalEventBus,
   log,
   pageService,
   tooling,
   widgetLoader
) {

   let idCounter = 0;
   const instance = makeTopic( configuration.ensure( 'name' ) );

   /**
    * An API to bootstrap (additional) artifacts.
    *
    * @name AxBootstrap
    * @constructor
    */
   const api = {
      artifacts( artifacts ) {
         artifactProvider.registerArtifacts( artifacts );
      },
      tooling( debugInfo ) {
         tooling.registerDebugInfo( debugInfo );
      },
      flow,
      page,
      widget
   };

   return api;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function flow( name, anchorElement, id = generateId( name ) ) {
      assert( name ).hasType( String ).isNotNull();
      assert( anchorElement ).isNotNull();
      assert.state( anchorElement.nodeType === Node.ELEMENT_NODE );

      const itemMeta = provideItemMeta( 'flow', name, id );

      log.trace( `laxar.bootstrap: loading flow: ${name}` );
      pageService.createControllerFor( anchorElement, itemMeta );
      flowController
         .loadFlow( name )
         .then( () => {
            log.trace( 'laxar.bootstrap: flow loaded' );
         }, err => {
            log.fatal( 'laxar.bootstrap: failed to load flow.' );
            log.fatal( 'Error [0].\nStack: [1]', err, err && err.stack );
         } );

      return api;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function page( name, anchorElement, parameters = {}, id = generateId( name ) ) {
      assert( name ).hasType( String ).isNotNull();
      assert( anchorElement ).isNotNull();
      assert.state( anchorElement.nodeType === Node.ELEMENT_NODE );

      const itemMeta = provideItemMeta( 'page', name, id );

      const controller = pageService.createControllerFor( anchorElement, itemMeta );
      const eventBus = globalEventBus;
      const event = {
         target: name,
         place: null,
         data: parameters
      };

      controller.setupPage( name )
         .then( () => {
            return eventBus.publish( `didNavigate.${event.target}`, event, { sender: 'bootstrap' } );
         } )
         .then( () => {
            log.trace( 'laxar.bootstrap: page loaded' );
         }, err => {
            log.fatal( 'laxar.bootstrap: failed to load page.' );
            log.fatal( 'Error [0].\nStack: [1]', err, err && err.stack );
         } );

      return api;
   }


   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function widget( name, anchorElement, features = {}, id = generateId( name ) ) {
      assert( name ).hasType( String ).isNotNull();
      assert( anchorElement ).isNotNull();
      assert.state( anchorElement.nodeType === Node.ELEMENT_NODE );

      const itemMeta = provideItemMeta( 'widget', name, id );

      widgetLoader.load( { widget: name, id, features }, { anchorElement }, itemMeta )
         .then( widgetAdapterWrapper => {
            widgetAdapterWrapper.templatePromise
               .then( htmlTemplate => {
                  widgetAdapterWrapper.adapter.domAttachTo( anchorElement.parentNode, htmlTemplate );
               } );
         } );

      return api;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function provideItemMeta( type, name, id ) {
      /**
       * An object of strings which together identify a bootstrapping item.
       *
       * @name ItemMeta
       * @constructor
       */
      const itemMeta = {
         /**
          * The (topic-formatted) name of the LaxarJS instance.
          * @name instance
          * @type {String}
          * @memberof ItemMeta
          */
         instance,
         /**
          * The (topic-formatted, ID-suffixed) name of the bootstrapping item.
          * @name item
          * @type {String}
          * @memberof ItemMeta
          */
         item: id,
         /**
          * The type of the bootstrapping item.
          * @name type
          * @type {String}
          * @memberof ItemMeta
          */
         type,
         /**
          * The artifact reference used for creating the bootstrapping item.
          * @name ${type}
          * @type {String}
          * @memberof ItemMeta
          */
         [ type ]: name
      };

      tooling.registerItem( itemMeta );

      return itemMeta;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function generateId( name ) {
      return `${makeTopic( name )}-id${idCounter++}`;
   }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function makeTopic( string ) {
   return string
      .trim()
      .toLowerCase()
      .replace( TOPIC_SEGMENTS_MATCHER, TOPIC_SEGMENTS_REPLACER );
}
