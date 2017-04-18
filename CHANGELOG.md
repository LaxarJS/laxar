# Changelog

## Last Changes


## v2.0.0-alpha.23

- [#450](https://github.com/LaxarJS/laxar/issues/450): removed configuration option `tooling.enabled`
- [#445](https://github.com/LaxarJS/laxar/issues/445): log: the `console` log channel now uses standard console formatting specifiers
- [#403](https://github.com/LaxarJS/laxar/issues/403): tooling: added external API originally added in LaxarJS 1.3 (#303)
    + **BREAKING CHANGE:** see ticket for details
- [#404](https://github.com/LaxarJS/laxar/issues/404): documentation: the `axTooling` API is now documented


## v2.0.0-alpha.22

- [#447](https://github.com/LaxarJS/laxar/issues/447): testing: made createAxI18nMock friendly to standalone usage
    + **BREAKING CHANGE:** see ticket for details
- [#443](https://github.com/LaxarJS/laxar/issues/443): testing: initialize eventBusMock with noisy error log
- [#448](https://github.com/LaxarJS/laxar/issues/448): documentation: fixed markdown indent in API index


## v2.0.0-alpha.21

- [#446](https://github.com/LaxarJS/laxar/issues/446): documentation: transformed code examples to ES2015
- [#418](https://github.com/LaxarJS/laxar/issues/418): documentation: various API doc fixes, added index.md
- [#438](https://github.com/LaxarJS/laxar/issues/438): log: improved visibility of `log.fatal`
- [#444](https://github.com/LaxarJS/laxar/issues/444): navigo router: fixed use of fallbackHandler (404)


## v2.0.0-alpha.20

- [#440](https://github.com/LaxarJS/laxar/issues/440): navigo router: fixed creation of absolute URLs with hash


## v2.0.0-alpha.19

- [#437](https://github.com/LaxarJS/laxar/issues/437): bootstrapping: new `create().flow().bootstrap()` workflow
    + **BREAKING CHANGE:** see ticket for details
- [#436](https://github.com/LaxarJS/laxar/issues/436): testing: auto-spy unsubscribe-callback of `eventBus.subscribe`
    + NEW FEATURE: see ticket for details
- [#435](https://github.com/LaxarJS/laxar/issues/435): navigo: updated to current version with configurable hash string
    + NEW FEATURE: see ticket for details
- [#348](https://github.com/LaxarJS/laxar/issues/348): documentation: added manual on the `plain` adapter
- [#420](https://github.com/LaxarJS/laxar/issues/420): documentation: added upgrade guide
- [#434](https://github.com/LaxarJS/laxar/issues/434): areaHelper: keep `data-ax-widget-area` attribute
- [#433](https://github.com/LaxarJS/laxar/issues/433): documentation: updated manuals for LaxarJS v2
- [#432](https://github.com/LaxarJS/laxar/issues/432): router: replaced page.js with Navigo
    + **BREAKING CHANGE:** see ticket for details
- [#385](https://github.com/LaxarJS/laxar/issues/385): removed CSS loader
    + **BREAKING CHANGE:** see ticket for details


## v2.0.0-alpha.18

- [#419](https://github.com/LaxarJS/laxar/issues/419): updated contributor information
- [#431](https://github.com/LaxarJS/laxar/issues/431): testing: added `eventBusMock.drainAsync()`
    + NEW FEATURE: see ticket for details


## v2.0.0-alpha.17

- [#429](https://github.com/LaxarJS/laxar/issues/428): i18n: allow instantiating widget service without i18n feature config
    + NEW FEATURE: see ticket for details
- [#408](https://github.com/LaxarJS/laxar/issues/408): area helper: improved error logging when calling domAttachTo
- [#417](https://github.com/LaxarJS/laxar/issues/417): flow: added redirects to paths with parameter values included
    + NEW FEATURE: see ticket for details
- [#430](https://github.com/LaxarJS/laxar/issues/430): page.js: fixed hashbang navigation for bases being prefix of a path
- [#428](https://github.com/LaxarJS/laxar/issues/428): widget service mocks: provide context to area helper in axVisibilityMock
- [#427](https://github.com/LaxarJS/laxar/issues/427): project: revert #425


## v2.0.0-alpha.16

- [#423](https://github.com/LaxarJS/laxar/issues/423): project: fix building LaxarJS when somewhere inside a `node_modules` directory
- [#425](https://github.com/LaxarJS/laxar/issues/425): project: add browser mappings for other entry points to `package.json`
- [#426](https://github.com/LaxarJS/laxar/issues/426): project: don't use library name `laxar` for polyfills and widget service mocks entry points


## v2.0.0-alpha.15

- [#422](https://github.com/LaxarJS/laxar/issues/422): runtime: improved widget services testability
    + NEW FEATURE: see ticket for details
- [#416](https://github.com/LaxarJS/laxar/issues/416): fixed log levels reference in compatibility main file


## v2.0.0-alpha.14

- [#413](https://github.com/LaxarJS/laxar/issues/413): adapters: renamed `onBeforeControllerCreation` hook
    + **BREAKING CHANGE:** see ticket for details
- [#415](https://github.com/LaxarJS/laxar/issues/415): project: updated dev-dependencies, upgraded to webpack 2
- [#414](https://github.com/LaxarJS/laxar/issues/414): areaHelperMock: added missing spies to localName and fullName methods


## v2.0.0-alpha.13

- [#411](https://github.com/LaxarJS/laxar/issues/411): simplified visibility checking
    + **BREAKING CHANGE:** see ticket for details
- [#412](https://github.com/LaxarJS/laxar/issues/412): temporarily re-added widget loader to services


## v2.0.0-alpha.12

- [#398](https://github.com/LaxarJS/laxar/issues/398): removed page service from widget adapter services
    + **BREAKING CHANGE:** see ticket for details
- [#397](https://github.com/LaxarJS/laxar/issues/397): moved adapter errors from widgetLoader to new `adapterUtilities` service
    + **BREAKING CHANGE:** see ticket for details
- [#394](https://github.com/LaxarJS/laxar/issues/394): fixed broken `axI18n.track()`, improved docs and spec coverage


## v2.0.0-alpha.11

- [#380](https://github.com/LaxarJS/laxar/issues/380): removed JSON schema processing from runtime
    + **BREAKING CHANGE:** see ticket for details
- [#405](https://github.com/LaxarJS/laxar/issues/405): JSON schemas have been converted back to JSON and updated to include all artifacts
    + **BREAKING CHANGE:** see ticket for details
- [#410](https://github.com/LaxarJS/laxar/issues/410): adapters: adapters now get access to the flow-service during bootstrapping
- [#407](https://github.com/LaxarJS/laxar/issues/407): polyfills: converted to ES2015 and fixed fetch-polyfill path
- [#406](https://github.com/LaxarJS/laxar/issues/406): fixed typo in comments
- [#396](https://github.com/LaxarJS/laxar/issues/396): adapters: adapter instances no longer need to have a `technology` property
- [#276](https://github.com/LaxarJS/laxar/issues/276): added and fixed API docs
- [#381](https://github.com/LaxarJS/laxar/issues/381): flow: clearly distinguish places from their targets and patterns
    + **BREAKING CHANGE:** see ticket for details
- [#402](https://github.com/LaxarJS/laxar/issues/402): project: polyfill `Object.assign`
- [#395](https://github.com/LaxarJS/laxar/issues/395): cleanup: removed `object.extend` and `object.deepFreeze`
    + **BREAKING CHANGE:** see ticket for details
- [#349](https://github.com/LaxarJS/laxar/issues/349): removed support for MSIE 9
    + **BREAKING CHANGE:** see ticket for details
- [#392](https://github.com/LaxarJS/laxar/issues/392): flow: removed `entryPoint` / `exitPoint` feature
    + **BREAKING CHANGE:** see ticket for details
- [#390](https://github.com/LaxarJS/laxar/issues/390): adapter API: make `artifactProvider` available to adapters and allow `create()` to be async
    + NEW FEATURE: see ticket for details


## v2.0.0-alpha.10

- [#389](https://github.com/LaxarJS/laxar/issues/389): flow: normalize generated URLs (no trailing `/_`)
    + **BREAKING CHANGE:** see ticket for details
- [#388](https://github.com/LaxarJS/laxar/issues/388): flow: fixed handling of parameter-only places
- [#386](https://github.com/LaxarJS/laxar/issues/386): flow: double-encode slashes in path segments
- [#387](https://github.com/LaxarJS/laxar/issues/387): flow: reverted name-change (keep `constructAbsoluteUrl`)
    + NEW FEATURE: see ticket for details
- [#384](https://github.com/LaxarJS/laxar/issues/384): flow: simplified handling of invalid empty places
- [#375](https://github.com/LaxarJS/laxar/issues/375): flow: added support for query parameters
    + NEW FEATURE: see ticket for details
- [#376](https://github.com/LaxarJS/laxar/issues/376): flow: fixed `constructAbsoluteUrl` (was not absolute)
- [#371](https://github.com/LaxarJS/laxar/issues/371): flow: fixed URL encoding of place parameter values
- [#366](https://github.com/LaxarJS/laxar/issues/366): axFlowService: removed `constructAnchor` and `constructPath`
    + **BREAKING CHANGE:** see ticket for details
- [#369](https://github.com/LaxarJS/laxar/issues/369): documentation: improved docs and specs for object.path/setPath
- [#323](https://github.com/LaxarJS/laxar/issues/323): documentation: fixed link
- [#365](https://github.com/LaxarJS/laxar/issues/365): jasmine: set fixed minor version
- [#364](https://github.com/LaxarJS/laxar/issues/364): axFlowService: widgets can now longer access the flow controller
    + **BREAKING CHANGE:** see ticket for details
- [#362](https://github.com/LaxarJS/laxar/issues/362): loaders: support new `styleSource` and `templateSource` in artifact descriptors
    + NEW FEATURE: see ticket for details
- [#317](https://github.com/LaxarJS/laxar/issues/317): utilities: removed `path`, added `browser.resolve`
- [#357](https://github.com/LaxarJS/laxar/issues/357): runtime: consolidated modules into `lib/runtime`
- [#361](https://github.com/LaxarJS/laxar/issues/361): widget services: re-added `axControls` injection


## v2.0.0-alpha.9

- [#358](https://github.com/LaxarJS/laxar/issues/358): adapter API: simplified further
    + **BREAKING CHANGE:** see ticket for details


## v2.0.0-alpha.8

- [#360](https://github.com/LaxarJS/laxar/issues/360): routing: use `flow.router.base` instead of `baseHref` config
    + **BREAKING CHANGE:** see ticket for details
- [#351](https://github.com/LaxarJS/laxar/issues/351): testing: provided full set of widget service mocks
    + NEW FEATURE: see ticket for details


## v2.0.0-alpha.7
## v2.0.0-alpha.6

- [#356](https://github.com/LaxarJS/laxar/issues/356): event bus: can be created with a custom error handler
    + **BREAKING CHANGE:** see ticket for details


## v2.0.0-alpha.5

- [#355](https://github.com/LaxarJS/laxar/issues/355): json validator: moved to utilities
- [#354](https://github.com/LaxarJS/laxar/issues/354): event bus: removed unsubscribe methods
    + **BREAKING CHANGE:** see ticket for details
- [#353](https://github.com/LaxarJS/laxar/issues/353): log: changed level to levels
    + **BREAKING CHANGE:** see ticket for details
- [#332](https://github.com/LaxarJS/laxar/issues/332): widget services: added axI18n service
    + NEW FEATURE: see ticket for details
- [#344](https://github.com/LaxarJS/laxar/issues/344): widget services: added axAssets service
- [#345](https://github.com/LaxarJS/laxar/issues/345): added `axConfiguration.ensure`, collected configuration defaults in `services`
- [#347](https://github.com/LaxarJS/laxar/issues/347): timer: removed resumedOrStarted and added missing tests
- [#300](https://github.com/LaxarJS/laxar/issues/300): plain widget adapter: added axWithDom service and renamed DOM ready hook
    + **BREAKING CHANGE:** see ticket for details
- [#309](https://github.com/LaxarJS/laxar/issues/309): runtime: slightly simplified area helper
- [#333](https://github.com/LaxarJS/laxar/issues/333): added `axVisibility` injection to replace the visibility helper of patterns
    + NEW FEATURE: see ticket for details
- [#346](https://github.com/LaxarJS/laxar/issues/346): testing: added spec-tests for the various mocks
- [#304](https://github.com/LaxarJS/laxar/issues/304): loaders: replaced dynamic artifact resolution with prebuilt artifacts listing
    + **BREAKING CHANGE:** see ticket for details
- [#270](https://github.com/LaxarJS/laxar/issues/270): json validator: simplified return value
- [#307](https://github.com/LaxarJS/laxar/issues/307): flow: improved page.js integration
    + NEW FEATURE: see ticket for details
    + **BREAKING CHANGE:** see ticket for details
- [#337](https://github.com/LaxarJS/laxar/issues/337): widget adapters: removed applyViewChanges from widget adapter api
    + **BREAKING CHANGE:** see ticket for details
- [#340](https://github.com/LaxarJS/laxar/issues/340): heartbeat: call listeners asynchronously so that event bus promises have already been processed
- [#339](https://github.com/LaxarJS/laxar/issues/339): event bus: return unsubscribe function on subscription
- [#338](https://github.com/LaxarJS/laxar/issues/338): event bus: automatically remove inspectors on widget destruction
    + **BREAKING CHANGE:** see ticket for details
- [#308](https://github.com/LaxarJS/laxar/issues/308): event bus: removed setMediator and setErrorHandler
    + **BREAKING CHANGE:** see ticket for details


## v2.0.0-alpha.4

- [#335](https://github.com/LaxarJS/laxar/issues/335): widget services: build lazily, allow to decorate
    + NEW FEATURE: see ticket for details
- [#334](https://github.com/LaxarJS/laxar/issues/334): added LaxarJS v1.x compatibility helpers
    + NEW FEATURE: see ticket for details
- [#331](https://github.com/LaxarJS/laxar/issues/331): widget services: added axAreaHelper service
- [#306](https://github.com/LaxarJS/laxar/issues/306): log: added as property to widget context object
- [#326](https://github.com/LaxarJS/laxar/issues/326): documentation: added manual for injectable widget services
- [#321](https://github.com/LaxarJS/laxar/issues/321): simplified file listings API and file resource provider
    + **BREAKING CHANGE:** see ticket for details
- [#328](https://github.com/LaxarJS/laxar/issues/328): allow to configure if and how the instanceId is generated
    + NEW FEATURE: see ticket for details
- [#327](https://github.com/LaxarJS/laxar/issues/327): EventBus: simplified internal API
- [#329](https://github.com/LaxarJS/laxar/issues/329): made any access to laxarInstances go through a laxar API
    + NEW FEATURE: see ticket for details
- [#273](https://github.com/LaxarJS/laxar/issues/273): removed asset-loading compatibility code for pre-1.0 widgets
    + **BREAKING CHANGE:** see ticket for details
- [#310](https://github.com/LaxarJS/laxar/issues/310): services: adjusted set of services available to application artifacts
    + **BREAKING CHANGE:** see ticket for details
- [#325](https://github.com/LaxarJS/laxar/issues/325): project: improved browser-spec reporting
- [#324](https://github.com/LaxarJS/laxar/issues/324): project: es2015 object-rest/spread, array.includes
- [#318](https://github.com/LaxarJS/laxar/issues/318): logging: improved source location reporting
    + NEW FEATURE: see ticket for details
- [#316](https://github.com/LaxarJS/laxar/issues/316): fn: removed
    + **BREAKING CHANGE:** see ticket for details
- [#319](https://github.com/LaxarJS/laxar/issues/319): storage: simplified prefix generation
- [#305](https://github.com/LaxarJS/laxar/issues/305): widget-areas: no longer generate first/last classes
    + **BREAKING CHANGE:** see ticket for details
- [#320](https://github.com/LaxarJS/laxar/issues/320): use shared eslint configuration
- [#315](https://github.com/LaxarJS/laxar/issues/315): added and applied some more complex eslint rules
- [#302](https://github.com/LaxarJS/laxar/issues/302): added and applied comprehensive eslint rules


## v2.0.0-alpha.3

- [#314](https://github.com/LaxarJS/laxar/issues/314): re-enabled junit reporting and firefox/chrome tests
- [#313](https://github.com/LaxarJS/laxar/issues/313): added i18n mock


## v2.0.0-alpha.2

- [#311](https://github.com/LaxarJS/laxar/issues/311): moved webpack-jasmine-html-runner-plugin to its own project
- [#312](https://github.com/LaxarJS/laxar/issues/312): provide required polyfills as bundle
    + NEW FEATURE: see ticket for details


## v2.0.0-alpha.1

- [#303](https://github.com/LaxarJS/laxar/issues/298): modules: eliminated all global state
    + **BREAKING CHANGE:** see ticket for details
- [#298](https://github.com/LaxarJS/laxar/issues/298): modules: load using webpack
    + **BREAKING CHANGE:** see ticket for details
- [#299](https://github.com/LaxarJS/laxar/issues/299): plain widget adapter: fixed injectable service names
- [#291](https://github.com/LaxarJS/laxar/issues/291): page loader: merged namespaces for widget- and composition-ids
- [#286](https://github.com/LaxarJS/laxar/issues/286): flow: fixed flow-validation error message format
- [#277](https://github.com/LaxarJS/laxar/issues/277): loaders: Fix problem with insertBeforeId in compositions
- [#274](https://github.com/LaxarJS/laxar/issues/274): loaders: Fix handling of compositions without '.' area
- [#296](https://github.com/LaxarJS/laxar/issues/296): documentation: fixed string API doc module name
- [#269](https://github.com/LaxarJS/laxar/issues/269): EventBus: fixed handling of single `did` response after multiple requests with individual `will` responses
- [#293](https://github.com/LaxarJS/laxar/issues/293): loaders: mention composition name and ID when composition features fail validation
- [#281](https://github.com/LaxarJS/laxar/issues/281): bootstrapping: improved state encapsulation for adapters and modules
    + **BREAKING CHANGE:** see ticket for details
- [#284](https://github.com/LaxarJS/laxar/issues/284): documentation: fixed broken link
- [#295](https://github.com/LaxarJS/laxar/issues/295): documentation: fixed order of preliminary readings
- [#279](https://github.com/LaxarJS/laxar/issues/279): bootstrapping: a custom node for the page can now be used
    + **BREAKING CHANGE:** see ticket for details
- [#264](https://github.com/LaxarJS/laxar/issues/264): configuration: paths are now configurable via application configuration
    + **BREAKING CHANGE:** see ticket for details


## v2.0.0-alpha.0

- [#272](https://github.com/LaxarJS/laxar/issues/272): AngularJS: Removed all dependencies and usages in core
    + **BREAKING CHANGE:** see ticket for details
- [#271](https://github.com/LaxarJS/laxar/issues/271): page: implemented without AngularJS (not yet in use)
- [#267](https://github.com/LaxarJS/laxar/issues/267): flow: implemented without AngularJS (not yet in use)
    + **BREAKING CHANGE:** see ticket for details
- [#262](https://github.com/LaxarJS/laxar/issues/262): services: extracted stateful services
    + **BREAKING CHANGE:** see ticket for details
- [#265](https://github.com/LaxarJS/laxar/issues/265): visibility service: moved from core to angular adapter
    + **BREAKING CHANGE:** see ticket for details
- [#263](https://github.com/LaxarJS/laxar/issues/263): modules: made all modules stateless
    + **BREAKING CHANGE:** see ticket for details
- [#261](https://github.com/LaxarJS/laxar/issues/261): profiling: moved from core to angular adapter
    + **BREAKING CHANGE:** see ticket for details
- [#258](https://github.com/LaxarJS/laxar/issues/258): directives: moved from core to angular adapter
    + **BREAKING CHANGE:** see ticket for details
- [#259](https://github.com/LaxarJS/laxar/issues/259): AngularJS: implemented widget area collector without angular
- [#257](https://github.com/LaxarJS/laxar/issues/257): AngularJS: moved widget adapter to its own repository
    + **BREAKING CHANGE:** see ticket for details
- [#256](https://github.com/LaxarJS/laxar/issues/256): using locally installed jspm
- [#254](https://github.com/LaxarJS/laxar/issues/254): documentation: improved and updated manuals
- [#250](https://github.com/LaxarJS/laxar/issues/250): testing: updated spec runners to Jasmine 2.4
- [#246](https://github.com/LaxarJS/laxar/issues/246): transformed AMD modules to es2015 modules
    + **BREAKING CHANGE:** see ticket for details


## v1.2.0

- [#249](https://github.com/LaxarJS/laxar/issues/249): project: updated copyright year in file header
- [#248](https://github.com/LaxarJS/laxar/issues/248): tooling: added compositions to page inspection API
    + NEW FEATURE: see ticket for details
- [#247](https://github.com/LaxarJS/laxar/issues/247): tooling: added page inspection API
    + NEW FEATURE: see ticket for details
- [#244](https://github.com/LaxarJS/laxar/issues/244): documentation: added extensive documentation on visibility events


## v1.2.0-alpha.1

- [#243](https://github.com/LaxarJS/laxar/issues/243): fn: fixed invalid setTimeout application


## v1.2.0-alpha.0

- [#242](https://github.com/LaxarJS/laxar/issues/242): tooling: added `provideQ` factory
    + NEW FEATURE: see ticket for details
- [#241](https://github.com/LaxarJS/laxar/issues/241): fn: allow to cancel debounced functions
    + NEW FEATURE: see ticket for details
- [#240](https://github.com/LaxarJS/laxar/issues/240): documentation: fixed prerequisites (yeoman, not grunt-init)


## v1.1.0

## v1.1.0-beta.1

- [#238](https://github.com/LaxarJS/laxar/issues/238): testing: fixed initialization of `axControls` mock


## v1.1.0-beta.0

- [#210](https://github.com/LaxarJS/laxar/issues/210): runtime: added `axControls` service so that controls can be instantiated in any integration technology
    + NEW FEATURE: see ticket for details


## v1.1.0-alpha.9

- [#237](https://github.com/LaxarJS/laxar/issues/237): runtime: defer page-controller injections until controller instantiation


## v1.1.0-alpha.8

- [#236](https://github.com/LaxarJS/laxar/issues/236): loaders: fixed typo which prevented default theme from loading (debug mode)


## v1.1.0-alpha.7

- [#235](https://github.com/LaxarJS/laxar/issues/235): loaders: to find CSS in theme, first try the descriptor name


## v1.1.0-alpha.6

- [#234](https://github.com/LaxarJS/laxar/issues/234): testing: do not query widget CSS/HTML assets


## v1.1.0-alpha.5

- [#233](https://github.com/LaxarJS/laxar/issues/233): loaders: fixed widget theme lookup
- [#232](https://github.com/LaxarJS/laxar/issues/232): documentation: explain Bower-based widget installation
    + NEW FEATURE: see ticket for details


## v1.1.0-alpha.4

- [#195](https://github.com/LaxarJS/laxar/issues/195): documentation: added manual on the FileResourceProvider
    + NEW FEATURE: see ticket for details
- [#230](https://github.com/LaxarJS/laxar/issues/230): documentation: fixed example in *Widgets and Activities* manual
- [#223](https://github.com/LaxarJS/laxar/issues/223): documentation: explain tooling with the new grunt tasks
- [#228](https://github.com/LaxarJS/laxar/issues/228): documentation: documented writing widget controller for specific technologies
- [#229](https://github.com/LaxarJS/laxar/issues/229): adapters: added axFeatures as injection for angular widgets
- [#221](https://github.com/LaxarJS/laxar/issues/221): adapters: made all relevant services available to plain widgets


## v1.1.0-alpha.3

- [#227](https://github.com/LaxarJS/laxar/issues/227): testing: fixed widget descriptor lookup so that it is independent of the widget location
- [#225](https://github.com/LaxarJS/laxar/issues/225): loaders: prefer widget specification name over directory name if possible
- [#226](https://github.com/LaxarJS/laxar/issues/226): angular: normalized widget module lookup so that widget.json can use dash-separated-names
- [#129](https://github.com/LaxarJS/laxar/issues/129): integration: implemented using widgets installed via bower as amd module
    + NEW FEATURE: see ticket for details
- [#222](https://github.com/LaxarJS/laxar/issues/222): require_config: added documentation for widget / control specific configuration
- [#215](https://github.com/LaxarJS/laxar/issues/215): testing: updated documentation regarding widget tests
- [#220](https://github.com/LaxarJS/laxar/issues/220): fixed off-by-one bug in HTML spec-runners
- [#78](https://github.com/LaxarJS/laxar/issues/78): tests: allow to execute spec-tests using a project RequireJS configuration
    + NEW FEATURE: see ticket for details


## v1.1.0-alpha.2

- [#219](https://github.com/LaxarJS/laxar/issues/219): added Travis-CI build integration
    + NEW FEATURE: see ticket for details
- [#213](https://github.com/LaxarJS/laxar/issues/213): documentation: fixed widget installation manual
- [#214](https://github.com/LaxarJS/laxar/issues/214): axHeartBeat: using applyViewChanges via page controller


## v1.1.0-alpha.1

- [#193](https://github.com/LaxarJS/laxar/issues/193): loaders: implemented nesting of layouts within areas directly in a page


## v1.1.0-alpha.0

- [#127](https://github.com/LaxarJS/laxar/issues/127): testing: made necessary changes for new, distinct testing framework
- [#211](https://github.com/LaxarJS/laxar/issues/211): project: state compatibility with AngularJS 1.4.x
    + NEW FEATURE: see ticket for details
- [#212](https://github.com/LaxarJS/laxar/issues/212): documentation: added basic manual on installing controls
- [#150](https://github.com/LaxarJS/laxar/issues/150): documentation: added contributor guide
- [#209](https://github.com/LaxarJS/laxar/issues/209): api-doc: update generated api doc
- [#208](https://github.com/LaxarJS/laxar/issues/208): configuration: applied default for `i18n.locales` when setting `$rootScope.i18n.tags`


## v1.0.0

- [#205](https://github.com/LaxarJS/laxar/issues/205): documentation: updated README.md according to latest template version


## v1.0.0-beta.1

- [#207](https://github.com/LaxarJS/laxar/issues/207): documentation: adapted to changed naming
- [#206](https://github.com/LaxarJS/laxar/issues/206): runtime: fixed problem with possible duplicate flow-controller
- [#203](https://github.com/LaxarJS/laxar/issues/203): documentation: updated manual on controls to cover the new descriptor


## v1.0.0-beta.0

- [#132](https://github.com/LaxarJS/laxar/issues/132): documentation: provided updated API doc for relevant modules


## v1.0.0-alpha.15

- [#202](https://github.com/LaxarJS/laxar/issues/202): themes: made path to the default theme configurable
    + **BREAKING CHANGE:** see ticket for details


## v1.0.0-alpha.14

- [#201](https://github.com/LaxarJS/laxar/issues/201): testing: fix loading of old-style controls


## v1.0.0-alpha.13

- [#200](https://github.com/LaxarJS/laxar/issues/200): loaders, testing: fix loading of controls that are configured as commonjs packages in RequireJS


## v1.0.0-alpha.12

- [#199](https://github.com/LaxarJS/laxar/issues/199): project: removed unnecessary dependencies, simplified Bower references
- [#197](https://github.com/LaxarJS/laxar/issues/197): loaders: read control name from control.json descriptor if present
    + NEW FEATURE: see ticket for details


## v1.0.0-alpha.11

- [#198](https://github.com/LaxarJS/laxar/issues/198): project: prepared `laxar` npm package


## v1.0.0-alpha.10

- [#196](https://github.com/LaxarJS/laxar/issues/196): runtime: fixed default theme loading


## v1.0.0-alpha.9

- [#183](https://github.com/LaxarJS/laxar/issues/183): runtime, file_resource_provider: allow to load file listings directly from configuration
    + NEW FEATURE: see ticket for details
- [#186](https://github.com/LaxarJS/laxar/issues/186): loaders: allow to load layouts from theme
    + NEW FEATURE: see ticket for details
- [#192](https://github.com/LaxarJS/laxar/issues/192): loaders: removed duplicate code for defaults application


## v1.0.0-alpha.8

- [#189](https://github.com/LaxarJS/laxar/issues/189): loaders: fixed inferring top-level widget configuration defaults for JSON schema v4
- [#188](https://github.com/LaxarJS/laxar/issues/188): configuration: moved configuration module to utilities
- [#187](https://github.com/LaxarJS/laxar/issues/187): storage: use per-app unique storage prefixes
    + NEW FEATURE: see ticket for details
- [#184](https://github.com/LaxarJS/laxar/issues/184): documentation: fixed logging configuration documentation
- [#185](https://github.com/LaxarJS/laxar/issues/185): logging: configuration value not applied correctly
- [#128](https://github.com/LaxarJS/laxar/issues/128): logging, utilities: simplified and removed some APIs
    + **BREAKING CHANGE:** see ticket for details
- [#159](https://github.com/LaxarJS/laxar/issues/159): flow: removed support for triggerBrowserReload.
    + **BREAKING CHANGE:** see ticket for details
- [#182](https://github.com/LaxarJS/laxar/issues/182): runtime: removed live theme switching
    + **BREAKING CHANGE:** see ticket for details
- [#180](https://github.com/LaxarJS/laxar/issues/180): directives: removed `axPageFade` directive
    + **BREAKING CHANGE:** see ticket for details


## v1.0.0-alpha.7

- [#179](https://github.com/LaxarJS/laxar/issues/179): loaders: fixed loading of CSS for controls
- [#154](https://github.com/LaxarJS/laxar/issues/154): widget_adapters: added deprecation warning for old-style widget modules
- [#177](https://github.com/LaxarJS/laxar/issues/177): runtime: renamed configuration options
    + NEW FEATURE: see ticket for details
- [#171](https://github.com/LaxarJS/laxar/issues/171): documentation: added manual on widget adapters
- [#178](https://github.com/LaxarJS/laxar/issues/178): runtime: renamed AngularJS modules to match AMD modules
- [#176](https://github.com/LaxarJS/laxar/issues/176): documentation: replaced the widget category _portal_ with _laxarjs_
- [#175](https://github.com/LaxarJS/laxar/issues/175): loaders: changed generated DOM- and topic-IDs to be more compact
    + **BREAKING CHANGE:** see ticket for details
- [#174](https://github.com/LaxarJS/laxar/issues/174): widget_adapters: simplified widget adapter API
    + NEW FEATURE: see ticket for details


## v1.0.0-alpha.6

- [#173](https://github.com/LaxarJS/laxar/issues/173): testing: fixed a bug when configuring the widget under test.
- [#167](https://github.com/LaxarJS/laxar/issues/167): widget_adapters: added injectable axContext as alternative to AngularJS scopes.
    + NEW FEATURE: see ticket for details
- [#170](https://github.com/LaxarJS/laxar/issues/170): loaders: refactored widget loader and widget adapters.
- [#168](https://github.com/LaxarJS/laxar/issues/168): documentation: added basic documentation on coding style
- [#136](https://github.com/LaxarJS/laxar/issues/136): storage: removed `window.name`-shim for session-storage
    + **BREAKING CHANGE:** see ticket for details


## v1.0.0-alpha.5

- [#130](https://github.com/LaxarJS/laxar/issues/130): portal: refactored portal artifacts to runtime and loaders.


## v1.0.0-alpha.4

- [#164](https://github.com/LaxarJS/laxar/issues/164): updated bower dependencies jjv and jjve to latest versions.
- [#71](https://github.com/LaxarJS/laxar/issues/71): angular_adapter: widget and activity scopes are now created on demand.


## v1.0.0-alpha.3

- [#165](https://github.com/LaxarJS/laxar/issues/165): i18n: changed localizer.format signature to match string.format
    + **BREAKING CHANGE:** see ticket for details
- [#161](https://github.com/LaxarJS/laxar/issues/161): portal: removed memory leak fix for msie8


## v1.0.0-alpha.2

- [#158](https://github.com/LaxarJS/laxar/issues/158): changed AngularJS support to version 1.3.15.
    + **BREAKING CHANGE:** see ticket for details
- [#147](https://github.com/LaxarJS/laxar/issues/147): footprint: made jquery from a dependency into a dev-dependency
    + NEW FEATURE: see ticket for details
- [#162](https://github.com/LaxarJS/laxar/issues/162): documentation: fixed theme manual after shop-demo update


## v1.0.0-alpha.1

- [#160](https://github.com/LaxarJS/laxar/issues/160): refactoring: normalized AngularJS artifact names
    + **BREAKING CHANGE:** see ticket for details
- [#149](https://github.com/LaxarJS/laxar/issues/149): testing: always use `widget.json` for widget spec tests
    + **BREAKING CHANGE:** see ticket for details
- [#139](https://github.com/LaxarJS/laxar/issues/139): loader: removed widget compatibility warning for now
- [#124](https://github.com/LaxarJS/laxar/issues/124): implemented an adapter for plain JavaScript widgets.
    + NEW FEATURE: see ticket for details


## v1.0.0-alpha.0

- [#103](https://github.com/LaxarJS/laxar/issues/103): portal: removed json patch compatibility layer.
    + **BREAKING CHANGE:** see ticket for details
- [#117](https://github.com/LaxarJS/laxar/issues/117): portal: implemented a flow service that provides place urls usable as hyperlinks.
    + **BREAKING CHANGE:** see ticket for details
- [#35](https://github.com/LaxarJS/laxar/issues/35): Upgraded internal JSON schemas to draft v4.
- [#116](https://github.com/LaxarJS/laxar/issues/116): performance: the flow is now loaded through the file resource provider
    + **BREAKING CHANGE:** see ticket for details
- [#99](https://github.com/LaxarJS/laxar/issues/99): exit points are now configured as `exitPoint` in flow.json.
    + **BREAKING CHANGE:** see ticket for details
- [#72](https://github.com/LaxarJS/laxar/issues/72): configuration: removed deprecated configuration paths.
    + **BREAKING CHANGE:** see ticket for details
- [#88](https://github.com/LaxarJS/laxar/issues/88): footprint: removed `underscore` dependency
- [#70](https://github.com/LaxarJS/laxar/issues/70): footprint: removed `laxar.text` API (use `laxar.string.format` instead)
    + **BREAKING CHANGE:** see ticket for details
- [#92](https://github.com/LaxarJS/laxar/issues/92): removed obsolete mixins in favor of compositions.
    + **BREAKING CHANGE:** see ticket for details


- [#181](https://github.com/LaxarJS/laxar/issues/181): runtime: added missing default for the configuration key `i18n.locales`


## v0.26.0

- [#169](https://github.com/LaxarJS/laxar/issues/169): widget_adapters: fixed plain-adapter to use new-style widget module names
- [#172](https://github.com/LaxarJS/laxar/issues/172): documentation: fixed dead link
- [#166](https://github.com/LaxarJS/laxar/issues/166): cleanup: removed distribution-related configuration and files
- [#163](https://github.com/LaxarJS/laxar/issues/163): EventBus: fixed request topic matching


## v0.25.0

- [#156](https://github.com/LaxarJS/laxar/issues/156): i18n: by default, use relaxed matching for language tags


## v0.24.0

- [#157](https://github.com/LaxarJS/laxar/issues/157): portal: angular-adapter: fixed error reporting
- [#145](https://github.com/LaxarJS/laxar/issues/145): testing: added missing cancel-method to mock-$timeout
- [#155](https://github.com/LaxarJS/laxar/issues/155): visibility: page controller now unsubscribes on tear-down
- [#152](https://github.com/LaxarJS/laxar/issues/152): documentation: added widget installation manual
    + NEW FEATURE: see ticket for details


## v0.23.0

- [#153](https://github.com/LaxarJS/laxar/issues/153): portal: angular-adapter: simplified widget and controller naming
    + NEW FEATURE: see ticket for details
- [#151](https://github.com/LaxarJS/laxar/issues/151): EventBus: fixed cycle count for zero subscribers
- [#148](https://github.com/LaxarJS/laxar/issues/148): documentation: more detailed information on the event bus, link to api doc


## v0.22.0

- [#146](https://github.com/LaxarJS/laxar/issues/146): documentation: improved the prerequisites in the `README.md` and writing style
- [#143](https://github.com/LaxarJS/laxar/issues/143): documentation: fixed testing configuration example (`andCallFake`, not `andCallThrough`)
- [#142](https://github.com/LaxarJS/laxar/issues/142): documentation: fixed task alias for development server (`start`, not `develop`)
- [#144](https://github.com/LaxarJS/laxar/issues/144): EventBus: reject publishAndGatherReplies-promise after timeout
    + **BREAKING CHANGE:** see ticket for details


## v0.21.0

- [#137](https://github.com/LaxarJS/laxar/issues/137): flow: warn on empty place
- [#140](https://github.com/LaxarJS/laxar/issues/140): EventBus: make timeout configurable
- [#126](https://github.com/LaxarJS/laxar/issues/126): testing: `axEventBus` injection available to widget controllers during testing


## v0.20.0

- [#138](https://github.com/LaxarJS/laxar/issues/138): logging: the instance id is now generated by the log context and transmitted using an $http interceptor
    + NEW FEATURE: see ticket for details
- [#134](https://github.com/LaxarJS/laxar/issues/134): storage: fixed storage in iOS Safari private browsing


## v0.19.0

- [#125](https://github.com/LaxarJS/laxar/issues/125): axLayout: emit AngularJS event when loaded
    + NEW FEATURE: see ticket for details
- [#113](https://github.com/LaxarJS/laxar/issues/113): documentation: manual on tools
- [#122](https://github.com/LaxarJS/laxar/issues/122): testing: allow to inject dependencies
    + NEW FEATURE: see ticket for details
- [#123](https://github.com/LaxarJS/laxar/issues/123): portal: preload widget assets on page load
- [#117](https://github.com/LaxarJS/laxar/issues/117): portal: implemented a flow service that provides place urls usable as hyperlinks.
- [#121](https://github.com/LaxarJS/laxar/issues/121): documentation: have README.md next steps point to manuals
- [#118](https://github.com/LaxarJS/laxar/issues/118): performance: removed $timeout from axPageFade
- [#120](https://github.com/LaxarJS/laxar/issues/120): portal: fixed flaky timestamp test
- [#119](https://github.com/LaxarJS/laxar/issues/119): portal: fixed race condition in page loader


## v0.18.0

- [#97](https://github.com/LaxarJS/laxar/issues/97): documentation: manual on themes
- [#112](https://github.com/LaxarJS/laxar/issues/112): documentation: removed colloquial style


## v0.17.0

- [#108](https://github.com/LaxarJS/laxar/issues/108): documentation: unify code-snippet format, and some polish
- [#109](https://github.com/LaxarJS/laxar/issues/109): documentation: added manual on providing controls
- [#107](https://github.com/LaxarJS/laxar/issues/107): angular widget adapter: added widget specific event bus service.
- [#106](https://github.com/LaxarJS/laxar/issues/106): documentation: fixed manuals, improved introduction in README.md
- [#93](https://github.com/LaxarJS/laxar/issues/93): refactoring: extracted page related services into own files.
- [#98](https://github.com/LaxarJS/laxar/issues/98): documentation: added manual on events and pub/sub
- [#100](https://github.com/LaxarJS/laxar/issues/100): widget loader: added angular widget as default integration.
- [#105](https://github.com/LaxarJS/laxar/issues/105): moved resumable timer handling from flow to timer.
- [#104](https://github.com/LaxarJS/laxar/issues/104): configuration: deprecated configuration keys are no handled at one place.
- [#101](https://github.com/LaxarJS/laxar/issues/101): documentation: use "«" rather than "<<" for backwards navigation links
- [#76](https://github.com/LaxarJS/laxar/issues/76): documentation: widgets and activities
- [#75](https://github.com/LaxarJS/laxar/issues/75): documentation: flow and places.
- [#96](https://github.com/LaxarJS/laxar/issues/96): documentation: restructured existing documents and added stubs for missing ones.
- [#95](https://github.com/LaxarJS/laxar/issues/95): documentation: wrote a motivational article for LaxarJS.
- [#94](https://github.com/LaxarJS/laxar/issues/94): footprint: removed the outdated app stub in favor of grunt-init (see README.md)
- [#38](https://github.com/LaxarJS/laxar/issues/38): documentation: pages and compositions.
- [#91](https://github.com/LaxarJS/laxar/issues/91): portal: make sure that widget DOM is attached when linking
- [#90](https://github.com/LaxarJS/laxar/issues/90): documentation: secondary parts of any LaxarJS application
    + NEW FEATURE: see ticket for details
- [#89](https://github.com/LaxarJS/laxar/issues/89): documentation: primary concepts of LaxarJS
- [#84](https://github.com/LaxarJS/laxar/issues/84): storage: storing `undefined` now causes the entry to be removed


## v0.16.0

- [#87](https://github.com/LaxarJS/laxar/issues/87): portal: Ensure anonymization of logged events.
- [#86](https://github.com/LaxarJS/laxar/issues/86): logging: Added tests to ensure that string format compatible format strings using indexed placeholders are supported.
- [#85](https://github.com/LaxarJS/laxar/issues/85): utilities: Implemented support for value mapping functions in string.format.
    + NEW FEATURE: see ticket for details
- [#83](https://github.com/LaxarJS/laxar/issues/83): portal: provided a timestamp service with a mock that works with jasmine
    + NEW FEATURE: see ticket for details
- [#81](https://github.com/LaxarJS/laxar/issues/81): added check for duplicate area definitions in layouts


## v0.15.0

- [#82](https://github.com/LaxarJS/laxar/issues/82): implemented directives axId and axFor
    + NEW FEATURE: see ticket for details
- [#80](https://github.com/LaxarJS/laxar/issues/80): storage: Improved detection of WebStorage API for Internet Explorer
- [#79](https://github.com/LaxarJS/laxar/issues/79): assert: details given as object are now serialized
- [#77](https://github.com/LaxarJS/laxar/issues/77): flow: the log tag `PLCE` with the current place name is set after navigation


## v0.14.0

- [#73](https://github.com/LaxarJS/laxar/issues/73): portal: fixed lookup of merged CSS file
- [#69](https://github.com/LaxarJS/laxar/issues/69): portal: moved setting widget root element IDs to widget loader
- [#68](https://github.com/LaxarJS/laxar/issues/68): fixed wrongly global assert in jshintrc.
- [#67](https://github.com/LaxarJS/laxar/issues/67): re-added missing widget root element IDs.
- [#65](https://github.com/LaxarJS/laxar/issues/65): fixed navigation being broken when parameter values were missing.
- [#66](https://github.com/LaxarJS/laxar/issues/66): prevented endless navigation ping pong in flow controller
- [#63](https://github.com/LaxarJS/laxar/issues/63): axVisibilityService: use scope.$id to identify handlers, not scope.id
- [#62](https://github.com/LaxarJS/laxar/issues/62): fixed endless recursion on navigation when place and target have the same name.


## v0.13.0

- [#61](https://github.com/LaxarJS/laxar/issues/61): added first profiling tools for scope property watchers.
    + NEW FEATURE: see ticket for details
- [#60](https://github.com/LaxarJS/laxar/issues/60): tests: make sure PhantomJS is installed properly, before running spec tests.
- [#52](https://github.com/LaxarJS/laxar/issues/52): portal, testing: added visibility events and the `axVisibilityService`
    + NEW FEATURE: see ticket for details
- [#59](https://github.com/LaxarJS/laxar/issues/59): portal: fixed dangling comma in timer imports
- [#58](https://github.com/LaxarJS/laxar/issues/58): portal, json: fixed copyright headers
- [#57](https://github.com/LaxarJS/laxar/issues/57): portal: fixed double-navigation problem which can lead to skipping places
- [#56](https://github.com/LaxarJS/laxar/issues/56): object: removed all direct calls of hasOwnProperty.
- [#55](https://github.com/LaxarJS/laxar/issues/55): run_spec: disable loading the `widget.json` if the `spec_runner.js` contains `widgetJson: false`
- [#54](https://github.com/LaxarJS/laxar/issues/54): testing: fixed broken testBed injection of $q and $timeout
- [#50](https://github.com/LaxarJS/laxar/issues/50): performance: decoupled instantiation of widget controllers from their DOM


## v0.12.0

- [#49](https://github.com/LaxarJS/laxar/issues/49): added compatibility layer for JSON patch.
    + NEW FEATURE: see ticket for details
- [#48](https://github.com/LaxarJS/laxar/issues/48): Promises generated by the event bus are now scheduled by the event bus, not by AngularJS `$apply`.
- [#51](https://github.com/LaxarJS/laxar/issues/51): Remove some obsolete NPM `devDependencies`.
- [#47](https://github.com/LaxarJS/laxar/issues/47): Do not schedule another full event-bus tick while one is already being processed.
- [#46](https://github.com/LaxarJS/laxar/issues/46): fixed misinterpretation of falsy required attribute in json schema converter.
- [#45](https://github.com/LaxarJS/laxar/issues/45): i18n: adjusted localizer.format specs to changes from [#43](https://github.com/LaxarJS/laxar/issues/43).
- [#43](https://github.com/LaxarJS/laxar/issues/43): string: added new function `string.format` as simpler replacement for `text` library.
    + NEW FEATURE: see ticket for details
- [#42](https://github.com/LaxarJS/laxar/issues/42): portal: added 'language-tag', 'topic-map' and 'localization' formats.
    + NEW FEATURE: see ticket for details
- [#40](https://github.com/LaxarJS/laxar/issues/40): portal: fixed 'flag-topic' pattern.


## v0.11.0

- [#39](https://github.com/LaxarJS/laxar/issues/39): portal: added JSON-schema formats 'topic', 'sub-topic' and 'flag-topic' to widget loader.
    + NEW FEATURE: see ticket for details
- [#37](https://github.com/LaxarJS/laxar/issues/37): improved browsing of existing api doc and fixed some syntactical errors.
- [#36](https://github.com/LaxarJS/laxar/issues/36): jshintrc: disabled enforcement of dot notation for object property access.
- [#34](https://github.com/LaxarJS/laxar/issues/34): Enabled specification of widget features using JSON schema draft v4 notation.
    + NEW FEATURE: see ticket for details
- [#33](https://github.com/LaxarJS/laxar/issues/33): EventBus: added event object to the information sent to inspectors on deliver actions.
- [#31](https://github.com/LaxarJS/laxar/issues/31): Refactored JSON validator for better error messages and schema v4 support.
    + NEW FEATURE: see ticket for details
- [#32](https://github.com/LaxarJS/laxar/issues/32): Configuration: Consolidated and documented configuration options under docs/manuals/configuration.md
    + NEW FEATURE: see ticket for details
- [#30](https://github.com/LaxarJS/laxar/issues/30): PageLoader: added missing check for duplicate composition ids.


## v0.10.0

- [#27](https://github.com/LaxarJS/laxar/issues/27): Portal: Enhanced the portal event bus performance by not requiring a digest/render-cycle on each tick
- [#28](https://github.com/LaxarJS/laxar/issues/28): Fixed null values in widget features within compositions being turned into empty objects.
- [#29](https://github.com/LaxarJS/laxar/issues/29): PageLoader: composition features that are not configured do not result in undefined values for widget features.
- [#25](https://github.com/LaxarJS/laxar/issues/25): Only the page relevant for the current place is loaded now.
- [#17](https://github.com/LaxarJS/laxar/issues/17): Testing: The testBed.setup method can now simulate default-events
    + NEW FEATURE: see ticket for details
- [#26](https://github.com/LaxarJS/laxar/issues/26): Testing: Fixed the responseTransform option for http-mock
- [#22](https://github.com/LaxarJS/laxar/issues/22): FileResourceProvider: allow to embed files into listings
    + NEW FEATURE: see ticket for details
- [#15](https://github.com/LaxarJS/laxar/issues/15): FileResourceProvider, PageLoader: Prevented duplicate (simultaneous) requests to file listings
- [#24](https://github.com/LaxarJS/laxar/issues/24): Widgets and compositions can now be disabled in pages.
    + NEW FEATURE: see ticket for details
- [#23](https://github.com/LaxarJS/laxar/issues/23): FileResourceProvider: Slashes are now correctly handled when checking a file for existence in a listing.
- [#21](https://github.com/LaxarJS/laxar/issues/21): The file resource provider now normalizes its root path.
- [#20](https://github.com/LaxarJS/laxar/issues/20): Fixed event bus inspectors not being notified on unsubscription.
- [#14](https://github.com/LaxarJS/laxar/issues/14): Fixed navigation being broken after successive navigation to the current location.
- [#13](https://github.com/LaxarJS/laxar/issues/13): The current place is now send as part of the didNavigate event.
- [#12](https://github.com/LaxarJS/laxar/issues/12): Testing: Get the LaxarJS tests running in Karma again.
- [#11](https://github.com/LaxarJS/laxar/issues/11): Testing: Handle `spec_runner.js` that are not in a subdirectory of the RequireJS' `baseUrl`.
- [#10](https://github.com/LaxarJS/laxar/issues/10): Testing: Loading controls during tests now works in Karma.
- [#9](https://github.com/LaxarJS/laxar/issues/9): Update Bower from ~1.2.8 to ~1.3.3.
- [#8](https://github.com/LaxarJS/laxar/issues/8): Fixed the cleanup mechanism for generated widget areas.
- [#6](https://github.com/LaxarJS/laxar/issues/6): The Portal now initializes an i18n object on the application's `$rootScope`
- [#5](https://github.com/LaxarJS/laxar/issues/5): Testing: The run_spec-script (used to set up the spec tests) now loads controls declared in the widget.json
- [#4](https://github.com/LaxarJS/laxar/issues/4): PageLoader: Added missing optional negation of generated topics and replacement of expressions in feature keys
- [#3](https://github.com/LaxarJS/laxar/issues/3): Added url formatting for links in Readme.md
- [#2](https://github.com/LaxarJS/laxar/issues/2): Fixed grunt-init step in Getting-Started docs
- [#1](https://github.com/LaxarJS/laxar/issues/1): Added initial Getting-Started documentation
