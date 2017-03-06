import { create as createWidgetServicesI18n } from '../widget_services_i18n';
import { create as createEventBusMock } from '../../testing/event_bus_mock';
import { create as createConfigurationMock } from '../../testing/configuration_mock';

const CONFIGURED_FALLBACK = 'en-US';
const INTERNAL_FALLBACK = 'en';

describe( 'axI18n', () => {

   let axI18n;
   let i18nValue;
   let i18nFormat;
   let eventBusMock;
   let context;
   let configuration;

   beforeEach( () => {

      i18nValue = {
         'en-US': 'A value',
         de_DE: 'Ein Wert',
         en: 'A value'
      };

      i18nFormat = {
         'en-US': 'Howdy, [0]! [1] is a value.',
         de_DE: 'Guten Tag, [0]! [1] ist ein Wert.',
         en: 'Hello [0]! [1] is a value.'
      };

      eventBusMock = createEventBusMock();
      context = {
         features: {
            i18n: {
               locale: 'default'
            },
            alt: {
               locale: 'alternative',
               alt: {
                  locale: 'alt-by-2'
               }
            }
         },
         widget: {
            id: 'myWidget',
            area: 'containerArea'
         },
         eventBus: eventBusMock
      };
      configuration = createConfigurationMock();

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function mockPublishTag( languageTag, locale = 'default' ) {
      eventBusMock.publish( `didChangeLocale.${locale}`, { locale, languageTag } );
      eventBusMock.flush();
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'created for a widget context with i18n feature ("default" locale)', () => {

      beforeEach( () => {
         axI18n = createWidgetServicesI18n( context, configuration, { fallback: CONFIGURED_FALLBACK } );
         mockPublishTag( 'de_DE' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'asked for the current language tag', () => {

         let defaultTag;
         let altI18n;

         beforeEach( () => {
            defaultTag = axI18n.languageTag();
            altI18n = axI18n.forFeature( 'alt' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'returns the normalized current language tag', () => {
            expect( defaultTag ).toEqual( 'de-de' );
            expect( altI18n.languageTag() ).toEqual( undefined );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'reflects changes to the current language tag', () => {
            mockPublishTag( 'en', 'alternative' );
            expect( altI18n.languageTag() ).toEqual( 'en' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when asked for a localization (localize)', () => {

         it( 'should localize a given internationalized value using the latest language-tag', () => {
            expect( axI18n.localize( i18nValue ) ).toEqual( 'Ein Wert' );

            mockPublishTag( 'en_US' );
            expect( axI18n.localize( i18nValue ) ).toEqual( 'A value' );

            mockPublishTag( 'en' );
            expect( axI18n.localize( i18nValue ) ).toEqual( 'A value' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'should not try to localize a given primitive non-internationalized value', () => {
            expect( axI18n.localize( 'Peter Berger' ) ).toEqual( 'Peter Berger' );
            expect( axI18n.localize( 17 ) ).toEqual( 17 );
            expect( axI18n.localize( true ) ).toEqual( true );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'when the requested localization is missing', () => {

            beforeEach( () => {
               delete i18nValue[ CONFIGURED_FALLBACK ];
               delete i18nValue[ INTERNAL_FALLBACK ];

               mockPublishTag( 'XYZ' );
            } );

            it( 'should return undefined ', () => {
               expect( axI18n.localize( i18nValue ) ).toBeUndefined();

               mockPublishTag( 'de' );
               expect( axI18n.localize( i18nValue ) ).toBeUndefined();
               expect( axI18n.localize( [] ) ).toBeUndefined();
               expect( axI18n.localize( {} ) ).toBeUndefined();
            } );

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'when the requested tag is missing', () => {

            beforeEach( () => {
               mockPublishTag( 'en_GB' );
               mockPublishTag( 'de_DE-xmine', 'alternative' );
            } );

            it( 'should fallback to a more general localization', () => {
               expect( axI18n.localize( i18nValue ) ).toEqual( 'A value' );
               expect( axI18n.forFeature( 'alt' ).localize( i18nValue ) ).toEqual( 'Ein Wert' );
            } );

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( ' when processing languageTags', () => {

            let i18nUnconventionalValue;

            beforeEach( () => {
               i18nUnconventionalValue = {
                  'EN-uS': 'A value',
                  'DE_DE': 'Ein Wert',
                  'En': 'A value'
               };
               mockPublishTag( 'de-DE' );
               mockPublishTag( 'EN_US', 'alternative' );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'should be case-insensitive', () => {
               expect( axI18n.localize( i18nValue ) ).toEqual( 'Ein Wert' );
               expect( axI18n.localize( i18nUnconventionalValue ) ).toEqual( 'Ein Wert' );
               expect( axI18n.localize( { 'de': 'hey', 'de_DE': 'ho' } ) ).toEqual( 'ho' );

               expect( axI18n.forFeature( 'alt' ).localize( i18nValue ) ).toEqual( 'A value' );
               expect( axI18n.forFeature( 'alt' ).localize( i18nValue ) ).toEqual( 'A value' );
               expect( axI18n.forFeature( 'alt' ).localize( i18nUnconventionalValue ) ).toEqual( 'A value' );
               expect( axI18n.forFeature( 'alt' ).localize( i18nUnconventionalValue ) ).toEqual( 'A value' );
               expect( axI18n.forFeature( 'alt' ).localize( 17 ) ).toEqual( 17 );
               expect(
                  axI18n.forFeature( 'alt' ).localize( { 'enGb': Error, 'en-GB-': Error } )
               ).toBeUndefined();
            } );

         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'asked to publish a new language tag (update)', () => {

         describe( 'for the default locale', () => {

            beforeEach( () => {
               axI18n.update( 'en-NZ' );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'publishes an update to the configured locale on the event bus', () => {
               expect( eventBusMock.publishAndGatherReplies ).toHaveBeenCalledWith(
                  'changeLocaleRequest.default',
                  { locale: 'default', languageTag: 'en-NZ' },
                  jasmine.any( Object )
               );
            } );

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'for an alternative locale', () => {

            beforeEach( () => {
               axI18n.forFeature( 'alt' ).update( 'de' );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'publishes an update to the configured locale on the event bus', () => {
               expect( eventBusMock.publishAndGatherReplies ).toHaveBeenCalledWith(
                  'changeLocaleRequest.alternative',
                  { locale: 'alternative', languageTag: 'de' },
                  jasmine.any( Object )
               );
            } );

         } );

      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'created for a widget context, with *strict* localization', () => {

      beforeEach( () => {
         axI18n = createWidgetServicesI18n( context, configuration, { strict: true } );
         mockPublishTag( 'de' );
         mockPublishTag( 'en_GB', 'alternative' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'should return undefined when the exact requested localization is missing', () => {
         expect( axI18n.localize( i18nValue ) ).toBeUndefined();
         expect( axI18n.localize( i18nValue ) ).toBeUndefined();
         expect( axI18n.localize( i18nValue ) ).toBeUndefined();
         expect( axI18n.localize( [] ) ).toBeUndefined();
         expect( axI18n.localize( {} ) ).toBeUndefined();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'should be case-insensitive when processing languageTags', () => {
         expect( axI18n.localize( { 'DE': 'ok', 'en': Error } ) ).toEqual( 'ok' );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'created for a widget context, with *relaxed* localization', () => {

      beforeEach( () => {
         axI18n = createWidgetServicesI18n( context, configuration,
            { strict: false, fallback: CONFIGURED_FALLBACK } );
         mockPublishTag( 'de_DE' );
         mockPublishTag( 'en', 'alternative' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'should localize a given internationalized value using the given language-tag', () => {
         expect( axI18n.localize( i18nValue ) ).toEqual( 'Ein Wert' );
         expect( axI18n.forFeature( 'alt' ).localize( i18nValue ) ).toEqual( 'A value' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when the requested localization is missing, and there is no fallback', () => {

         beforeEach( () => {
            mockPublishTag( 'en_GB' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'should return undefined', () => {
            expect( axI18n.localize( [] ) ).toBeUndefined();
            expect( axI18n.localize( {} ) ).toBeUndefined();
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'asked to track i18n state for the default locale', () => {

         beforeEach( () => {
            axI18n.track();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'references the current state of the default locale on the provided context under i18n', () => {
            expect( context.i18n.locale ).toEqual( 'default' );
            expect( context.i18n.tags[ 'default' ] ).toEqual( 'de-de' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'when the language tag is modified', () => {

            beforeEach( () => {
               mockPublishTag( 'de-CH' );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'references the updated state on the provided context under i18n', () => {
               expect( context.i18n.locale ).toEqual( 'default' );
               expect( context.i18n.tags[ 'default' ] ).toEqual( 'de-ch' );
            } );

         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'asked to track i18n state for the alternative locale', () => {

         beforeEach( () => {
            axI18n.forFeature( 'alt' ).track();
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'references the current state of the default locale on the provided context under i18n', () => {
            expect( context.alt.locale ).toEqual( 'alternative' );
            expect( context.alt.tags[ 'alternative' ] ).toEqual( 'en' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'asked to track i18n state for the default locale under a user-defined path', () => {

         beforeEach( () => {
            axI18n.track( 'at.another.location' );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         it( 'references the current state of the default locale on the provided context under i18n', () => {
            expect( context.at.another.location.locale ).toEqual( 'default' );
            expect( context.at.another.location.tags[ 'default' ] ).toEqual( 'de-de' );
         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      describe( 'when change handlers are registered for locales default & alt (whenLocaleChanged)', () => {

         let defaultHandler;
         let alternativeHandler;

         beforeEach( () => {
            defaultHandler = jasmine.createSpy();
            alternativeHandler = jasmine.createSpy();
            axI18n.whenLocaleChanged( defaultHandler );
            axI18n.forFeature( 'alt' ).whenLocaleChanged( alternativeHandler );
         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'when the language tag of the default locale is updated', () => {

            beforeEach( () => {
               mockPublishTag( 'en-US' );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'should invoke the default handler with the new language tag', () => {
               expect( defaultHandler ).toHaveBeenCalledWith( 'en-US' );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'should reflect the new language tag', () => {
               expect( axI18n.localize( i18nValue ) ).toEqual( 'A value' );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'should not invoke the alt locale handler', () => {
               expect( alternativeHandler ).not.toHaveBeenCalled();
            } );

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'when released and the language tag of the default locale is updated (release)', () => {

            beforeEach( () => {
               axI18n.release();
               mockPublishTag( 'en-US' );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'should not invoke the default handler with the new language tag', () => {
               expect( defaultHandler ).not.toHaveBeenCalled();
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'should not reflect the new language tag', () => {
               expect( axI18n.localize( i18nValue ) ).toEqual( 'Ein Wert' );
            } );

         } );

         /////////////////////////////////////////////////////////////////////////////////////////////////////

         describe( 'when the language tag of the alternative locale is updated', () => {

            beforeEach( () => {
               mockPublishTag( 'de-DE', 'alternative' );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'should invoke the alt handler with the new language tag', () => {
               expect( alternativeHandler ).toHaveBeenCalledWith( 'de-DE' );
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            it( 'should not invoke the default locale handler', () => {
               expect( defaultHandler ).not.toHaveBeenCalled();
            } );

            //////////////////////////////////////////////////////////////////////////////////////////////////

            describe( 'and then "updated" again, with the same tag', () => {

               beforeEach( () => {
                  alternativeHandler.calls.reset();
                  mockPublishTag( 'de-DE', 'alternative' );
               } );

               ///////////////////////////////////////////////////////////////////////////////////////////////

               it( 'should not invoke the alt locale handler again', () => {
                  expect( alternativeHandler ).not.toHaveBeenCalled();
               } );

            } );

         } );

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'should generalize the language tag as needed', () => {
         mockPublishTag( 'de_DE-meinestadt' );
         expect( axI18n.localize( i18nValue ) ).toEqual( 'Ein Wert' );
         mockPublishTag( 'en_US_cyrl', 'alternative' );
         expect( axI18n.forFeature( 'alt' ).localize( i18nValue ) ).toEqual( 'A value' );
         mockPublishTag( 'en-GB', 'alternative' );
         expect( axI18n.forFeature( 'alt' ).localize( i18nValue ) ).toEqual( 'A value' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'should access the fallback locale as needed', () => {
         i18nValue[ CONFIGURED_FALLBACK ] = 'the default';
         mockPublishTag( 'XYZ' );
         expect( axI18n.localize( i18nValue ) ).toEqual( 'the default' );
      } );

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   describe( 'when asked to format an internationalized value (format)', () => {

      beforeEach( () => {
         axI18n = createWidgetServicesI18n( context, configuration, { fallback: CONFIGURED_FALLBACK } );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'should apply any given substitutions to the localized value when asked to format it', () => {
         mockPublishTag( 'en', 'alt-by-2' );
         mockPublishTag( 'de_de', 'alternative' );
         const enUs = axI18n.localize;
         const deDe = axI18n.forFeature( 'alt' ).localize;
         const en = axI18n.forFeature( 'alt.alt' ).localize;

         expect( axI18n.format( i18nFormat, [ 'Joe', enUs( i18nValue ) ] ) )
            .toEqual( 'Howdy, Joe! A value is a value.' );
         expect( axI18n.forFeature( 'alt' ).format( i18nFormat, [ 'Hans', deDe( i18nValue ) ] ) )
            .toEqual( 'Guten Tag, Hans! Ein Wert ist ein Wert.' );
         expect( axI18n.forFeature( 'alt.alt' ).format( i18nFormat, [ 'Kevin', en( i18nValue ) ] ) )
            .toEqual( 'Hello Kevin! A value is a value.' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'should apply named substitutions when formatting a localized value', () => {
         mockPublishTag( 'en_US' );
         expect( axI18n.format( 'Hey [who], dont make it [how]', [], { who: 'Joe', how: 'good' } ) )
            .toEqual( 'Hey Joe, dont make it good' );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'should return undefined when there is no format string for the given languageTag', () => {
         delete i18nFormat[ CONFIGURED_FALLBACK ];
         delete i18nFormat[ 'en' ];

         mockPublishTag( 'en_GB' );
         expect( axI18n.format( i18nFormat, [ 'Giles', axI18n.localize( i18nValue ) ] ) ).toBeUndefined();

         mockPublishTag( 'de' );
         expect( axI18n.format( i18nFormat, [ 'Peter', axI18n.localize( i18nValue ) ] ) ).toBeUndefined();

         mockPublishTag( 'de_CH' );
         expect( axI18n.format( i18nFormat, [ 'Hans', axI18n.localize( i18nValue ) ] ) ).toBeUndefined();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'applies simple string serialization to a non-string format input', () => {
         const i18nInvalidFormat = {
            en_GB: 17,
            de: { 'i': 'am', 'no': 'format string' }
         };

         mockPublishTag( 'en_GB' );
         expect( axI18n.format( i18nInvalidFormat, [ 'Giles', 'a value' ] ) ).toEqual( '17' );
         mockPublishTag( 'de' );
         expect( axI18n.format( i18nInvalidFormat, [ 'Peter', 'ein Wert' ] ) ).toEqual( '[object Object]' );
      } );

   } );

} );
