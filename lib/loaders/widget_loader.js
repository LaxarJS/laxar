/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

import * as string from '../utilities/string';

const TYPE_WIDGET = 'widget';
const TYPE_ACTIVITY = 'activity';

const ID_SEPARATOR = '-';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

const noOp = () => {};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Create a generic widget loader that can load widgets and activities implemented in various technologies
 * by using appropriate adapters.
 *
 * @param {Log} log
 *    log instance to use for technology compatibility warnings
 * @param {ArtifactProvider} artifactProvider
 *    an artifact provider for looking up widget descriptors and assets
 * @param {EventBus} debugEventBus
 * @param {ControlLoader} controlLoader
 *    helps loading controls and their assets
 * @param {Function} servicesForWidget
 *    a factory method to create widget-specific services
 *
 * @return {WidgetLoader}
 *    a new widget loader
 */
export function create(
   log,
   artifactProvider,
   debugEventBus,
   controlLoader,
   servicesForWidget
) {

   const widgetAdapters = {};

   /**
    * @name WidgetLoader
    * @constructor
    */
   return {
      load,

      /**
       * Register support for integration technologies.
       *
       * @param {Object} adapters
       *    a map of widget adapters by technology to be registered with this loader
       *
       * @memberof WidgetLoader
       */
      registerWidgetAdapters( adapters ) {
         Object.assign(widgetAdapters, adapters);
      }
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Load a widget using an appropriate adapter
    *
    * First, get the given widget's descriptor to validate and instantiate the widget features.
    * Then, instantiate a widget adapter matching the widget's technology. Using the adapter, create the
    * widget controller. The adapter is returned and can be used to attach the widget to the DOM, or to
    * destroy it.
    *
    * @param {Object} widgetConfiguration
    *    a widget instance configuration (as used in page definitions) to instantiate the widget from
    * @param {Object} [optionalOptions]
    *    map of additonal options
    * @param {Function} [optionalOptions.whenServicesAvailable]
    *    a callback that will be invoked just before the controller is set up. It receives an object of named,
    *    widget-specific injections as arguments allowing clients and tools such as laxar-mocks to tap into
    *   the provided services
    *
    * @return {Promise} a promise for a widget adapter, with an already instantiated controller
    *
    * @memberof WidgetLoader
    */
   function load( widgetConfiguration, { whenServicesAvailable = noOp } = {} ) {

      const widgetArtifactProvider = artifactProvider.forWidget( widgetConfiguration.widget );

      return widgetArtifactProvider
         .descriptor()
         .then( descriptor => {
            // The control-descriptors must be loaded prior to controller creation.
            // This allows the widget controller to synchronously instantiate controls.
            return Promise.all( ( descriptor.controls || [] ).map( controlLoader.load ) )
               .then( controlDescriptors => {
                  controlDescriptors.forEach( checkTechnologyCompatibility( descriptor ) );
                  return descriptor;
               } );
         } )
         .then( descriptor => {

            //TODO: debugEventBus;

            const { integration: { type, technology } } = descriptor;
            const widgetName = descriptor.name;
            if( type !== TYPE_WIDGET && type !== TYPE_ACTIVITY ) {
               throwError( widgetConfiguration, `Unknown integration type "${type}"` );
            }

            const features = widgetConfiguration.features || {};
            const anchorElement = document.createElement( 'DIV' );
            anchorElement.className = widgetName;
            anchorElement.id = `ax${ID_SEPARATOR}${widgetConfiguration.id}`;

            const adapterFactory = widgetAdapters[ technology ];
            const { serviceDecorators = () => ({}) } = adapterFactory;
            const { services, releaseServices } = servicesForWidget(
               descriptor,
               widgetConfiguration,
               features,
               serviceDecorators( descriptor, widgetConfiguration )
            );

            const environment = {
               anchorElement,
               services,
               widgetName,
               provideServices: whenServicesAvailable
            };

            return Promise.resolve( adapterFactory.create( environment ) )
               .then( adapter => ( { destroy: noOp, ...adapter } ) )
               .then( adapter => ( {
                  id: widgetConfiguration.id,
                  adapter,
                  destroy() {
                     releaseServices();
                     adapter.destroy();
                  },
                  templatePromise: loadAssets(
                     descriptor,
                     widgetArtifactProvider
                  )
               } ) );

         }, err => {
            const message = `Could not load widget "${widgetConfiguration.widget}": ${err.message}`;
            log.error( message );
            throw err;
         } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Locates and loads the widget HTML template for this widget (if any) as well as any CSS stylesheets
    * used by this widget or its controls.
    *
    * @param {Object} widgetDescriptor
    *    a descriptor identifying the widget to load assets for
    * @param {ArtifactProvider} artifactProviderForWidget
    *    the provider with which to lookup or fetch artifact HTML and CSS
    *
    * @return {Promise}
    *    A promise that will be resolved with the contents of any HTML template for this widget, or with
    *    `null` if there is no template (for example, if this is an activity).
    *
    * @private
    */
   function loadAssets( widgetDescriptor, { assetForTheme } ) {
      const { integration: { type }, name } = widgetDescriptor;
      return type === TYPE_ACTIVITY ?
         Promise.resolve( null ) :
         assetForTheme( widgetDescriptor.templateSource || `${name}.html` );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function checkTechnologyCompatibility( widgetDescriptor ) {
      const { name, integration: { technology } } = widgetDescriptor;
      return controlDescriptor => {
         const controlTechnology = ( controlDescriptor.integration || {} ).technology;
         if( controlTechnology === 'plain' ) {
            // plain is always compatible
            return;
         }

         if( technology !== controlTechnology ) {
            log.warn(
               'Incompatible integration technologies: widget [0] ([1]) cannot use control [2] ([3])',
               name, technology, controlDescriptor.name, controlTechnology
            );
         }
      };
   }

}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function throwError( widgetConfiguration, message ) {
   throw new Error( string.format(
      'Error loading widget "[widget]" (id: "[id]"): [0]', [ message ], widgetConfiguration
   ) );
}
