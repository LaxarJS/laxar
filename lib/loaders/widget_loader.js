/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

import * as object from '../utilities/object';
import * as string from '../utilities/string';
import * as featuresProvider from './features_provider';

const TYPE_WIDGET = 'widget';
const TYPE_ACTIVITY = 'activity';

const ID_SEPARATOR = '-';

export function create(
   log,
   artifactProvider,
   controlsLoader,
   cssLoader,
   pagesCollector,
   servicesForWidget
) {

   const widgetAdapters = {};

   return {
      load,
      registerWidgetAdapters( adapters ) {
         adapters.forEach( adapter => {
            widgetAdapters[ adapter.technology ] = adapter;
         } );
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
    * @param {Function} optionalOptions.onBeforeControllerCreation
    *    a function to call just before the controller is set up. It receives environment and adapter
    *    specific injections as arguments
    *
    * @return {Promise} a promise for a widget adapter, with an already instantiated controller
    */
   function load( widgetConfiguration, optionalOptions ) {

      const options = object.options( optionalOptions, {
         onBeforeControllerCreation: () => {}
      } );

      const widgetArtifactProvider = artifactProvider.forWidget( widgetConfiguration.widget );

      return widgetArtifactProvider
         .descriptor()
         .then( descriptor => {
            // The control-descriptors must be loaded prior to controller creation.
            // This allows the widget controller to synchronously instantiate controls.
            return Promise.all( ( descriptor.controls || [] ).map( controlsLoader.load ) )
               .then( controlDescriptors => {
                  controlDescriptors.forEach( checkTechnologyCompatibility( descriptor ) );
                  return descriptor;
               } );
         } )
         .then( descriptor => {
            pagesCollector.collectWidgetDescriptor( widgetConfiguration.widget, descriptor );

            const { integration } = descriptor;
            const { type, technology } = integration;
            if( type !== TYPE_WIDGET && type !== TYPE_ACTIVITY ) {
               throwError( widgetConfiguration, `Unknown integration type "${type}"` );
            }

            const throwWidgetError = throwError.bind( null, widgetConfiguration );
            const features =
               featuresProvider.featuresForWidget( descriptor, widgetConfiguration, throwWidgetError );
            const anchorElement = document.createElement( 'DIV' );
            anchorElement.className = descriptor.name;
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
               // TODO (#343)
               specification: descriptor
            };

            const adapter = adapterFactory.create( environment );
            adapter.createController( options );

            return {
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
            };

         }, err => {
            const message = `Could not load widget "${widgetConfiguration.widget}": ${err.message}`;
            log.error( message );
            throw err;
         } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   // eslint-disable-next-line valid-jsdoc
   /**
    * Locates and loads the widget HTML template for this widget (if any) as well as any CSS stylesheets
    * used by this widget or its controls.
    *
    * @param {Object} widgetDescriptor
    * @param {Object} artifactProviderForWidget
    *
    * @return {Promise<String>}
    *    A promise that will be resolved with the contents of any HTML template for this widget, or with
    *    `null` if there is no template (for example, if this is an activity).
    *
    * @private
    */
   function loadAssets( widgetDescriptor, { assetForTheme, assetUrlForTheme } ) {
      const { integration: { type }, name } = widgetDescriptor;
      if( type === TYPE_ACTIVITY ) {
         return Promise.resolve( null );
      }

      return Promise.all( [
         assetForTheme( `${name}.html` ),
         assetUrlForTheme( `css/${name}.css` )
      ] )
      .then( ([ html, cssUrl ]) => {
         if( cssUrl ) {
            cssLoader.load( cssUrl );
         }
         return html;
      } );
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
