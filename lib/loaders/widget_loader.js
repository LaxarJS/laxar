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
const TECHNOLOGY_ANGULAR = 'angular';

const DEFAULT_INTEGRATION = { type: TYPE_WIDGET, technology: TECHNOLOGY_ANGULAR };

const ID_SEPARATOR = '-';
const INVALID_ID_MATCHER = /[^A-Za-z0-9_\.-]/g;

export function create(
      log,
      fileResourceProvider,
      eventBus,
      controls,
      cssLoader,
      themeManager,
      themesPath,
      widgetsPath,
      pagesCollector
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

            const integration = object.options( specification.integration, DEFAULT_INTEGRATION );
            let type = integration.type;
            const technology = integration.technology;
            // Handle legacy widget code:
            if( type === TECHNOLOGY_ANGULAR ) {
               type = TYPE_WIDGET;
            }
            if( type !== TYPE_WIDGET && type !== TYPE_ACTIVITY ) {
               throwError( widgetConfiguration, `Unknown integration type "${type}"` );
            }

            const throwWidgetError = throwError.bind( null, widgetConfiguration );
            const features =
               featuresProvider.featuresForWidget( specification, widgetConfiguration, throwWidgetError );
            const anchorElement = document.createElement( 'DIV' );
            anchorElement.className = normalizeClassName( specification.name );
            anchorElement.id = 'ax' + ID_SEPARATOR + widgetConfiguration.id;
            const widgetEventBus =
               createEventBusForWidget( eventBus, specification, widgetConfiguration );

            const adapterFactory = widgetAdapters[ technology ];
            const adapter = adapterFactory.create( {
               anchorElement,
               context: {
                  eventBus: widgetEventBus,
                  features,
                  id: createIdGeneratorForWidget( widgetConfiguration.id ),
                  widget: {
                     area: widgetConfiguration.area,
                     id: widgetConfiguration.id,
                     path: widgetConfiguration.widget
                  }
               },
               specification
            } );
            adapter.createController( options );

            return {
               id: widgetConfiguration.id,
               adapter,
               destroy() {
                  widgetEventBus.release();
                  adapter.destroy();
               },
               applyViewChanges: adapterFactory.applyViewChanges || null,
               templatePromise: loadAssets(
                  resolvedWidgetPath,
                  integration,
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
    * @param widgetPath
    *    The path suffix used to look up the widget, as given in the instance configuration.
    * @param integration
    *    Details on the integration type and technology: Activities do not require assets.
    * @param widgetSpecification
    *    The widget specification, used to find out if any controls need to be loaded.
    * @param widgetConfiguration
    *    The widget instance configuration
    *
    * @return {Promise<String>}
    *    A promise that will be resolved with the contents of any HTML template for this widget, or with
    *    `null` if there is no template (for example, if this is an activity).
    */
   function loadAssets( widgetPath, integration, widgetSpecification, widgetConfiguration ) {
      if( integration.type === TYPE_ACTIVITY ) {
         return Promise.resolve( null );
      }

      return resolve()
         .then( urls => {
            urls.cssFileUrls.forEach( url => cssLoader.load( url ) );
            return urls.templateUrl ? fileResourceProvider.provide( urls.templateUrl ) : null;
         } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function resolve() {
         // the name from the widget.json
         const specifiedName = widgetSpecification.name;
         const specifiedHtmlFile = specifiedName + '.html';
         const specifiedCssFile = path.join( 'css/', specifiedName + '.css' );
         // for backward compatibility: the name inferred from the reference
         const technicalName = widgetPath.split( '/' ).pop();
         const technicalHtmlFile = technicalName + '.html';
         const technicalCssFile = path.join( 'css/', technicalName + '.css' );

         const refPath = path.extractScheme( widgetConfiguration.widget ).ref;
         let promises = [];
         promises.push( themeManager.urlProvider(
            path.join( widgetPath, '[theme]' ),
            path.join( themesPath, '[theme]', 'widgets', specifiedName ),
            [ path.join( themesPath, '[theme]', 'widgets', refPath ) ]
         ).provide( [
            specifiedHtmlFile,
            specifiedCssFile,
            technicalHtmlFile,
            technicalCssFile
         ] ) );

         promises = promises.concat( loadControlAssets() );
         return Promise.all( promises )
            .then( results => {
               const widgetUrls = results[ 0 ];
               const cssUrls = results.slice( 1 )
                  .map( urls => urls[ 0 ] )
                  .concat( ( widgetUrls[ 1 ] || widgetUrls[ 3 ] ) )
                  .filter( url => !!url );

               return {
                  templateUrl: widgetUrls[ 0 ] || widgetUrls[ 2 ] || '',
                  cssFileUrls: cssUrls
               };
            } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function loadControlAssets() {
         return ( widgetSpecification.controls || [] )
            .map( controlRef => {
               const descriptor = controls.descriptor( controlRef );
               const resolvedPath = controls.resolve( controlRef );
               const name = descriptor.name;

               const cssPathInControl = path.join( resolvedPath, '[theme]' );
               let cssPathInTheme = path.join( themesPath, '[theme]', 'controls', name );
               // TODO: (#273) remove old compatibility stuff
               /*eslint no-underscore-dangle: ["warn", { "allow": ["_compatibility_0x"] }]*/
               if( descriptor._compatibility_0x ) {
                  // LaxarJS v0.x compatibility: use compatibility paths to load CSS.
                  log.warn( 'Deprecation: Control is missing control.json descriptor: [0]', controlRef );
                  cssPathInTheme = path.join( themesPath, '[theme]', controlRef );
               }
               return themeManager
                  .urlProvider( cssPathInControl, cssPathInTheme )
                  .provide( [ path.join( 'css/', name + '.css' ) ] );
            } );
      }

   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function checkTechnologyCompatibility( widgetDescriptor ) {
      return controlDescriptor => {
         const controlTechnology = ( controlDescriptor.integration || DEFAULT_INTEGRATION ).technology;
         if( controlTechnology === 'plain' ) {
            // plain is always compatible
            return;
         }

         const widgetTechnology = ( widgetDescriptor.integration || DEFAULT_INTEGRATION ).technology;
         if( widgetTechnology === controlTechnology ) {
            return;
         }

         log.warn(
            'Incompatible integration technologies: widget [0] ([1]) cannot use control [2] ([3])',
            widgetDescriptor.name, widgetTechnology, controlDescriptor.name, controlTechnology
         );
      };
   }

}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function normalizeClassName( str ) {
   return str
      .replace( /([a-z0-9])([A-Z])/g, ( $_, $0, $1 ) => $0 + '-' + $1 )
      .replace( /_/g, '-' )
      .toLowerCase();
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function throwError( widgetConfiguration, message ) {
   throw new Error( string.format(
      'Error loading widget "[widget]" (id: "[id]"): [0]', [ message ], widgetConfiguration
   ) );
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createIdGeneratorForWidget( widgetId ) {
   const charCodeOfA = 'a'.charCodeAt( 0 );
   function fixLetter( l ) {
      // We map invalid characters deterministically to valid lower case letters. Thereby a collision of
      // two ids with different invalid characters at the same positions is less likely to occur.
      return String.fromCharCode( charCodeOfA + ( l.charCodeAt( 0 ) % 26 ) );
   }

   const prefix = 'ax' + ID_SEPARATOR + widgetId.replace( INVALID_ID_MATCHER, fixLetter ) + ID_SEPARATOR;
   return localId => prefix + ( '' + localId ).replace( INVALID_ID_MATCHER, fixLetter );
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

function createEventBusForWidget( eventBus, widgetSpecification, widgetConfiguration ) {

   const collaboratorId = 'widget.' + widgetSpecification.name + '#' + widgetConfiguration.id;

   function forward( to ) {
      return () => eventBus[ to ].apply( eventBus, arguments );
   }

   function augmentOptions( optionalOptions ) {
      return object.options( optionalOptions, { sender: collaboratorId } );
   }

   const subscriptions = [];
   function unsubscribe( subscriber ) {
      eventBus.unsubscribe( subscriber );
   }

   return {
      addInspector: forward( 'addInspector' ),
      setErrorHandler: forward( 'setErrorHandler' ),
      setMediator: forward( 'setMediator' ),
      unsubscribe,
      subscribe( eventName, subscriber, optionalOptions ) {
         subscriptions.push( subscriber );

         const options = object.options( optionalOptions, { subscriber: collaboratorId } );

         eventBus.subscribe( eventName, subscriber, options );
      },
      publish( eventName, optionalEvent, optionalOptions ) {
         return eventBus.publish( eventName, optionalEvent, augmentOptions( optionalOptions ) );
      },
      publishAndGatherReplies( eventName, optionalEvent, optionalOptions ) {
         return eventBus
            .publishAndGatherReplies( eventName, optionalEvent, augmentOptions( optionalOptions ) );
      },
      release() {
         subscriptions.forEach( unsubscribe );
      }
   };
}
