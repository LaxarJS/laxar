const noDeliveryToSender = { deliverToSender: false };
const noOp = () => {};

/**
 * Creates a widget-specific helper for `didChangeAreaVisibility` events.
 *
 * @param {Object} context
 *    the widget context/scope that the handler should work with. It uses the `eventBus` property there
 *    with which it can do the event handling. The visibility handler will set the boolean context property
 *    `isVisible` which can be used to determine the visibility state of the entire widget, e.g. for use in
 *    templates.
 *
 * @param {Object} areaHelper
 *    an area helper to qualify/unqualify names for this widget's areas
 *
 * @return {AxVisibility}
 *    a visibility handler instance
 */
export function create( context, areaHelper ) {

   /**
    * @name {AxVisibility}
    */
   const api = {
      onChange,
      onHide,
      onShow,
      release,
      track,
      unsubscribe,
      updateAreaVisibility,
      updateWidgetVisibility
   };

   const { eventBus } = context;

   // reading the widget visibility
   let isVisible = false;
   let trackingProperty;
   const showListeners = [];
   const hideListeners = [];
   let unsubscribeToChanges = noOp;

   // controlling the visibility of the widget and its areas
   const visibilityByArea = {};
   const overrideByArea = {};
   let unsubscribeToAreaRequests = noOp;

   return api;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Registers a callback to be run when this widget becomes hidden.
    *
    * @param {Function} f
    *    a callback to be invoked whenever the widget becomes visible, with a boolean argument indicating
    *    the new visibility state (`false`). The callback will *not* be invoked for the start value (`false`).
    *
    * @return {AxVisibility}
    *    this instance for chaining
    */
   function onHide( f ) {
      hideListeners.push( f );
      updateChangeSubscription();
      return api;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Registers a callback to be run when this widget becomes visbile.
    *
    * @param {Function} f
    *    a callback to be invoked whenever the widget becomes visible, with a boolean argument indicating
    *    the new visibility state (`true`).
    *
    * @return {AxVisibility}
    *    this instance for chaining
    */
   function onShow( f ) {
      showListeners.push( f );
      updateChangeSubscription();
      return api;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Registers a callback for changes to this widget's visibility.
    *
    * @param {Function} f
    *    a callback to be invoked whenever the widget visibility changes, with a boolean argument indicating
    *    the new visibility state. The callback will *not* be invoked for the start value (`false`).
    *
    * @return {AxVisibility}
    *    this instance for chaining
    */
   function onChange( f ) {
      showListeners.push( f );
      hideListeners.push( f );
      updateChangeSubscription();
      return api;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Starts tracking visibility as a property on the context.
    *
    * @param {Boolean} enabled
    *    If `true` (default) an event bus subscription will be maintained to track visibility changes of the
    *    current widget by updating a managed property on the context. If `false`, any existing subscription
    *    will be cancelled. If set, the context property will *not* be removed.
    * @param {String} property
    *    The name of the context property to maintain. Changing the property name after tracking has started
    *    once will not remove previously created properties.
    *
    * @return {AxVisibility}
    *    this instance for chaining
    */
   function track( enabled = true, property = 'isVisible' ) {
      trackingProperty = enabled ? property : null;
      if( enabled ) {
         context[ trackingProperty ] = isVisible;
      }
      updateChangeSubscription();
      return api;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Triggers a visibility change to the given area. The visibility of the area and its nested areas is
    * re-evaluated over the event bus. Use this to implement e.g. tabbing/accordion/expander widgets.
    *
    * @param {Object} visibilityByLocalArea
    *   A mapping of local area names (without the widget ID) to their new visibility state (Boolean).
    *   Areas that are omitted here are left as is. Areas that have not been set at all just assume the
    *   visibility state of the containing area.
    * @param {Object} [optionalOptions]
    *   Additional options
    * @param {Object} [optionalOptions.overrideContainer]
    *   Allows the specified areas to become visible even if the widget's container area is not visible.
    *
    * @return {Promise}
    *    a promise that is resolved (without a value) when the visibility change was applied
    */
   function updateAreaVisibility( visibilityByLocalArea, optionalOptions = {} ) {
      const { overrideContainer = false } = optionalOptions;

      if( unsubscribeToAreaRequests === noOp ) {
         const requestEvent = `changeAreaVisibilityRequest.${context.widget.id}`;
         unsubscribeToAreaRequests = eventBus.subscribe( requestEvent, responder( isAreaVisible ) );
      }

      const promises = Object.keys( visibilityByLocalArea ).map( name => {
         const oldVisible = visibilityByArea[ name ];
         const oldOverride = overrideByArea[ name ];
         const visible = visibilityByArea[ name ] = visibilityByLocalArea[ name ];
         if( overrideContainer ) {
            overrideByArea[ name ] = overrideContainer;
         }
         else if( oldOverride ) {
            delete overrideByArea[ name ];
         }
         if( oldVisible !== visible || oldOverride !== overrideByArea[ name ] ) {
            const area = areaHelper.fullName( name );
            const eventName = `changeAreaVisibilityRequest.${area}.${visible}`;
            return eventBus.publishAndGatherReplies( eventName, { area, visible }, noDeliveryToSender );
         }
         return Promise.resolve();
      } );

      return Promise.all( promises ).then( noOp );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /* @private helper for updateAreaVisibility */
   function isAreaVisible( localAreaName, containerVisible ) {
      const areaVisible = visibilityByArea[ localAreaName ];
      if( areaVisible === undefined ) {
         return containerVisible;
      }
      return areaVisible && ( containerVisible || overrideByArea[ localAreaName ] );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Triggers a visibility change the widget itself and all its areas, always overriding its container
    * visibility with the given value.
    * This simplifies implementing popup/popover/layer widgets, which always live in an invisible container
    * area, but need to show/hide all their owned areas.
    *
    * To control the visibility of individual areas, use #updateAreaVisibility
    *
    * @param {Boolean} visible
    *   The new visibility state of the widget.
    *
    * @return {AxVisibility}
    *    this instance for chaining
    */
   function updateWidgetVisibility( visible ) {
      const widget = context.widget.id;
      const eventName = `changeWidgetVisibilityRequest.${widget}.${visible}`;
      return eventBus.publishAndGatherReplies( eventName, { widget, visible }, noDeliveryToSender );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Remove the given callback (registered through one or more of the on... methods) from any subscriptions.
    *
    * @param {Function} f
    *    a callback that was previously registered using any of the `on...` methods.
    *    It will be removed from all registrations. Passing an unknown callback has no effect.
    *
    * @return {AxVisibility}
    *    this instance for chaining
    */
   function unsubscribe( f ) {
      [ showListeners, hideListeners ].forEach( remove );

      function remove( array ) {
         const index = array.indexOf( f );
         if( index === -1 ) { return; }
         array.splice( index, 1 );
         remove( array );
      }
      return api;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function release() {
      unsubscribeToAreaRequests();
      unsubscribeToChanges();
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function updateChangeSubscription() {
      const needsSubscription = trackingProperty || ( showListeners.length + hideListeners.length );
      if( needsSubscription && unsubscribeToChanges === noOp ) {
         unsubscribeToChanges = eventBus.subscribe(
            `didChangeAreaVisibility.${context.widget.area}`,
            ({ visible } ) => {
               if( visible === isVisible ) { return; }
               isVisible = visible;
               if( trackingProperty ) {
                  context[ trackingProperty ] = visible;
               }
               ( visible ? showListeners : hideListeners ).forEach( f => f( visible ) );
            }
         );
      }
      else if( unsubscribeToChanges && !needsSubscription ) {
         unsubscribeToChanges();
         unsubscribeToChanges = noOp;
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function responder( callback ) {
      return ({ area, visible: containerVisible }) => {
         const visible = callback( areaHelper.localName( area ), containerVisible );
         if( visible === true || visible === false ) {
            const didEvent = `didChangeAreaVisibility.${area}.${visible}`;
            eventBus.publish( didEvent, { area, visible }, noDeliveryToSender );
         }
      };
   }

}
