/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import * as path from '../utilities/path';
import * as object from '../utilities/object';
import * as string from '../utilities/string';
import * as featuresProvider from './features_provider';

const TYPE_WIDGET = 'widget';
const TYPE_ACTIVITY = 'activity';

const ID_SEPARATOR = '-';

const exists = _ => !!_;

export function create(
   log,
   fileResourceProvider,
   controls,
   cssLoader,
   themeManager,
   themesPath,
   widgetsPath,
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
    * First, get the given widget's specification to validate and instantiate the widget features.
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

      const resolvedWidgetPath = path.resolveAssetPath( widgetConfiguration.widget, widgetsPath, 'local' );
      const widgetJsonPath = path.join( resolvedWidgetPath, 'widget.json' );

      const options = object.options( optionalOptions, {
         onBeforeControllerCreation: () => {}
      } );

      return fileResourceProvider
         .provide( widgetJsonPath )
         .then( specification => {
            // The control-descriptors must be loaded prior to controller creation.
            // This allows the widget controller to synchronously instantiate controls.
            return Promise.all( ( specification.controls || [] ).map( controls.load ) )
               .then( descriptors => {
                  descriptors.forEach( checkTechnologyCompatibility( specification ) );
                  return specification;
               } );
         } )
         .then( specification => {
            pagesCollector.collectWidgetDescriptor( widgetConfiguration.widget, specification );

            const { integration } = specification;
            const { type, technology } = integration;
            if( type !== TYPE_WIDGET && type !== TYPE_ACTIVITY ) {
               throwError( widgetConfiguration, `Unknown integration type "${type}"` );
            }

            const throwWidgetError = throwError.bind( null, widgetConfiguration );
            const features =
               featuresProvider.featuresForWidget( specification, widgetConfiguration, throwWidgetError );
            const anchorElement = document.createElement( 'DIV' );
            anchorElement.className = specification.name;
            anchorElement.id = `ax${ID_SEPARATOR}${widgetConfiguration.id}`;

            const adapterFactory = widgetAdapters[ technology ];
            const { services, releaseServices } =
               servicesForWidget( specification, widgetConfiguration, features );
            const environment = {
               anchorElement,
               context: services.axContext,
               services,
               specification
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
               applyViewChanges: adapterFactory.applyViewChanges || null,
               templatePromise: loadAssets(
                  resolvedWidgetPath,
                  specification,
                  widgetConfiguration
               )
            };

         }, err => {
            const message = 'Could not load spec for widget [0] from [1]: [2]';
            log.error( message, widgetConfiguration.widget, widgetJsonPath, err );
         } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Locates and loads the widget HTML template for this widget (if any) as well as any CSS stylesheets
    * used by this widget or its controls.
    *
    * @param {String} widgetPath
    *    The path suffix used to look up the widget, as given in the instance configuration.
    * @param {Object} widgetDescriptor
    *    The widget descriptor, used to find out integration info, and if controls need to be loaded.
    *
    * @return {Promise<String>}
    *    A promise that will be resolved with the contents of any HTML template for this widget, or with
    *    `null` if there is no template (for example, if this is an activity).
    */
   function loadAssets( widgetPath, widgetDescriptor ) {
      const { integration } = widgetDescriptor;
      if( integration === TYPE_ACTIVITY ) {
         return Promise.resolve( null );
      }

      return resolve()
         .then( ({ cssFileUrls, templateUrl }) => {
            cssFileUrls.forEach( url => {
               cssLoader.load( url );
            } );
            return templateUrl ? fileResourceProvider.provide( templateUrl ) : null;
         } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function resolve() {
         const { name } = widgetDescriptor;
         const widgetHtml = `${name}.html`;
         const widgetCss = path.join( 'css', `${name}.css` );

         const provide = themeManager.urlProvider(
            path.join( widgetPath, '[theme]' ),
            path.join( themesPath, '[theme]', 'widgets', name )
         );

         const urlPromises = [ provide( widgetHtml ), provide( widgetCss ) ].concat( loadControlAssets() );
         return Promise.all( urlPromises )
            .then( ([ widgetHtmlUrl, widgetCssUrl, ...controlCssUrls ]) => (
               {
                  templateUrl: widgetHtmlUrl,
                  cssFileUrls: controlCssUrls.concat( widgetCssUrl ).filter( exists )
               }
            ) );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function loadControlAssets() {
         return ( widgetDescriptor.controls || [] )
            .map( controlRef => {
               const descriptor = controls.descriptor( controlRef );
               const resolvedPath = controls.resolve( controlRef );

               const { name } = descriptor;
               const cssPathInControl = path.join( resolvedPath, '[theme]' );
               const cssPathInTheme = path.join( themesPath, '[theme]', 'controls', name );
               const provide = themeManager.urlProvider( cssPathInControl, cssPathInTheme );
               return provide( path.join( 'css', `${name}.css` ) );
            } );
      }

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
