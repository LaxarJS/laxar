(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("laxar", [], factory);
	else if(typeof exports === 'object')
		exports["laxar"] = factory();
	else
		root["laxar"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	   value: true
	});
	exports._tooling = exports.string = exports.storage = exports.object = exports.log = exports.i18n = exports.fn = exports.configuration = exports.assert = undefined;

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	exports.bootstrap = bootstrap;

	var _log = __webpack_require__(1);

	var _log2 = _interopRequireDefault(_log);

	var _event_bus = __webpack_require__(6);

	var eventBus = _interopRequireWildcard(_event_bus);

	var _file_resource_provider = __webpack_require__(7);

	var fileResourceProvider = _interopRequireWildcard(_file_resource_provider);

	var _i18n = __webpack_require__(9);

	var i18n = _interopRequireWildcard(_i18n);

	var _widget_loader = __webpack_require__(11);

	var widgetLoader = _interopRequireWildcard(_widget_loader);

	var _assert = __webpack_require__(2);

	var _assert2 = _interopRequireDefault(_assert);

	var _configuration = __webpack_require__(3);

	var configuration = _interopRequireWildcard(_configuration);

	var _fn = __webpack_require__(19);

	var _fn2 = _interopRequireDefault(_fn);

	var _object = __webpack_require__(4);

	var object = _interopRequireWildcard(_object);

	var _path = __webpack_require__(8);

	var path = _interopRequireWildcard(_path);

	var _storage = __webpack_require__(20);

	var _storage2 = _interopRequireDefault(_storage);

	var _string = __webpack_require__(10);

	var string = _interopRequireWildcard(_string);

	var _services = __webpack_require__(21);

	var _controls_service = __webpack_require__(23);

	var controlsService = _interopRequireWildcard(_controls_service);

	var _theme_manager = __webpack_require__(32);

	var themeManager = _interopRequireWildcard(_theme_manager);

	var _plain_adapter = __webpack_require__(39);

	var plainAdapter = _interopRequireWildcard(_plain_adapter);

	var _pages = __webpack_require__(18);

	var _pages2 = _interopRequireDefault(_pages);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /**
	                                                                                                                                                                                                     * Copyright 2016 aixigo AG
	                                                                                                                                                                                                     * Released under the MIT license.
	                                                                                                                                                                                                     * http://laxarjs.org/license
	                                                                                                                                                                                                     */


	/**
	 * Bootstraps AngularJS on the provided `anchorElement` and sets up the LaxarJS runtime.
	 *
	 * @memberOf laxar
	 *
	 * @param {HTMLElement} anchorElement the element to insert the page in
	 */
	function bootstrap(anchorElement, _ref) {
	   var widgetAdapters = _ref.widgetAdapters;
	   var widgetModules = _ref.widgetModules;


	   setInstanceIdLogTag();

	   _log2.default.trace('Bootstrapping LaxarJS...');

	   var adapters = [plainAdapter].concat(_toConsumableArray(widgetAdapters));
	   var services = (0, _services.create)(configuration, adapters);
	   loadThemeCss(services);
	   bootstrapWidgetAdapters(services, adapters, widgetModules);

	   whenDocumentReady(function () {
	      _log2.default.trace('Loading flow from "' + services.paths.FLOW_JSON + '"');
	      services.pageService.createControllerFor(anchorElement);
	      services.flowService.controller().loadFlow(services.paths.FLOW_JSON).then(function () {
	         return _log2.default.trace('Flow loaded');
	      }, function (err) {
	         _log2.default.fatal('Failed to load');
	         _log2.default.fatal('Error [0].\nStack: [1]', err, err.stack);
	      });
	   });
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////

	function setInstanceIdLogTag() {
	   var instanceIdStorageKey = 'axLogTags.INST';
	   var store = _storage2.default.getApplicationSessionStorage();
	   var instanceId = store.getItem(instanceIdStorageKey);
	   if (!instanceId) {
	      instanceId = '' + Date.now() + Math.floor(Math.random() * 100);
	      store.setItem(instanceIdStorageKey, instanceId);
	   }

	   _log2.default.addTag('INST', instanceId);
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////

	function loadThemeCss(services) {
	   services.themeManager.urlProvider(path.join(services.paths.THEMES, '[theme]'), null, [services.paths.DEFAULT_THEME]).provide(['css/theme.css']).then(function (_ref2) {
	      var _ref3 = _slicedToArray(_ref2, 1);

	      var cssFile = _ref3[0];
	      return services.cssLoader.load(cssFile);
	   });
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////

	function bootstrapWidgetAdapters(services, adapters, widgetModules) {
	   var widgetAdapters = {};
	   adapters.forEach(function (adapter) {
	      widgetAdapters[adapter.technology] = adapter;
	   });

	   Object.keys(widgetModules).forEach(function (technology) {
	      var adapter = widgetAdapters[technology];
	      if (!adapter) {
	         _log2.default.fatal('Unknown widget technology: [0]', technology);
	         return;
	      }

	      adapter.bootstrap(widgetModules[technology], services);
	   });
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////

	function whenDocumentReady(callback) {
	   if (document.readyState === 'complete') {
	      callback();
	   } else {
	      document.addEventListener('DOMContentLoaded', callback);
	   }
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// API to leverage tooling support. Not for direct use by widgets/activities!
	// For example laxar-mocks needs this for widget tests
	var _tooling = {
	   controlsService: controlsService,
	   eventBus: eventBus,
	   fileResourceProvider: fileResourceProvider,
	   path: path,
	   themeManager: themeManager,
	   widgetLoader: widgetLoader,
	   // Prototype support for page inspection tools:
	   pages: _pages2.default
	};

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////

	exports.assert = _assert2.default;
	exports.configuration = configuration;
	exports.fn = _fn2.default;
	exports.i18n = i18n;
	exports.log = _log2.default;
	exports.object = object;
	exports.storage = _storage2.default;
	exports.string = string;
	exports._tooling = _tooling;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	   value: true
	});

	var _assert = __webpack_require__(2);

	var _assert2 = _interopRequireDefault(_assert);

	var _configuration = __webpack_require__(3);

	var configuration = _interopRequireWildcard(_configuration);

	var _console_channel = __webpack_require__(5);

	var _object = __webpack_require__(4);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * By default available log levels, sorted by increasing log level:
	 * - TRACE (level 100)
	 * - DEBUG (level 200)
	 * - INFO (level 300)
	 * - WARN (level 400)
	 * - ERROR (level 500)
	 * - FATAL (level 600)
	 *
	 * @type {Object}
	 */
	/**
	 * Copyright 2016 aixigo AG
	 * Released under the MIT license.
	 * http://laxarjs.org/license
	 */
	/**
	 * An interface for logging purposes. At least for permanent logging this should always be used in favor of
	 * `console.log` and friends, as it is cross browser secure and allows attaching multiple channels where
	 * messages can be routed to (i.e. to send them to a server process for persistence). If available, messages
	 * will be logged to the browser's console using a builtin console channel.
	 *
	 * When requiring `laxar`, an instance of the `Logger` type is available as `laxar.log`.
	 *
	 * @module log
	 */
	var level = {
	   TRACE: 100,
	   DEBUG: 200,
	   INFO: 300,
	   WARN: 400,
	   ERROR: 500,
	   FATAL: 600
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Constructor for a logger.
	 *
	 * @constructor
	 * @private
	 */
	function Logger() {
	   var _this = this;

	   var self = this;
	   this.queueSize_ = 100;
	   this.channels_ = [_console_channel.log];
	   this.counter_ = 0;
	   this.messageQueue_ = [];
	   this.threshold_ = 0;
	   this.tags_ = {};

	   this.level = (0, _object.options)(configuration.get('logging.levels', {}), level);
	   this.levelToName_ = function (logger, levels) {
	      var result = {};
	      (0, _object.forEach)(levels, function (level, levelName) {
	         logger[levelName.toLowerCase()] = function () {
	            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	               args[_key] = arguments[_key];
	            }

	            return self.log.apply(_this, [level].concat(args));
	         };
	         result[level] = levelName;
	      });
	      return result;
	   }(this, this.level);

	   this.setLogThreshold(configuration.get('logging.threshold', 'INFO'));
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Creates and returns a new logger instance. Intended for testing purposes only.
	 *
	 * @return {Logger}
	 *    a new logger instance
	 */
	Logger.prototype.create = function () {
	   return new Logger();
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Logs a message. A message may contain placeholders in the form `[#]` where `#` resembles the index
	 * within the list of `replacements`. `replacements` are incrementally counted starting at `0`. If the
	 * log level is below the configured log threshold, the message is simply discarded.
	 *
	 * It is recommended not to use this method directly, but instead one of the short cut methods for the
	 * according log level.
	 *
	 * @param {Number} level
	 *    the level for this message
	 * @param {String} message
	 *    the message to log
	 * @param {...*} replacements
	 *    objects that should replace placeholders within the message
	 */
	Logger.prototype.log = function (level, message) {
	   for (var _len2 = arguments.length, replacements = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
	      replacements[_key2 - 2] = arguments[_key2];
	   }

	   if (level < this.threshold_) {
	      return;
	   }

	   var messageObject = {
	      id: this.counter_++,
	      level: this.levelToName_[level],
	      text: message,
	      replacements: replacements,
	      time: new Date(),
	      tags: this.gatherTags(),
	      sourceInfo: gatherSourceInformation()
	   };

	   this.channels_.forEach(function (channel) {
	      channel(messageObject);
	   });

	   if (this.messageQueue_.length === this.queueSize_) {
	      this.messageQueue_.shift();
	   }
	   this.messageQueue_.push(messageObject);
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Logs a message in log level `TRACE`. See {@link Logger#log} for further information.
	 *
	 * *Important note*: This method is only available, if no custom log levels were defined via
	 * configuration or custom log levels include this method as well.
	 *
	 * @param {String} message
	 *    the message to log
	 * @param {...*} replacements
	 *    objects that should replace placeholders within the message
	 */
	Logger.prototype.trace = function () {};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Logs a message in log level `DEBUG`. See {@link Logger#log} for further information.
	 *
	 * *Important note*: This method is only available, if no custom log levels were defined via
	 * configuration or custom log levels include this method as well.
	 *
	 * @param {String} message
	 *    the message to log
	 * @param {...*} replacements
	 *    objects that should replace placeholders within the message
	 */
	Logger.prototype.debug = function () {};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Logs a message in log level `INFO`. See {@link Logger#log} for further information.
	 *
	 * *Important note*: This method is only available, if no custom log levels were defined via
	 * configuration or custom log levels include this method as well.
	 *
	 * @param {String} message
	 *    the message to log
	 * @param {...*} replacements
	 *    objects that should replace placeholders within the message
	 */
	Logger.prototype.info = function () {};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Logs a message in log level `WARN`. See {@link Logger#log} for further information.
	 *
	 * *Important note*: This method is only available, if no custom log levels were defined via
	 * configuration or custom log levels include this method as well.
	 *
	 * @param {String} message
	 *    the message to log
	 * @param {...*} replacements
	 *    objects that should replace placeholders within the message
	 */
	Logger.prototype.warn = function () {};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Logs a message in log level `ERROR`. See {@link Logger#log} for further information.
	 *
	 * *Important note*: This method is only available, if no custom log levels were defined via
	 * configuration or custom log levels include this method as well.
	 *
	 * @param {String} message
	 *    the message to log
	 * @param {...*} replacements
	 *    objects that should replace placeholders within the message
	 */
	Logger.prototype.error = function () {};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Logs a message in log level `FATAL`. See {@link Logger#log} for further information.
	 *
	 * *Important note*: This method is only available, if no custom log levels were defined via
	 * configuration or custom log levels include this method as well.
	 *
	 * @param {String} message
	 *    the message to log
	 * @param {...*} replacements
	 *    objects that should replace placeholders within the message
	 */
	Logger.prototype.fatal = function () {};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Adds a new channel to forward log messages to. A channel is called synchronously for every log message
	 * and can do whatever necessary to handle the message according to its task. Note that blocking or
	 * performance critical actions within a channel should always take place asynchronously to prevent from
	 * blocking the application. Ideally a web worker is used for heavier background tasks.
	 *
	 * Each message is an object having the following properties:
	 * - `id`: the unique, ascending id of the log message
	 * - `level`: the log level of the message in string representation
	 * - `text`: the actual message that was logged
	 * - `replacements`: the raw list of replacements passed along the message
	 * - `time`: JavaScript Date instance when the message was logged
	 * - `tags`: A map of all log tags currently set for the logger
	 * - `sourceInfo`: if supported, a map containing `file`, `line` and `char` where the logging took place
	 *
	 * @param {Function} channel
	 *    the log channel to add
	 */
	Logger.prototype.addLogChannel = function (channel) {
	   this.channels_.push(channel);
	   this.messageQueue_.forEach(function (entry) {
	      channel(entry);
	   });
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Removes a log channel and thus stops sending further messages to it.
	 *
	 * @param {Function} channel
	 *    the log channel to remove
	 */
	Logger.prototype.removeLogChannel = function (channel) {
	   var channelIndex = this.channels_.indexOf(channel);
	   if (channelIndex > -1) {
	      this.channels_.splice(channelIndex, 1);
	   }
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Adds a value for a log tag. If a tag is already known, the value is appended to the existing one using a
	 * `;` as separator. Note that no formatting of the value takes place and a non-string value will just have
	 * its appropriate `toString` method called.
	 *
	 * Log tags can be used to mark a set of log messages with a value giving further information on the
	 * current logging context. For example laxar sets a tag `'INST'` with a unique-like identifier for the
	 * current browser client. If then for example log messages are persisted on a server, messages belonging
	 * to the same client can be accumulated.
	 *
	 * @param {String} tag
	 *    the id of the tag to add a value for
	 * @param {String} value
	 *    the value to add
	 */
	Logger.prototype.addTag = function (tag, value) {
	   (0, _assert2.default)(tag).hasType(String).isNotNull();

	   if (!this.tags_[tag]) {
	      this.tags_[tag] = [value];
	   } else {
	      this.tags_[tag].push(value);
	   }
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Sets a value for a log tag. If a tag is already known, the value is overwritten by the given one. Note
	 * that no formatting of the value takes place and a non-string value will just have its appropriate
	 * `toString` method called. For further information on log tags, see {@link Logger#addTag}.
	 *
	 * @param {String} tag
	 *    the id of the tag to set a value for
	 * @param {String} value
	 *    the value to set
	 */
	Logger.prototype.setTag = function (tag, value) {
	   (0, _assert2.default)(tag).hasType(String).isNotNull();

	   this.tags_[tag] = [value];
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Removes a log tag. For further information on log tags, see {@link Logger#addTag}.
	 *
	 * @param {String} tag
	 *    the id of the tag to set a value for
	 */
	Logger.prototype.removeTag = function (tag) {
	   (0, _assert2.default)(tag).hasType(String).isNotNull();

	   delete this.tags_[tag];
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Returns a map of all tags. If there are multiple values for the same tag, their values are concatenated
	 * using a `;` as separator. For further information on log tags, see {@link Logger#addTag}.
	 *
	 * @return {Object}
	 *    a mapping from tag to its value(s)
	 */
	Logger.prototype.gatherTags = function () {
	   var tags = {};
	   (0, _object.forEach)(this.tags_, function (values, tag) {
	      tags[tag] = values.join(';');
	   });
	   return tags;
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Sets the threshold for log messages. Log messages with a lower level will be discarded upon logging.
	 *
	 * @param {String|Number} threshold
	 *    the numeric or the string value of the log level to use as threshold
	 */
	Logger.prototype.setLogThreshold = function (threshold) {
	   if (typeof threshold === 'string') {
	      _assert2.default.state(threshold.toUpperCase() in this.level, 'Unsupported log threshold "' + threshold + '".');

	      threshold = this.level[threshold.toUpperCase()];
	   }

	   (0, _assert2.default)(threshold).hasType(Number);

	   this.threshold_ = threshold;
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	var CHROME_AND_IE_STACK_MATCHER = /\(?([^\( ]+)\:(\d+)\:(\d+)\)?$/;
	var FIRE_FOX_STACK_MATCHER = /@(.+)\:(\d+)$/;
	var EMPTY_CALL_INFORMATION = { file: '?', line: -1, char: -1 };

	function gatherSourceInformation() {
	   var e = new Error();

	   if (!e.stack) {
	      try {
	         // IE >= 10 only generates a stack, if the error object is really thrown
	         throw new Error();
	      } catch (err) {
	         e = err;
	      }
	      if (!e.stack) {
	         return EMPTY_CALL_INFORMATION;
	      }
	   }

	   var rows = e.stack.split(/[\n]/);
	   var interpreterFunction = void 0;
	   if (rows[0] === 'Error') {
	      rows.splice(0, 1);
	      interpreterFunction = function chromeStackInterpreter(row) {
	         var match = CHROME_AND_IE_STACK_MATCHER.exec(row);
	         return {
	            file: match ? match[1] : '?',
	            line: match ? match[2] : -1,
	            char: match ? match[3] : -1
	         };
	      };
	   } else if (rows[0].indexOf('@') !== -1) {
	      interpreterFunction = function fireFoxStackInterpreter(row) {
	         var match = FIRE_FOX_STACK_MATCHER.exec(row);
	         return {
	            file: match ? match[1] : '?',
	            line: match ? match[2] : -1,
	            char: -1
	         };
	      };
	   } else {
	      return EMPTY_CALL_INFORMATION;
	   }

	   for (var i = 0; i < rows.length; ++i) {
	      var row = interpreterFunction(rows[i]);
	      if (row.file.indexOf('/logging/log.js') === -1) {
	         return row;
	      }
	   }

	   return EMPTY_CALL_INFORMATION;
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	// TODO: change default export to named exports. Need to get rid of the prototype stuff for this
	exports.default = new Logger();

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	   value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	/**
	 * Copyright 2016 aixigo AG
	 * Released under the MIT license.
	 * http://laxarjs.org/license
	 */
	/**
	 * The *assert* module provides some simple assertion methods for type checks, truthyness tests and guards
	 * invalid code paths.
	 *
	 * When requiring `laxar`, it is available as `laxar.assert`.
	 *
	 * @module assert
	 */

	/**
	 * Constructor for an Assertion.
	 *
	 * @param {*} subject
	 *    the object assertions are made for
	 * @param {String} [optionalDetails]
	 *    details that should be printed in case no specific details are given for an assertion method
	 *
	 * @constructor
	 * @private
	 */
	function Assertion(subject, optionalDetails) {
	   this.subject_ = subject;
	   this.details_ = optionalDetails || null;
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Throws an error if the subject is `null` or `undefined`.
	 *
	 * @param {String} [optionalDetails]
	 *    details to append to the error message
	 *
	 * @return {Assertion}
	 *    this instance
	 */
	Assertion.prototype.isNotNull = function isNotNull(optionalDetails) {
	   if (typeof this.subject_ === 'undefined' || this.subject_ === null) {
	      fail('Expected value to be defined and not null.', optionalDetails || this.details_);
	   }

	   return this;
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Throws an error if the subject is not of the given type. No error is thrown for `null` or `undefined`.
	 *
	 * @param {Function} type
	 *    the expected type of the subject
	 * @param {String} [optionalDetails]
	 *    details to append to the error message
	 *
	 * @return {Assertion}
	 *    this instance
	 */
	Assertion.prototype.hasType = function hasType(type, optionalDetails) {
	   if (typeof this.subject_ === 'undefined' || this.subject_ === null) {
	      return this;
	   }

	   if (typeof type !== 'function') {
	      fail('type must be a constructor function. Got ' + (typeof type === 'undefined' ? 'undefined' : _typeof(type)) + '.');
	   }

	   if (!checkType(this.subject_, type)) {
	      var actualString = functionName(this.subject_.constructor);
	      var expectedString = functionName(type);

	      fail('Expected value to be an instance of "' + expectedString + '" but was "' + actualString + '".', optionalDetails || this.details_);
	   }

	   return this;
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Throws an error if the subject is no object or the given property is not defined on it.
	 *
	 * @param {String} property
	 *    the property that is expected for the subject
	 * @param {String} [optionalDetails]
	 *    details to append to the error message
	 *
	 * @return {Assertion}
	 *    this instance
	 */
	Assertion.prototype.hasProperty = function hasProperty(property, optionalDetails) {
	   if (_typeof(this.subject_) !== 'object') {
	      fail('value must be an object. Got ' + _typeof(this.subject_) + '.');
	   }

	   if (!(property in this.subject_)) {
	      fail('value is missing mandatory property "' + property + '".', optionalDetails || this.details_);
	   }

	   return this;
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function fail(message, optionalDetails) {
	   if (optionalDetails) {
	      message += ' Details: ' + ((typeof optionalDetails === 'undefined' ? 'undefined' : _typeof(optionalDetails)) === 'object' ? JSON.stringify(optionalDetails) : optionalDetails);
	   }
	   throw new Error('Assertion error: ' + message);
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	var TYPE_TO_CONSTRUCTOR = {
	   'string': String,
	   'number': Number,
	   'boolean': Boolean,
	   'function': Function
	};
	function checkType(subject, type) {
	   if ((typeof subject === 'undefined' ? 'undefined' : _typeof(subject)) === 'object') {
	      return subject instanceof type;
	   }

	   var actualType = TYPE_TO_CONSTRUCTOR[typeof subject === 'undefined' ? 'undefined' : _typeof(subject)];
	   return actualType === type;
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	var FUNCTION_NAME_MATCHER = /^function ([^\(]*)\(/i;
	function functionName(func) {
	   var match = FUNCTION_NAME_MATCHER.exec(func.toString().trim());
	   return match[1].length ? match[1] : 'n/a';
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Creates and returns a new `Assertion` instance for the given `subject`.
	 *
	 * **Note**: this function is no member of the module, but the module itself. Thus when using `assert` via
	 * laxar, `assert` is will be no simple object, but this function having the other functions as
	 * properties.
	 *
	 * Example:
	 * ```js
	 * define( [ 'laxar' ], function( ax ) {
	 *    ax.assert( ax.assert ).hasType( Function );
	 *    ax.assert.state( typeof ax.assert.codeIsUnreachable === 'function' );
	 * } );
	 * ```
	 *
	 * @param {*} subject
	 *    the object assertions are made for
	 * @param {String} [optionalDetails]
	 *    details that should be printed in case no specific details are given when calling an assertion method
	 *
	 * @return {Assertion}
	 *    the assertion instance
	 */
	function assert(subject, optionalDetails) {
	   return new Assertion(subject, optionalDetails);
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Marks a code path as erroneous by throwing an error when reached.
	 *
	 * @param {String} [optionalDetails]
	 *    details to append to the error message
	 */
	assert.codeIsUnreachable = function codeIsUnreachable(optionalDetails) {
	   fail('Code should be unreachable!', optionalDetails);
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Throws an error if the given expression is falsy.
	 *
	 * @param {*} expression
	 *    the expression to test for truthyness
	 * @param {String} [optionalDetails]
	 *    details to append to the error message
	 */
	assert.state = function state(expression, optionalDetails) {
	   if (!expression) {
	      fail('State does not hold.', optionalDetails);
	   }
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	exports.default = assert;
	var codeIsUnreachable = exports.codeIsUnreachable = assert.codeIsUnreachable;
	var state = exports.state = assert.state;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.get = get;

	var _object = __webpack_require__(4);

	/*jshint evil:true*/
	/**
	 * Obtain global object in strict mode: http://stackoverflow.com/questions/3277182/
	 *
	 * private tag needed for api doc generation. Otherwise the module description becomes messed up.
	 *
	 * @private
	 */
	var global = new Function('return this')();

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Returns the configured value for the specified attribute path or `undefined` in case it wasn't
	 * configured. If a default value was passed as second argument this is returned instead of `undefined`.
	 *
	 * Examples:
	 * ```js
	 * define( [ 'laxar' ], function( ax ) {
	 *    ax.configuration.get( 'logging.threshold' ); // -> 'INFO'
	 *    ax.configuration.get( 'iDontExist' ); // -> undefined
	 *    ax.configuration.get( 'iDontExist', 42 ); // -> 42
	 * } );
	 * ```
	 *
	 * @param {String} key
	 *    a  path (using `.` as separator) to the property in the configuration object
	 * @param {*} [optionalDefault]
	 *    the value to return if no value was set for `key`
	 *
	 * @return {*}
	 *    either the configured value, `undefined` or `optionalDefault`
	 */
	/**
	 * Copyright 2016 aixigo AG
	 * Released under the MIT license.
	 * http://laxarjs.org/license
	 */
	/**
	 * The *configuration* module provides convenient readonly access to all values configured for this application
	 * under `window.laxar`. Most probably this configuration takes place in the JavaScript file
	 * `application/application.js` under your project's root directory.
	 *
	 * When requiring `laxar`, it is available as `laxar.configuration`.
	 *
	 * @module configuration
	 */
	function get(key, optionalDefault) {
	  return (0, _object.path)(global.laxar, key, optionalDefault);
	}

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	   value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	exports.extend = extend;
	exports.options = options;
	exports.forEach = forEach;
	exports.path = path;
	exports.setPath = setPath;
	exports.deepClone = deepClone;
	exports.deepFreeze = deepFreeze;
	/**
	 * Copyright 2016 aixigo AG
	 * Released under the MIT license.
	 * http://laxarjs.org/license
	 */
	/**
	 * Utilities for dealing with objects.
	 *
	 * When requiring `laxar`, it is available as `laxar.object`.
	 *
	 * @module object
	 */

	/**
	 * Copies the properties from a set of source objects over to the target object. Properties of sources
	 * later in the arguments list overwrite existing properties in the target and earlier source objects.
	 *
	 * @param {Object} target
	 *    the target object to modify
	 * @param {...Object} sources
	 *    the source objects to copy over
	 *
	 * @return {Object}
	 *    the modified target object
	 *
	 * @type {Function}
	 */
	function extend(target) {
	   for (var _len = arguments.length, sources = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	      sources[_key - 1] = arguments[_key];
	   }

	   return applyForAll([target].concat(sources), function (target, source, key) {
	      target[key] = source[key];
	   });
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Returns all properties from `obj` with missing properties completed from `defaults`. If `obj` is `null`
	 * or `undefined`, an empty object is automatically created. `obj` and `defaults` are not modified by this
	 * function. This is very useful for optional map arguments, resembling some kind of configuration.
	 *
	 * Example:
	 * ```js
	 * object.options( { validate: true }, {
	 *    validate: false,
	 *    highlight: true
	 * } );
	 * // =>
	 * // {
	 * //    validate: true,
	 * //    highlight: true
	 * // }
	 * ```
	 *
	 * @param {Object} obj
	 *    the options object to use as source, may be `null` or `undefined`
	 * @param {Object} defaults
	 *    the defaults to take missing properties from
	 *
	 * @return {Object}
	 *    the completed options object
	 */
	function options(obj, defaults) {
	   return extend({}, defaults, obj);
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Iterates over the keys of an object and calls the given iterator function for each entry. On each
	 * iteration the iterator function is passed the `value`, the `key` and the complete `object` as
	 * arguments. If `object` is an array, the native `Array.prototype.forEach` function is called and hence
	 * the keys are the numeric indices of the array.
	 *
	 * @param {Object} object
	 *    the object to run the iterator function on
	 * @param {Function} iteratorFunction
	 *    the iterator function to run on each key-value pair
	 */
	function forEach(object, iteratorFunction) {
	   if (Array.isArray(object)) {
	      object.forEach(iteratorFunction);
	      return;
	   }

	   for (var key in object) {
	      if (hasOwnProperty(object, key)) {
	         iteratorFunction(object[key], key, object);
	      }
	   }
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Finds a property in a nested object structure by a given path. A path is a string of keys, separated
	 * by a dot from each other, used to traverse that object and find the value of interest. An additional
	 * default is returned, if otherwise the value would yield `undefined`.
	 *
	 * Example.
	 * ```js
	 * object.path( { one: { two: 3 } }, 'one.two' ); // => 3
	 * object.path( { one: { two: 3 } }, 'one.three' ); // => undefined
	 * object.path( { one: { two: 3 } }, 'one.three', 42 ); // => 42
	 *
	 * ```
	 *
	 * @param {Object} obj
	 *    the object to traverse
	 * @param {String} thePath
	 *    the path to search for
	 * @param {*} [optionalDefault]
	 *    the value to return instead of `undefined` if nothing is found
	 *
	 * @return {*}
	 *    the value at the given path
	 */
	function path(obj, thePath, optionalDefault) {
	   var defaultResult = arguments.length === 3 ? optionalDefault : undefined;

	   var pathArr = thePath.split('.');
	   var node = obj;
	   var key = pathArr.shift();

	   while (key) {
	      if (node && (typeof node === 'undefined' ? 'undefined' : _typeof(node)) === 'object' && hasOwnProperty(node, key)) {
	         node = node[key];
	         key = pathArr.shift();
	      } else {
	         return defaultResult;
	      }
	   }

	   return node;
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Sets a property in a nested object structure at a given path to a given value. A path is a string of
	 * keys, separated by a dot from each other, used to traverse that object and find the place where the
	 * value should be set. Any missing subtrees along the path are created.
	 *
	 * Example:
	 * ```js
	 * object.setPath( {}, 'name.first', 'Peter' ); // => { name: { first: 'Peter' } }
	 * object.setPath( {}, 'pets.1', 'Hamster' ); // => { pets: [ null, 'Hamster' ] }
	 * ```
	 *
	 * @param {Object} obj
	 *    the object to modify
	 * @param {String} path
	 *    the path to set a value at
	 * @param {*} value
	 *    the value to set at the given path
	 *
	 * @return {*}
	 *    the full object (for chaining)
	 */
	function setPath(obj, path, value) {
	   var node = obj;
	   var pathArr = path.split('.');
	   var last = pathArr.pop();

	   pathArr.forEach(function (pathFragment, index) {
	      if (!node[pathFragment] || _typeof(node[pathFragment]) !== 'object') {
	         var lookAheadFragment = pathArr[index + 1] || last;
	         if (lookAheadFragment.match(/^[0-9]+$/)) {
	            node[pathFragment] = [];
	            fillArrayWithNull(node[pathFragment], parseInt(lookAheadFragment, 10));
	         } else {
	            node[pathFragment] = {};
	         }
	      }

	      node = node[pathFragment];
	   });

	   if (Array.isArray(node) && last > node.length) {
	      fillArrayWithNull(node, last);
	   }

	   node[last] = value;

	   return obj;
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Returns a deep clone of the given object. Note that the current implementation is intended to be used
	 * for simple object literals only. There is no guarantee that cloning objects instantiated via
	 * constructor function works and cyclic references will lead to endless recursion.
	 *
	 * @param {*} object
	 *    the object to clone
	 *
	 * @return {*}
	 *    the clone
	 */
	function deepClone(object) {
	   if (!object || (typeof object === 'undefined' ? 'undefined' : _typeof(object)) !== 'object') {
	      return object;
	   }

	   // Not using underscore here for performance reasons. Plain for-loops are twice as fast as each and map
	   // in all common browsers.
	   var result = void 0;
	   if (Array.isArray(object)) {
	      result = [];
	      for (var i = 0, length = object.length; i < length; ++i) {
	         result[i] = deepClone(object[i]);
	      }
	   } else {
	      result = {};
	      for (var key in object) {
	         if (hasOwnProperty(object, key)) {
	            result[key] = deepClone(object[key]);
	         }
	      }
	   }

	   return result;
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Freezes an object, optionally recursively, in any browser capable of freezing objects. In any other
	 * browser this method simply returns its first value, i.e. is an identity operation.
	 *
	 * @param {Object} obj
	 *    the object to freeze
	 * @param {Boolean} [optionalRecursive]
	 *    freezes recursively if `true`. Default is `false`
	 *
	 * @return {Object}
	 *    the input (possibly) frozen
	 */
	function deepFreeze(obj, optionalRecursive) {
	   if (Object.isFrozen(obj)) {
	      return obj;
	   }

	   if (optionalRecursive) {
	      forEach(obj, function (val, key) {
	         if ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object') {
	            obj[key] = deepFreeze(val, true);
	         }
	      });
	   }

	   return Object.freeze(obj);
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Sets all entries of the given array to `null`.
	 *
	 * @private
	 */
	function fillArrayWithNull(arr, toIndex) {
	   for (var i = arr.length; i < toIndex; ++i) {
	      arr[i] = null;
	   }
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Takes a list of objects where the first entry is treated as target object and all other entries as
	 * source objects. The callback then is called for each property of each source object. Finally target is
	 * returned.
	 *
	 * @private
	 */
	function applyForAll(objects, callback) {
	   var target = objects[0];
	   objects.slice(1).forEach(function (source) {
	      if (source) {
	         for (var key in source) {
	            if (hasOwnProperty(source, key)) {
	               callback(target, source, key);
	            }
	         }
	      }
	   });
	   return target;
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 *
	 * @private
	 */
	function hasOwnProperty(object, property) {
	   return hasOwnProp.call(object, property);
	}
	var hasOwnProp = Object.prototype.hasOwnProperty;

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	   value: true
	});
	exports.log = log;
	/**
	 * Copyright 2016 aixigo AG
	 * Released under the MIT license.
	 * http://laxarjs.org/license
	 */
	var winConsole = void 0;
	function log(messageObject) {
	   if (!window.console) {
	      return;
	   }
	   winConsole = window.console;

	   var logMethod = messageObject.level.toLowerCase();
	   if (!(logMethod in winConsole) || logMethod === 'trace') {
	      // In console objects trace doesn't define a valid log level but is used to print stack traces. We
	      // thus need to change it something different.
	      logMethod = 'log';
	   }

	   if (!(logMethod in winConsole)) {
	      return;
	   }

	   var callArgs = [messageObject.level + ': '];
	   callArgs = callArgs.concat(mergeTextAndReplacements(messageObject.text, messageObject.replacements));
	   callArgs.push('(@ ' + messageObject.sourceInfo.file + ':' + messageObject.sourceInfo.line + ')');
	   callConsole(logMethod, callArgs);
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function callConsole(method, messageParts) {
	   // MSIE8 does not support console.log.apply( ... )
	   // The following call is equivalent to: console[ method ].apply( console, args );
	   Function.apply.apply(winConsole[method], [winConsole, messageParts]);
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function mergeTextAndReplacements(text, replacements) {
	   var parts = [];
	   var pos = 0;
	   var buffer = '';

	   while (pos < text.length) {
	      var character = text.charAt(pos);

	      switch (character) {
	         case '\\':
	            ++pos;
	            if (pos === text.length) {
	               throw new Error('Unterminated string: "' + text + '"');
	            }

	            buffer += text.charAt(pos);
	            break;

	         case '[':
	            parts.push(buffer);
	            buffer = '';

	            var end = text.indexOf(']', pos);
	            if (end === -1) {
	               throw new Error('Unterminated replacement at character ' + pos + ': "' + text + '"');
	            }

	            var replacementIndex = parseInt(text.substring(pos + 1, end), 10);

	            parts.push(replacements[replacementIndex]);
	            pos = end;

	            break;

	         default:
	            buffer += character;
	            break;
	      }

	      ++pos;
	   }

	   if (buffer.length > 0) {
	      parts.push(buffer);
	   }

	   return parts;
	}

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	   value: true
	});
	exports.create = create;

	var _assert = __webpack_require__(2);

	var _assert2 = _interopRequireDefault(_assert);

	var _log = __webpack_require__(1);

	var _log2 = _interopRequireDefault(_log);

	var _object = __webpack_require__(4);

	var object = _interopRequireWildcard(_object);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var WILDCARD = '*'; /**
	                     * Copyright 2016 aixigo AG
	                     * Released under the MIT license.
	                     * http://laxarjs.org/license
	                     */
	/**
	 * The *event_bus* module contains the implementation of the *LaxarJS EventBus*. In an application you'll
	 * never use this module or instantiate an event bus instance directly. Instead within a widget the event bus
	 * can be injected via service or accessed as property on the AngularJS `$scope` or `axContext` injections.
	 *
	 * @module event_bus
	 */

	var SUBSCRIBER_FIELD = '.';
	var INTERNAL_EVENTS_REGISTRY = 'ax__events';

	var PART_SEPARATOR = '.';
	var SUB_PART_SEPARATOR = '-';
	var REQUEST_MATCHER = /^([^.])([^.]*)Request(\..+)?$/;

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Constructor for an event bus.
	 *
	 * @param {Function} nextTick
	 *    a next tick function like `process.nextTick` or AngularJS' `$timeout`
	 * @param {Function} timeoutFunction
	 *    a timeout function like `window.setTimeout`  or AngularJS' `$timeout`
	 * @param {Object} [optionalConfiguration]
	 *    configuration for the event bus instance
	 * @param {Number} optionalConfiguration.pendingDidTimeout
	 *    the timeout in milliseconds used by {@link EventBus#publishAndGatherReplies}. Default is 120000ms
	 *
	 * @constructor
	 * @private
	 */
	function EventBus(nextTick, timeoutFunction, optionalConfiguration) {
	   this.nextTick_ = function (f) {
	      return nextTick(f);
	   };
	   this.timeoutFunction_ = function (f, ms) {
	      return timeoutFunction(f, ms);
	   };
	   this.config_ = object.options(optionalConfiguration, {
	      pendingDidTimeout: 120000
	   });

	   this.cycleCounter_ = 0;
	   this.eventQueue_ = [];
	   this.subscriberTree_ = {};

	   this.waitingPromiseResolves_ = [];
	   this.currentCycle_ = -1;
	   this.errorHandler_ = defaultErrorHandler;
	   this.mediator_ = ensureFunction();
	   this.inspectors_ = [];
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Sets a handler for all errors that may occur during event processing. It receives an error message as
	 * first argument and a map with additional information on the problem as second argument. There may be
	 * instances of `Error` as values within the map.
	 * The default error handler simply logs all issues to `console.error` or `console.log` if available.
	 *
	 * @param {Function} errorHandler
	 *    the error handler
	 */
	EventBus.prototype.setErrorHandler = function (errorHandler) {
	   this.errorHandler_ = ensureFunction(errorHandler, defaultErrorHandler);
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Sets a mediator, that has the chance to alter events shortly before their delivery to the according
	 * subscribers. Its sole argument is the complete list of queued event items that should be delivered
	 * during the current JavaScript event loop. It then needs to return this list, including optional
	 * modifications, again. Event items may be added or deleted at will, but the return type needs to be an
	 * array containing zero or more event item-like objects.
	 *
	 * An event item has these properties:
	 * - `meta`: map with meta information for this event
	 *   - `name`: full name of the published event
	 *   - `cycleId`: the id of the cycle the event was published in
	 *   - `sender`: name of sender (if available)
	 *   - `initiator`: name of the sender initiating the current event cycle (if available)
	 *   - `options`: map of options given when publishing the event
	 * - `event`: the event payload it self as published by the sender
	 *
	 * @param {Function} mediator
	 *    the mediator function
	 */
	EventBus.prototype.setMediator = function (mediator) {
	   this.mediator_ = ensureFunction(mediator);
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Adds an inspector, that gets notified when certain actions within the event bus take place. Currently
	 * these actions may occur:
	 *
	 * - `subscribe`: a new subscriber registered for an event
	 * - `publish`: an event is published but not yet delivered
	 * - `deliver`: an event is actually delivered to a subscriber
	 *
	 * An inspector receives a map with the following properties:
	 *
	 * - `action`: one of the actions from above
	 * - `source`: the origin of the `action`
	 * - `target`: the name of the event subscriber (`deliver` action only)
	 * - `event`: the full name of the event or the subscribed event (`subscribe` action only)
	 * - `eventObject`: the published event item (`publish` action only)
	 * - `subscribedTo`: the event, possibly with omissions, the subscriber subscribed to (`deliver` action only)
	 * - `cycleId`: the id of the event cycle
	 *
	 * The function returned by this method can be called to remove the inspector again and prevent it from
	 * being called for future event bus actions.
	 *
	 * @param {Function} inspector
	 *    the inspector function to add
	 *
	 * @return {Function}
	 *    a function to remove the inspector
	 */
	EventBus.prototype.addInspector = function (inspector) {
	   (0, _assert2.default)(inspector).hasType(Function).isNotNull();

	   this.inspectors_.push(inspector);
	   return function () {
	      var index = this.inspectors_.indexOf(inspector);
	      if (index !== -1) {
	         this.inspectors_.splice(index, 1);
	      }
	   }.bind(this);
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Subscribes to an event by name. An event name consists of so called *topics*, where each topic is
	 * separated from another by dots (`.`). If a topic is omitted, this is treated as a wildcard. Note that
	 * two dots in the middle or one dot at the beginning of an event name must remain, whereas a dot at the
	 * end may be omitted. As such every event name has an intrinsic wildcard at its end. For example these are
	 * all valid event names:
	 *
	 * - `some.event`: matches `some.event`, `some.event.again`
	 * - `.event`: matches `some.event`, `any.event`, `any.event.again`
	 * - `some..event`: matches `some.fancy.event`, `some.special.event`
	 *
	 * Additionally *subtopics* are supported. A subtopic are fragments of a topic, separated from another by
	 * simple dashes (`-`). Here only suffixes of subtopics may be omitted when subscribing. Thus subscribing
	 * to `some.event` would match an event published with name `some.event-again` or even
	 * `some.event-another.again`.
	 *
	 * When an event is delivered, the subscriber function receives two arguments:
	 * The first one is the event object as it was published. If `clone` yields `true` this is a simple deep
	 * copy of the object (note that only properties passing a JSON-(de)serialization remain). If `false` the
	 * object is frozen using `Object.freeze` recursively in browsers that support freezing. In any other
	 * browser this is just an identity operation.
	 *
	 * The second one is a meta object with these properties:
	 *
	 * - `unsubscribe`: A function to directly unsubscribe the called subscriber from further events
	 * - `name`: The name of the event as it actually was published (i.e. without wildcards).
	 * - `cycleId`: The id of the cycle the event was published (and delivered) in
	 * - `sender`: The id of the event sender, may be `null`.
	 * - `initiator`: The id of the initiator of the cycle. Currently not implemented, thus always `null`.
	 * - `options`: The options that were passed to `publish` or `publishAndGatherReplies` respectively.
	 *
	 * Note that the subscriber function will receive a property `ax__events` to keep track of all events this
	 * function was attached to. This is necessary to make {@link EventBus#unsubscribe} work.
	 *
	 * @param {String} eventName
	 *    the name of the event to subscribe to
	 * @param {Function} subscriber
	 *    a function to call whenever an event matching `eventName` is published
	 * @param {Object} [optionalOptions]
	 *    additional options for the subscribe action
	 * @param {String} optionalOptions.subscriber
	 *    the id of the subscriber. Default is `null`
	 * @param {Boolean} optionalOptions.clone
	 *    if `false` the event will be send frozen to the subscriber, otherwise it will receive a deep copy.
	 *    Default is `true`
	 */
	EventBus.prototype.subscribe = function (eventName, subscriber, optionalOptions) {
	   (0, _assert2.default)(eventName).hasType(String).isNotNull();
	   (0, _assert2.default)(subscriber).hasType(Function).isNotNull();

	   var options = object.options(optionalOptions, {
	      subscriber: null,
	      clone: true
	   });
	   var subscriberItem = {
	      name: eventName,
	      subscriber: subscriber,
	      subscriberName: options.subscriber,
	      subscriptionWeight: calculateSubscriptionWeight(eventName),
	      options: options
	   };

	   var parts = eventName.split(PART_SEPARATOR);
	   var node = this.subscriberTree_;
	   for (var i = 0; i < parts.length; ++i) {
	      var bucketName = parts[i].length ? parts[i] : WILDCARD;
	      if (!(bucketName in node)) {
	         node[bucketName] = {};
	      }
	      node = node[bucketName];
	   }

	   if (!(SUBSCRIBER_FIELD in node)) {
	      node[SUBSCRIBER_FIELD] = [];
	   }
	   node[SUBSCRIBER_FIELD].push(subscriberItem);

	   if (!subscriber.hasOwnProperty(INTERNAL_EVENTS_REGISTRY)) {
	      subscriber[INTERNAL_EVENTS_REGISTRY] = [];
	   }
	   subscriber[INTERNAL_EVENTS_REGISTRY].push(eventName);

	   notifyInspectors(this, {
	      action: 'subscribe',
	      source: options.subscriber,
	      target: '-',
	      event: eventName,
	      cycleId: this.currentCycle_
	   });
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Removes all subscriptions of the given subscriber.
	 *
	 * @param {Function} subscriber
	 *    the function to unsubscribe
	 */
	EventBus.prototype.unsubscribe = function (subscriber) {
	   (0, _assert2.default)(subscriber).hasType(Function).isNotNull();

	   if (!subscriber.hasOwnProperty(INTERNAL_EVENTS_REGISTRY) || !Array.isArray(subscriber[INTERNAL_EVENTS_REGISTRY])) {
	      return;
	   }

	   var self = this;
	   var subscriberTree = this.subscriberTree_;
	   subscriber[INTERNAL_EVENTS_REGISTRY].forEach(function (eventName) {
	      unsubscribeRecursively(self, subscriberTree, eventName.split(PART_SEPARATOR), subscriber);
	   });

	   delete subscriber[INTERNAL_EVENTS_REGISTRY];
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function unsubscribeRecursively(self, node, parts, subscriber) {
	   if (parts.length === 0 && Array.isArray(node[SUBSCRIBER_FIELD])) {
	      var subscribers = node[SUBSCRIBER_FIELD];
	      for (var i = subscribers.length - 1; i >= 0; --i) {
	         if (subscribers[i].subscriber === subscriber) {
	            notifyInspectors(self, {
	               action: 'unsubscribe',
	               source: subscribers[i].subscriberName,
	               target: '-',
	               event: subscribers[i].name,
	               cycleId: self.currentCycle_
	            });
	            subscribers.splice(i, 1);
	         }
	      }
	   }

	   var part = parts.shift();
	   if (part === '') {
	      part = WILDCARD;
	   }
	   if (part in node) {
	      unsubscribeRecursively(self, node[part], parts, subscriber);
	   }
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Asynchronously publishes an event on the event bus. The returned promise will be queued as soon as this
	 * event is delivered and, if during delivery a new event was enqueued, resolved after that new event was
	 * delivered. If no new event is queued during delivery of this event, the promise is instantly resolved.
	 * To make this a bit clearer, lets assume we publish and thus enqueue an event at time `t`. It then will
	 * be delivered at time `t+1`. At that precise moment the promise is enqueued to be resolved soon. We then
	 * distinguish between two cases:
	 *
	 * - At time `t+1` no subscriber publishes (i.e. enqueues) an event: Thus there is no event in the same
	 *   cycle and the promise is also resolved at time `t+1`.
	 * - At least one subscriber publishes an event at time `t+1`: The promise is then scheduled to be resolved
	 *   as soon as this event is delivered at time `t+2`.
	 *
	 * The implication of this is the following:
	 *
	 * We have two collaborators, A and B. A listens to event b and B listens to event a.
	 * Whenever A publishes a and B than instantly (i.e. in the same event cycle of the JavaScript runtime
	 * where its subscriber function was called) *responds* by publishing b, b arrives at the subscriber
	 * function of A, before the promise of A's publish action is resolved.
	 * It is hence possible to observe possible effects of an event sent by oneself, under the conditions
	 * mentioned above. Practically this is used internally for the implementation of
	 * {@link EventBus#publishAndGatherReplies}.
	 *
	 * @param {String} eventName
	 *    the name of the event to publish
	 * @param {Object} [optionalEvent]
	 *    the event to publish
	 * @param {Object} [optionalOptions]
	 *    additional options for the publish action
	 * @param {String} optionalOptions.sender
	 *    the id of the event sender. Default is `null`
	 * @param {Boolean} optionalOptions.deliverToSender
	 *    if `false` the event will not be send to subscribers whose subscriber name matches
	 *    `optionalOptions.sender`, else all subscribers will receive the event. Default is `true`
	 *
	 * @return {Promise}
	  *   the delivery promise
	 */
	EventBus.prototype.publish = function (eventName, optionalEvent, optionalOptions) {
	   var _this = this;

	   (0, _assert2.default)(eventName).hasType(String).isNotNull();

	   var event = JSON.parse(JSON.stringify(optionalEvent || {}));
	   var options = object.options(optionalOptions, {
	      deliverToSender: true,
	      sender: event.sender || null
	   });

	   if (event.sender) {
	      _log2.default.warn('Deprecation warning: The event sender should be set in the options, not the event itself.\n' + 'Sender: [0], Eventname: [1]', event.sender, eventName);
	   }

	   return new Promise(function (resolve) {
	      var eventItem = {
	         meta: {
	            name: eventName,
	            cycleId: _this.currentCycle_ > -1 ? _this.currentCycle_ : _this.cycleCounter_++,
	            sender: options.sender,
	            initiator: null,
	            options: options
	         },
	         event: event,
	         resolvePublish: resolve
	      };
	      enqueueEvent(_this, eventItem);

	      notifyInspectors(_this, {
	         action: 'publish',
	         source: options.sender,
	         target: '-',
	         event: eventName,
	         eventObject: event,
	         cycleId: eventItem.meta.cycleId
	      });
	   });
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Publishes an event that follows the *request-will-did pattern* and awaits all replies. This pattern has
	 * evolved over time and is of great use when handling the asynchronous nature of event bus events.
	 *
	 * Certain rules need to be fulfilled: First the initiator needs to call this method with an event whose
	 * name has the suffix `Request`, e.g. `takeActionRequest`. All collaborators that want to react to this
	 * event then either do so in the same event cycle by sending a `didTakeAction` event or announce that they
	 * will do something asynchronously by publishing a `willTakeAction` event. In the latter case they need to
	 * broadcast the fulfillment of their action by sending a `didTakeAction` event. Note that for both events
	 * the same sender name needs to be given. Otherwise they cannot be mapped and the event bus doesn't know
	 * if all asynchronous replies were already received.
	 *
	 * Additionally a timer is started using either the globally configured `pendingDidTimeout` ms value or the
	 * value provided as option to this method. If that timer expires before all `did*` events to all given
	 * `will*` events were received, the error handler is called to handle the incident and the promise is
	 * rejected with all response received up to now.
	 *
	 * @param {String} eventName
	 *    the name of the event to publish
	 * @param {Object} [optionalEvent]
	 *    the event to publish
	 * @param {Object} [optionalOptions]
	 *    additional options for the publish action
	 * @param {String} optionalOptions.sender
	 *    the id of the event sender. Default is `null`
	 * @param {Number} optionalOptions.pendingDidTimeout
	 *    the timeout in milliseconds for pending did* events
	 *
	 * @return {Promise}
	 *   the delivery promise. It receives a list of all collected `did*` events and according meta information
	 */
	EventBus.prototype.publishAndGatherReplies = function (eventName, optionalEvent, optionalOptions) {
	   (0, _assert2.default)(eventName).hasType(String).isNotNull();

	   var matches = REQUEST_MATCHER.exec(eventName);
	   _assert2.default.state(!!matches, 'Expected eventName to end with "Request" but got ' + eventName);

	   var self = this;
	   var options = object.options(optionalOptions, {
	      pendingDidTimeout: this.config_.pendingDidTimeout
	   });

	   var eventNameSuffix = matches[1].toUpperCase() + matches[2];
	   if (matches[3]) {
	      eventNameSuffix += matches[3];
	   }
	   var deferred = {};
	   deferred.promise = new Promise(function (resolve, reject) {
	      deferred.resolve = resolve;
	      deferred.reject = reject;
	   });
	   var willWaitingForDid = [];
	   var givenDidResponses = [];
	   var cycleFinished = false;

	   function willCollector(event, meta) {
	      (0, _assert2.default)(meta.sender).hasType(String).isNotNull('A response with will to a request-event must contain a sender.');

	      willWaitingForDid.push(meta.sender);
	   }
	   this.subscribe('will' + eventNameSuffix, willCollector, { subscriber: options.sender });

	   function didCollector(event, meta) {
	      givenDidResponses.push({ event: event, meta: meta });
	      var senderIndex = void 0;
	      do {
	         senderIndex = willWaitingForDid.indexOf(meta.sender);
	         if (senderIndex !== -1) {
	            willWaitingForDid.splice(senderIndex, 1);
	         }
	      } while (senderIndex !== -1);

	      if (willWaitingForDid.length === 0 && cycleFinished) {
	         finish();
	      }
	   }
	   this.subscribe('did' + eventNameSuffix, didCollector, { subscriber: options.sender });

	   var timeoutRef = this.timeoutFunction_(function () {
	      if (willWaitingForDid.length > 0) {
	         var message = 'Timeout while waiting for pending did' + eventNameSuffix + ' on ' + eventName + '.';
	         self.errorHandler_(message, {
	            'Sender': options.sender,
	            'After ms timeout': options.pendingDidTimeout,
	            'Responses missing from': willWaitingForDid.join(', ')
	         });
	         finish(true);
	      }
	   }, options.pendingDidTimeout);

	   this.publish(eventName, optionalEvent, options).then(function () {
	      self.unsubscribe(willCollector);
	      if (willWaitingForDid.length === 0) {
	         // either there was no will or all did responses were already given in the same cycle as the will
	         finish();
	         return;
	      }
	      cycleFinished = true;
	   });

	   function finish(wasCanceled) {
	      clearTimeout(timeoutRef);
	      self.unsubscribe(didCollector);
	      (wasCanceled ? deferred.reject : deferred.resolve)(givenDidResponses);
	   }

	   return deferred.promise;
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function enqueueEvent(self, eventItem) {
	   if (self.eventQueue_.length === 0) {
	      self.nextTick_(function () {
	         var queuedEvents = self.eventQueue_;

	         self.eventQueue_ = [];

	         processWaitingPublishPromises(self, processQueue(self, queuedEvents));
	      });
	   }
	   self.eventQueue_.push(eventItem);
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function processQueue(self, queuedEvents) {
	   return self.mediator_(queuedEvents).map(function (eventItem) {
	      var meta = eventItem.meta;
	      self.currentCycle_ = meta.cycleId;

	      var subscribers = findSubscribers(self, meta.name);
	      if (subscribers.length === 0) {
	         self.currentCycle_ = -1;
	         return eventItem.resolvePublish;
	      }

	      var serializedEvent = null;
	      if (subscribers.length > 1) {
	         serializedEvent = JSON.stringify(eventItem.event);
	      }

	      var senderName = meta.sender;
	      var options = meta.options;

	      subscribers.forEach(function (subscriberItem) {
	         var subscriberName = subscriberItem.subscriberName;
	         if (!options.deliverToSender && senderName && senderName === subscriberName) {
	            return;
	         }

	         try {
	            var event = void 0;
	            if (subscriberItem.options.clone) {
	               event = serializedEvent ? JSON.parse(serializedEvent) : eventItem.event;
	            } else {
	               event = object.deepFreeze(eventItem.event, true);
	            }
	            subscriberItem.subscriber(event, object.options(meta, {
	               unsubscribe: function unsubscribe() {
	                  self.unsubscribe(subscriberItem.subscriber);
	               }
	            }));
	         } catch (e) {
	            var message = 'error while calling subscriber "' + subscriberName + '"' + ' for event ' + meta.name + ' published by "' + senderName + '" (subscribed to: ' + subscriberItem.name + ')';
	            self.errorHandler_(message, {
	               'Exception': e,
	               'Published event': eventItem.event,
	               'Event meta information': meta,
	               'Caused by Subscriber': subscriberItem
	            });
	         }

	         notifyInspectors(self, {
	            action: 'deliver',
	            source: senderName,
	            target: subscriberName,
	            event: meta.name,
	            eventObject: eventItem.event,
	            subscribedTo: subscriberItem.name,
	            cycleId: meta.cycleId
	         });
	      });

	      self.currentCycle_ = -1;

	      return eventItem.resolvePublish;
	   });
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function processWaitingPublishPromises(self, newPromiseResolves) {
	   var waitingResolves = self.waitingPromiseResolves_;
	   self.waitingPromiseResolves_ = newPromiseResolves;

	   waitingResolves.forEach(function (resolve) {
	      return resolve();
	   });

	   if (self.eventQueue_.length === 0) {
	      // nothing was queued by any subscriber. The publishers can instantly be notified of delivery.
	      newPromiseResolves.forEach(function (resolve) {
	         return resolve();
	      });
	      self.waitingPromiseResolves_ = [];
	   }
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function findSubscribers(self, eventName) {
	   var subscribers = [];
	   var parts = eventName.split(PART_SEPARATOR);
	   var node = self.subscriberTree_;

	   findSubscribersRecursively(node, parts, subscribers);
	   subscribers.sort(function (a, b) {
	      var aWeight = a.subscriptionWeight;
	      var bWeight = b.subscriptionWeight;
	      if (aWeight[0] === bWeight[0]) {
	         return bWeight[1] - aWeight[1];
	      }

	      return bWeight[0] - aWeight[0];
	   });

	   return subscribers;
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function findSubscribersRecursively(node, parts, subscribers) {
	   if (Array.isArray(node[SUBSCRIBER_FIELD])) {
	      subscribers.push.apply(subscribers, node[SUBSCRIBER_FIELD]);
	   }

	   if (parts.length === 0) {
	      return;
	   }

	   var part = parts[0];
	   parts = parts.slice(1);

	   if (part.indexOf(SUB_PART_SEPARATOR) !== -1) {
	      var index = part.length;
	      do {
	         part = part.substring(0, index);
	         if (part in node) {
	            findSubscribersRecursively(node[part], parts, subscribers);
	         }
	         index = part.lastIndexOf(SUB_PART_SEPARATOR);
	      } while (index !== -1);
	   } else if (part in node) {
	      findSubscribersRecursively(node[part], parts, subscribers);
	   }

	   if (WILDCARD in node) {
	      findSubscribersRecursively(node[WILDCARD], parts, subscribers);
	   }
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function calculateSubscriptionWeight(eventName) {
	   var parts = eventName.split(PART_SEPARATOR);
	   var weight = [0, 0];
	   parts.forEach(function (part) {
	      if (part.length > 0) {
	         weight[0]++;
	         weight[1] += part.split(SUB_PART_SEPARATOR).length - 1;
	      }
	   });
	   return weight;
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function notifyInspectors(self, infoObject) {
	   self.inspectors_.forEach(function (inspector) {
	      inspector(infoObject);
	   });
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function defaultErrorHandler(message, optionalErrorInformation) {
	   if (!window.console || !window.console.log) {
	      return;
	   }

	   var errFunc = !!window.console.error ? 'error' : 'log';
	   window.console[errFunc](message);

	   if (optionalErrorInformation) {
	      Object.keys(optionalErrorInformation).forEach(function (title) {
	         var info = optionalErrorInformation[title];
	         window.console[errFunc]('   - %s: %o', title, info);
	         if (info instanceof Error && info.stack) {
	            window.console[errFunc]('   - Stacktrace: %s', info.stack);
	         }
	      });
	   }
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function ensureFunction(candidate, fallback) {
	   return typeof candidate === 'function' ? candidate : fallback || function (_) {
	      return _;
	   };
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Creates and returns a new event bus instance using the given configuration.
	 *
	 * @param {Function} nextTick
	 *    a next tick function like `process.nextTick` or AngularJS' `$timeout`
	 * @param {Function} timeoutFunction
	 *    a timeout function like `window.setTimeout`  or AngularJS' `$timeout`
	 * @param {Object} [optionalConfiguration]
	 *    configuration for the event bus instance
	 * @param {Number} optionalConfiguration.pendingDidTimeout
	 *    the timeout in milliseconds used by {@link EventBus#publishAndGatherReplies}. Default is 120000ms
	 *
	 * @return {EventBus}
	 */
	function create(nextTick, timeoutFunction, optionalConfiguration) {
	   (0, _assert2.default)(nextTick).hasType(Function).isNotNull('Need a next tick implementation like $timeout');
	   (0, _assert2.default)(timeoutFunction).hasType(Function).isNotNull('Need a timeout implementation like $timeout or setTimeout');

	   return new EventBus(nextTick, timeoutFunction, optionalConfiguration);
	}

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	   value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; /**
	                                                                                                                                                                                                                                                   * Copyright 2016 aixigo AG
	                                                                                                                                                                                                                                                   * Released under the MIT license.
	                                                                                                                                                                                                                                                   * http://laxarjs.org/license
	                                                                                                                                                                                                                                                   */
	/**
	 * The *file_resource_provider* module defines a mechanism to load static assets from the web server of the
	 * LaxarJS application efficiently. Whenever a file should be requested from the server, the file resource
	 * provider should be used in favor of manual http requests, due to two reasons: During development it reduces
	 * the amount of `404` status replies for files that may or may not exist, and when making a release build,
	 * file contents may optionally be embedded in the build bundle. This makes further http requests redundant,
	 * which is especially relevant in high-latency networks, such as cellular networks.
	 *
	 * This module should not be used directly, but via the `axFileResourceProvider` service provided by LaxarJS.
	 *
	 * @module file_resource_provider
	 */


	exports.create = create;

	var _assert = __webpack_require__(2);

	var _assert2 = _interopRequireDefault(_assert);

	var _path = __webpack_require__(8);

	var path = _interopRequireWildcard(_path);

	var _configuration = __webpack_require__(3);

	var configuration = _interopRequireWildcard(_configuration);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var BORDER_SLASHES_MATCHER = /^\/|\/$/g;
	var ENTRY_TYPE_FILE = 1;

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * A provider for file resources that tries to minimize the amount of 404 errors when requesting files that
	 * are not available. To achieve this it is backed by one or more directory tree mappings that already list
	 * which files are available on the server. For any file being located at a path that is not supported by a
	 * mapping, a HEAD request takes place, that might or might not result in a 404 error. If a file is
	 * located at a path supported by a mapping, but is not found in that mapping (because it was added later),
	 * it is assumed to be nonexistent.
	 *
	 * @param {Object} browser
	 *    a browser abstraction
	 * @param {String} rootPath
	 *    the path to the root of the application. It is needed to prefix relative paths found in a listing
	 *    with an absolute prefix
	 *
	 * @constructor
	 * @private
	 */
	function FileResourceProvider(browser, rootPath) {
	   this.browser_ = browser;
	   this.rootPath_ = path.normalize(rootPath);
	   this.useEmbedded_ = configuration.get('useEmbeddedFileListings', false);
	   this.fileListings_ = {};
	   this.fileListingUris_ = {};

	   this.httpGets_ = {};
	   this.httpHeads_ = {};
	   this.httpHeadCache_ = {};
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * If available, resolves the returned promise with the requested file's contents. Otherwise the promise is
	 * rejected. It uses the file mapping prior to fetching the contents to prevent from 404 errors. In the
	 * optimal case the contents are already embedded in the listing and simply need to be returned. If no
	 * listing for the path is available, a request simply takes place and either succeeds or fails.
	 *
	 * @param {String} url
	 *    the uri to the resource to provide
	 *
	 * @return {Promise}
	 *    resolved with the file's content or rejected when the file could not be fetched
	 */
	FileResourceProvider.prototype.provide = function (url) {
	   var self = this;
	   return entry(this, url).then(function (knownEntry) {
	      if (typeof knownEntry === 'string') {
	         return Promise.resolve(knownEntry);
	      }
	      return knownEntry !== false ? httpGet(self, url) : Promise.reject();
	   }, function () {
	      return httpGet(self, url);
	   }).then(resourceTransform(url));
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Resolves the returned promise with `true` as argument, if the requested resource is available and
	 * `false` otherwise.  If no listing for the path is available, a HEAD request takes place and either
	 * succeeds or fails.
	 *
	 * @param {String} url
	 *    the uri to check for availability
	 *
	 * @return {Promise}
	 *    a promise that is always resolved with a boolean value
	 */
	FileResourceProvider.prototype.isAvailable = function isAvailable(url) {
	   var self = this;
	   return entry(self, url).then(function (knownEntry) {
	      return Promise.resolve(knownEntry !== false);
	   }, function () {
	      return httpHead(self, url).then(function (knownAvailable) {
	         return Promise.resolve(knownAvailable);
	      });
	   });
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Sets the uri to a file listing file for a given path.
	 *
	 * @param {String} directory
	 *    the directory the file listing is valid for
	 * @param {String} listingUri
	 *    the uri to the listing file
	 */
	FileResourceProvider.prototype.setFileListingUri = function (directory, listingUri) {
	   var filePathPrefix = path.join(this.rootPath_, directory);
	   this.fileListingUris_[filePathPrefix] = path.join(this.rootPath_, listingUri);
	   this.fileListings_[filePathPrefix] = null;
	   fetchListingForPath(this, filePathPrefix);
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Sets the contents of a file listing file to the given object. This a useful alternative to
	 * {@link FileResourceProvider#setFileListingUri}, to avoid an additional round-trip during production.
	 *
	 * @param {String} directory
	 *    the directory the file listing is valid for
	 * @param {String} listing
	 *    the actual file listing
	 */
	FileResourceProvider.prototype.setFileListingContents = function (directory, listing) {
	   var filePathPrefix = path.join(this.rootPath_, directory);
	   this.fileListingUris_[filePathPrefix] = '#';
	   this.fileListings_[filePathPrefix] = listing;
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Try to lookup a file resource in the provider's listings.
	 *
	 * @return {Promise}
	 *    Resolves to `true` (listed but not embedded), to `false` (file is not listed), or to a string
	 *    (embedded content for a listed file).
	 *
	 * @private
	 */
	function entry(self, resourcePath) {
	   var usablePrefixes = Object.keys(self.fileListingUris_).filter(function (prefix) {
	      return resourcePath.indexOf(prefix) === 0;
	   });

	   if (usablePrefixes.length) {
	      var prefix = usablePrefixes[0];
	      return fetchListingForPath(self, prefix).then(function (listing) {
	         return Promise.resolve(lookup(self, resourcePath, listing));
	      });
	   }

	   return Promise.reject();

	   ////////////////////////////////////////////////////////////////////////////////////////////////////////

	   function lookup(self, file, listing) {
	      var parts = file.replace(self.rootPath_, '').replace(BORDER_SLASHES_MATCHER, '').split('/');
	      for (var i = 0, len = parts.length; i < len; ++i) {
	         if (i === len - 1) {
	            var value = listing[parts[i]];
	            if (self.useEmbedded_) {
	               return typeof value === 'string' ? value : value === ENTRY_TYPE_FILE;
	            } else {
	               return typeof value === 'string' || value === ENTRY_TYPE_FILE;
	            }
	         }

	         listing = listing[parts[i]];
	         if ((typeof listing === 'undefined' ? 'undefined' : _typeof(listing)) !== 'object') {
	            return false;
	         }
	      }
	   }
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function resourceTransform(path) {
	   return (/\.json$/.test(path) ? function (contents) {
	         return JSON.parse(contents);
	      } : function (contents) {
	         return contents;
	      }
	   );
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function fetchListingForPath(self, path) {
	   if (self.fileListings_[path]) {
	      return Promise.resolve(self.fileListings_[path]);
	   }

	   var listingUri = self.fileListingUris_[path];
	   return httpGet(self, listingUri).then(resourceTransform(listingUri)).then(function (listing) {
	      self.fileListings_[path] = listing;
	      return listing;
	   });
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * @param {FileResourceProvider} self
	 * @param {String} url A url to get
	 *
	 * @return {Promise<String>} Resolved to the file contents if the request succeeds
	 *
	 * @private
	 */
	function httpGet(self, url) {
	   if (url in self.httpGets_) {
	      return self.httpGets_[url];
	   }

	   var promise = self.httpGets_[url] = self.browser_.fetch(url).then(function (response) {
	      return response.text();
	   });

	   // Free memory when the response is complete:
	   promise.then(function () {
	      delete self.httpGets_[url];
	   });

	   return promise;
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * @param {FileResourceProvider} self
	 * @param {String} url A url to check using a HEAD request
	 *
	 * @return {Promise<Boolean>} Resolved to `true` if a HEAD-request to the url succeeds, else to `false`.
	 *
	 * @private
	 */
	function httpHead(self, url) {
	   if (url in self.httpHeadCache_) {
	      return Promise.resolve(self.httpHeadCache_[url]);
	   }
	   if (url in self.httpHeads_) {
	      return self.httpHeads_[url];
	   }

	   var promise = self.httpHeads_[url] = self.browser_.fetch(url, { method: 'HEAD' }).then(function () {
	      return true;
	   }, function () {
	      return false;
	   });

	   // Free memory and cache result when the response is complete:
	   promise.then(function (result) {
	      self.httpHeadCache_[url] = result;
	      delete self.httpHeads_[url];
	   });

	   return promise;
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Creates and returns a new instance.
	 *
	 * @param {Object} browser
	 *    a browser abstraction
	 * @param {String} rootPath
	 *    the path to the root of the application. It is needed to prefix relative paths found in a listing
	 *    with an absolute prefix
	 *
	 * @return {FileResourceProvider}
	 *    a new instance
	 */
	function create(browser, rootPath) {
	   (0, _assert2.default)(browser).hasProperty('fetch').isNotNull('Need a browser abstraction library providing fetch()');

	   return new FileResourceProvider(browser, rootPath);
	}

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	   value: true
	});
	exports.join = join;
	exports.normalize = normalize;
	exports.relative = relative;
	exports.resolveAssetPath = resolveAssetPath;
	exports.extractScheme = extractScheme;

	var _assert = __webpack_require__(2);

	var _assert2 = _interopRequireDefault(_assert);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var PATH_SEPARATOR = '/'; /**
	                           * Copyright 2016 aixigo AG
	                           * Released under the MIT license.
	                           * http://laxarjs.org/license
	                           */
	// TODO: this won't work. We need to get rid of amd module references in the frontend
	// import require from 'require';

	var PARENT = '..';
	var ABSOLUTE = /^([a-z0-9]+:\/\/[^\/]+\/|\/)(.*)$/;

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Joins multiple path fragments into one normalized path. Absolute paths (paths starting with a `/`)
	 * and URLs will "override" any preceding paths. I.e. joining a URL or an absolute path to _anything_
	 * will give the URL or absolute path.
	 *
	 * @param {...String} fragments
	 *    the path fragments to join
	 *
	 * @return {String}
	 *    the joined path
	 */
	function join() {
	   for (var _len = arguments.length, fragments = Array(_len), _key = 0; _key < _len; _key++) {
	      fragments[_key] = arguments[_key];
	   }

	   if (fragments.length === 0) {
	      return '';
	   }

	   var prefix = '';

	   fragments = fragments.reduce(function (fragments, fragment) {
	      (0, _assert2.default)(fragment).hasType(String).isNotNull();

	      var matchAbsolute = ABSOLUTE.exec(fragment);

	      if (matchAbsolute) {
	         prefix = matchAbsolute[1];
	         fragment = matchAbsolute[2];
	         return fragment.split(PATH_SEPARATOR);
	      }

	      return fragments.concat(fragment.split(PATH_SEPARATOR));
	   }, []);

	   var pathStack = normalizeFragments(fragments);

	   return prefix + pathStack.join(PATH_SEPARATOR);
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Normalizes a path. Removes multiple consecutive slashes, strips trailing slashes, removes `.`
	 * references and resolves `..` references (unless there are no preceding directories).
	 *
	 * @param {String} path
	 *    the path to normalize
	 *
	 * @return {String}
	 *    the normalized path
	 */
	function normalize(path) {
	   var prefix = '';
	   var matchAbsolute = ABSOLUTE.exec(path);

	   if (matchAbsolute) {
	      prefix = matchAbsolute[1];
	      path = matchAbsolute[2];
	   }

	   var pathStack = normalizeFragments(path.split(PATH_SEPARATOR));

	   return prefix + pathStack.join(PATH_SEPARATOR);
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Compute a relative path. Takes two absolute paths and returns a normalized path, relative to
	 * the first path.
	 * Note that if both paths are URLs they are threated as if they were on the same host. I.e. this function
	 * does not complain when called with `http://localhost/path` and `http://example.com/another/path`.
	 *
	 * @param {String} from
	 *    the starting point from which to determine the relative path
	 *
	 * @param {String} path
	 *    the target path
	 *
	 * @return {String}
	 *    the relative path from `from` to `to`
	 */
	function relative(from, path) {
	   var matchAbsoluteFrom = ABSOLUTE.exec(from);
	   var matchAbsolutePath = ABSOLUTE.exec(path);

	   (0, _assert2.default)(matchAbsoluteFrom).isNotNull();
	   (0, _assert2.default)(matchAbsolutePath).isNotNull();

	   var fromStack = normalizeFragments(matchAbsoluteFrom[2].split(PATH_SEPARATOR));
	   var pathStack = normalizeFragments(matchAbsolutePath[2].split(PATH_SEPARATOR));

	   return fromStack.reduce(function (path, fragment) {
	      if (path[0] === fragment) {
	         path.shift();
	      } else {
	         path.unshift('..');
	      }
	      return path;
	   }, pathStack).join(PATH_SEPARATOR) || '.';
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function resolveAssetPath(refWithScheme, defaultAssetDirectory, optionalDefaultScheme) {
	   var info = extractScheme(refWithScheme, optionalDefaultScheme || 'amd');
	   if (typeof schemeLoaders[info.scheme] !== 'function') {
	      throw new Error('Unknown schema type "' + info.scheme + '" in reference "' + refWithScheme + '".');
	   }
	   return normalize(schemeLoaders[info.scheme](info.ref, defaultAssetDirectory));
	}

	var schemeLoaders = {
	   local: function local(ref, defaultAssetDirectory) {
	      return join(defaultAssetDirectory, ref);
	   },
	   amd: function amd(ref) {
	      // TODO NEEDS FIX A: amd references should already be resolved by the grunt task
	      return System.normalizeSync(ref).replace(/\.js$/, '');
	   }
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function extractScheme(ref, defaultScheme) {
	   var parts = ref.split(':');
	   return {
	      scheme: parts.length === 2 ? parts[0] : defaultScheme,
	      ref: parts.length === 2 ? parts[1] : parts[0]
	   };
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function normalizeFragments(fragments) {
	   return fragments.reduce(function (pathStack, fragment) {
	      fragment = fragment.replace(/^\/+|\/+$/g, '');

	      if (fragment === '' || fragment === '.') {
	         return pathStack;
	      }

	      if (pathStack.length === 0) {
	         return [fragment];
	      }

	      if (fragment === PARENT && pathStack.length > 0 && pathStack[pathStack.length - 1] !== PARENT) {
	         pathStack.pop();
	         return pathStack;
	      }
	      pathStack.push(fragment);

	      return pathStack;
	   }, []);
	}

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	   value: true
	});
	exports.languageTagFromI18n = exports.localizer = exports.localizeRelaxed = exports.localizeStrict = exports.localize = undefined;

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; /**
	                                                                                                                                                                                                                                                   * Copyright 2016 aixigo AG
	                                                                                                                                                                                                                                                   * Released under the MIT license.
	                                                                                                                                                                                                                                                   * http://laxarjs.org/license
	                                                                                                                                                                                                                                                   */
	/**
	 * Utilities for dealing with internationalization (i18n).
	 *
	 * When requiring `laxar`, it is available as `laxar.i18n`.
	 *
	 * @module i18n
	 */

	var _assert = __webpack_require__(2);

	var _assert2 = _interopRequireDefault(_assert);

	var _string = __webpack_require__(10);

	var string = _interopRequireWildcard(_string);

	var _configuration = __webpack_require__(3);

	var configuration = _interopRequireWildcard(_configuration);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var localize = localizeRelaxed;

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	var primitives = {
	   string: true,
	   number: true,
	   boolean: true
	};

	var fallbackTag = void 0;

	var normalize = memoize(function (languageTag) {
	   return languageTag.toLowerCase().replace(/[-]/g, '_');
	});

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	// Shortcuts: it is assumed that this module is used heavily (or not at all).
	var format = string.format;
	var keys = Object.keys;

	exports.localize = localize;
	exports.localizeStrict = localizeStrict;
	exports.localizeRelaxed = localizeRelaxed;
	exports.localizer = localizer;
	exports.languageTagFromI18n = languageTagFromI18n;

	/**
	 * Shortcut to {@link localizeRelaxed}.
	 *
	 * @name localize
	 * @type {Function}
	 */

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Localize the given internationalized object using the given languageTag.
	 *
	 * @param {String} languageTag
	 *    the languageTag to lookup a localization with. Maybe `undefined`, if the value is not i18n (app does
	 *    not use i18n)
	 * @param {*} i18nValue
	 *    a possibly internationalized value:
	 *    - when passing a primitive value, it is returned as-is
	 *    - when passing an object, the languageTag is used as a key within that object
	 * @param {*} [optionalFallback]
	 *    a value to use if no localization is available for the given language tag
	 *
	 * @return {*}
	 *    the localized value if found, `undefined` otherwise
	 */

	function localizeStrict(languageTag, i18nValue, optionalFallback) {
	   (0, _assert2.default)(languageTag).hasType(String);
	   if (!i18nValue || primitives[typeof i18nValue === 'undefined' ? 'undefined' : _typeof(i18nValue)]) {
	      // Value is not i18n
	      return i18nValue;
	   }
	   (0, _assert2.default)(languageTag).isNotNull();

	   // Try one direct lookup before scanning the input keys,
	   // assuming that language-tags are written in consistent style.
	   var value = i18nValue[languageTag];
	   if (value !== undefined) {
	      return value;
	   }

	   var lookupKey = normalize(languageTag);
	   var availableTags = keys(i18nValue);
	   var n = availableTags.length;
	   for (var i = 0; i < n; ++i) {
	      var t = availableTags[i];
	      if (normalize(t) === lookupKey) {
	         return i18nValue[t];
	      }
	   }

	   return optionalFallback;
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * For controls (such as a date-picker), we cannot anticipate all required language tags, as they may be
	 * app-specific. The relaxed localize behaves like localize if an exact localization is available. If not,
	 * the language tag is successively generalized by stripping off the rightmost sub-tags until a
	 * localization is found. Eventually, a fallback ('en') is used.
	 *
	 * @param {String} languageTag
	 *    the languageTag to lookup a localization with. Maybe `undefined`, if the value is not i18n (app does
	 *    not use i18n)
	 * @param {*} i18nValue
	 *    a possibly internationalized value:
	 *    - when passing a primitive value, it is returned as-is
	 *    - when passing an object, the `languageTag` is used to look up a localization within that object
	 * @param {*} [optionalFallback]
	 *    a value to use if no localization is available for the given language tag
	 *
	 * @return {*}
	 *    the localized value if found, the fallback `undefined` otherwise
	 */
	function localizeRelaxed(languageTag, i18nValue, optionalFallback) {
	   (0, _assert2.default)(languageTag).hasType(String);
	   if (!i18nValue || primitives[typeof i18nValue === 'undefined' ? 'undefined' : _typeof(i18nValue)]) {
	      // Value is not i18n (app does not use it)
	      return i18nValue;
	   }

	   var tagParts = languageTag ? languageTag.replace(/-/g, '_').split('_') : [];
	   while (tagParts.length > 0) {
	      var currentLocaleTag = tagParts.join('-');
	      var value = localizeStrict(currentLocaleTag, i18nValue);
	      if (value !== undefined) {
	         return value;
	      }
	      tagParts.pop();
	   }

	   if (fallbackTag === undefined) {
	      fallbackTag = configuration.get('i18n.fallback', 'en');
	   }

	   return fallbackTag && localizeStrict(fallbackTag, i18nValue) || optionalFallback;
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Encapsulate a given languageTag in a partially applied localize function.
	 *
	 * @param {String} languageTag
	 *    the languageTag to lookup localizations with
	 * @param {*} [optionalFallback]
	 *    a value to use by the localizer function whenever no localization is available for the language tag
	 *
	 * @return {Localizer}
	 *    A single-arg localize-Function, which always uses the given language-tag. It also has a `.format`
	 *    -method, which can be used as a shortcut to `string.format( localize( x ), args )`
	 */
	function localizer(languageTag, optionalFallback) {

	   /**
	    * @name Localizer
	    * @private
	    */
	   function partial(i18nValue) {
	      return localize(languageTag, i18nValue, optionalFallback);
	   }

	   /**
	    * Shortcut to string.format, for simple chaining to the localizer.
	    *
	    * These are equal:
	    * - `string.format( i18n.localizer( tag )( i18nValue ), numericArgs, namedArgs )`
	    * - `i18n.localizer( tag ).format( i18nValue, numericArgs, namedArgs )`.
	    *
	    * @param {String} i18nValue
	    *    the value to localize and then format
	    * @param {Array} [optionalIndexedReplacements]
	    *    replacements for any numeric placeholders in the localized value
	    * @param {Object} [optionalNamedReplacements]
	    *    replacements for any named placeholders in the localized value
	    *
	    * @return {String}
	    *    the formatted string, taking i18n into account
	    *
	    * @memberOf Localizer
	    */
	   partial.format = function (i18nValue, optionalIndexedReplacements, optionalNamedReplacements) {
	      var formatString = localize(languageTag, i18nValue);
	      if (formatString === undefined) {
	         return optionalFallback;
	      }
	      return format(formatString, optionalIndexedReplacements, optionalNamedReplacements);
	   };

	   return partial;
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Retrieve the language tag of the current locale from an i18n model object, such as used on the scope.
	 *
	 * @param {{locale: String, tags: Object<String, String>}} i18n
	 *    an internationalization model, with reference to the currently active locale and a map from locales
	 *    to language tags
	 * @param {*} [optionalFallbackLanguageTag]
	 *    a language tag to use if no tags are found on the given object
	 *
	 * @return {String}
	 *    the localized value if found, `undefined` otherwise
	 */
	function languageTagFromI18n(i18n, optionalFallbackLanguageTag) {
	   if (!i18n || !i18n.hasOwnProperty('tags')) {
	      return optionalFallbackLanguageTag;
	   }
	   return i18n.tags[i18n.locale] || optionalFallbackLanguageTag;
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function memoize(f) {
	   var cache = {};
	   return function (key) {
	      var value = cache[key];
	      if (value === undefined) {
	         value = f(key);
	         cache[key] = value;
	      }
	      return value;
	   };
	}

/***/ },
/* 10 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	   value: true
	});
	exports.format = format;
	exports.createFormatter = createFormatter;
	/**
	 * Copyright 2016 aixigo AG
	 * Released under the MIT license.
	 * http://laxarjs.org/license
	 */
	/**
	 * Utilities for dealing with strings.
	 *
	 * When requiring `laxar`, it is available as `laxar.string`.
	 *
	 * @module string
	 */
	var DEFAULT_FORMATTERS = exports.DEFAULT_FORMATTERS = {
	   's': function s(input) {
	      return '' + input;
	   },

	   'd': function d(input) {
	      return input.toFixed(0);
	   },

	   'i': function i(input, subSpecifierString) {
	      return DEFAULT_FORMATTERS.d(input, subSpecifierString);
	   },

	   'f': function f(input, subSpecifierString) {
	      var precision = subSpecifierString.match(/^\.(\d)$/);
	      if (precision) {
	         return input.toFixed(precision[1]);
	      }

	      return '' + input;
	   },

	   'o': function o(input) {
	      return JSON.stringify(input);
	   },

	   'default': function _default(input, subSpecifierString) {
	      return DEFAULT_FORMATTERS.s(input, subSpecifierString);
	   }
	};

	if (typeof Object.freeze === 'function') {
	   Object.freeze(DEFAULT_FORMATTERS);
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Substitutes all unescaped placeholders in the given string for a given indexed or named value.
	 * A placeholder is written as a pair of brackets around the key of the placeholder. An example of an
	 * indexed placeholder is `[0]` and a named placeholder would look like this `[replaceMe]`. If no
	 * replacement for a key exists, the placeholder will simply not be substituted.
	 *
	 * Some examples:
	 * ```javascript
	 * string.format( 'Hello [0], how do you like [1]?', [ 'Peter', 'Cheeseburgers' ] );
	 * // => 'Hello Peter, how do you like Cheeseburgers?'
	 * ```
	 * ```javascript
	 * string.format( 'Hello [name] and [partner], how do you like [0]?', [ 'Pizza' ], {
	 *    name: 'Hans',
	 *    partner: 'Roswita'
	 * } );
	 * // => 'Hello Hans and Roswita, how do you like Pizza?'
	 * ```
	 * If a pair of brackets should not be treated as a placeholder, the opening bracket can simply be escaped
	 * by backslashes (thus to get an actual backslash in a JavaScript string literal, which is then treated as
	 * an escape symbol, it needs to be written as double backslash):
	 * ```javascript
	 * string.format( 'A [something] should eventually only have \\[x].', {
	 *    something: 'checklist'
	 * } );
	 * // => 'A checklist should eventually only have [x].'
	 * ```
	 * A placeholder key can be any character string besides `[`, `]` and `:` to keep parsing simple and fast.
	 * By using `:` as separator it is possible to provide a type specifier for string serialization or other
	 * additional mapping functions for the value to insert. Type specifiers always begin with an `%` and end
	 * with the specifier type. Builtin specifier types are the following:
	 *
	 * - `%d` / `%i`: Format the given numeric value as integer. Decimal places are removed.
	 * - `%f`: Format the given numeric value as floating point value. This specifier supports precision as
	 *   sub-specifier (e.g. `%.2f` for 2 decimal places).
	 * - `%s`: use simple string serialization using `toString`.
	 * - `%o`: Format complex objects using `JSON.stringify`.
	 *
	 * When no specifier is provided, by default `%s` is assumed.
	 *
	 * Example:
	 * ```javascript
	 * string.format( 'Hello [0:%s], you owe me [1:%.2f] euros.', [ 'Peter', 12.1243 ] );
	 * // => 'Hello Peter, you owe me 12.12 euros.'
	 * ```
	 *
	 * Mapping functions should instead consist of simple strings and may not begin with a `%` character. It is
	 * advised to use the same naming rules as for simple JavaScript functions. Type specifiers and mapping
	 * functions are applied in the order they appear within the placeholder.
	 *
	 * An example, where we assume that the mapping functions `flip` and `double` where defined by the user
	 * when creating the `formatString` function using {@link createFormatter}:
	 * ```javascript
	 * formatString( 'Hello [0:%s:flip], you owe me [1:double:%.2f] euros.', [ 'Peter', 12 ] );
	 * // => 'Hello reteP, you owe me 24.00 euros.'
	 * ```
	 *
	 * Note that there currently exist no builtin mapping functions.
	 *
	 * If a type specifier is used that doesn't exist, an exception is thrown. In contrast to that the use of
	 * an unknown mapping function results in a no-op. This is on purpose to be able to use filter-like
	 * functions that, in case they are defined for a formatter, transform a value as needed and in all other
	 * cases simply are ignored and don't alter the value.
	 *
	 * @param {String} string
	 *    the string to replace placeholders in
	 * @param {Array} [optionalIndexedReplacements]
	 *    an optional array of indexed replacements
	 * @param {Object} [optionalNamedReplacements]
	 *    an optional map of named replacements
	 *
	 * @return {String}
	 *    the string with placeholders substituted for their according replacements
	 */
	function format(string, optionalIndexedReplacements, optionalNamedReplacements) {
	   return DEFAULT_FORMATTER(string, optionalIndexedReplacements, optionalNamedReplacements);
	}
	var DEFAULT_FORMATTER = createFormatter(DEFAULT_FORMATTERS);

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Creates a new format function having the same api as {@link format}. If the first argument is
	 * omitted or `null`, the default formatters for type specifiers are used. Otherwise only the provided map
	 * of specifiers is available to the returned format function. Each key of the map is a specifier character
	 * where the `%` is omitted and the value is the formatting function. A formatting function receives the
	 * value to format (i.e. serialize) and the sub-specifier (if any) as arguments. For example for the format
	 * specifier `%.2f` the sub-specifier would be `.2` where for `%s` it would simply be the empty string.
	 *
	 * Example:
	 * ```javascript
	 * const format = string.createFormatter( {
	 *    'm': function( value ) {
	 *       return value.amount + ' ' + value.currency;
	 *    },
	 *    'p': function( value, subSpecifier ) {
	 *       return Math.pow( value, parseInt( subSpecifier, 10 ) );
	 *    }
	 * } );
	 *
	 * format( 'You owe me [0:%m].', [ { amount: 12, currency: 'EUR' } ] );
	 * // => 'You owe me 12 EUR.'
	 *
	 * format( '[0]^3 = [0:%3p]', [ 2 ] );
	 * // => '2^3 = 8'
	 * ```
	 *
	 * The second argument is completely additional to the behavior of the default {@link format}
	 * function. Here a map from mapping function id to actual mapping function can be passed in. Whenever the
	 * id of a mapping function is found within the placeholder, that mapping function is called with the
	 * current value and its return value is either passed to the next mapping function or rendered
	 * instead of the placeholder if there are no more mapping function ids or type specifiers within the
	 * placeholder string.
	 *
	 * ```javascript
	 * const format = string.createFormatter( null, {
	 *    flip: function( value ) {
	 *       return ( '' + s ).split( '' ).reverse().join( '' );
	 *    },
	 *    double: function( value ) {
	 *       return value * 2;
	 *    }
	 * } );
	 *
	 * format( 'Hello [0:%s:flip], you owe me [1:double:%.2f] euros.', [ 'Peter', 12 ] );
	 * // => 'Hello reteP, you owe me 24.00 euros.'
	 * ```
	 *
	 * @param {Object} typeFormatters
	 *    map from format specifier (single letter without leading `%`) to formatting function
	 * @param {Object} [optionalValueMappers]
	 *    map from mapping identifier to mapping function
	 *
	 * @return {Function}
	 *    A function having the same api as {@link format}
	 */
	function createFormatter(typeFormatters, optionalValueMappers) {

	   if (!typeFormatters) {
	      typeFormatters = DEFAULT_FORMATTERS;
	   }
	   if (!optionalValueMappers) {
	      optionalValueMappers = {};
	   }

	   function format(string, optionalIndexedReplacements, optionalNamedReplacements) {
	      if (typeof string !== 'string') {
	         return defaultTypeFormatter(typeFormatters)(string);
	      }

	      var indexed = Array.isArray(optionalIndexedReplacements) ? optionalIndexedReplacements : [];
	      var named = {};
	      if (optionalNamedReplacements) {
	         named = optionalNamedReplacements || {};
	      } else if (!Array.isArray(optionalIndexedReplacements)) {
	         named = optionalIndexedReplacements || {};
	      }

	      var chars = string.split('');
	      var output = '';
	      for (var i = 0, len = chars.length; i < len; ++i) {
	         if (chars[i] === BACKSLASH) {
	            if (i + 1 === len) {
	               throw new Error('Unterminated escaping sequence at index ' + i + ' of string: "' + string + '".');
	            }

	            output += chars[++i];
	         } else if (chars[i] === OPENING_BRACKET) {
	            var closingIndex = string.indexOf(CLOSING_BRACKET, i + 1);
	            if (closingIndex === -1) {
	               throw new Error('Unterminated placeholder at index ' + i + ' of string: "' + string + '".');
	            }

	            var key = string.substring(i + 1, closingIndex);

	            output += replacePlaceholder(key, named, indexed, { string: string, index: i });

	            i = closingIndex;
	         } else {
	            output += chars[i];
	         }
	      }
	      return output;
	   }

	   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

	   function replacePlaceholder(placeholder, named, indexed, context) {
	      var specifier = '';
	      var subSpecifierString = '';
	      var placeholderParts = placeholder.split(':');
	      var key = placeholderParts[0];

	      var value = void 0;
	      if (INTEGER_MATCHER.test(key) && key < indexed.length) {
	         value = indexed[key];
	      } else if (key in named) {
	         value = named[key];
	      } else {
	         return OPENING_BRACKET + placeholder + CLOSING_BRACKET;
	      }

	      if (placeholderParts.length > 1) {

	         if (placeholderParts[1].charAt(0) !== '%') {
	            value = defaultTypeFormatter(typeFormatters)(value);
	         }

	         return placeholderParts.slice(1).reduce(function (value, part) {
	            if (part.indexOf('%') === 0) {
	               var specifierMatch = part.match(/^%(.*)(\w)$/);
	               specifier = specifierMatch ? specifierMatch[2] : '';
	               subSpecifierString = specifierMatch ? specifierMatch[1] : '';
	               if (specifier in typeFormatters) {
	                  return typeFormatters[specifier](value, subSpecifierString);
	               } else {
	                  var knownSpecifiers = Object.keys(typeFormatters).filter(function (_) {
	                     return _ !== 'default';
	                  }).map(function (_) {
	                     return '%' + _;
	                  }).join(', ');

	                  throw new Error('Unknown format specifier "%' + specifier + '" for placeholder' + ' at index ' + context.index + ' of string: "' + context.string + '" (Known specifiers are: ' + knownSpecifiers + ').');
	               }
	            } else if (part in optionalValueMappers) {
	               return optionalValueMappers[part](value);
	            }

	            return value;
	         }, value);
	      }

	      return defaultTypeFormatter(typeFormatters)(value);
	   }

	   ////////////////////////////////////////////////////////////////////////////////////////////////////////

	   return format;
	}
	var BACKSLASH = '\\';
	var OPENING_BRACKET = '[';
	var CLOSING_BRACKET = ']';
	var INTEGER_MATCHER = /^[0-9]+$/;

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function defaultTypeFormatter(typeFormatters) {
	   if ('default' in typeFormatters) {
	      return typeFormatters['default'];
	   }

	   return DEFAULT_FORMATTERS['default'];
	}

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	   value: true
	});
	exports.create = create;

	var _log = __webpack_require__(1);

	var _log2 = _interopRequireDefault(_log);

	var _path = __webpack_require__(8);

	var path = _interopRequireWildcard(_path);

	var _object = __webpack_require__(4);

	var object = _interopRequireWildcard(_object);

	var _string = __webpack_require__(10);

	var string = _interopRequireWildcard(_string);

	var _features_provider = __webpack_require__(12);

	var featuresProvider = _interopRequireWildcard(_features_provider);

	var _pages = __webpack_require__(18);

	var _pages2 = _interopRequireDefault(_pages);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * Copyright 2016 aixigo AG
	 * Released under the MIT license.
	 * http://laxarjs.org/license
	 */


	var TYPE_WIDGET = 'widget';
	var TYPE_ACTIVITY = 'activity';
	var TECHNOLOGY_ANGULAR = 'angular';

	var DEFAULT_INTEGRATION = { type: TYPE_WIDGET, technology: TECHNOLOGY_ANGULAR };

	var ID_SEPARATOR = '-';
	var INVALID_ID_MATCHER = /[^A-Za-z0-9_\.-]/g;

	function create(fileResourceProvider, eventBus, controls, cssLoader, themeManager, themesPath, widgetsPath) {

	   var widgetAdapters = {};

	   return {
	      load: load,
	      registerWidgetAdapters: function registerWidgetAdapters(adapters) {
	         adapters.forEach(function (adapter) {
	            widgetAdapters[adapter.technology] = adapter;
	         });
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
	   function load(widgetConfiguration, optionalOptions) {

	      var resolvedWidgetPath = path.resolveAssetPath(widgetConfiguration.widget, widgetsPath, 'local');
	      var widgetJsonPath = path.join(resolvedWidgetPath, 'widget.json');

	      var options = object.options(optionalOptions, {
	         onBeforeControllerCreation: function onBeforeControllerCreation() {}
	      });

	      return fileResourceProvider.provide(widgetJsonPath).then(function (specification) {
	         // The control-descriptors must be loaded prior to controller creation.
	         // This allows the widget controller to synchronously instantiate controls.
	         return Promise.all((specification.controls || []).map(controls.load)).then(function (descriptors) {
	            descriptors.forEach(checkTechnologyCompatibility(specification));
	            return specification;
	         });
	      }).then(function (specification) {
	         _pages2.default.setWidgetDescriptor(widgetConfiguration.widget, specification);

	         var integration = object.options(specification.integration, DEFAULT_INTEGRATION);
	         var type = integration.type;
	         var technology = integration.technology;
	         // Handle legacy widget code:
	         if (type === TECHNOLOGY_ANGULAR) {
	            type = TYPE_WIDGET;
	         }
	         if (type !== TYPE_WIDGET && type !== TYPE_ACTIVITY) {
	            throwError(widgetConfiguration, 'Unknown integration type "' + type + '"');
	         }

	         var throwWidgetError = throwError.bind(null, widgetConfiguration);
	         var features = featuresProvider.featuresForWidget(specification, widgetConfiguration, throwWidgetError);
	         var anchorElement = document.createElement('DIV');
	         anchorElement.className = normalizeClassName(specification.name);
	         anchorElement.id = 'ax' + ID_SEPARATOR + widgetConfiguration.id;
	         var widgetEventBus = createEventBusForWidget(eventBus, specification, widgetConfiguration);

	         var adapterFactory = widgetAdapters[technology];
	         var adapter = adapterFactory.create({
	            anchorElement: anchorElement,
	            context: {
	               eventBus: widgetEventBus,
	               features: features,
	               id: createIdGeneratorForWidget(widgetConfiguration.id),
	               widget: {
	                  area: widgetConfiguration.area,
	                  id: widgetConfiguration.id,
	                  path: widgetConfiguration.widget
	               }
	            },
	            specification: specification
	         });
	         adapter.createController(options);

	         return {
	            id: widgetConfiguration.id,
	            adapter: adapter,
	            destroy: function destroy() {
	               widgetEventBus.release();
	               adapter.destroy();
	            },

	            applyViewChanges: adapterFactory.applyViewChanges || null,
	            templatePromise: loadAssets(resolvedWidgetPath, integration, specification, widgetConfiguration)
	         };
	      }, function (err) {
	         var message = 'Could not load spec for widget [0] from [1]: [2]';
	         _log2.default.error(message, widgetConfiguration.widget, widgetJsonPath, err);
	      });
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
	   function loadAssets(widgetPath, integration, widgetSpecification, widgetConfiguration) {
	      if (integration.type === TYPE_ACTIVITY) {
	         return Promise.resolve(null);
	      }

	      return resolve().then(function (urls) {
	         urls.cssFileUrls.forEach(function (url) {
	            return cssLoader.load(url);
	         });
	         return urls.templateUrl ? fileResourceProvider.provide(urls.templateUrl) : null;
	      });

	      ////////////////////////////////////////////////////////////////////////////////////////////////////////

	      function resolve() {
	         // the name from the widget.json
	         var specifiedName = widgetSpecification.name;
	         var specifiedHtmlFile = specifiedName + '.html';
	         var specifiedCssFile = path.join('css/', specifiedName + '.css');
	         // for backward compatibility: the name inferred from the reference
	         var technicalName = widgetPath.split('/').pop();
	         var technicalHtmlFile = technicalName + '.html';
	         var technicalCssFile = path.join('css/', technicalName + '.css');

	         var refPath = path.extractScheme(widgetConfiguration.widget).ref;
	         var promises = [];
	         promises.push(themeManager.urlProvider(path.join(widgetPath, '[theme]'), path.join(themesPath, '[theme]', 'widgets', specifiedName), [path.join(themesPath, '[theme]', 'widgets', refPath)]).provide([specifiedHtmlFile, specifiedCssFile, technicalHtmlFile, technicalCssFile]));

	         promises = promises.concat(loadControlAssets());
	         return Promise.all(promises).then(function (results) {
	            var widgetUrls = results[0];
	            var cssUrls = results.slice(1).map(function (urls) {
	               return urls[0];
	            }).concat(widgetUrls[1] || widgetUrls[3]).filter(function (url) {
	               return !!url;
	            });

	            return {
	               templateUrl: widgetUrls[0] || widgetUrls[2] || '',
	               cssFileUrls: cssUrls
	            };
	         });
	      }

	      ////////////////////////////////////////////////////////////////////////////////////////////////////////

	      function loadControlAssets() {
	         return (widgetSpecification.controls || []).map(function (controlRef) {
	            var descriptor = controls.descriptor(controlRef);
	            var resolvedPath = controls.resolve(controlRef);
	            var name = descriptor.name;

	            var cssPathInControl = path.join(resolvedPath, '[theme]');
	            var cssPathInTheme = path.join(themesPath, '[theme]', 'controls', name);
	            if (descriptor._compatibility_0x) {
	               // LaxarJS v0.x compatibility: use compatibility paths to load CSS.
	               _log2.default.warn('Deprecation: Control is missing control.json descriptor: [0]', controlRef);
	               cssPathInTheme = path.join(themesPath, '[theme]', controlRef);
	            }
	            return themeManager.urlProvider(cssPathInControl, cssPathInTheme).provide([path.join('css/', name + '.css')]);
	         });
	      }
	   }
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////

	function checkTechnologyCompatibility(widgetDescriptor) {
	   return function (controlDescriptor) {
	      var controlTechnology = (controlDescriptor.integration || DEFAULT_INTEGRATION).technology;
	      if (controlTechnology === 'plain') {
	         // plain is always compatible
	         return;
	      }

	      var widgetTechnology = (widgetDescriptor.integration || DEFAULT_INTEGRATION).technology;
	      if (widgetTechnology === controlTechnology) {
	         return;
	      }

	      _log2.default.warn('Incompatible integration technologies: widget [0] ([1]) cannot use control [2] ([3])', widgetDescriptor.name, widgetTechnology, controlDescriptor.name, controlTechnology);
	   };
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////

	function normalizeClassName(str) {
	   return str.replace(/([a-z0-9])([A-Z])/g, function ($_, $0, $1) {
	      return $0 + '-' + $1;
	   }).replace(/_/g, '-').toLowerCase();
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////

	function throwError(widgetConfiguration, message) {
	   throw new Error(string.format('Error loading widget "[widget]" (id: "[id]"): [0]', [message], widgetConfiguration));
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////

	function createIdGeneratorForWidget(widgetId) {
	   var charCodeOfA = 'a'.charCodeAt(0);
	   function fixLetter(l) {
	      // We map invalid characters deterministically to valid lower case letters. Thereby a collision of
	      // two ids with different invalid characters at the same positions is less likely to occur.
	      return String.fromCharCode(charCodeOfA + l.charCodeAt(0) % 26);
	   }

	   var prefix = 'ax' + ID_SEPARATOR + widgetId.replace(INVALID_ID_MATCHER, fixLetter) + ID_SEPARATOR;
	   return function (localId) {
	      return prefix + ('' + localId).replace(INVALID_ID_MATCHER, fixLetter);
	   };
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////

	function createEventBusForWidget(eventBus, widgetSpecification, widgetConfiguration) {

	   var collaboratorId = 'widget.' + widgetSpecification.name + '#' + widgetConfiguration.id;

	   function forward(to) {
	      var _arguments = arguments;

	      return function () {
	         return eventBus[to].apply(eventBus, _arguments);
	      };
	   }

	   function augmentOptions(optionalOptions) {
	      return object.options(optionalOptions, { sender: collaboratorId });
	   }

	   var subscriptions = [];
	   function unsubscribe(subscriber) {
	      eventBus.unsubscribe(subscriber);
	   }

	   return {
	      addInspector: forward('addInspector'),
	      setErrorHandler: forward('setErrorHandler'),
	      setMediator: forward('setMediator'),
	      unsubscribe: unsubscribe,
	      subscribe: function subscribe(eventName, subscriber, optionalOptions) {
	         subscriptions.push(subscriber);

	         var options = object.options(optionalOptions, { subscriber: collaboratorId });

	         eventBus.subscribe(eventName, subscriber, options);
	      },
	      publish: function publish(eventName, optionalEvent, optionalOptions) {
	         return eventBus.publish(eventName, optionalEvent, augmentOptions(optionalOptions));
	      },
	      publishAndGatherReplies: function publishAndGatherReplies(eventName, optionalEvent, optionalOptions) {
	         return eventBus.publishAndGatherReplies(eventName, optionalEvent, augmentOptions(optionalOptions));
	      },
	      release: function release() {
	         subscriptions.forEach(unsubscribe);
	      }
	   };
	}

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	   value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; /**
	                                                                                                                                                                                                                                                   * Copyright 2016 aixigo AG
	                                                                                                                                                                                                                                                   * Released under the MIT license.
	                                                                                                                                                                                                                                                   * http://laxarjs.org/license
	                                                                                                                                                                                                                                                   */


	exports.featuresForWidget = featuresForWidget;

	var _validator = __webpack_require__(13);

	var jsonValidator = _interopRequireWildcard(_validator);

	var _object = __webpack_require__(4);

	var object = _interopRequireWildcard(_object);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	// JSON schema formats:
	var TOPIC_IDENTIFIER = '([a-z][+a-zA-Z0-9]*|[A-Z][+A-Z0-9]*)';
	var SUB_TOPIC_FORMAT = new RegExp('^' + TOPIC_IDENTIFIER + '$');
	var TOPIC_FORMAT = new RegExp('^(' + TOPIC_IDENTIFIER + '(-' + TOPIC_IDENTIFIER + ')*)$');
	var FLAG_TOPIC_FORMAT = new RegExp('^[!]?(' + TOPIC_IDENTIFIER + '(-' + TOPIC_IDENTIFIER + ')*)$');
	// simplified RFC-5646 language-tag matcher with underscore/dash relaxation:
	// the parts are: language *("-"|"_" script|region|constiant) *("-"|"_" extension|privateuse)
	var LANGUAGE_TAG_FORMAT = /^[a-z]{2,8}([-_][a-z0-9]{2,8})*([-_][a-z0-9][-_][a-z0-9]{2,8})*$/i;

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function featuresForWidget(widgetSpecification, widgetConfiguration, throwError) {
	   if (!widgetSpecification.features || Object.keys(widgetSpecification.features).length === 0) {
	      return {};
	   }

	   var featureConfiguration = widgetConfiguration.features || {};
	   var featuresSpec = widgetSpecification.features;
	   // if( !( '$schema' in featuresSpec ) ) {
	   //    // we assume an "old style" feature specification (i.e. first level type specification is omitted)
	   //    // if no schema version was defined.
	   //    featuresSpec = {
	   //       $schema: 'http://json-schema.org/draft-03/schema#',
	   //       type: 'object',
	   //       properties: widgetSpecification.features
	   //    };
	   // }
	   var validator = createFeaturesValidator(featuresSpec);

	   object.forEach(featuresSpec.properties, function (feature, name) {
	      // ensure that simple object/array features are at least defined
	      if (name in featureConfiguration) {
	         return;
	      }

	      if (feature.type === 'object') {
	         featureConfiguration[name] = {};
	      } else if (feature.type === 'array') {
	         featureConfiguration[name] = [];
	      }
	   });

	   var report = validator.validate(featureConfiguration);

	   if (report.errors.length > 0) {
	      var message = 'Validation of feature-configuration failed. Errors: ';

	      report.errors.forEach(function (error) {
	         message += '\n - ' + error.message.replace(/\[/g, '\\[');
	      });

	      throwError(message);
	   }

	   return featureConfiguration;
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function createFeaturesValidator(featuresSpec) {
	   var validator = jsonValidator.create(featuresSpec, {
	      prohibitAdditionalProperties: true,
	      useDefault: true
	   });

	   // allows 'mySubTopic0815', 'MY_SUB_TOPIC+OK' and constiations:
	   validator.addFormat('sub-topic', function (subTopic) {
	      return typeof subTopic !== 'string' || SUB_TOPIC_FORMAT.test(subTopic);
	   });

	   // allows 'myTopic', 'myTopic-mySubTopic-SUB_0815+OK' and constiations:
	   validator.addFormat('topic', function (topic) {
	      return typeof topic !== 'string' || TOPIC_FORMAT.test(topic);
	   });

	   // allows 'myTopic', '!myTopic-mySubTopic-SUB_0815+OK' and constiations:
	   validator.addFormat('flag-topic', function (flagTopic) {
	      return typeof flagTopic !== 'string' || FLAG_TOPIC_FORMAT.test(flagTopic);
	   });

	   // allows 'de_DE', 'en-x-laxarJS' and such:
	   validator.addFormat('language-tag', function (languageTag) {
	      return typeof languageTag !== 'string' || LANGUAGE_TAG_FORMAT.test(languageTag);
	   });

	   // checks that object keys have the 'topic' format
	   validator.addFormat('topic-map', function (topicMap) {
	      return (typeof topicMap === 'undefined' ? 'undefined' : _typeof(topicMap)) !== 'object' || Object.keys(topicMap).every(function (topic) {
	         return TOPIC_FORMAT.test(topic);
	      });
	   });

	   // checks that object keys have the 'language-tag' format
	   validator.addFormat('localization', function (localization) {
	      return (typeof localization === 'undefined' ? 'undefined' : _typeof(localization)) !== 'object' || Object.keys(localization).every(function (tag) {
	         return LANGUAGE_TAG_FORMAT.test(tag);
	      });
	   });

	   return validator;
	}

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	   value: true
	});
	exports.JSON_SCHEMA_V4_URI = undefined;
	exports.create = create;

	var _jjv = __webpack_require__(14);

	var _jjv2 = _interopRequireDefault(_jjv);

	var _jjve = __webpack_require__(16);

	var _jjve2 = _interopRequireDefault(_jjve);

	var _schema = __webpack_require__(17);

	var schema = _interopRequireWildcard(_schema);

	var _object = __webpack_require__(4);

	var objectUtils = _interopRequireWildcard(_object);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * Copyright 2016 aixigo AG
	 * Released under the MIT license.
	 * http://laxarjs.org/license
	 */


	var JSON_SCHEMA_V4_URI = 'http://json-schema.org/draft-04/schema#';

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function transformResult(result, schema, object, env) {
	   if (!result) {
	      return {
	         errors: []
	      };
	   }

	   var messageGenerator = (0, _jjve2.default)(env);

	   return {
	      errors: messageGenerator(schema, object, result).map(function (error) {
	         return objectUtils.options({
	            message: error.message + '. Path: "' + error.path + '".'
	         }, error);
	      })
	   };
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Creates and returns a new JSON validator for schema draft version 4. Minimal conversion from v3 to v4
	 * is builtin, but it is strongly advised to create new schemas using the version 4 draft. Version
	 * detection for v4 is realized by checking if the `$schema` property of the root schema equals the
	 * uri `http://json-schema.org/draft-04/schema#`. If the `$schema` property is missing or has a
	 * different value, v3 is assumed.
	 * See https://github.com/json-schema/json-schema/wiki/ChangeLog for differences between v3 and v4.
	 *
	 * @param {Object} jsonSchema
	 *    the JSON schema to use when validating
	 * @param {Object} [options]
	 *    an optional set of options
	 * @param {Boolean} options.prohibitAdditionalProperties
	 *    sets additionalProperties to false if not defined otherwise for the according object schema
	 * @param {Boolean} options.checkRequired
	 *    (jjv option) if `true` it reports missing required properties, otherwise it allows missing
	 *    required properties. Default is `true`
	 * @param {Boolean} options.useDefault
	 *    (jjv option) If true it modifies the validated object to have the default values for missing
	 *    non-required fields. Default is `false`
	 * @param {Boolean} options.useCoerce
	 *    (jjv option) if `true` it enables type coercion where defined. Default is `false`
	 * @param {Boolean} options.removeAdditional
	 *    (jjv option) if `true` it removes all attributes of an object which are not matched by the
	 *    schema's specification. Default is `false`
	 *
	 *
	 * @return {Object}
	 *    a new instance of JsonValidator
	 */
	function create(jsonSchema, options) {
	   var env = (0, _jjv2.default)();
	   options = objectUtils.options(options, {
	      prohibitAdditionalProperties: false
	   });
	   env.defaultOptions = objectUtils.options(options, env.defaultOptions);

	   if (!('$schema' in jsonSchema)) {
	      throw new Error('Missing schema version. Use the $schema property to define it.');
	   }

	   if (jsonSchema.$schema !== JSON_SCHEMA_V4_URI) {
	      throw new Error('Unsupported schema version "' + jsonSchema.$schema + '". Only V4 is supported: "' + JSON_SCHEMA_V4_URI + '".');
	   }

	   if (options.prohibitAdditionalProperties) {
	      schema.prohibitAdditionalProperties(jsonSchema);
	   }

	   var origValidate = env.validate;

	   env.validate = function (object) {
	      var result = origValidate.call(env, jsonSchema, object);
	      return transformResult(result, jsonSchema, object, env);
	   };

	   return env;
	}

	exports.JSON_SCHEMA_V4_URI = JSON_SCHEMA_V4_URI;

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(15);


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* jshint proto: true */

	/**
	 * jjv.js -- A javascript library to validate json input through a json-schema.
	 *
	 * Copyright (c) 2013 Alex Cornejo.
	 *
	 * Redistributable under a MIT-style open source license.
	 */

	(function () {
	  var clone = function (obj) {
	      // Handle the 3 simple types (string, number, function), and null or undefined
	      if (obj === null || typeof obj !== 'object') return obj;
	      var copy;

	      // Handle Date
	      if (obj instanceof Date) {
	          copy = new Date();
	          copy.setTime(obj.getTime());
	          return copy;
	      }

	      // handle RegExp
	      if (obj instanceof RegExp) {
	        copy = new RegExp(obj);
	        return copy;
	      }

	      // Handle Array
	      if (obj instanceof Array) {
	          copy = [];
	          for (var i = 0, len = obj.length; i < len; i++)
	              copy[i] = clone(obj[i]);
	          return copy;
	      }

	      // Handle Object
	      if (obj instanceof Object) {
	          copy = {};
	//           copy = Object.create(Object.getPrototypeOf(obj));
	          for (var attr in obj) {
	              if (obj.hasOwnProperty(attr))
	                copy[attr] = clone(obj[attr]);
	          }
	          return copy;
	      }

	      throw new Error("Unable to clone object!");
	  };

	  var clone_stack = function (stack) {
	    var new_stack = [ clone(stack[0]) ], key = new_stack[0].key, obj = new_stack[0].object;
	    for (var i = 1, len = stack.length; i< len; i++) {
	      obj = obj[key];
	      key = stack[i].key;
	      new_stack.push({ object: obj, key: key });
	    }
	    return new_stack;
	  };

	  var copy_stack = function (new_stack, old_stack) {
	    var stack_last = new_stack.length-1, key = new_stack[stack_last].key;
	    old_stack[stack_last].object[key] = new_stack[stack_last].object[key];
	  };

	  var handled = {
	    'type': true,
	    'not': true,
	    'anyOf': true,
	    'allOf': true,
	    'oneOf': true,
	    '$ref': true,
	    '$schema': true,
	    'id': true,
	    'exclusiveMaximum': true,
	    'exclusiveMininum': true,
	    'properties': true,
	    'patternProperties': true,
	    'additionalProperties': true,
	    'items': true,
	    'additionalItems': true,
	    'required': true,
	    'default': true,
	    'title': true,
	    'description': true,
	    'definitions': true,
	    'dependencies': true
	  };

	  var fieldType = {
	    'null': function (x) {
	      return x === null;
	    },
	    'string': function (x) {
	      return typeof x === 'string';
	    },
	    'boolean': function (x) {
	      return typeof x === 'boolean';
	    },
	    'number': function (x) {
	      // Use x === x instead of !isNaN(x) for speed
	      return typeof x === 'number' && x === x;
	    },
	    'integer': function (x) {
	      return typeof x === 'number' && x%1 === 0;
	    },
	    'object': function (x) {
	      return x && typeof x === 'object' && !Array.isArray(x);
	    },
	    'array': function (x) {
	      return Array.isArray(x);
	    },
	    'date': function (x) {
	      return x instanceof Date;
	    }
	  };

	  // missing: uri, date-time, ipv4, ipv6
	  var fieldFormat = {
	    'alpha': function (v) {
	      return (/^[a-zA-Z]+$/).test(v);
	    },
	    'alphanumeric': function (v) {
	      return (/^[a-zA-Z0-9]+$/).test(v);
	    },
	    'identifier': function (v) {
	      return (/^[-_a-zA-Z0-9]+$/).test(v);
	    },
	    'hexadecimal': function (v) {
	      return (/^[a-fA-F0-9]+$/).test(v);
	    },
	    'numeric': function (v) {
	      return (/^[0-9]+$/).test(v);
	    },
	    'date-time': function (v) {
	      return !isNaN(Date.parse(v)) && v.indexOf('/') === -1;
	    },
	    'uppercase': function (v) {
	      return v === v.toUpperCase();
	    },
	    'lowercase': function (v) {
	      return v === v.toLowerCase();
	    },
	    'hostname': function (v) {
	      return v.length < 256 && (/^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])(\.([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9]))*$/).test(v);
	    },
	    'uri': function (v) {
	      return (/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/).test(v);
	    },
	    'email': function (v) { // email, ipv4 and ipv6 adapted from node-validator
	      return (/^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/).test(v);
	    },
	    'ipv4': function (v) {
	      if ((/^(\d?\d?\d)\.(\d?\d?\d)\.(\d?\d?\d)\.(\d?\d?\d)$/).test(v)) {
	        var parts = v.split('.').sort();
	        if (parts[3] <= 255)
	          return true;
	      }
	      return false;
	    },
	    'ipv6': function(v) {
	      return (/^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/).test(v);
	     /*  return (/^::|^::1|^([a-fA-F0-9]{1,4}::?){1,7}([a-fA-F0-9]{1,4})$/).test(v); */
	    }
	  };

	  var fieldValidate = {
	    'readOnly': function (v, p) {
	      return false;
	    },
	    // ****** numeric validation ********
	    'minimum': function (v, p, schema) {
	      return !(v < p || schema.exclusiveMinimum && v <= p);
	    },
	    'maximum': function (v, p, schema) {
	      return !(v > p || schema.exclusiveMaximum && v >= p);
	    },
	    'multipleOf': function (v, p) {
	      return (v/p)%1 === 0 || typeof v !== 'number';
	    },
	    // ****** string validation ******
	    'pattern': function (v, p) {
	      if (typeof v !== 'string')
	        return true;
	      var pattern, modifiers;
	      if (typeof p === 'string')
	        pattern=p;
	      else {
	        pattern=p[0];
	        modifiers=p[1];
	      }
	      var regex = new RegExp(pattern, modifiers);
	      return regex.test(v);
	    },
	    'minLength': function (v, p) {
	      return v.length >= p || typeof v !== 'string';
	    },
	    'maxLength': function (v, p) {
	      return v.length <= p || typeof v !== 'string';
	    },
	    // ***** array validation *****
	    'minItems': function (v, p) {
	      return v.length >= p || !Array.isArray(v);
	    },
	    'maxItems': function (v, p) {
	      return v.length <= p || !Array.isArray(v);
	    },
	    'uniqueItems': function (v, p) {
	      var hash = {}, key;
	      for (var i = 0, len = v.length; i < len; i++) {
	        key = JSON.stringify(v[i]);
	        if (hash.hasOwnProperty(key))
	          return false;
	        else
	          hash[key] = true;
	      }
	      return true;
	    },
	    // ***** object validation ****
	    'minProperties': function (v, p) {
	      if (typeof v !== 'object')
	        return true;
	      var count = 0;
	      for (var attr in v) if (v.hasOwnProperty(attr)) count = count + 1;
	      return count >= p;
	    },
	    'maxProperties': function (v, p) {
	      if (typeof v !== 'object')
	        return true;
	      var count = 0;
	      for (var attr in v) if (v.hasOwnProperty(attr)) count = count + 1;
	      return count <= p;
	    },
	    // ****** all *****
	    'constant': function (v, p) {
	      return JSON.stringify(v) == JSON.stringify(p);
	    },
	    'enum': function (v, p) {
	      var i, len, vs;
	      if (typeof v === 'object') {
	        vs = JSON.stringify(v);
	        for (i = 0, len = p.length; i < len; i++)
	          if (vs === JSON.stringify(p[i]))
	            return true;
	      } else {
	        for (i = 0, len = p.length; i < len; i++)
	          if (v === p[i])
	            return true;
	      }
	      return false;
	    }
	  };

	  var normalizeID = function (id) {
	    return id.indexOf("://") === -1 ? id : id.split("#")[0];
	  };

	  var resolveURI = function (env, schema_stack, uri) {
	    var curschema, components, hash_idx, name;

	    hash_idx = uri.indexOf('#');

	    if (hash_idx === -1) {
	      if (!env.schema.hasOwnProperty(uri))
	        return null;
	      return [env.schema[uri]];
	    }

	    if (hash_idx > 0) {
	      name = uri.substr(0, hash_idx);
	      uri = uri.substr(hash_idx+1);
	      if (!env.schema.hasOwnProperty(name)) {
	        if (schema_stack && schema_stack[0].id === name)
	          schema_stack = [schema_stack[0]];
	        else
	          return null;
	      } else
	        schema_stack = [env.schema[name]];
	    } else {
	      if (!schema_stack)
	        return null;
	      uri = uri.substr(1);
	    }

	    if (uri === '')
	      return [schema_stack[0]];

	    if (uri.charAt(0) === '/') {
	      uri = uri.substr(1);
	      curschema = schema_stack[0];
	      components = uri.split('/');
	      while (components.length > 0) {
	        if (!curschema.hasOwnProperty(components[0]))
	          return null;
	        curschema = curschema[components[0]];
	        schema_stack.push(curschema);
	        components.shift();
	      }
	      return schema_stack;
	    } else // FIX: should look for subschemas whose id matches uri
	      return null;
	  };

	  var resolveObjectRef = function (object_stack, uri) {
	    var components, object, last_frame = object_stack.length-1, skip_frames, frame, m = /^(\d+)/.exec(uri);

	    if (m) {
	      uri = uri.substr(m[0].length);
	      skip_frames = parseInt(m[1], 10);
	      if (skip_frames < 0 || skip_frames > last_frame)
	        return;
	      frame = object_stack[last_frame-skip_frames];
	      if (uri === '#')
	        return frame.key;
	    } else
	      frame = object_stack[0];

	    object = frame.object[frame.key];

	    if (uri === '')
	      return object;

	    if (uri.charAt(0) === '/') {
	      uri = uri.substr(1);
	      components = uri.split('/');
	      while (components.length > 0) {
	        components[0] = components[0].replace(/~1/g, '/').replace(/~0/g, '~');
	        if (!object.hasOwnProperty(components[0]))
	          return;
	        object = object[components[0]];
	        components.shift();
	      }
	      return object;
	    } else
	      return;
	  };

	  var checkValidity = function (env, schema_stack, object_stack, options) {
	    var i, len, count, hasProp, hasPattern;
	    var p, v, malformed = false, objerrs = {}, objerr, props, matched;
	    var sl = schema_stack.length-1, schema = schema_stack[sl], new_stack;
	    var ol = object_stack.length-1, object = object_stack[ol].object, name = object_stack[ol].key, prop = object[name];
	    var errCount, minErrCount;

	    if (schema.hasOwnProperty('$ref')) {
	      schema_stack= resolveURI(env, schema_stack, schema.$ref);
	      if (!schema_stack)
	        return {'$ref': schema.$ref};
	      else
	        return checkValidity(env, schema_stack, object_stack, options);
	    }

	    if (schema.hasOwnProperty('type')) {
	      if (typeof schema.type === 'string') {
	        if (options.useCoerce && env.coerceType.hasOwnProperty(schema.type))
	          prop = object[name] = env.coerceType[schema.type](prop);
	        if (!env.fieldType[schema.type](prop))
	          return {'type': schema.type};
	      } else {
	        malformed = true;
	        for (i = 0, len = schema.type.length; i < len && malformed; i++)
	          if (env.fieldType[schema.type[i]](prop))
	            malformed = false;
	        if (malformed)
	          return {'type': schema.type};
	      }
	    }

	    if (schema.hasOwnProperty('allOf')) {
	      for (i = 0, len = schema.allOf.length; i < len; i++) {
	        objerr = checkValidity(env, schema_stack.concat(schema.allOf[i]), object_stack, options);
	        if (objerr)
	          return objerr;
	      }
	    }

	    if (!options.useCoerce && !options.useDefault && !options.removeAdditional) {
	      if (schema.hasOwnProperty('oneOf')) {
	        minErrCount = Infinity;
	        for (i = 0, len = schema.oneOf.length, count = 0; i < len; i++) {
	          objerr = checkValidity(env, schema_stack.concat(schema.oneOf[i]), object_stack, options);
	          if (!objerr) {
	            count = count + 1;
	            if (count > 1)
	              break;
	          } else {
	            errCount = objerr.schema ? Object.keys(objerr.schema).length : 1;
	            if (errCount < minErrCount) {
	                minErrCount = errCount;
	                objerrs = objerr;
	            }
	          }
	        }
	        if (count > 1)
	          return {'oneOf': true};
	        else if (count < 1)
	          return objerrs;
	        objerrs = {};
	      }

	      if (schema.hasOwnProperty('anyOf')) {
	        objerrs = null;
	        minErrCount = Infinity;
	        for (i = 0, len = schema.anyOf.length; i < len; i++) {
	          objerr = checkValidity(env, schema_stack.concat(schema.anyOf[i]), object_stack, options);
	          if (!objerr) {
	            objerrs = null;
	            break;
	          }
	          else {
	            errCount = objerr.schema ? Object.keys(objerr.schema).length : 1;
	            if (errCount < minErrCount) {
	                minErrCount = errCount;
	                objerrs = objerr;
	            }
	          }
	        }
	        if (objerrs)
	          return objerrs;
	      }

	      if (schema.hasOwnProperty('not')) {
	        objerr = checkValidity(env, schema_stack.concat(schema.not), object_stack, options);
	        if (!objerr)
	          return {'not': true};
	      }
	    } else {
	      if (schema.hasOwnProperty('oneOf')) {
	        minErrCount = Infinity;
	        for (i = 0, len = schema.oneOf.length, count = 0; i < len; i++) {
	          new_stack = clone_stack(object_stack);
	          objerr = checkValidity(env, schema_stack.concat(schema.oneOf[i]), new_stack, options);
	          if (!objerr) {
	            count = count + 1;
	            if (count > 1)
	              break;
	            else
	              copy_stack(new_stack, object_stack);
	          } else {
	            errCount = objerr.schema ? Object.keys(objerr.schema).length : 1;
	            if (errCount < minErrCount) {
	                minErrCount = errCount;
	                objerrs = objerr;
	            }
	          }
	        }
	        if (count > 1)
	          return {'oneOf': true};
	        else if (count < 1)
	          return objerrs;
	        objerrs = {};
	      }

	      if (schema.hasOwnProperty('anyOf')) {
	        objerrs = null;
	        minErrCount = Infinity;
	        for (i = 0, len = schema.anyOf.length; i < len; i++) {
	          new_stack = clone_stack(object_stack);
	          objerr = checkValidity(env, schema_stack.concat(schema.anyOf[i]), new_stack, options);
	          if (!objerr) {
	            copy_stack(new_stack, object_stack);
	            objerrs = null;
	            break;
	          }
	          else {
	            errCount = objerr.schema ? Object.keys(objerr.schema).length : 1;
	            if (errCount < minErrCount) {
	                minErrCount = errCount;
	                objerrs = objerr;
	            }
	          }
	        }
	        if (objerrs)
	          return objerrs;
	      }

	      if (schema.hasOwnProperty('not')) {
	        new_stack = clone_stack(object_stack);
	        objerr = checkValidity(env, schema_stack.concat(schema.not), new_stack, options);
	        if (!objerr)
	          return {'not': true};
	      }
	    }

	    if (schema.hasOwnProperty('dependencies')) {
	      for (p in schema.dependencies)
	        if (schema.dependencies.hasOwnProperty(p) && prop.hasOwnProperty(p)) {
	          if (Array.isArray(schema.dependencies[p])) {
	            for (i = 0, len = schema.dependencies[p].length; i < len; i++)
	              if (!prop.hasOwnProperty(schema.dependencies[p][i])) {
	                return {'dependencies': true};
	              }
	          } else {
	            objerr = checkValidity(env, schema_stack.concat(schema.dependencies[p]), object_stack, options);
	            if (objerr)
	              return objerr;
	          }
	        }
	    }

	    if (!Array.isArray(prop)) {
	      props = [];
	      objerrs = {};
	      for (p in prop)
	        if (prop.hasOwnProperty(p))
	          props.push(p);

	      if (options.checkRequired && schema.required) {
	        for (i = 0, len = schema.required.length; i < len; i++)
	          if (!prop.hasOwnProperty(schema.required[i])) {
	            objerrs[schema.required[i]] = {'required': true};
	            malformed = true;
	          }
	      }

	      hasProp = schema.hasOwnProperty('properties');
	      hasPattern = schema.hasOwnProperty('patternProperties');
	      if (hasProp || hasPattern) {
	        i = props.length;
	        while (i--) {
	          matched = false;
	          if (hasProp && schema.properties.hasOwnProperty(props[i])) {
	            matched = true;
	            objerr = checkValidity(env, schema_stack.concat(schema.properties[props[i]]), object_stack.concat({object: prop, key: props[i]}), options);
	            if (objerr !== null) {
	              objerrs[props[i]] = objerr;
	              malformed = true;
	            }
	          }
	          if (hasPattern) {
	            for (p in schema.patternProperties)
	              if (schema.patternProperties.hasOwnProperty(p) && props[i].match(p)) {
	                matched = true;
	                objerr = checkValidity(env, schema_stack.concat(schema.patternProperties[p]), object_stack.concat({object: prop, key: props[i]}), options);
	                if (objerr !== null) {
	                  objerrs[props[i]] = objerr;
	                  malformed = true;
	                }
	              }
	          }
	          if (matched)
	            props.splice(i, 1);
	        }
	      }

	      if (options.useDefault && hasProp && !malformed) {
	        for (p in schema.properties)
	          if (schema.properties.hasOwnProperty(p) && !prop.hasOwnProperty(p) && schema.properties[p].hasOwnProperty('default'))
	            prop[p] = schema.properties[p]['default'];
	      }

	      if (options.removeAdditional && hasProp && schema.additionalProperties !== true && typeof schema.additionalProperties !== 'object') {
	        for (i = 0, len = props.length; i < len; i++)
	          delete prop[props[i]];
	      } else {
	        if (schema.hasOwnProperty('additionalProperties')) {
	          if (typeof schema.additionalProperties === 'boolean') {
	            if (!schema.additionalProperties) {
	              for (i = 0, len = props.length; i < len; i++) {
	                objerrs[props[i]] = {'additional': true};
	                malformed = true;
	              }
	            }
	          } else {
	            for (i = 0, len = props.length; i < len; i++) {
	              objerr = checkValidity(env, schema_stack.concat(schema.additionalProperties), object_stack.concat({object: prop, key: props[i]}), options);
	              if (objerr !== null) {
	                objerrs[props[i]] = objerr;
	                malformed = true;
	              }
	            }
	          }
	        }
	      }
	      if (malformed)
	        return {'schema': objerrs};
	    } else {
	      if (schema.hasOwnProperty('items')) {
	        if (Array.isArray(schema.items)) {
	          for (i = 0, len = schema.items.length; i < len; i++) {
	            objerr = checkValidity(env, schema_stack.concat(schema.items[i]), object_stack.concat({object: prop, key: i}), options);
	            if (objerr !== null) {
	              objerrs[i] = objerr;
	              malformed = true;
	            }
	          }
	          if (prop.length > len && schema.hasOwnProperty('additionalItems')) {
	            if (typeof schema.additionalItems === 'boolean') {
	              if (!schema.additionalItems)
	                return {'additionalItems': true};
	            } else {
	              for (i = len, len = prop.length; i < len; i++) {
	                objerr = checkValidity(env, schema_stack.concat(schema.additionalItems), object_stack.concat({object: prop, key: i}), options);
	                if (objerr !== null) {
	                  objerrs[i] = objerr;
	                  malformed = true;
	                }
	              }
	            }
	          }
	        } else {
	          for (i = 0, len = prop.length; i < len; i++) {
	            objerr = checkValidity(env, schema_stack.concat(schema.items), object_stack.concat({object: prop, key: i}), options);
	            if (objerr !== null) {
	              objerrs[i] = objerr;
	              malformed = true;
	            }
	          }
	        }
	      } else if (schema.hasOwnProperty('additionalItems')) {
	        if (typeof schema.additionalItems !== 'boolean') {
	          for (i = 0, len = prop.length; i < len; i++) {
	            objerr = checkValidity(env, schema_stack.concat(schema.additionalItems), object_stack.concat({object: prop, key: i}), options);
	            if (objerr !== null) {
	              objerrs[i] = objerr;
	              malformed = true;
	            }
	          }
	        }
	      }
	      if (malformed)
	        return {'schema': objerrs};
	    }

	    for (v in schema) {
	      if (schema.hasOwnProperty(v) && !handled.hasOwnProperty(v)) {
	        if (v === 'format') {
	          if (env.fieldFormat.hasOwnProperty(schema[v]) && !env.fieldFormat[schema[v]](prop, schema, object_stack, options)) {
	            objerrs[v] = true;
	            malformed = true;
	          }
	        } else {
	          if (env.fieldValidate.hasOwnProperty(v) && !env.fieldValidate[v](prop, schema[v].hasOwnProperty('$data') ? resolveObjectRef(object_stack, schema[v].$data) : schema[v], schema, object_stack, options)) {
	            objerrs[v] = true;
	            malformed = true;
	          }
	        }
	      }
	    }

	    if (malformed)
	      return objerrs;
	    else
	      return null;
	  };

	  var defaultOptions = {
	    useDefault: false,
	    useCoerce: false,
	    checkRequired: true,
	    removeAdditional: false
	  };

	  function Environment() {
	    if (!(this instanceof Environment))
	      return new Environment();

	    this.coerceType = {};
	    this.fieldType = clone(fieldType);
	    this.fieldValidate = clone(fieldValidate);
	    this.fieldFormat = clone(fieldFormat);
	    this.defaultOptions = clone(defaultOptions);
	    this.schema = {};
	  }

	  Environment.prototype = {
	    validate: function (name, object, options) {
	      var schema_stack = [name], errors = null, object_stack = [{object: {'__root__': object}, key: '__root__'}];

	      if (typeof name === 'string') {
	        schema_stack = resolveURI(this, null, name);
	        if (!schema_stack)
	          throw new Error('jjv: could not find schema \'' + name + '\'.');
	      }

	      if (!options) {
	        options = this.defaultOptions;
	      } else {
	        for (var p in this.defaultOptions)
	          if (this.defaultOptions.hasOwnProperty(p) && !options.hasOwnProperty(p))
	            options[p] = this.defaultOptions[p];
	      }

	      errors = checkValidity(this, schema_stack, object_stack, options);

	      if (errors)
	        return {validation: errors.hasOwnProperty('schema') ? errors.schema : errors};
	      else
	        return null;
	    },

	    resolveRef: function (schema_stack, $ref) {
	      return resolveURI(this, schema_stack, $ref);
	    },

	    addType: function (name, func) {
	      this.fieldType[name] = func;
	    },

	    addTypeCoercion: function (type, func) {
	      this.coerceType[type] = func;
	    },

	    addCheck: function (name, func) {
	      this.fieldValidate[name] = func;
	    },

	    addFormat: function (name, func) {
	      this.fieldFormat[name] = func;
	    },

	    addSchema: function (name, schema) {
	      if (!schema && name) {
	        schema = name;
	        name = undefined;
	      }
	      if (schema.hasOwnProperty('id') && typeof schema.id === 'string' && schema.id !== name) {
	        if (schema.id.charAt(0) === '/')
	          throw new Error('jjv: schema id\'s starting with / are invalid.');
	        this.schema[normalizeID(schema.id)] = schema;
	      } else if (!name) {
	        throw new Error('jjv: schema needs either a name or id attribute.');
	      }
	      if (name)
	        this.schema[normalizeID(name)] = schema;
	    }
	  };

	  // Export for use in server and client.
	  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
	    module.exports = Environment;
	  else if (true)
	    !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {return Environment;}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  else
	    this.jjv = Environment;
	}).call(this);


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;(function() {
	  'use strict';

	  function make(o) {
	    var errors = [];

	    var keys = Object.keys(o.validation);

	    // when we're on a leaf node we need to handle the validation errors,
	    // otherwise we continue walking
	    var leaf = keys.every(function(key) {
	      return typeof o.validation[key] !== 'object' ||
	        isArray(o.validation[key]);
	    });

	    if (leaf) {
	      // step through each validation issue
	      // example: { required: true }
	      keys.forEach(function(key) {
	        var error, properties;
	        try {
	          switch (key) {
	            case 'type':
	              var type = typeof o.data;

	              // further discover types
	              if (type === 'number' && ('' + o.data).match(/^\d+$/)) {
	                type = 'integer';
	              } else if (type === 'object' && Array.isArray(o.data)) {
	                type = 'array';
	              }

	              // the value of type is the required type (ex: { type: 'string' })
	              error = {
	                code: 'INVALID_TYPE',
	                message: 'Invalid type: ' + type + ' should be ' +
	                         (isArray(o.validation[key]) ?  'one of ' :  '') +
	                          o.validation[key]
	              };

	              break;
	            case 'required':
	              properties = o.ns;

	              error = {
	                code: 'OBJECT_REQUIRED',
	                message: 'Missing required property: ' +
	                         properties[properties.length - 1]
	              };

	              break;
	            case 'minimum':
	              error = {
	                code: 'MINIMUM',
	                message: 'Value ' + o.data + ' is less than minimum ' +
	                         o.schema.minimum
	              };

	              break;
	            case 'maximum':
	              error = {
	                code: 'MAXIMUM',
	                message: 'Value ' + o.data + ' is greater than maximum ' +
	                         o.schema.maximum
	              };

	              break;
	            case 'multipleOf':
	              error = {
	                code: 'MULTIPLE_OF',
	                message: 'Value ' + o.data + ' is not a multiple of ' +
	                         o.schema.multipleOf
	              };

	              break;
	            case 'pattern':
	              error = {
	                code: 'PATTERN',
	                message: 'String does not match pattern: ' + o.schema.pattern
	              };

	              break;
	            case 'minLength':
	              error = {
	                code: 'MIN_LENGTH',
	                message: 'String is too short (' + o.data.length + ' chars), ' +
	                         'minimum ' + o.schema.minLength
	              };

	              break;
	            case 'maxLength':
	              error = {
	                code: 'MAX_LENGTH',
	                message: 'String is too long (' + o.data.length + ' chars), ' +
	                         'maximum ' + o.schema.maxLength
	              };

	              break;
	            case 'minItems':
	              error = {
	                code: 'ARRAY_LENGTH_SHORT',
	                message: 'Array is too short (' + o.data.length + '), ' +
	                         'minimum ' + o.schema.minItems
	              };

	              break;
	            case 'maxItems':
	              error = {
	                code: 'ARRAY_LENGTH_LONG',
	                message: 'Array is too long (' + o.data.length + '), maximum ' +
	                         o.schema.maxItems
	              };

	              break;
	            case 'uniqueItems':
	              error = {
	                code: 'ARRAY_UNIQUE',
	                message: 'Array items are not unique'
	              };

	              break;
	            case 'minProperties':
	              error = {
	                code: 'OBJECT_PROPERTIES_MINIMUM',
	                message: 'Too few properties defined (' +
	                         Object.keys(o.data).length + '), minimum ' +
	                         o.schema.minProperties
	              };

	              break;
	            case 'maxProperties':
	              error = {
	                code: 'OBJECT_PROPERTIES_MAXIMUM',
	                message: 'Too many properties defined (' +
	                         Object.keys(o.data).length + '), maximum ' +
	                         o.schema.maxProperties
	              };

	              break;
	            case 'enum':
	              error = {
	                code: 'ENUM_MISMATCH',
	                message: 'No enum match (' + o.data + '), expects: ' +
	                         o.schema['enum'].join(', ')
	              };

	              break;
	            case 'not':
	              error = {
	                code: 'NOT_PASSED',
	                message: 'Data matches schema from "not"'
	              };

	              break;
	            case 'additional':
	              properties = o.ns;

	              error = {
	                code: 'ADDITIONAL_PROPERTIES',
	                message: 'Additional properties not allowed: ' +
	                         properties[properties.length - 1]
	              };

	              break;
	            case 'format':
	              error = {
	                code: 'FORMAT',
	                message: 'Value does not satisfy format: ' +
	                         o.schema.format
	              };

	              break;
	          }
	        } catch (err) {
	          // ignore errors
	        }

	        // unhandled errors
	        if (!error) {
	          error = {
	            code: 'FAILED',
	            message: 'Validation error: ' + key
	          };

	          try {
	            if (typeof o.validation[key] !== 'boolean') {
	              error.message = ' (' + o.validation[key] + ')';
	            }
	          } catch (err) {
	            // ignore errors
	          }
	        }

	        error.code = 'VALIDATION_' + error.code;
	        if (o.data !== undefined) error.data = o.data;
	        error.path = o.ns;
	        errors.push(error);
	      });
	    } else {
	      // handle all non-leaf children
	      keys.forEach(function(key) {
	        var s;

	        if (o.schema.$ref) {
	          if (o.schema.$ref.match(/#\/definitions\//)) {
	            o.schema = o.definitions[o.schema.$ref.slice(14)];
	          } else {
	            o.schema = o.schema.$ref;
	          }

	          if (typeof o.schema === 'string') {
	            o.schema = o.env.resolveRef(null, o.schema);
	            if (o.schema) o.schema = o.schema[0];
	          }

	          if (!o.schema.type) o.schema.type = 'object';
	        }

	        if (o.schema && o.schema.type) {
	          if (allowsType(o.schema, 'object')) {
	            if (o.schema.properties && o.schema.properties[key]) {
	              s = o.schema.properties[key];
	            }

	            if (!s && o.schema.patternProperties) {
	              Object.keys(o.schema.patternProperties).some(function(pkey) {
	                if (key.match(new RegExp(pkey))) {
	                  s = o.schema.patternProperties[pkey];
	                  return true;
	                }
	              });
	            }

	            if (!s && o.schema.hasOwnProperty('additionalProperties')) {
	              if (typeof o.schema.additionalProperties === 'boolean') {
	                s = {};
	              } else {
	                s = o.schema.additionalProperties;
	              }
	            }
	          }

	          if (allowsType(o.schema, 'array')) {
	            s = o.schema.items;
	          }
	        }

	        var opts = {
	          env: o.env,
	          schema: s || {},
	          ns: o.ns.concat(key)
	        };

	        try {
	          opts.data = o.data[key];
	        } catch (err) {
	          // ignore errors
	        }

	        try {
	          opts.validation = o.validation[key].schema ?
	            o.validation[key].schema :
	            o.validation[key];
	        } catch (err) {
	          opts.validation = {};
	        }

	        try {
	          opts.definitions = s.definitions || o.definitions;
	        } catch (err) {
	          opts.definitions = o.definitions;
	        }

	        errors = errors.concat(make(opts));
	      });
	    }

	    return errors;
	  }

	  function allowsType(schema, type) {
	    if (typeof schema.type === 'string') {
	      return schema.type === type;
	    }
	    if (isArray(schema.type)) {
	      return schema.type.indexOf(type) !== -1;
	    }
	    return false;
	  }

	  function isArray(obj) {
	    if (typeof Array.isArray === 'function') {
	      return Array.isArray(obj);
	    }
	    return Object.prototype.toString.call(obj) === '[object Array]';
	  }

	  function formatPath(options) {
	    var root = options.hasOwnProperty('root') ?
	      options.root : '$';

	    var sep = options.hasOwnProperty('sep') ?
	      options.sep : '.';

	    return function(error) {
	      var path = root;

	      error.path.forEach(function(key) {
	        path += key.match(/^\d+$/) ?
	          '[' + key + ']' :
	          key.match(/^[A-Z_$][0-9A-Z_$]*$/i) ?
	            (sep + key) :
	            ('[' + JSON.stringify(key) + ']');
	      });

	      error.path = path;

	      return error;
	    };
	  }

	  function jjve(env) {
	    return function jjve(schema, data, result, options) {
	      if (!result || !result.validation) return [];

	      options = options || {};

	      if (typeof schema === 'string') { schema = env.schema[schema]; }

	      var errors = make({
	        env: env,
	        schema: schema,
	        data: data,
	        validation: result.validation,
	        ns: [],
	        definitions: schema.definitions || {}
	      });

	      if (errors.length && options.formatPath !== false) {
	        return errors.map(formatPath(options));
	      }

	      return errors;
	    };
	  }

	  // Export for use in server and client.
	  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
	    module.exports = jjve;
	  } else if (true) {
	    !(__WEBPACK_AMD_DEFINE_RESULT__ = function() { return jjve; }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else {
	    this.jjve = jjve;
	  }
	}).call(this);


/***/ },
/* 17 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	   value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	exports.prohibitAdditionalProperties = prohibitAdditionalProperties;
	/**
	 * Copyright 2016 aixigo AG
	 * Released under the MIT license.
	 * http://laxarjs.org/license
	 */
	function prohibitAdditionalProperties(schema) {
	   prohibitAdditionalPropertiesRecursively(schema);
	}

	function prohibitAdditionalPropertiesRecursively(schema) {
	   if (('properties' in schema || 'patternProperties' in schema) && !('additionalProperties' in schema)) {
	      schema.additionalProperties = false;
	   }

	   if ('properties' in schema) {
	      Object.keys(schema.properties).forEach(function (name) {
	         prohibitAdditionalPropertiesRecursively(schema.properties[name]);
	      });
	   }

	   if ('additionalProperties' in schema && _typeof(schema.additionalProperties) === 'object') {
	      prohibitAdditionalPropertiesRecursively(schema.additionalProperties);
	   }

	   if ('patternProperties' in schema) {
	      Object.keys(schema.patternProperties).forEach(function (pattern) {
	         prohibitAdditionalPropertiesRecursively(schema.patternProperties[pattern]);
	      });
	   }

	   if ('items' in schema) {
	      prohibitAdditionalPropertiesRecursively(schema.items);
	   }
	}

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	   value: true
	});

	var _object = __webpack_require__(4);

	var _log = __webpack_require__(1);

	var _log2 = _interopRequireDefault(_log);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * Copyright 2016 aixigo AG
	 * Released under the MIT license.
	 * http://laxarjs.org/license
	 */


	var enabled = false;

	var currentPageInfo = {
	   pageReference: null,
	   pageDefinitions: {},
	   compositionDefinitions: {},
	   widgetDescriptors: {}
	};

	var listeners = [];

	exports.default = {
	   /** Use to access the flattened page model, where compositions have been expanded. */
	   FLAT: 'FLAT',
	   /** Use to access the compact page/composition model, where compositions have not been expanded. */
	   COMPACT: 'COMPACT',

	   /** Start collecting page/composition data. */
	   enable: function enable() {
	      enabled = true;
	   },

	   /** Stop collecting page/composition data and clean up. */
	   disable: function disable() {
	      enabled = false;
	      currentPageInfo.pageReference = null;
	      currentPageInfo.widgetDescriptors = {};
	      cleanup();
	   },

	   /**
	    * Access the current page information.
	    * Everything is returned as a copy, sothis object cannot be used to modify the host application.
	    *
	    * @return {Object}
	    *   the current page information, with the following properties:
	    *    - `pageDefinitions` {Object}
	    *       both the original as well as the expanded/flattened page model for each available page
	    *    - `compositionDefinitions` {Object}
	    *       both the original as well as the expanded/flattened composition model for each composition of
	    *       any available page
	    *    - `widgetDescriptors` {Object}
	    *       the widget descriptor for each widget that was referenced
	    *    - `pageReference` {String}
	    *       the reference for the current page, to lookup page/composition definitions
	    */
	   current: function current() {
	      if (!enabled) {
	         _log2.default.warn('laxar page tooling: trying to access data, but collecting it was never enabled');
	      }
	      return (0, _object.deepClone)(currentPageInfo);
	   },

	   /**
	    * Add a listener function to be notified whenever the page information changes.
	    * As a side-effect, this also automatically enables collecting page/composition data.
	    *
	    * @param {Function}
	    *   The listener to add. Will be called with the current page information whenever that changes.
	    */
	   addListener: function addListener(listener) {
	      enabled = true;
	      listeners.push(listener);
	   },

	   /**
	    * Remove a page information listener function.
	    *
	    * @param {Function}
	    *   The listener to remove
	    */
	   removeListener: function removeListener(listener) {
	      listeners = listeners.filter(function (_) {
	         return _ !== listener;
	      });
	   },

	   ////////////////////////////////////////////////////////////////////////////////////////////////////////

	   /** @private */
	   setWidgetDescriptor: function setWidgetDescriptor(ref, descriptor) {
	      if (!enabled) {
	         return;
	      }
	      currentPageInfo.widgetDescriptors[ref] = descriptor;
	   },

	   /** @private */
	   setPageDefinition: function setPageDefinition(ref, page, type) {
	      if (!enabled) {
	         return;
	      }
	      var definitions = currentPageInfo.pageDefinitions;
	      definitions[ref] = definitions[ref] || {
	         FLAT: null,
	         COMPACT: null
	      };
	      definitions[ref][type] = (0, _object.deepClone)(page);
	   },

	   /** @private */
	   setCompositionDefinition: function setCompositionDefinition(pageRef, compositionInstanceId, composition, type) {
	      if (!enabled) {
	         return;
	      }
	      var definitions = currentPageInfo.compositionDefinitions;
	      var definitionsByInstance = definitions[pageRef] = definitions[pageRef] || {};
	      definitionsByInstance[compositionInstanceId] = definitionsByInstance[compositionInstanceId] || {
	         FLAT: null,
	         COMPACT: null
	      };
	      definitionsByInstance[compositionInstanceId][type] = (0, _object.deepClone)(composition);
	   },

	   /** @private */
	   setCurrentPage: function setCurrentPage(ref) {
	      if (!enabled) {
	         return;
	      }
	      currentPageInfo.pageReference = ref;
	      listeners.forEach(function (listener) {
	         listener((0, _object.deepClone)(currentPageInfo));
	      });
	      cleanup();
	   }
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function cleanup() {
	   var currentRef = currentPageInfo.pageReference;
	   ['pageDefinitions', 'compositionDefinitions'].forEach(function (collection) {
	      Object.keys(currentPageInfo[collection]).filter(function (ref) {
	         return ref !== currentRef;
	      }).forEach(function (ref) {
	         delete currentPageInfo[collection][ref];
	      });
	   });
	}

/***/ },
/* 19 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	   value: true
	});
	exports.debounce = debounce;
	/**
	 * Copyright 2016 aixigo AG
	 * Released under the MIT license.
	 * http://laxarjs.org/license
	 */
	/**
	 * Utilities for dealing with functions.
	 *
	 * When requiring `laxar`, it is available as `laxar.fn`.
	 *
	 * @module fn
	 */

	/**
	 * [Underscore `debounce`](http://underscorejs.org/#debounce) with the following modifications:
	 *  - automatically mocked when accessed through `laxar/laxar_testing`
	 *  - the generated function provides a `cancel()` method
	 *
	 * See [http://underscorejs.org/#debounce](http://underscorejs.org/#debounce) for detailed
	 * documentation on the original version.
	 *
	 * ### Note on testing:
	 *
	 * You can set `laxar.fn._nowMilliseconds` and `laxar.fn._setTimout` to mock-functions in order to
	 * help testing components that use `laxar.fn` or to test `laxar.fn` itself.
	 *
	 *
	 * @param {Function} f
	 *    the function to return a debounced version of
	 * @param {Number} waitMs
	 *    milliseconds to debounce before invoking `f`
	 * @param {Boolean} immediate
	 *    if `true` `f` is invoked prior to start waiting `waitMs` milliseconds. Otherwise `f` is invoked
	 *    after the given debounce duration has passed. Default is `false`
	 *
	 * @return {Function}
	 *    a debounced wrapper around the argument function f, with an additional method `cancel()`:
	 *    After `cancel()` has been called, f will not be invoked anymore, no matter how often the wrapper\
	 *    is called.
	 */
	function debounce(f, waitMs, immediate) {
	   var timeout = void 0;
	   // -1 is only to make eslint shutup. It doesn't recognize, that `debounced` will be called multiple times
	   // but timestamp should only be read by `later` from another call.
	   var timestamp = -1;
	   var result = void 0;
	   var canceled = false;

	   var debounced = function debounced() {
	      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	         args[_key] = arguments[_key];
	      }

	      var context = this;
	      timestamp = _tooling.nowMilliseconds();
	      var callNow = immediate && !timeout;

	      if (!timeout) {
	         timeout = _tooling.setTimeout(later, waitMs);
	      }
	      if (callNow && !canceled) {
	         result = f.apply(context, args);
	      }

	      return result;

	      /**
	       * Check if the debounced function is ready for execution, and do so if it is.
	       * @param {Boolean} _force
	       *    This is only relevant when mocking `fn._setTimeout` to implement a force/flush for tests.
	       *    If the parameter is passed as `true`, no timing checks are performed prior to execution.
	       */
	      function later(_force) {
	         var sinceLast = _tooling.nowMilliseconds() - timestamp;
	         if (_force || sinceLast >= waitMs) {
	            timeout = null;
	            if (!immediate && !canceled) {
	               result = f.apply(context, args);
	               if (!timeout) {
	                  context = args = null;
	               }
	            }
	            return;
	         }
	         timeout = _tooling.setTimeout(later, waitMs - sinceLast);
	      }
	   };

	   debounced.cancel = function () {
	      canceled = true;
	   };

	   return debounced;
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////

	var _tooling = exports._tooling = {

	   /**
	    * Get the current time in milliseconds.
	    * This API is intended to be used from tests only.
	    *
	    * @return {Number}
	    *   the current time in milliseconds (`Date.now()`).
	    *   Ovewrride this from tests for reproducible results.
	    */

	   nowMilliseconds: function nowMilliseconds() {
	      return Date.now();
	   },


	   /**
	    * By default, invoke window.setTimeout with the given arguments.
	    */
	   setTimeout: function setTimeout() {
	      return window.setTimeout.apply(window, arguments);
	   }
	};

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	   value: true
	});
	exports.create = create;

	var _assert = __webpack_require__(2);

	var _assert2 = _interopRequireDefault(_assert);

	var _configuration = __webpack_require__(3);

	var configuration = _interopRequireWildcard(_configuration);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * Copyright 2016 aixigo AG
	 * Released under the MIT license.
	 * http://laxarjs.org/license
	 */
	/**
	 * Provides a convenient api over the browser's `window.localStorage` and `window.sessionStorage` objects. If
	 * a browser doesn't support [web storage](http://www.w3.org/TR/webstorage/), a warning is logged to the
	 * `console` (if available) and a non-persistent in-memory store will be used instead. Note that this can for
	 * example also happen when using Mozilla Firefox with cookies disabled and as such isn't limited to older
	 * browsers.
	 *
	 * Additionally, in contrast to plain *web storage* access, non-string values will be automatically passed
	 * through JSON (de-) serialization on storage or retrieval. All keys will be prepended with a combination of
	 * an arbitrary and a configured namespace to prevent naming clashes with other web applications running on
	 * the same host and port. All {@link StorageApi} accessor methods should then be called without any namespace
	 * since adding and removing it, is done automatically.
	 *
	 * When requiring `laxar`, it is available as `laxar.storage`.
	 *
	 * @module storage
	 */


	var SESSION = 'sessionStorage';
	var LOCAL = 'localStorage';

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * @param {Object} backend
	 *    the K/V store, probably only accepting string values
	 * @param {String} namespace
	 *    prefix for all keys for namespacing purposes
	 *
	 * @return {StorageApi}
	 *    a storage wrapper to the given backend with `getItem`, `setItem` and `removeItem` methods
	 *
	 * @private
	 */
	function createStorage(backend, namespace) {

	   /**
	    * The api returned by one of the `get*Storage` functions of the *storage* module.
	    *
	    * @name StorageApi
	    * @constructor
	    */
	   return {
	      getItem: getItem,
	      setItem: setItem,
	      removeItem: removeItem
	   };

	   ////////////////////////////////////////////////////////////////////////////////////////////////////////

	   /**
	    * Retrieves a `value` by `key` from the store. JSON deserialization will automatically be applied.
	    *
	    * @param {String} key
	    *    the key of the item to retrieve (without namespace prefix)
	    *
	    * @return {*}
	    *    the value or `null` if it doesn't exist in the store
	    *
	    * @memberOf StorageApi
	    */
	   function getItem(key) {
	      var item = backend.getItem(namespace + '.' + key);
	      return item ? JSON.parse(item) : item;
	   }

	   ////////////////////////////////////////////////////////////////////////////////////////////////////////

	   /**
	    * Sets a `value` for a `key`. The value should be JSON serializable. An existing value will be
	    * overwritten.
	    *
	    * @param {String} key
	    *    the key of the item to set (without namespace prefix)
	    * @param {*} value
	    *    the new value to set
	    *
	    * @memberOf StorageApi
	    */
	   function setItem(key, value) {
	      var nsKey = namespace + '.' + key;
	      if (value === undefined) {
	         backend.removeItem(nsKey);
	      } else {
	         backend.setItem(nsKey, JSON.stringify(value));
	      }
	   }

	   ////////////////////////////////////////////////////////////////////////////////////////////////////////

	   /**
	    * Removes the value associated with `key` from the store.
	    *
	    * @param {String} key
	    *    the key of the item to remove (without namespace prefix)
	    *
	    * @memberOf StorageApi
	    */
	   function removeItem(key) {
	      backend.removeItem(namespace + '.' + key);
	   }
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function getOrFakeBackend(webStorageName) {
	   var store = window[webStorageName];
	   if (store.setItem && store.getItem && store.removeItem) {
	      try {
	         var testKey = 'ax.storage.testItem';
	         // In iOS Safari Private Browsing, this will fail:
	         store.setItem(testKey, 1);
	         store.removeItem(testKey);
	         return store;
	      } catch (e) {
	         // setItem failed: must use fake storage
	      }
	   }

	   if (window.console) {
	      var method = 'warn' in window.console ? 'warn' : 'log';
	      window.console[method]('window.' + webStorageName + ' not available: Using non-persistent polyfill. \n' + 'Try disabling private browsing or enabling cookies.');
	   }

	   var backend = {};
	   return {
	      getItem: function getItem(key) {
	         return backend[key] || null;
	      },
	      setItem: function setItem(key, val) {
	         backend[key] = val;
	      },
	      removeItem: function removeItem(key) {
	         if (key in backend) {
	            delete backend[key];
	         }
	      }
	   };
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function generateUniquePrefix() {
	   var prefix = configuration.get('storagePrefix');
	   if (prefix) {
	      return prefix;
	   }

	   var str = configuration.get('name', '');
	   var res = 0;
	   /* jshint bitwise:false */
	   for (var i = str.length - 1; i > 0; --i) {
	      res = (res << 5) - res + str.charCodeAt(i);
	      res |= 0;
	   }
	   return Math.abs(res);
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Creates a new storage module. In most cases this module will be called without arguments,
	 * but having the ability to provide them is useful e.g. for mocking purposes within tests.
	 * If the arguments are omitted, an attempt is made to access the native browser WebStorage api.
	 * If that fails, storage is only mocked by an in memory map (thus actually unavailable).
	 *
	 * Developers are free to use polyfills to support cases where local- or session-storage may not be
	 * available. Just make sure to initialize the polyfills before this module.
	 *
	 * @param {Object} [localStorageBackend]
	 *    the backend for local storage, Default is `window.localStorage`
	 * @param {Object} [sessionStorageBackend]
	 *    the backend for session storage, Default is `window.sessionStorage`
	 *
	 * @return {Object}
	 *    a new storage module
	 */
	function create(localStorageBackend, sessionStorageBackend) {

	   var localBackend = localStorageBackend || getOrFakeBackend(LOCAL);
	   var sessionBackend = sessionStorageBackend || getOrFakeBackend(SESSION);
	   var prefix = 'ax.' + generateUniquePrefix() + '.';

	   return {

	      /**
	       * Returns a local storage object for a specific local namespace.
	       *
	       * @param {String} namespace
	       *    the namespace to prepend to keys
	       *
	       * @return {StorageApi}
	       *    the local storage object
	       */
	      getLocalStorage: function getLocalStorage(namespace) {
	         (0, _assert2.default)(namespace).hasType(String).isNotNull();

	         return createStorage(localBackend, prefix + namespace);
	      },

	      /////////////////////////////////////////////////////////////////////////////////////////////////////

	      /**
	       * Returns a session storage object for a specific local namespace.
	       *
	       * @param {String} namespace
	       *    the namespace to prepend to keys
	       *
	       * @return {StorageApi}
	       *    the session storage object
	       */
	      getSessionStorage: function getSessionStorage(namespace) {
	         (0, _assert2.default)(namespace).hasType(String).isNotNull();

	         return createStorage(sessionBackend, prefix + namespace);
	      },

	      /////////////////////////////////////////////////////////////////////////////////////////////////////

	      /**
	       * Returns the local storage object for application scoped keys. This is equivalent to
	       * `storage.getLocalStorage( 'app' )`.
	       *
	       * @return {StorageApi}
	       *    the application local storage object
	       */
	      getApplicationLocalStorage: function getApplicationLocalStorage() {
	         return createStorage(localBackend, prefix + 'app');
	      },

	      /////////////////////////////////////////////////////////////////////////////////////////////////////

	      /**
	       * Returns the session storage object for application scoped keys. This is equivalent to
	       * `storage.getSessionStorage( 'app' )`.
	       *
	       * @return {StorageApi}
	       *    the application session storage object
	       */
	      getApplicationSessionStorage: function getApplicationSessionStorage() {
	         return createStorage(sessionBackend, prefix + 'app');
	      }

	   };
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	var instance = create();
	exports.default = instance;

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	   value: true
	});
	exports.create = create;

	var _browser = __webpack_require__(22);

	var _controls_service = __webpack_require__(23);

	var _event_bus = __webpack_require__(6);

	var _flow_service = __webpack_require__(24);

	var _file_resource_provider = __webpack_require__(7);

	var _heartbeat = __webpack_require__(28);

	var _page_service = __webpack_require__(29);

	var _theme_manager = __webpack_require__(32);

	var _locale_event_manager = __webpack_require__(33);

	var _visibility_event_manager = __webpack_require__(34);

	var _css_loader = __webpack_require__(35);

	var _layout_loader = __webpack_require__(36);

	var _page_loader = __webpack_require__(37);

	var _widget_loader = __webpack_require__(11);

	var _object = __webpack_require__(4);

	var _log = __webpack_require__(1);

	var _log2 = _interopRequireDefault(_log);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * Copyright 2016 aixigo AG
	 * Released under the MIT license.
	 * http://laxarjs.org/license
	 */
	function create(configuration, widgetAdapters) {

	   var services = {};

	   var browser = (0, _browser.create)();
	   var paths = createPaths(configuration);
	   var fileResourceProvider = (0, _file_resource_provider.create)(browser, paths.PRODUCT);
	   configureFileResourceProvider(fileResourceProvider, configuration);

	   var heartbeat = (0, _heartbeat.create)();
	   var eventBus = (0, _event_bus.create)(heartbeat.onNext, function (f, t) {
	      // MSIE Bug, we have to wrap set timeout to pass assertion
	      setTimeout(f, t);
	   }, { pendingDidTimeout: configuration.get('eventBusTimeoutMs', 120 * 1000) });
	   eventBus.setErrorHandler(eventBusErrorHandler);

	   var themeManager = (0, _theme_manager.create)(fileResourceProvider, configuration.get('theme'));
	   var cssLoader = (0, _css_loader.create)(configuration, themeManager, paths.PRODUCT);
	   var layoutLoader = (0, _layout_loader.create)(paths.LAYOUTS, paths.THEMES, cssLoader, themeManager, fileResourceProvider);
	   var pageLoader = (0, _page_loader.create)(paths.PAGES, fileResourceProvider);
	   var controls = (0, _controls_service.create)(fileResourceProvider, paths.CONTROLS);
	   var widgetLoader = (0, _widget_loader.create)(fileResourceProvider, eventBus, controls, cssLoader, themeManager, paths.THEMES, paths.WIDGETS);
	   widgetLoader.registerWidgetAdapters(widgetAdapters);

	   var localeManager = (0, _locale_event_manager.create)(eventBus, configuration);
	   var visibilityManager = (0, _visibility_event_manager.create)(eventBus);
	   var pageService = (0, _page_service.create)(eventBus, heartbeat, pageLoader, layoutLoader, widgetLoader, themeManager, localeManager, visibilityManager);

	   var flowService = (0, _flow_service.create)(fileResourceProvider, eventBus, configuration, browser, pageService);

	   services.configuration = configuration;
	   services.controls = controls;
	   services.cssLoader = cssLoader;
	   services.fileResourceProvider = fileResourceProvider;
	   services.flowService = flowService;
	   services.globalEventBus = eventBus;
	   services.heartbeat = heartbeat;
	   services.layoutLoader = layoutLoader;
	   services.pageService = pageService;
	   services.paths = paths;
	   services.themeManager = themeManager;

	   return services;

	   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

	   function eventBusErrorHandler(message, optionalErrorInformation) {
	      var sensitiveData = ['Published event'];

	      _log2.default.error('EventBus: ' + message);

	      if (optionalErrorInformation) {
	         (0, _object.forEach)(optionalErrorInformation, function (info, title) {
	            var formatString = '   - [0]: [1:%o]';
	            if (sensitiveData.indexOf(title) !== -1) {
	               formatString = '   - [0]: [1:%o:anonymize]';
	            }

	            _log2.default.error(formatString, title, info);

	            if (info instanceof Error && info.stack) {
	               _log2.default.error('   - Stacktrace: ' + info.stack);
	            }
	         });
	      }
	   }

	   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

	   function configureFileResourceProvider(fileResourceProvider, configuration) {
	      (0, _object.forEach)(configuration.get('fileListings', {}), function (value, key) {
	         if (typeof value === 'string') {
	            fileResourceProvider.setFileListingUri(key, value);
	         } else {
	            fileResourceProvider.setFileListingContents(key, value);
	         }
	      });
	   }

	   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

	   function createPaths(configuration) {
	      return {
	         PRODUCT: configuration.get('paths.product', ''),
	         THEMES: configuration.get('paths.themes', 'includes/themes'),
	         LAYOUTS: configuration.get('paths.layouts', 'application/layouts'),
	         CONTROLS: configuration.get('paths.controls', 'includes/controls'),
	         WIDGETS: configuration.get('paths.widgets', 'includes/widgets'),
	         PAGES: configuration.get('paths.pages', 'application/pages'),
	         FLOW_JSON: configuration.get('paths.flowJson', 'application/flow/flow.json'),
	         DEFAULT_THEME: configuration.get('paths.defaultTheme', 'includes/themes/default.theme')
	      };
	   }
	}

/***/ },
/* 22 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.create = create;
	/**
	 * Copyright 2016 aixigo AG
	 * Released under the MIT license.
	 * http://laxarjs.org/license
	 */

	/**
	 * Abstraction for browser api used internally by LaxarJS. We use this instead of the DOM and window directly
	 * to be able to easily mock during tests.
	 */
	function create() {

	  return {
	    location: function location() {
	      return window.location;
	    },
	    fetch: function fetch(input, init) {
	      return window.fetch(input, init);
	    }
	  };
	}

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	   value: true
	});
	exports.create = create;

	var _path = __webpack_require__(8);

	var path = _interopRequireWildcard(_path);

	var _string = __webpack_require__(10);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	/**
	 * Copyright 2016 aixigo AG
	 * Released under the MIT license.
	 * http://laxarjs.org/license
	 */
	/**
	 * The controls service helps to lookup control assets and implementations.
	 * It should be used via dependency injection as the *axControls* service.
	 *
	 * @module controls_service
	 */
	function create(fileResourceProvider, controlsPath) {

	   var notDeclaredMessage = 'Tried to load control reference [0] without declaration in widget.json.\nDetails: [1]';
	   var missingDescriptorMessage = 'Cannot use axControls service to load control [0] without descriptor.\nDetails: [1]';
	   var errorInfoLink = 'https://github.com/LaxarJS/laxar/blob/master/docs/manuals/providing_controls.md#compatibility';

	   var descriptors = {};
	   var descriptorPromises = {};

	   return {
	      load: load,
	      provide: provide,
	      resolve: resolve,
	      descriptor: descriptor
	   };

	   ////////////////////////////////////////////////////////////////////////////////////////////////////////

	   /**
	    * Provides the implementation module of the given control, for manual instantiation by a widget.
	    *
	    * Because the method must return synchronously, it may only be called for controls that have been
	    * loaded before (using `load`)!
	    *
	    * @param {String} controlRef
	    *   a valid control reference as used in the `widget.json`
	    * @return {*}
	    *   the AMD module for the requested control reference
	    */
	   function provide(controlRef) {
	      var resolvedControlPath = resolve(controlRef);
	      var descriptor = descriptors[resolvedControlPath];
	      if (!descriptor) {
	         fail(notDeclaredMessage);
	      }
	      if (descriptor._compatibility_0x) {
	         fail(missingDescriptorMessage);
	      }

	      var amdControlRef = path.extractScheme(controlRef).ref;
	      // TODO: check users of this api, since they receive a promise now
	      return System.import(path.join(amdControlRef, descriptor.name));

	      function fail(reason) {
	         var message = (0, _string.format)('axControls: ' + reason, [controlRef, errorInfoLink]);
	         throw new Error(message);
	      }
	   }

	   ////////////////////////////////////////////////////////////////////////////////////////////////////////

	   /**
	    * Fetches the descriptor for a given control reference, and saves it as a side-effect.
	    * This is part of the internal API used by the widget loader.
	    *
	    * This process must be completed before the descriptor or the module for a control can be provided.
	    * For this reason, `load` is called by the widget-loader, using information from the `widet.json`.
	    *
	    * For backward-compatibility, missing descriptors are synthesized.
	    *
	    * @return {Promise}
	    *   A promise for the (fetched or synthesized) control descriptor.
	    *
	    * @private
	    */
	   function load(controlRef) {
	      // By appending a path now and .json afterwards, 'help' RequireJS to generate the
	      // correct descriptor path when loading from a 'package'.
	      var resolvedPath = resolve(controlRef);
	      if (!descriptorPromises[resolvedPath]) {
	         var descriptorUrl = path.join(resolvedPath, 'control.json');
	         descriptorPromises[resolvedPath] = fileResourceProvider.provide(descriptorUrl).catch(function () {
	            // LaxarJS 0.x style (no control.json): generate descriptor
	            return {
	               _compatibility_0x: true,
	               name: controlRef.split('/').pop(),
	               integration: { technology: 'angular' }
	            };
	         }).then(function (descriptor) {
	            descriptors[resolvedPath] = descriptor;
	            return descriptor;
	         });
	      }
	      return descriptorPromises[resolvedPath];
	   }

	   ////////////////////////////////////////////////////////////////////////////////////////////////////////

	   /**
	    * Takes a control reference and resolves it to a URL.
	    * This is part of the internal API used by the widget loader.
	    *
	    * @param {String} controlRef
	    *   a valid control reference as used in the `widget.json`
	    * @return {String}
	    *   the url under which the `control.json` should be found
	    *
	    * @private
	    */
	   function resolve(controlRef) {
	      return path.resolveAssetPath(controlRef, controlsPath);
	   }

	   ////////////////////////////////////////////////////////////////////////////////////////////////////////

	   /**
	    * Gets the (previously loaded) descriptor for a widget reference.
	    * This is part of the internal API used by the widget loader.
	    *
	    * @param controlRef
	    *   a valid control referenceas used in the `widget.json`
	    * @return {Object}
	    *   The control descriptor.
	    *
	    * @private
	    */
	   function descriptor(controlRef) {
	      var resolvedControlPath = resolve(controlRef);
	      return descriptors[resolvedControlPath];
	   }
	}

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	   value: true
	});
	exports.TARGET_SELF = undefined;

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; /**
	                                                                                                                                                                                                                                                   * Copyright 2016 aixigo AG
	                                                                                                                                                                                                                                                   * Released under the MIT license.
	                                                                                                                                                                                                                                                   * http://laxarjs.org/license
	                                                                                                                                                                                                                                                   */


	exports.create = create;

	var _page = __webpack_require__(25);

	var _page2 = _interopRequireDefault(_page);

	var _validator = __webpack_require__(13);

	var _object = __webpack_require__(4);

	var object = _interopRequireWildcard(_object);

	var _path = __webpack_require__(8);

	var path = _interopRequireWildcard(_path);

	var _timer = __webpack_require__(26);

	var timer = _interopRequireWildcard(_timer);

	var _log = __webpack_require__(1);

	var _log2 = _interopRequireDefault(_log);

	var _flow = __webpack_require__(27);

	var _flow2 = _interopRequireDefault(_flow);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var SESSION_KEY_TIMER = 'navigationTimer';

	var TARGET_SELF = exports.TARGET_SELF = '_self';

	function create(fileResourceProvider, eventBus, configuration, browser, pageService) {
	   var router = arguments.length <= 5 || arguments[5] === undefined ? _page2.default : arguments[5];


	   var flowController = createFlowController();

	   var api = {
	      controller: function controller() {
	         return flowController;
	      },
	      constructPath: constructPath,
	      constructAnchor: constructAnchor,
	      constructAbsoluteUrl: constructAbsoluteUrl
	   };

	   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

	   /**
	    * Constructs a path, that is compatible to the expected arguments of `path()` from `path.js`. If a target
	    * is given as first argument, this is resolved using the currently active place.
	    *
	    * @param {String} targetOrPlace
	    *    the target or place id to construct the url for
	    * @param {Object} [optionalParameters]
	    *    optional map of place parameters. Missing parameters are taken from the parameters that were
	    *    passed to the currently active place
	    *
	    * @return {string}
	    *    the generated path
	    *
	    * @memberOf axFlowService
	    */
	   function constructPath(targetOrPlace, optionalParameters) {
	      var newParameters = object.options(optionalParameters, flowController.parameters());
	      var placeName = flowController.placeNameForNavigationTarget(targetOrPlace, flowController.place());
	      var place = flowController.places()[placeName];

	      return place.expectedParameters.reduce(function (location, parameterName) {
	         return location + '/' + encodePlaceParameter(newParameters[parameterName]);
	      }, '/' + placeName);
	   }

	   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

	   /**
	    * Constructs a path and prepends a `#` to make it directly usable as relative link within an
	    * application. If a target is given as first argument, this is resolved using the currently active
	    * place.
	    *
	    * @param {String} targetOrPlace
	    *    the target or place id to construct the url for
	    * @param {Object} [optionalParameters]
	    *    optional map of place parameters. Missing parameters are taken from the parameters that were
	    *    passed to the currently active place
	    *
	    * @return {string}
	    *    the generated anchor
	    *
	    * @memberOf axFlowService
	    */
	   function constructAnchor(targetOrPlace, optionalParameters) {
	      return '#!' + constructPath(targetOrPlace, optionalParameters);
	   }

	   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

	   /**
	    * Constructs an absolute url to the given target or place using the given parameters application. If
	    * a target is given as first argument, this is resolved using the currently active place.
	    *
	    * @param {String} targetOrPlace
	    *    the target or place id to construct the url for
	    * @param {Object} [optionalParameters]
	    *    optional map of place parameters. Missing parameters are taken from the parameters that were
	    *    passed to the currently active place
	    *
	    * @return {string}
	    *    the generated url
	    *
	    * @memberOf axFlowService
	    */
	   function constructAbsoluteUrl(targetOrPlace, optionalParameters) {
	      var fullUrl = browser.location().href;
	      var removeIndex = Math.min(fullUrl.indexOf('#'), fullUrl.indexOf('?'));
	      return (removeIndex === -1 ? fullUrl : fullUrl.substr(0, removeIndex)) + constructAnchor(targetOrPlace, optionalParameters);
	   };

	   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

	   function createFlowController() {

	      var COLLABORATOR_ID = 'AxFlowController';
	      var availablePlaces = {};
	      var activeParameters = {};
	      var activePlace = void 0;
	      var navigationInProgress = false;
	      var requestedTarget = TARGET_SELF;

	      var controllerApi = {
	         places: function places() {
	            return availablePlaces;
	         },
	         place: function place() {
	            return object.deepClone(activePlace);
	         },
	         parameters: function parameters() {
	            return object.deepClone(activeParameters || {});
	         },
	         placeNameForNavigationTarget: placeNameForNavigationTarget,
	         loadFlow: function loadFlow(flowJson) {
	            var flowFile = path.normalize(flowJson);
	            return _loadFlow(flowFile, handleRouteChange).then(function (places) {
	               availablePlaces = object.deepFreeze(places);
	               // TODO make this configurable for server side rendering and non-hashbang urls
	               router.base(browser.location().pathname);
	               router.start({ hashbang: true, dispatch: true });
	               return availablePlaces;
	            });
	         }
	      };

	      ////////////////////////////////////////////////////////////////////////////////////////////////////////

	      eventBus.subscribe('navigateRequest', function (_ref) {
	         var target = _ref.target;
	         var parameters = _ref.data;

	         if (navigationInProgress) {
	            return;
	         }

	         requestedTarget = target;
	         router(constructPath(target, parameters));
	      }, { subscriber: COLLABORATOR_ID });

	      ////////////////////////////////////////////////////////////////////////////////////////////////////////

	      function handleRouteChange(place, context) {
	         var parameters = decodeParametersFromContext(context);
	         if (activePlace && place.id === activePlace.id && equals(parameters, activeParameters)) {
	            navigationInProgress = false;
	            _log2.default.trace('Canceling navigation to "' + place.id + '". Already there with same parameters.');
	            return;
	         }
	         if (navigationInProgress) {
	            _log2.default.trace('Canceling navigation to "' + place.id + '". Navigation already in progress.');
	            return;
	         }
	         navigationInProgress = true;

	         var navigationTimer = timer.started({
	            label: 'navigation (' + (activePlace ? activePlace.targets._self : '') + ' -> ' + place.targets._self + ')',
	            persistenceKey: SESSION_KEY_TIMER
	         });
	         var navigateEvent = {
	            target: requestedTarget,
	            place: place.id,
	            data: parameters
	         };
	         var options = { sender: COLLABORATOR_ID };
	         return eventBus.publish('willNavigate.' + requestedTarget, navigateEvent, options).then(function () {
	            if (activePlace && place.id === activePlace.id) {
	               activeParameters = parameters;
	               return;
	            }

	            return pageService.controller().tearDownPage().then(function () {
	               _log2.default.setTag('PLCE', place.id);
	               activeParameters = parameters;
	               activePlace = place;
	            }).then(function () {
	               return pageService.controller().setupPage(place.page);
	            });
	         }).then(function () {
	            return eventBus.publish('didNavigate.' + requestedTarget, navigateEvent, options);
	         }).then(function () {
	            requestedTarget = TARGET_SELF;
	            navigationInProgress = false;
	            navigationTimer.stopAndLog('didNavigate');
	         }, function (err) {
	            navigationInProgress = false;
	            navigationTimer.stopAndLog('didNavigate');
	            _log2.default.error('Failed to navigate to place "' + place.id + '". Error: [0]', err);
	         });
	      }

	      ////////////////////////////////////////////////////////////////////////////////////////////////////////

	      function placeNameForNavigationTarget(targetOrPlaceName, place) {
	         var placeName = object.path(place, 'targets.' + targetOrPlaceName, targetOrPlaceName);
	         if (placeName in availablePlaces) {
	            return placeName;
	         }

	         _log2.default.error('Unknown target or place "' + targetOrPlaceName + '". Current place: "' + place.id + '"');
	      }

	      ////////////////////////////////////////////////////////////////////////////////////////////////////////

	      return controllerApi;
	   }

	   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

	   function _loadFlow(flowFile, routeRequestHandler) {

	      return fileResourceProvider.provide(flowFile).then(function (flow) {
	         validateFlowJson(flow);
	         return flow.places;
	      }).then(function (places) {
	         return processPlaceParameters(places);
	      }).then(function (places) {
	         object.forEach(places, function (place, routeName) {
	            if (place.redirectTo) {
	               router.redirect('/' + routeName, '/' + place.redirectTo);
	               return;
	            }

	            if (place.entryPoints) {
	               router.redirect('/' + routeName, routeByEntryPoint(place.entryPoints));
	               return;
	            }

	            if (place.exitPoint) {
	               router('/' + routeName, function (context) {
	                  var exitFunction = configuration.get('flow.exitPoints.' + place.exitPoint);
	                  if (!exitFunction) {
	                     _log2.default.error('Exit point "' + place.exitPoint + '" does not exist for place "' + place.id + '".');
	                     return;
	                  }

	                  exitFunction(decodeParametersFromContext(context));
	               });
	               return;
	            }

	            if (!place.page) {
	               _log2.default.warn('flow: invalid empty place: [0]', place.id);
	               return;
	            }

	            router('/' + routeName, function (context) {
	               return routeRequestHandler(place, context);
	            });
	         });

	         if ('entry' in places) {
	            // pageRouter.redirect( '/', '/entry' );
	            router('*', function (context) {
	               _log2.default.trace('Received request for unknown route "' + context.path + '". Redirecting to entry');
	               router('/entry');
	            });
	         } else {
	            // TODO: make a redirect to some error page
	            router('*', function (context) {
	               _log2.default.warn('Found no entry route to redirect to from unknown route "' + context.path + '"');
	            });
	         }

	         return places;

	         /////////////////////////////////////////////////////////////////////////////////////////////////////

	         function routeByEntryPoint(possibleEntryPoints) {
	            var entryPoint = configuration.get('flow.entryPoint', { target: 'default', parameters: {} });
	            var placeName = possibleEntryPoints[entryPoint.target];
	            if (placeName) {
	               var _ret = function () {
	                  var targetPlace = places[placeName];
	                  var parameters = entryPoint.parameters || {};

	                  return {
	                     v: targetPlace.expectedParameters.reduce(function (uri, parameterName) {
	                        return uri + '/' + encodePlaceParameter(parameters[parameterName]);
	                     }, '/' + placeName)
	                  };
	               }();

	               if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
	            }
	         }
	      });
	   }

	   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

	   return api;
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////

	function decodeParametersFromContext(_ref2) {
	   var params = _ref2.params;

	   var parameters = {};
	   Object.keys(params || {}).forEach(function (key) {
	      parameters[key] = decodePlaceParameter(params[key]);
	   });
	   return parameters;
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////

	function encodePlaceParameter(value) {
	   return value == null ? '_' : value;
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////

	function decodePlaceParameter(value) {
	   return value === '_' ? null : value;
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////

	var ROUTE_PARAMS_MATCHER = /\/:([^\/]+)/ig;

	function processPlaceParameters(places) {
	   var processedRoutes = {};

	   object.forEach(places, function (place, placeName) {
	      place.expectedParameters = [];
	      place.id = placeName;

	      if (!place.targets) {
	         place.targets = {};
	      }
	      if (!place.targets[TARGET_SELF]) {
	         place.targets[TARGET_SELF] = placeName.split(/\/:/)[0];
	      }

	      var matches = void 0;
	      while (matches = ROUTE_PARAMS_MATCHER.exec(placeName)) {
	         var routeNameWithoutParams = placeName.substr(0, matches.index);

	         place.expectedParameters.push(matches[1]);

	         processedRoutes[routeNameWithoutParams] = place;
	      }
	      processedRoutes[placeName] = place;
	   });

	   return processedRoutes;
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////

	function validateFlowJson(flowJson) {
	   var result = (0, _validator.create)(_flow2.default).validate(flowJson);

	   if (result.errors.length) {
	      _log2.default.error('Failed validating flow file:\n[0]', result.errors.map(function (_) {
	         return ' - ' + _.message;
	      }).join('\n'));
	      throw new Error('Illegal flow.json format');
	   }
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////

	function equals(a, b) {
	   var aKeys = Object.keys(a);
	   var bKeys = Object.keys(b);
	   if (aKeys.length !== bKeys.length) {
	      return false;
	   }
	   var _iteratorNormalCompletion = true;
	   var _didIteratorError = false;
	   var _iteratorError = undefined;

	   try {
	      for (var _iterator = aKeys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	         var key = _step.value;

	         if (!(key in b) || a[key] !== b[key]) {
	            return false;
	         }
	      }
	   } catch (err) {
	      _didIteratorError = true;
	      _iteratorError = err;
	   } finally {
	      try {
	         if (!_iteratorNormalCompletion && _iterator.return) {
	            _iterator.return();
	         }
	      } finally {
	         if (_didIteratorError) {
	            throw _iteratorError;
	         }
	      }
	   }

	   return true;
	}

/***/ },
/* 25 */
/***/ function(module, exports) {

	!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.page=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
	(function (process){
	  /* globals require, module */

	  'use strict';

	  /**
	   * Module dependencies.
	   */

	  var pathtoRegexp = require('path-to-regexp');

	  /**
	   * Module exports.
	   */

	  module.exports = page;

	  /**
	   * Detect click event
	   */
	  var clickEvent = ('undefined' !== typeof document) && document.ontouchstart ? 'touchstart' : 'click';

	  /**
	   * To work properly with the URL
	   * history.location generated polyfill in https://github.com/devote/HTML5-History-API
	   */

	  var location = ('undefined' !== typeof window) && (window.history.location || window.location);

	  /**
	   * Perform initial dispatch.
	   */

	  var dispatch = true;


	  /**
	   * Decode URL components (query string, pathname, hash).
	   * Accommodates both regular percent encoding and x-www-form-urlencoded format.
	   */
	  var decodeURLComponents = true;

	  /**
	   * Base path.
	   */

	  var base = '';

	  /**
	   * Running flag.
	   */

	  var running;

	  /**
	   * HashBang option
	   */

	  var hashbang = false;

	  /**
	   * Previous context, for capturing
	   * page exit events.
	   */

	  var prevContext;

	  /**
	   * Register `path` with callback `fn()`,
	   * or route `path`, or redirection,
	   * or `page.start()`.
	   *
	   *   page(fn);
	   *   page('*', fn);
	   *   page('/user/:id', load, user);
	   *   page('/user/' + user.id, { some: 'thing' });
	   *   page('/user/' + user.id);
	   *   page('/from', '/to')
	   *   page();
	   *
	   * @param {string|!Function|!Object} path
	   * @param {Function=} fn
	   * @api public
	   */

	  function page(path, fn) {
	    // <callback>
	    if ('function' === typeof path) {
	      return page('*', path);
	    }

	    // route <path> to <callback ...>
	    if ('function' === typeof fn) {
	      var route = new Route(/** @type {string} */ (path));
	      for (var i = 1; i < arguments.length; ++i) {
	        page.callbacks.push(route.middleware(arguments[i]));
	      }
	      // show <path> with [state]
	    } else if ('string' === typeof path) {
	      page['string' === typeof fn ? 'redirect' : 'show'](path, fn);
	      // start [options]
	    } else {
	      page.start(path);
	    }
	  }

	  /**
	   * Callback functions.
	   */

	  page.callbacks = [];
	  page.exits = [];

	  /**
	   * Current path being processed
	   * @type {string}
	   */
	  page.current = '';

	  /**
	   * Number of pages navigated to.
	   * @type {number}
	   *
	   *     page.len == 0;
	   *     page('/login');
	   *     page.len == 1;
	   */

	  page.len = 0;

	  /**
	   * Get or set basepath to `path`.
	   *
	   * @param {string} path
	   * @api public
	   */

	  page.base = function(path) {
	    if (0 === arguments.length) return base;
	    base = path;
	  };

	  /**
	   * Bind with the given `options`.
	   *
	   * Options:
	   *
	   *    - `click` bind to click events [true]
	   *    - `popstate` bind to popstate [true]
	   *    - `dispatch` perform initial dispatch [true]
	   *
	   * @param {Object} options
	   * @api public
	   */

	  page.start = function(options) {
	    options = options || {};
	    if (running) return;
	    running = true;
	    if (false === options.dispatch) dispatch = false;
	    if (false === options.decodeURLComponents) decodeURLComponents = false;
	    if (false !== options.popstate) window.addEventListener('popstate', onpopstate, false);
	    if (false !== options.click) {
	      document.addEventListener(clickEvent, onclick, false);
	    }
	    if (true === options.hashbang) hashbang = true;
	    if (!dispatch) return;
	    var url = (hashbang && ~location.hash.indexOf('#!')) ? location.hash.substr(2) + location.search : location.pathname + location.search + location.hash;
	    page.replace(url, null, true, dispatch);
	  };

	  /**
	   * Unbind click and popstate event handlers.
	   *
	   * @api public
	   */

	  page.stop = function() {
	    if (!running) return;
	    page.current = '';
	    page.len = 0;
	    running = false;
	    document.removeEventListener(clickEvent, onclick, false);
	    window.removeEventListener('popstate', onpopstate, false);
	  };

	  /**
	   * Show `path` with optional `state` object.
	   *
	   * @param {string} path
	   * @param {Object=} state
	   * @param {boolean=} dispatch
	   * @param {boolean=} push
	   * @return {!Context}
	   * @api public
	   */

	  page.show = function(path, state, dispatch, push) {
	    var ctx = new Context(path, state);
	    page.current = ctx.path;
	    if (false !== dispatch) page.dispatch(ctx);
	    if (false !== ctx.handled && false !== push) ctx.pushState();
	    return ctx;
	  };

	  /**
	   * Goes back in the history
	   * Back should always let the current route push state and then go back.
	   *
	   * @param {string} path - fallback path to go back if no more history exists, if undefined defaults to page.base
	   * @param {Object=} state
	   * @api public
	   */

	  page.back = function(path, state) {
	    if (page.len > 0) {
	      // this may need more testing to see if all browsers
	      // wait for the next tick to go back in history
	      history.back();
	      page.len--;
	    } else if (path) {
	      setTimeout(function() {
	        page.show(path, state);
	      });
	    }else{
	      setTimeout(function() {
	        page.show(base, state);
	      });
	    }
	  };


	  /**
	   * Register route to redirect from one path to other
	   * or just redirect to another route
	   *
	   * @param {string} from - if param 'to' is undefined redirects to 'from'
	   * @param {string=} to
	   * @api public
	   */
	  page.redirect = function(from, to) {
	    // Define route from a path to another
	    if ('string' === typeof from && 'string' === typeof to) {
	      page(from, function(e) {
	        setTimeout(function() {
	          page.replace(/** @type {!string} */ (to));
	        }, 0);
	      });
	    }

	    // Wait for the push state and replace it with another
	    if ('string' === typeof from && 'undefined' === typeof to) {
	      setTimeout(function() {
	        page.replace(from);
	      }, 0);
	    }
	  };

	  /**
	   * Replace `path` with optional `state` object.
	   *
	   * @param {string} path
	   * @param {Object=} state
	   * @param {boolean=} init
	   * @param {boolean=} dispatch
	   * @return {!Context}
	   * @api public
	   */


	  page.replace = function(path, state, init, dispatch) {
	    var ctx = new Context(path, state);
	    page.current = ctx.path;
	    ctx.init = init;
	    ctx.save(); // save before dispatching, which may redirect
	    if (false !== dispatch) page.dispatch(ctx);
	    return ctx;
	  };

	  /**
	   * Dispatch the given `ctx`.
	   *
	   * @param {Context} ctx
	   * @api private
	   */
	  page.dispatch = function(ctx) {
	    var prev = prevContext,
	      i = 0,
	      j = 0;

	    prevContext = ctx;

	    function nextExit() {
	      var fn = page.exits[j++];
	      if (!fn) return nextEnter();
	      fn(prev, nextExit);
	    }

	    function nextEnter() {
	      var fn = page.callbacks[i++];

	      if (ctx.path !== page.current) {
	        ctx.handled = false;
	        return;
	      }
	      if (!fn) return unhandled(ctx);
	      fn(ctx, nextEnter);
	    }

	    if (prev) {
	      nextExit();
	    } else {
	      nextEnter();
	    }
	  };

	  /**
	   * Unhandled `ctx`. When it's not the initial
	   * popstate then redirect. If you wish to handle
	   * 404s on your own use `page('*', callback)`.
	   *
	   * @param {Context} ctx
	   * @api private
	   */
	  function unhandled(ctx) {
	    if (ctx.handled) return;
	    var current;

	    if (hashbang) {
	      current = base + location.hash.replace('#!', '');
	    } else {
	      current = location.pathname + location.search;
	    }

	    if (current === ctx.canonicalPath) return;
	    page.stop();
	    ctx.handled = false;
	    location.href = ctx.canonicalPath;
	  }

	  /**
	   * Register an exit route on `path` with
	   * callback `fn()`, which will be called
	   * on the previous context when a new
	   * page is visited.
	   */
	  page.exit = function(path, fn) {
	    if (typeof path === 'function') {
	      return page.exit('*', path);
	    }

	    var route = new Route(path);
	    for (var i = 1; i < arguments.length; ++i) {
	      page.exits.push(route.middleware(arguments[i]));
	    }
	  };

	  /**
	   * Remove URL encoding from the given `str`.
	   * Accommodates whitespace in both x-www-form-urlencoded
	   * and regular percent-encoded form.
	   *
	   * @param {string} val - URL component to decode
	   */
	  function decodeURLEncodedURIComponent(val) {
	    if (typeof val !== 'string') { return val; }
	    return decodeURLComponents ? decodeURIComponent(val.replace(/\+/g, ' ')) : val;
	  }

	  /**
	   * Initialize a new "request" `Context`
	   * with the given `path` and optional initial `state`.
	   *
	   * @constructor
	   * @param {string} path
	   * @param {Object=} state
	   * @api public
	   */

	  function Context(path, state) {
	    if ('/' === path[0] && 0 !== path.indexOf(base)) path = base + (hashbang ? '#!' : '') + path;
	    var i = path.indexOf('?');

	    this.canonicalPath = path;
	    this.path = path.replace(base, '') || '/';
	    if (hashbang) this.path = this.path.replace('#!', '') || '/';

	    this.title = document.title;
	    this.state = state || {};
	    this.state.path = path;
	    this.querystring = ~i ? decodeURLEncodedURIComponent(path.slice(i + 1)) : '';
	    this.pathname = decodeURLEncodedURIComponent(~i ? path.slice(0, i) : path);
	    this.params = {};

	    // fragment
	    this.hash = '';
	    if (!hashbang) {
	      if (!~this.path.indexOf('#')) return;
	      var parts = this.path.split('#');
	      this.path = parts[0];
	      this.hash = decodeURLEncodedURIComponent(parts[1]) || '';
	      this.querystring = this.querystring.split('#')[0];
	    }
	  }

	  /**
	   * Expose `Context`.
	   */

	  page.Context = Context;

	  /**
	   * Push state.
	   *
	   * @api private
	   */

	  Context.prototype.pushState = function() {
	    page.len++;
	    history.pushState(this.state, this.title, hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
	  };

	  /**
	   * Save the context state.
	   *
	   * @api public
	   */

	  Context.prototype.save = function() {
	    history.replaceState(this.state, this.title, hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
	  };

	  /**
	   * Initialize `Route` with the given HTTP `path`,
	   * and an array of `callbacks` and `options`.
	   *
	   * Options:
	   *
	   *   - `sensitive`    enable case-sensitive routes
	   *   - `strict`       enable strict matching for trailing slashes
	   *
	   * @constructor
	   * @param {string} path
	   * @param {Object=} options
	   * @api private
	   */

	  function Route(path, options) {
	    options = options || {};
	    this.path = (path === '*') ? '(.*)' : path;
	    this.method = 'GET';
	    this.regexp = pathtoRegexp(this.path,
	      this.keys = [],
	      options);
	  }

	  /**
	   * Expose `Route`.
	   */

	  page.Route = Route;

	  /**
	   * Return route middleware with
	   * the given callback `fn()`.
	   *
	   * @param {Function} fn
	   * @return {Function}
	   * @api public
	   */

	  Route.prototype.middleware = function(fn) {
	    var self = this;
	    return function(ctx, next) {
	      if (self.match(ctx.path, ctx.params)) return fn(ctx, next);
	      next();
	    };
	  };

	  /**
	   * Check if this route matches `path`, if so
	   * populate `params`.
	   *
	   * @param {string} path
	   * @param {Object} params
	   * @return {boolean}
	   * @api private
	   */

	  Route.prototype.match = function(path, params) {
	    var keys = this.keys,
	      qsIndex = path.indexOf('?'),
	      pathname = ~qsIndex ? path.slice(0, qsIndex) : path,
	      m = this.regexp.exec(decodeURIComponent(pathname));

	    if (!m) return false;

	    for (var i = 1, len = m.length; i < len; ++i) {
	      var key = keys[i - 1];
	      var val = decodeURLEncodedURIComponent(m[i]);
	      if (val !== undefined || !(hasOwnProperty.call(params, key.name))) {
	        params[key.name] = val;
	      }
	    }

	    return true;
	  };


	  /**
	   * Handle "populate" events.
	   */

	  var onpopstate = (function () {
	    var loaded = false;
	    if ('undefined' === typeof window) {
	      return;
	    }
	    if (document.readyState === 'complete') {
	      loaded = true;
	    } else {
	      window.addEventListener('load', function() {
	        setTimeout(function() {
	          loaded = true;
	        }, 0);
	      });
	    }
	    return function onpopstate(e) {
	      if (!loaded) return;
	      if (e.state) {
	        var path = e.state.path;
	        page.replace(path, e.state);
	      } else {
	        page.show(location.pathname + location.hash, undefined, undefined, false);
	      }
	    };
	  })();
	  /**
	   * Handle "click" events.
	   */

	  function onclick(e) {

	    if (1 !== which(e)) return;

	    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
	    if (e.defaultPrevented) return;



	    // ensure link
	    // use shadow dom when available
	    var el = e.path ? e.path[0] : e.target;
	    while (el && 'A' !== el.nodeName) el = el.parentNode;
	    if (!el || 'A' !== el.nodeName) return;



	    // Ignore if tag has
	    // 1. "download" attribute
	    // 2. rel="external" attribute
	    if (el.hasAttribute('download') || el.getAttribute('rel') === 'external') return;

	    // ensure non-hash for the same path
	    var link = el.getAttribute('href');
	    if (!hashbang && el.pathname === location.pathname && (el.hash || '#' === link)) return;



	    // Check for mailto: in the href
	    if (link && link.indexOf('mailto:') > -1) return;

	    // check target
	    if (el.target) return;

	    // x-origin
	    if (!sameOrigin(el.href)) return;



	    // rebuild path
	    var path = el.pathname + el.search + (el.hash || '');

	    // strip leading "/[drive letter]:" on NW.js on Windows
	    if (typeof process !== 'undefined' && path.match(/^\/[a-zA-Z]:\//)) {
	      path = path.replace(/^\/[a-zA-Z]:\//, '/');
	    }

	    // same page
	    var orig = path;

	    if (path.indexOf(base) === 0) {
	      path = path.substr(base.length);
	    }

	    if (hashbang) path = path.replace('#!', '');

	    if (base && orig === path) return;

	    e.preventDefault();
	    page.show(orig);
	  }

	  /**
	   * Event button.
	   */

	  function which(e) {
	    e = e || window.event;
	    return null === e.which ? e.button : e.which;
	  }

	  /**
	   * Check if `href` is the same origin.
	   */

	  function sameOrigin(href) {
	    var origin = location.protocol + '//' + location.hostname;
	    if (location.port) origin += ':' + location.port;
	    return (href && (0 === href.indexOf(origin)));
	  }

	  page.sameOrigin = sameOrigin;

	}).call(this,require('_process'))
	},{"_process":2,"path-to-regexp":3}],2:[function(require,module,exports){
	// shim for using process in browser

	var process = module.exports = {};

	process.nextTick = (function () {
	    var canSetImmediate = typeof window !== 'undefined'
	    && window.setImmediate;
	    var canMutationObserver = typeof window !== 'undefined'
	    && window.MutationObserver;
	    var canPost = typeof window !== 'undefined'
	    && window.postMessage && window.addEventListener
	    ;

	    if (canSetImmediate) {
	        return function (f) { return window.setImmediate(f) };
	    }

	    var queue = [];

	    if (canMutationObserver) {
	        var hiddenDiv = document.createElement("div");
	        var observer = new MutationObserver(function () {
	            var queueList = queue.slice();
	            queue.length = 0;
	            queueList.forEach(function (fn) {
	                fn();
	            });
	        });

	        observer.observe(hiddenDiv, { attributes: true });

	        return function nextTick(fn) {
	            if (!queue.length) {
	                hiddenDiv.setAttribute('yes', 'no');
	            }
	            queue.push(fn);
	        };
	    }

	    if (canPost) {
	        window.addEventListener('message', function (ev) {
	            var source = ev.source;
	            if ((source === window || source === null) && ev.data === 'process-tick') {
	                ev.stopPropagation();
	                if (queue.length > 0) {
	                    var fn = queue.shift();
	                    fn();
	                }
	            }
	        }, true);

	        return function nextTick(fn) {
	            queue.push(fn);
	            window.postMessage('process-tick', '*');
	        };
	    }

	    return function nextTick(fn) {
	        setTimeout(fn, 0);
	    };
	})();

	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	// TODO(shtylman)
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};

	},{}],3:[function(require,module,exports){
	var isarray = require('isarray')

	/**
	 * Expose `pathToRegexp`.
	 */
	module.exports = pathToRegexp
	module.exports.parse = parse
	module.exports.compile = compile
	module.exports.tokensToFunction = tokensToFunction
	module.exports.tokensToRegExp = tokensToRegExp

	/**
	 * The main path matching regexp utility.
	 *
	 * @type {RegExp}
	 */
	var PATH_REGEXP = new RegExp([
	  // Match escaped characters that would otherwise appear in future matches.
	  // This allows the user to escape special characters that won't transform.
	  '(\\\\.)',
	  // Match Express-style parameters and un-named parameters with a prefix
	  // and optional suffixes. Matches appear as:
	  //
	  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
	  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
	  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
	  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'
	].join('|'), 'g')

	/**
	 * Parse a string for the raw tokens.
	 *
	 * @param  {String} str
	 * @return {Array}
	 */
	function parse (str) {
	  var tokens = []
	  var key = 0
	  var index = 0
	  var path = ''
	  var res

	  while ((res = PATH_REGEXP.exec(str)) != null) {
	    var m = res[0]
	    var escaped = res[1]
	    var offset = res.index
	    path += str.slice(index, offset)
	    index = offset + m.length

	    // Ignore already escaped sequences.
	    if (escaped) {
	      path += escaped[1]
	      continue
	    }

	    // Push the current path onto the tokens.
	    if (path) {
	      tokens.push(path)
	      path = ''
	    }

	    var prefix = res[2]
	    var name = res[3]
	    var capture = res[4]
	    var group = res[5]
	    var suffix = res[6]
	    var asterisk = res[7]

	    var repeat = suffix === '+' || suffix === '*'
	    var optional = suffix === '?' || suffix === '*'
	    var delimiter = prefix || '/'
	    var pattern = capture || group || (asterisk ? '.*' : '[^' + delimiter + ']+?')

	    tokens.push({
	      name: name || key++,
	      prefix: prefix || '',
	      delimiter: delimiter,
	      optional: optional,
	      repeat: repeat,
	      pattern: escapeGroup(pattern)
	    })
	  }

	  // Match any characters still remaining.
	  if (index < str.length) {
	    path += str.substr(index)
	  }

	  // If the path exists, push it onto the end.
	  if (path) {
	    tokens.push(path)
	  }

	  return tokens
	}

	/**
	 * Compile a string to a template function for the path.
	 *
	 * @param  {String}   str
	 * @return {Function}
	 */
	function compile (str) {
	  return tokensToFunction(parse(str))
	}

	/**
	 * Expose a method for transforming tokens into the path function.
	 */
	function tokensToFunction (tokens) {
	  // Compile all the tokens into regexps.
	  var matches = new Array(tokens.length)

	  // Compile all the patterns before compilation.
	  for (var i = 0; i < tokens.length; i++) {
	    if (typeof tokens[i] === 'object') {
	      matches[i] = new RegExp('^' + tokens[i].pattern + '$')
	    }
	  }

	  return function (obj) {
	    var path = ''
	    var data = obj || {}

	    for (var i = 0; i < tokens.length; i++) {
	      var token = tokens[i]

	      if (typeof token === 'string') {
	        path += token

	        continue
	      }

	      var value = data[token.name]
	      var segment

	      if (value == null) {
	        if (token.optional) {
	          continue
	        } else {
	          throw new TypeError('Expected "' + token.name + '" to be defined')
	        }
	      }

	      if (isarray(value)) {
	        if (!token.repeat) {
	          throw new TypeError('Expected "' + token.name + '" to not repeat, but received "' + value + '"')
	        }

	        if (value.length === 0) {
	          if (token.optional) {
	            continue
	          } else {
	            throw new TypeError('Expected "' + token.name + '" to not be empty')
	          }
	        }

	        for (var j = 0; j < value.length; j++) {
	          segment = encodeURIComponent(value[j])

	          if (!matches[i].test(segment)) {
	            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
	          }

	          path += (j === 0 ? token.prefix : token.delimiter) + segment
	        }

	        continue
	      }

	      segment = encodeURIComponent(value)

	      if (!matches[i].test(segment)) {
	        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
	      }

	      path += token.prefix + segment
	    }

	    return path
	  }
	}

	/**
	 * Escape a regular expression string.
	 *
	 * @param  {String} str
	 * @return {String}
	 */
	function escapeString (str) {
	  return str.replace(/([.+*?=^!:${}()[\]|\/])/g, '\\$1')
	}

	/**
	 * Escape the capturing group by escaping special characters and meaning.
	 *
	 * @param  {String} group
	 * @return {String}
	 */
	function escapeGroup (group) {
	  return group.replace(/([=!:$\/()])/g, '\\$1')
	}

	/**
	 * Attach the keys as a property of the regexp.
	 *
	 * @param  {RegExp} re
	 * @param  {Array}  keys
	 * @return {RegExp}
	 */
	function attachKeys (re, keys) {
	  re.keys = keys
	  return re
	}

	/**
	 * Get the flags for a regexp from the options.
	 *
	 * @param  {Object} options
	 * @return {String}
	 */
	function flags (options) {
	  return options.sensitive ? '' : 'i'
	}

	/**
	 * Pull out keys from a regexp.
	 *
	 * @param  {RegExp} path
	 * @param  {Array}  keys
	 * @return {RegExp}
	 */
	function regexpToRegexp (path, keys) {
	  // Use a negative lookahead to match only capturing groups.
	  var groups = path.source.match(/\((?!\?)/g)

	  if (groups) {
	    for (var i = 0; i < groups.length; i++) {
	      keys.push({
	        name: i,
	        prefix: null,
	        delimiter: null,
	        optional: false,
	        repeat: false,
	        pattern: null
	      })
	    }
	  }

	  return attachKeys(path, keys)
	}

	/**
	 * Transform an array into a regexp.
	 *
	 * @param  {Array}  path
	 * @param  {Array}  keys
	 * @param  {Object} options
	 * @return {RegExp}
	 */
	function arrayToRegexp (path, keys, options) {
	  var parts = []

	  for (var i = 0; i < path.length; i++) {
	    parts.push(pathToRegexp(path[i], keys, options).source)
	  }

	  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options))

	  return attachKeys(regexp, keys)
	}

	/**
	 * Create a path regexp from string input.
	 *
	 * @param  {String} path
	 * @param  {Array}  keys
	 * @param  {Object} options
	 * @return {RegExp}
	 */
	function stringToRegexp (path, keys, options) {
	  var tokens = parse(path)
	  var re = tokensToRegExp(tokens, options)

	  // Attach keys back to the regexp.
	  for (var i = 0; i < tokens.length; i++) {
	    if (typeof tokens[i] !== 'string') {
	      keys.push(tokens[i])
	    }
	  }

	  return attachKeys(re, keys)
	}

	/**
	 * Expose a function for taking tokens and returning a RegExp.
	 *
	 * @param  {Array}  tokens
	 * @param  {Array}  keys
	 * @param  {Object} options
	 * @return {RegExp}
	 */
	function tokensToRegExp (tokens, options) {
	  options = options || {}

	  var strict = options.strict
	  var end = options.end !== false
	  var route = ''
	  var lastToken = tokens[tokens.length - 1]
	  var endsWithSlash = typeof lastToken === 'string' && /\/$/.test(lastToken)

	  // Iterate over the tokens and create our regexp string.
	  for (var i = 0; i < tokens.length; i++) {
	    var token = tokens[i]

	    if (typeof token === 'string') {
	      route += escapeString(token)
	    } else {
	      var prefix = escapeString(token.prefix)
	      var capture = token.pattern

	      if (token.repeat) {
	        capture += '(?:' + prefix + capture + ')*'
	      }

	      if (token.optional) {
	        if (prefix) {
	          capture = '(?:' + prefix + '(' + capture + '))?'
	        } else {
	          capture = '(' + capture + ')?'
	        }
	      } else {
	        capture = prefix + '(' + capture + ')'
	      }

	      route += capture
	    }
	  }

	  // In non-strict mode we allow a slash at the end of match. If the path to
	  // match already ends with a slash, we remove it for consistency. The slash
	  // is valid at the end of a path match, not in the middle. This is important
	  // in non-ending mode, where "/test/" shouldn't match "/test//route".
	  if (!strict) {
	    route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?'
	  }

	  if (end) {
	    route += '$'
	  } else {
	    // In non-ending mode, we need the capturing groups to match as much as
	    // possible by using a positive lookahead to the end or next path segment.
	    route += strict && endsWithSlash ? '' : '(?=\\/|$)'
	  }

	  return new RegExp('^' + route, flags(options))
	}

	/**
	 * Normalize the given path string, returning a regular expression.
	 *
	 * An empty array can be passed in for the keys, which will hold the
	 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
	 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
	 *
	 * @param  {(String|RegExp|Array)} path
	 * @param  {Array}                 [keys]
	 * @param  {Object}                [options]
	 * @return {RegExp}
	 */
	function pathToRegexp (path, keys, options) {
	  keys = keys || []

	  if (!isarray(keys)) {
	    options = keys
	    keys = []
	  } else if (!options) {
	    options = {}
	  }

	  if (path instanceof RegExp) {
	    return regexpToRegexp(path, keys, options)
	  }

	  if (isarray(path)) {
	    return arrayToRegexp(path, keys, options)
	  }

	  return stringToRegexp(path, keys, options)
	}

	},{"isarray":4}],4:[function(require,module,exports){
	module.exports = Array.isArray || function (arr) {
	  return Object.prototype.toString.call(arr) == '[object Array]';
	};

	},{}]},{},[1])(1)
	});

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	   value: true
	});
	exports.started = started;
	exports.resumedOrStarted = resumedOrStarted;

	var _object = __webpack_require__(4);

	var object = _interopRequireWildcard(_object);

	var _storage = __webpack_require__(20);

	var _storage2 = _interopRequireDefault(_storage);

	var _log = __webpack_require__(1);

	var _log2 = _interopRequireDefault(_log);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	var idCounter = 0; /**
	                    * Copyright 2016 aixigo AG
	                    * Released under the MIT license.
	                    * http://laxarjs.org/license
	                    */

	var store = _storage2.default.getSessionStorage('timer');

	function Timer(optionalOptions) {
	   this.options_ = object.options(optionalOptions, {
	      label: 'timer' + idCounter++,
	      persistenceKey: null
	   });
	   this.startTime_ = null;
	   this.stopTime_ = null;
	   this.splitTimes_ = [];
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	Timer.prototype.getData = function () {
	   return {
	      label: this.options_.label,
	      startTime: this.startTime_,
	      stopTime: this.stopTime_,
	      splitTimes: object.deepClone(this.splitTimes_)
	   };
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	Timer.prototype.start = function () {
	   this.startTime_ = now();

	   saveIfPersistent(this);
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	Timer.prototype.splitTime = function (optionalLabel) {
	   this.splitTimes_.push({
	      time: now(),
	      label: optionalLabel || 'split' + this.splitTimes_.length
	   });

	   saveIfPersistent(this);
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	Timer.prototype.stop = function () {
	   this.stopTime_ = now();

	   removeIfPersistent(this);
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	Timer.prototype.stopAndLog = function (optionalLabel) {
	   this.stop();

	   var startTime = this.startTime_;
	   var endTime = now();
	   var label = optionalLabel || 'Timer Stopped';
	   this.splitTimes_.push({ label: label, time: endTime });

	   var message = [];
	   message.push('Timer "', this.options_.label, '": ');
	   message.push('start at ', new Date(startTime).toISOString(), ' (client), ');
	   message.push(label, ' after ', (endTime - startTime).toFixed(0), 'ms ');
	   message.push('(checkpoints: ');
	   var intervals = [];
	   this.splitTimes_.reduce(function (from, data) {
	      intervals.push('"' + data.label + '"=' + (data.time - from).toFixed(0) + 'ms');
	      return data.time;
	   }, startTime);
	   message.push(intervals.join(', '), ')');
	   _log2.default.info(message.join(''));
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function now() {
	   // cannot use window.performance, because timings need to be valid across pages:
	   return new Date().getTime();
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function saveIfPersistent(timer) {
	   if (timer.options_.persistenceKey) {
	      store.setItem(timer.options_.persistenceKey, {
	         options: timer.options_,
	         startTime: timer.startTime_,
	         stopTime: timer.stopTime_,
	         splitTimes: timer.splitTimes_
	      });
	   }
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function restoreIfPersistent(timer) {
	   if (timer.options_.persistenceKey) {
	      var data = store.getItem(timer.options_.persistenceKey);
	      if (data) {
	         timer.options_ = data.options;
	         timer.startTime_ = data.startTime;
	         timer.stopTime_ = data.stopTime;
	         timer.splitTimes_ = data.splitTimes;
	         return true;
	      }
	   }

	   return false;
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function removeIfPersistent(timer) {
	   if (timer.options_.persistenceKey) {
	      store.removeItem(timer.options_.persistenceKey);
	   }
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function started(optionalOptions) {
	   var timer = new Timer(optionalOptions);
	   timer.start();
	   return timer;
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function resumedOrStarted(optionalOptions) {
	   var timer = new Timer(optionalOptions);
	   if (!restoreIfPersistent(timer)) {
	      timer.start();
	   }
	   return timer;
	}

/***/ },
/* 27 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	   value: true
	});
	/**
	 * Copyright 2016 aixigo AG
	 * Released under the MIT license.
	 * http://laxarjs.org/license
	 */
	exports.default = {
	   "$schema": "http://json-schema.org/draft-04/schema#",
	   "type": "object",
	   "required": ["places"],
	   "properties": {

	      "places": {
	         "type": "object",
	         "description": "The places for this flow.",
	         "patternProperties": {
	            "[a-z][a-zA-Z0-9_]*": {
	               "type": "object",
	               "properties": {

	                  "redirectTo": {
	                     "type": "string",
	                     "description": "The place to redirect to when hitting this place."
	                  },
	                  "page": {
	                     "type": "string",
	                     "description": "The page to render for this place."
	                  },
	                  "targets": {
	                     "type": "object",
	                     "patternProperties": {
	                        "[a-z][a-zA-Z0-9_]*": {
	                           "type": "string"
	                        }
	                     },
	                     "description": "A map of symbolic targets to places reachable from this place."
	                  },
	                  "entryPoints": {
	                     "type": "object",
	                     "patternProperties": {
	                        "[a-z][a-zA-Z0-9_]*": {
	                           "type": "string"
	                        }
	                     },
	                     "description": "Entry points defined by this place."
	                  },
	                  "exitPoint": {
	                     "type": "string",
	                     "description": "The exit point to invoke when reaching this place."
	                  }

	               },
	               "additionalProperties": false
	            }
	         },
	         "additionalProperties": false
	      }

	   },
	   "additionalProperties": false
	};

/***/ },
/* 28 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	   value: true
	});
	exports.create = create;
	/**
	 * Copyright 2016 aixigo AG
	 * Released under the MIT license.
	 * http://laxarjs.org/license
	 */
	function create() {

	   var heartbeatListeners = [];
	   var nextQueue = [];
	   var beforeQueue = [];
	   var afterQueue = [];

	   var beatRequested = false;

	   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

	   function registerHeartbeatListener(listener) {
	      heartbeatListeners.push(listener);

	      return function () {
	         var index = void 0;
	         while ((index = heartbeatListeners.indexOf(listener)) !== -1) {
	            heartbeatListeners.splice(index, 1);
	         }
	      };
	   }

	   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

	   /**
	    * Schedules a function for the next heartbeat. If no heartbeat was triggered yet, it will be
	    * requested now.
	    *
	    * @param {Function} func
	    *    a function to schedule for the next tick
	    *
	    * @memberOf axHeartbeat
	    */
	   function onNext(func) {
	      if (!beatRequested) {
	         beatRequested = true;
	         setTimeout(function () {
	            while (beforeQueue.length) {
	               beforeQueue.shift()();
	            }
	            // The outer loop handles events published from apply-callbacks (watchers, promises).
	            do {
	               while (nextQueue.length) {
	                  nextQueue.shift()();
	               }

	               heartbeatListeners.forEach(function (listener) {
	                  return listener();
	               });
	            } while (nextQueue.length);
	            while (afterQueue.length) {
	               afterQueue.shift()();
	            }
	            beatRequested = false;
	         }, 0);
	      }
	      nextQueue.push(func);
	   }

	   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

	   /**
	    * Schedules a function to be called before the next heartbeat occurs. Note that `func` may never be
	    * called, if there is no next heartbeat.
	    *
	    * @param {Function} func
	    *    a function to call before the next heartbeat
	    *
	    * @memberOf axHeartbeat
	    */
	   function onBeforeNext(func) {
	      beforeQueue.push(func);
	   }

	   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

	   /**
	    * Schedules a function to be called after the next heartbeat occured. Note that `func` may never be
	    * called, if there is no next heartbeat.
	    *
	    * @param {Function} func
	    *    a function to call after the next heartbeat
	    *
	    * @memberOf axHeartbeat
	    */
	   function onAfterNext(func) {
	      afterQueue.push(func);
	   }

	   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

	   return {
	      registerHeartbeatListener: registerHeartbeatListener,
	      onBeforeNext: onBeforeNext,
	      onNext: onNext,
	      onAfterNext: onAfterNext
	   };
	}

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	   value: true
	});
	exports.create = create;

	var _assert = __webpack_require__(2);

	var _assert2 = _interopRequireDefault(_assert);

	var _area_helper = __webpack_require__(30);

	var _layout_widget_adapter = __webpack_require__(31);

	var _pages = __webpack_require__(18);

	var _pages2 = _interopRequireDefault(_pages);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /**
	                                                                                                                                                                                                     * Copyright 2016 aixigo AG
	                                                                                                                                                                                                     * Released under the MIT license.
	                                                                                                                                                                                                     * http://laxarjs.org/license
	                                                                                                                                                                                                     */


	function create(eventBus, heartbeat, pageLoader, layoutLoader, widgetLoader, themeManager, localeManager, visibilityManager) {

	   (0, _assert2.default)(eventBus).isNotNull();
	   (0, _assert2.default)(heartbeat).isNotNull();
	   (0, _assert2.default)(pageLoader).isNotNull();
	   (0, _assert2.default)(layoutLoader).isNotNull();
	   (0, _assert2.default)(widgetLoader).isNotNull();
	   (0, _assert2.default)(themeManager).isNotNull();
	   (0, _assert2.default)(localeManager).isNotNull();
	   (0, _assert2.default)(visibilityManager).isNotNull();

	   var pageController = void 0;

	   var pageServiceApi = {
	      createControllerFor: function createControllerFor(pageElement) {
	         _assert2.default.state(!pageController, 'Cannot create a page controller more than once.');
	         _assert2.default.state(pageElement instanceof HTMLElement, 'A page controller can only be created for a valid DOM element.');

	         pageController = createPageController(pageElement);
	         return pageController;
	      },
	      controller: function controller() {
	         return pageController;
	      }
	   };

	   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

	   function createPageController(pageElement) {

	      var api = {
	         setupPage: setupPage,
	         tearDownPage: tearDownPage
	      };

	      heartbeat.registerHeartbeatListener(function () {
	         viewChangeApplyFunctions.forEach(function (applyFunction) {
	            return applyFunction();
	         });
	      });

	      pageElement.innerHTML = '';

	      /** Delay between sending didLifeCycle and attaching widget templates. */
	      var WIDGET_ATTACH_DELAY_MS = 5;
	      var COLLABORATOR_ID = 'AxPageController';
	      var LIFECYCLE_EVENT = { lifecycleId: 'default' };
	      var EVENT_OPTIONS = { sender: COLLABORATOR_ID };
	      var DEFAULT_AREAS = [{ name: 'activities', hidden: true }, { name: 'popups' }, { name: 'popovers' }];

	      var viewChangeApplyFunctions = [];
	      var activeWidgetAdapterWrappers = [];
	      var cleanUpLayout = function cleanUpLayout() {};

	      ////////////////////////////////////////////////////////////////////////////////////////////////////////

	      function setupPage(pageName) {
	         (0, _assert2.default)(pageName).hasType(String).isNotNull();

	         var areaHelper = void 0;

	         return pageLoader.load(pageName).then(function (page) {
	            areaHelper = (0, _area_helper.create)(page);
	            visibilityManager.setAreaHelper(areaHelper);

	            var layoutPromise = layoutLoader.load(page.layout).then(function (layoutInfo) {
	               return cleanUpLayout = renderLayout(pageElement, areaHelper, layoutInfo);
	            });

	            localeManager.subscribe();
	            var layoutWidget = function layoutWidget(widget) {
	               return layoutWidgetAdapterFor(areaHelper, widget);
	            };

	            // instantiate controllers wrapped by widget adapters
	            var widgetPromises = widgetsForPage(page).map(function (widget) {
	               return 'layout' in widget ? layoutWidget(widget) : widgetLoader.load(widget);
	            });

	            return Promise.all([].concat(_toConsumableArray(widgetPromises), [layoutPromise])).then(function (results) {
	               return results.slice(0, -1);
	            });
	         }).then(function (widgetAdapterWrappers) {
	            _pages2.default.setCurrentPage(pageName);
	            viewChangeApplyFunctions = widgetAdapterWrappers.reduce(function (viewChangeApplyFunctions, adapter) {
	               if (typeof adapter.applyViewChanges === 'function' && viewChangeApplyFunctions.indexOf(adapter.applyViewChanges) === -1) {
	                  return [].concat(_toConsumableArray(viewChangeApplyFunctions), [adapter.applyViewChanges]);
	               }
	               return viewChangeApplyFunctions;
	            }, []);
	            activeWidgetAdapterWrappers = widgetAdapterWrappers;
	         }).then(localeManager.initialize).then(function () {
	            var theme = themeManager.getTheme();
	            return eventBus.publish('didChangeTheme.' + theme, { theme: theme }, EVENT_OPTIONS);
	         }).then(function () {
	            return eventBus.publishAndGatherReplies('beginLifecycleRequest.default', LIFECYCLE_EVENT, EVENT_OPTIONS);
	         }).then(visibilityManager.initialize)
	         // Give the widgets (a little) time to settle on the event bus before $digesting and painting:
	         .then(function () {
	            return delay(WIDGET_ATTACH_DELAY_MS);
	         }).then(function () {
	            return areaHelper.attachWidgets(activeWidgetAdapterWrappers);
	         });
	      }

	      ////////////////////////////////////////////////////////////////////////////////////////////////////////

	      function tearDownPage() {
	         visibilityManager.unsubscribe();
	         localeManager.unsubscribe();

	         return eventBus.publishAndGatherReplies('endLifecycleRequest.default', LIFECYCLE_EVENT, EVENT_OPTIONS).then(function () {
	            activeWidgetAdapterWrappers.forEach(function (wrapper) {
	               return wrapper.destroy();
	            });
	            activeWidgetAdapterWrappers = [];
	            cleanUpLayout();
	            cleanUpLayout = function cleanUpLayout() {};
	            viewChangeApplyFunctions = [];
	         });
	      }

	      ////////////////////////////////////////////////////////////////////////////////////////////////////////

	      function widgetsForPage(page) {
	         return Object.keys(page.areas).reduce(function (widgets, areaName) {
	            var areaWidgets = page.areas[areaName];
	            return areaWidgets.reduce(function (widgets, widget) {
	               widget.area = areaName;
	               return [].concat(_toConsumableArray(widgets), [widget]);
	            }, widgets);
	         }, []);
	      }

	      ////////////////////////////////////////////////////////////////////////////////////////////////////////

	      function layoutWidgetAdapterFor(areaHelper, widget) {
	         return layoutLoader.load(widget.layout).then(function (layout) {
	            var adapter = (0, _layout_widget_adapter.create)(areaHelper, layout, {
	               area: widget.area,
	               id: widget.id,
	               path: widget.layout
	            });

	            return {
	               id: widget.id,
	               adapter: adapter,
	               destroy: adapter.destroy,
	               templatePromise: Promise.resolve(layout.htmlContent)
	            };
	         });
	      }

	      ////////////////////////////////////////////////////////////////////////////////////////////////////////

	      function renderLayout(pageElement, areaHelper, layoutInfo) {

	         addClass(pageElement, layoutInfo.className);
	         pageElement.innerHTML = layoutInfo.htmlContent;

	         var areas = (0, _area_helper.findWidgetAreas)(pageElement);
	         var deregisterFuncs = Object.keys(areas).map(function (areaName) {
	            return areaHelper.register(areaName, areas[areaName]);
	         });

	         DEFAULT_AREAS.forEach(function (area) {
	            if (areaHelper.exists(area.name)) {
	               return;
	            }

	            var node = document.createElement('div');
	            // We only set the attribute here for debugging purposes
	            node.setAttribute('ax-widget-area', area.name);
	            if (area.hidden) {
	               node.style.display = 'none';
	            }
	            deregisterFuncs.push(areaHelper.register(area.name, node));
	            pageElement.appendChild(node);
	         });

	         return function () {
	            deregisterFuncs.forEach(function (func) {
	               return func();
	            });
	            removeClass(pageElement, layoutInfo.className);
	         };
	      }

	      ////////////////////////////////////////////////////////////////////////////////////////////////////////

	      return api;
	   }

	   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

	   return pageServiceApi;
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////

	function addClass(element, cssClass) {
	   if (element.classList) {
	      element.classList.add(cssClass);
	      return;
	   }
	   element.className += ' ' + cssClass;
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////

	function removeClass(element, cssClass) {
	   if (element.classList) {
	      element.classList.remove(cssClass);
	      return;
	   }
	   element.className = element.className.split(' ').map(function (c) {
	      return c.trim();
	   }).filter(function (c) {
	      return c !== cssClass;
	   }).join(' ');
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////

	function delay(ms) {
	   return new Promise(function (resolve) {
	      return setTimeout(resolve, ms);
	   });
	}

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	   value: true
	});
	exports.create = create;
	exports.findWidgetAreas = findWidgetAreas;

	var _object = __webpack_require__(4);

	/**
	 * The area helper manages widget areas, their DOM representation and their nesting structure.
	 *
	 * It tracks widget area visibility in order to compile widgets and to attach them to their areas when
	 * these become visible. It also tells the visibility service when change handlers need to be run. It does
	 * not interact with the event bus directly, but is consulted by the visibility manager to determine area
	 * nesting for visibility events.
	 */
	function create(page) {

	   var exports = {
	      setVisibility: setVisibility,
	      areasInArea: areasInArea,
	      areasInWidget: areasInWidget,
	      register: register,
	      exists: exists,
	      attachWidgets: attachWidgets
	   };

	   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

	   // all initially visible widgets should be attached together, to reduce jitter and unnecessary DOM ops
	   var freeToAttach = false;

	   // keep the dom element for each area, to attach widgets to
	   var areaToElement = {};

	   // track widget adapters waiting for their area to become available so that they may attach to its DOM
	   var areaToWaitingAdapters = {};

	   // the area name for each widget
	   var widgetIdToArea = {};
	   (0, _object.forEach)(page.areas, function (widgets, areaName) {
	      widgets.forEach(function (widget) {
	         widgetIdToArea[widget.id] = areaName;
	      });
	   });

	   // for each widget with children, and each widget area with nested areas, store a list of child names
	   var areasInAreaMap = {};
	   var areasInWidgetMap = {};
	   (0, _object.forEach)(page.areas, function (widgetEntries, areaName) {
	      var containerName = '';
	      if (areaName.indexOf('.') !== -1) {
	         var widgetId = areaName.split('.')[0];
	         areasInWidgetMap[widgetId] = areasInWidgetMap[widgetId] || [];
	         areasInWidgetMap[widgetId].push(areaName);
	         containerName = widgetIdToArea[widgetId];
	      }
	      areasInAreaMap[containerName] = areasInAreaMap[containerName] || [];
	      areasInAreaMap[containerName].push(areaName);
	   });

	   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

	   function setVisibility(areaName, visible) {
	      if (visible && freeToAttach) {
	         attachWaitingAdapters(areaName);
	      }
	      visibilityHelper.updateState(areaName, visible);
	   }

	   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

	   function areasInArea(containerName) {
	      return areasInAreaMap[containerName];
	   }

	   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

	   function areasInWidget(widgetId) {
	      return areasInWidgetMap[widgetId];
	   }

	   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

	   /**
	    * Register a widget area
	    *
	    * @param {String} name
	    *    the area name as used in the page definition
	    * @param {HTMLElement} element
	    *    an HTML element representing the widget area
	    *
	    * @return {Function}
	    *    removes the according area from the registry again
	    */
	   function register(name, element) {
	      if (name in areaToElement) {
	         throw new Error('The area "' + name + '" is defined twice in the current layout.');
	      }

	      areaToElement[name] = element;
	      if (freeToAttach && visibilityHelper.isVisible(name)) {
	         attachWaitingAdapters(name);
	      }

	      return function () {
	         delete areaToElement[name];
	      };
	   }

	   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

	   function exists(name) {
	      return name in areaToElement;
	   }

	   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

	   function attachWidgets(widgetAdapters) {
	      freeToAttach = true;
	      widgetAdapters.forEach(function (adapterRef) {
	         var areaName = widgetIdToArea[adapterRef.id];
	         areaToWaitingAdapters[areaName] = areaToWaitingAdapters[areaName] || [];
	         areaToWaitingAdapters[areaName].push(adapterRef);
	      });
	      (0, _object.forEach)(page.areas, function (widgets, areaName) {
	         if (visibilityHelper.isVisible(areaName)) {
	            attachWaitingAdapters(areaName);
	         }
	      });
	   }

	   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

	   /** @private */
	   function attachWaitingAdapters(areaName) {
	      var waitingAdapters = areaToWaitingAdapters[areaName];
	      if (!waitingAdapters || !waitingAdapters.length) {
	         return;
	      }

	      var element = areaToElement[areaName];
	      if (!element) {
	         return;
	      }

	      // Make sure that all assets are available before proceeding, so that DOM update happens en bloc.
	      Promise.all(waitingAdapters.map(function (adapterRef) {
	         return adapterRef.templatePromise;
	      })).then(function (htmlTemplates) {
	         // prepare first/last bootstrap classes for appending widgets
	         var children = childrenOf(element);
	         var currentLast = children[children.length - 1];
	         if (currentLast) {
	            removeClass(currentLast, 'last');
	         }
	         var currentFirst = children[0];

	         waitingAdapters.forEach(function (adapterRef, i) {
	            adapterRef.adapter.domAttachTo(element, htmlTemplates[i]);
	         });

	         // fix first/last bootstrap classes as needed
	         children = childrenOf(element);
	         if (!currentFirst) {
	            var first = children[0];
	            if (first) {
	               addClass(first, 'first');
	            }
	         }
	         var last = children[children.length - 1];
	         if (last) {
	            addClass(last, 'last');
	         }
	      });

	      delete areaToWaitingAdapters[areaName];
	   }

	   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

	   // TODO: For now taken from previous axVisibilityService. Perhaps this might be simplified.
	   var knownState = {};
	   var visibilityHelper = {
	      isVisible: function isVisible(area) {
	         return knownState[area] || false;
	      },


	      ////////////////////////////////////////////////////////////////////////////////////////////////////////

	      /**
	       * Run all handlers registered for the given area and target state after the next heartbeat.
	       * Also remove any handlers that have been cleared since the last run.
	       * @private
	       */
	      updateState: function updateState(area, targetState) {
	         knownState[area] = targetState;
	      }
	   };

	   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

	   return exports;
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Copyright 2016 aixigo AG
	 * Released under the MIT license.
	 * http://laxarjs.org/license
	 */
	function addClass(element, cssClass) {
	   if (element.classList) {
	      element.classList.add(cssClass);
	      return;
	   }
	   element.className += ' ' + cssClass;
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////

	function removeClass(element, cssClass) {
	   if (element.classList) {
	      element.classList.remove(cssClass);
	      return;
	   }
	   element.className = element.className.split(' ').map(function (c) {
	      return c.trim();
	   }).filter(function (c) {
	      return c !== cssClass;
	   }).join(' ');
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////

	function childrenOf(element) {
	   // we are only interested in element nodes
	   return Array.from(element.childNodes).filter(function (_) {
	      return _.nodeType === 1;
	   });
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////

	function findWidgetAreas(rootElement) {
	   var areas = {};
	   Array.from(rootElement.querySelectorAll('[ax-widget-area],[data-ax-widget-area]')).forEach(function (elem) {
	      var name = elem.getAttribute('ax-widget-area') || elem.getAttribute('data-ax-widget-area');

	      areas[name] = elem;
	   });
	   return areas;
	}

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	   value: true
	});
	exports.create = create;

	var _area_helper = __webpack_require__(30);

	function create(areaHelper, layout, widget) {

	   var exports = {
	      createController: createController,
	      domAttachTo: domAttachTo,
	      domDetach: domDetach,
	      destroy: destroy
	   };
	   var layoutNode = void 0;
	   var deregister = function deregister() {};

	   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

	   function createController() {}
	   // noop


	   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

	   function domAttachTo(areaElement, htmlTemplate) {
	      if (layoutNode) {
	         areaElement.appendChild(layoutNode);
	         return;
	      }

	      layoutNode = document.createElement('div');
	      layoutNode.id = widget.id;
	      layoutNode.className = layout.className;
	      layoutNode.innerHTML = htmlTemplate;

	      var areas = (0, _area_helper.findWidgetAreas)(layoutNode);
	      var deregisterFuncs = Object.keys(areas).map(function (areaName) {
	         return areaHelper.register(widget.id + '.' + areaName, areas[areaName]);
	      });
	      deregister = function deregister() {
	         return deregisterFuncs.forEach(function (func) {
	            return func();
	         });
	      };

	      areaElement.appendChild(layoutNode);
	   }

	   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

	   function domDetach() {
	      if (layoutNode.parentNode) {
	         layoutNode.parentNode.removeChild(layoutNode);
	      }
	   }

	   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

	   function destroy() {
	      deregister();
	      layoutNode = null;
	   }

	   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

	   return exports;
	} /**
	   * Copyright 2016 aixigo AG
	   * Released under the MIT license.
	   * http://laxarjs.org/license
	   */

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	   value: true
	});
	exports.create = create;

	var _path = __webpack_require__(8);

	var path = _interopRequireWildcard(_path);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	/**
	 * @param {FileResourceProvider} fileResourceProvider
	 *    the file resource provider used for theme file lookups
	 * @param {$q} q
	 *    a `$q` like promise library
	 * @param {String} theme
	 *    the theme to use
	 *
	 * @constructor
	 */
	function ThemeManager(fileResourceProvider, theme) {
	   this.fileResourceProvider_ = fileResourceProvider;
	   this.theme_ = theme;
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Returns the currently used theme.
	 *
	 * @return {String}
	 *    the currently active theme
	 */
	/**
	 * Copyright 2016 aixigo AG
	 * Released under the MIT license.
	 * http://laxarjs.org/license
	 */
	/**
	 * The theme manager simplifies lookup of theme specific assets.
	 *
	 * @module theme_manager
	 */
	ThemeManager.prototype.getTheme = function () {
	   return this.theme_;
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Returns a URL provider for specific path patterns that are used to lookup themed artifacts. The token
	 * `[theme]` will be replaced by the name of the currently active theme (plus `.theme` suffix) or by
	 * `default.theme` as a fallback. The `provide` method of the returned object can be called with a list of
	 * files for which a themed version should be found. The most specific location is searched first and the
	 * default theme last.
	 *
	 * @param {String} artifactPathPattern
	 *    a path pattern for search within the artifact directory itself, based on the current theme
	 * @param {String} [themePathPattern]
	 *    a path pattern for search within the current theme
	 * @param {String[]} [fallbackPathPatterns]
	 *    fallback paths, used if all else fails.
	 *    Possibly without placeholders, e.g. for loading the default theme itself.
	 *
	 * @returns {{provide: Function}}
	 *    an object with a provide method
	 */
	ThemeManager.prototype.urlProvider = function (artifactPathPattern, themePathPattern, fallbackPathPatterns) {
	   var self = this;

	   return {
	      provide: function provide(fileNames) {
	         var searchPrefixes = [];

	         var themeDirectory = self.theme_ + '.theme';
	         if (self.theme_ && self.theme_ !== 'default') {
	            if (artifactPathPattern) {
	               // highest precedence: artifacts with (multiple) embedded theme styles:
	               searchPrefixes.push(artifactPathPattern.replace('[theme]', themeDirectory));
	            }
	            if (themePathPattern) {
	               // second-highest precedence: themes with embedded artifact styles:
	               searchPrefixes.push(themePathPattern.replace('[theme]', themeDirectory));
	            }
	         }

	         (fallbackPathPatterns || []).forEach(function (pattern) {
	            // additional paths, usually for backward compatibility
	            if (self.theme_ !== 'default' || pattern.indexOf('[theme]') === -1) {
	               searchPrefixes.push(pattern.replace('[theme]', themeDirectory));
	            }
	         });

	         if (artifactPathPattern) {
	            // fall back to default theme provided by the artifact
	            searchPrefixes.push(artifactPathPattern.replace('[theme]', 'default.theme'));
	         }

	         var promises = fileNames.map(function (fileName) {
	            return findExistingPath(self, searchPrefixes, fileName);
	         });
	         return Promise.all(promises).then(function (results) {
	            return results.map(function (result, i) {
	               return result !== null ? path.join(result, fileNames[i]) : null;
	            });
	         });
	      }
	   };
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function findExistingPath(self, searchPrefixes, fileName) {
	   if (searchPrefixes.length === 0) {
	      return Promise.resolve(null);
	   }

	   return self.fileResourceProvider_.isAvailable(path.join(searchPrefixes[0], fileName)).then(function (available) {
	      return available ? searchPrefixes[0] : findExistingPath(self, searchPrefixes.slice(1), fileName);
	   });
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Creates and returns a new theme manager instance.
	 *
	 * @param {FileResourceProvider} fileResourceProvider
	 *    the file resource provider used for theme file lookup
	 * @param {String} theme
	 *    the theme to use
	 *
	 * @returns {ThemeManager}
	 */
	function create(fileResourceProvider, theme) {
	   return new ThemeManager(fileResourceProvider, theme);
	}

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	   value: true
	});
	exports.create = create;

	var _object = __webpack_require__(4);

	var senderOptions = { sender: 'AxPageController' }; /**
	                                                     * Copyright 2016 aixigo AG
	                                                     * Released under the MIT license.
	                                                     * http://laxarjs.org/license
	                                                     */

	var subscriberOptions = { subscriber: 'AxPageController' };

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * The LocaleManager initializes the locale(s) and implements changes to them.
	 *
	 * Before publishing the state of all configured locales, it listens to change requests, allowing
	 * widgets and activities (such as a LocaleSwitcherWidget) to influence the state of locales before
	 * the navigation is complete.
	 */
	function create(eventBus, configuration) {

	   var exports = {
	      initialize: initialize,
	      subscribe: subscribe,
	      unsubscribe: unsubscribe
	   };

	   var configLocales_ = configuration.get('i18n.locales', { 'default': 'en' });
	   var i18n = void 0;
	   var initialized = void 0;

	   ////////////////////////////////////////////////////////////////////////////////////////////////////////

	   function handleRequest(event) {
	      i18n[event.locale] = event.languageTag;
	      if (initialized) {
	         publish(event.locale);
	      }
	   }

	   ////////////////////////////////////////////////////////////////////////////////////////////////////////

	   function publish(locale) {
	      var event = { locale: locale, languageTag: i18n[locale] };
	      return eventBus.publish('didChangeLocale.' + locale, event, senderOptions);
	   }

	   ////////////////////////////////////////////////////////////////////////////////////////////////////////

	   function initialize() {
	      initialized = true;
	      return Promise.all(Object.keys(configLocales_).map(publish));
	   }

	   ////////////////////////////////////////////////////////////////////////////////////////////////////////

	   function unsubscribe() {
	      eventBus.unsubscribe(handleRequest);
	   }

	   ////////////////////////////////////////////////////////////////////////////////////////////////////////

	   function subscribe() {
	      i18n = (0, _object.deepClone)(configLocales_);
	      initialized = false;

	      eventBus.subscribe('changeLocaleRequest', handleRequest, subscriberOptions);
	   }

	   ////////////////////////////////////////////////////////////////////////////////////////////////////////

	   return exports;
	}

/***/ },
/* 34 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	   value: true
	});
	exports.create = create;
	/**
	 * Copyright 2016 aixigo AG
	 * Released under the MIT license.
	 * http://laxarjs.org/license
	 */
	var senderOptions = { sender: 'AxPageController', deliverToSender: false };
	var subscriberOptions = { subscriber: 'AxPageController' };

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * The visibility event manager initializes and coordinates events for widget area visibility.
	 *
	 * It subscribes to all visibility changes and propagates them to nested widget areas
	 * (if applicable). It is not concerned with the resulting DOM-visibility of individual controls:
	 * the `axVisibilityService` takes care of that.
	 *
	 * @return {{initialize: Function}}
	 *    a function to trigger initialization of the manager and initial widget visibility
	 */
	function create(eventBus) {

	   var exports = {
	      initialize: initialize,
	      setAreaHelper: setAreaHelper,
	      unsubscribe: unsubscribe
	   };

	   var areaHelper_ = void 0;
	   var ROOT = '';

	   function setAreaHelper(areaHelper) {
	      areaHelper_ = areaHelper;
	   }

	   ////////////////////////////////////////////////////////////////////////////////////////////////////////

	   function initialize() {
	      // broadcast visibility changes in individual widgets to their nested areas
	      eventBus.subscribe('changeWidgetVisibilityRequest', handleChangeWidgetRequest, subscriberOptions);

	      // broadcast visibility changes in widget areas to their nested areas
	      eventBus.subscribe('changeAreaVisibilityRequest', handleChangeAreaRequest, subscriberOptions);

	      return implementAreaChange(ROOT, true);
	   }

	   ////////////////////////////////////////////////////////////////////////////////////////////////////////

	   function handleChangeWidgetRequest(event) {
	      var affectedAreas = areaHelper_.areasInWidget(event.widget);
	      var will = ['willChangeWidgetVisibility', event.widget, event.visible].join('.');
	      var did = ['didChangeWidgetVisibility', event.widget, event.visible].join('.');

	      eventBus.publish(will, event, senderOptions);

	      Promise.all((affectedAreas || []).map(event.visible ? show : hide)).then(function () {
	         return eventBus.publish(did, event, senderOptions);
	      });
	   }

	   ////////////////////////////////////////////////////////////////////////////////////////////////////////

	   function handleChangeAreaRequest(event) {
	      return initiateAreaChange(event.area, event.visible);
	   }

	   ////////////////////////////////////////////////////////////////////////////////////////////////////////

	   function show(area) {
	      return requestAreaChange(area, true);
	   }

	   ////////////////////////////////////////////////////////////////////////////////////////////////////////

	   function hide(area) {
	      return requestAreaChange(area, false);
	   }

	   ////////////////////////////////////////////////////////////////////////////////////////////////////////

	   /**
	    * First, publish a `changeAreaVisibilityRequest` to ask if some widget would like to manage the
	    * given area's visibility.
	    * If no widget responds, self-issue a will/did-response to notify interested widgets in the area
	    * of their new visibility status.
	    * In either case, manage the propagation to nested areas and inform the area helper so that it
	    * may compile and attach the templates of any newly visible widgets.
	    *
	    * @param {String} area
	    *    the area whose visibility to update
	    * @param {Boolean} visible
	    *    the new visibility state of the given area, to the best knowledge of the client
	    */
	   function requestAreaChange(area, visible) {
	      var request = ['changeAreaVisibilityRequest', area].join('.');
	      var event = { area: area, visible: visible };
	      return eventBus.publishAndGatherReplies(request, event, senderOptions).then(function (responses) {
	         if (responses.length === 0) {
	            // no one took responsibility, so the event manager determines visibility by area nesting
	            return initiateAreaChange(area, visible);
	         }
	         // assume the first 'did'-response to be authoritative:
	         var response = responses[0];
	         return implementAreaChange(area, response.event.visible);
	      });
	   }

	   ////////////////////////////////////////////////////////////////////////////////////////////////////////

	   /**
	    * Set the new visibility state for the given area, then issue requests for the child areas.
	    * Inform the area helper so that it may compile and attach the templates of any newly visible
	    * widgets.
	    */
	   function initiateAreaChange(area, visible) {
	      var will = ['willChangeAreaVisibility', area, visible].join('.');
	      var event = { area: area, visible: visible };
	      return eventBus.publish(will, event, senderOptions).then(function () {
	         return implementAreaChange(area, visible);
	      }).then(function () {
	         var did = ['didChangeAreaVisibility', area, visible].join('.');
	         return eventBus.publish(did, event, senderOptions);
	      });
	   }

	   ////////////////////////////////////////////////////////////////////////////////////////////////////////

	   function implementAreaChange(ofArea, areaVisible) {
	      areaHelper_.setVisibility(ofArea, areaVisible);
	      var children = areaHelper_.areasInArea(ofArea);
	      if (!children) {
	         return Promise.resolve();
	      }

	      return Promise.all(children.map(areaVisible ? show : hide));
	   }

	   ////////////////////////////////////////////////////////////////////////////////////////////////////////

	   function unsubscribe() {
	      eventBus.unsubscribe(handleChangeAreaRequest);
	      eventBus.unsubscribe(handleChangeWidgetRequest);
	   }

	   ////////////////////////////////////////////////////////////////////////////////////////////////////////

	   return exports;
	}

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	   value: true
	});
	exports.create = create;

	var _object = __webpack_require__(4);

	var _path = __webpack_require__(8);

	var path = _interopRequireWildcard(_path);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	/**
	 * Copyright 2016 aixigo AG
	 * Released under the MIT license.
	 * http://laxarjs.org/license
	 */
	function create(configuration, themeManager, productPath) {
	   var mergedCssFileLoaded = [].some.call(document.getElementsByTagName('link'), function (link) {
	      return link.hasAttribute('data-ax-merged-css');
	   });

	   if (mergedCssFileLoaded) {
	      return { load: function load() {} };
	   }

	   var loadedFiles = [];
	   var loader = {
	      /**
	       * If not already loaded, loads the given file into the current page by appending a `link` element to
	       * the document's `head` element.
	       *
	       * Additionally it works around a
	       * [style sheet limit](http://support.microsoft.com/kb/262161) in older Internet Explorers
	       * (version < 10). The workaround is based on
	       * [this test](http://john.albin.net/ie-css-limits/993-style-test.html).
	       *
	       * @param {String} url
	       *    the url of the css file to load
	       *
	       * @memberOf axCssLoader
	       */
	      load: function load(url) {

	         if (loadedFiles.indexOf(url) === -1) {
	            if (hasStyleSheetLimit()) {
	               // Here we most probably have an Internet Explorer having the limit of at most 31 stylesheets
	               // per page. As a workaround we use style tags with import statements. Each style tag may
	               // have 31 import statement. This gives us 31 * 31 = 961 possible stylesheets to include ...
	               // Link to the problem on microsoft.com: http://support.microsoft.com/kb/262161
	               // Solution based on ideas found here: http://john.albin.net/css/ie-stylesheets-not-loading

	               var styleManagerId = 'cssLoaderStyleSheet' + Math.floor(loadedFiles.length / 30);
	               if (!document.getElementById(styleManagerId)) {
	                  addHeadElement('style', {
	                     type: 'text/css',
	                     id: styleManagerId
	                  });
	               }

	               document.getElementById(styleManagerId).styleSheet.addImport(url);
	            } else {
	               addHeadElement('link', {
	                  type: 'text/css',
	                  id: 'cssLoaderStyleSheet' + loadedFiles.length,
	                  rel: 'stylesheet',
	                  href: url
	               });
	            }

	            loadedFiles.push(url);
	         }
	      }
	   };

	   if (configuration.get('useMergedCss', false)) {
	      loader.load(path.join(productPath, 'const/static/css', themeManager.getTheme() + '.theme.css'));
	      return { load: function load() {} };
	   }

	   return loader;

	   ////////////////////////////////////////////////////////////////////////////////////////////////////////

	   function hasStyleSheetLimit() {
	      if (typeof hasStyleSheetLimit.result !== 'boolean') {
	         hasStyleSheetLimit.result = false;
	         if (document.createStyleSheet) {
	            var uaMatch = navigator.userAgent.match(/MSIE ?(\d+(\.\d+)?)[^\d]/i);
	            if (!uaMatch || parseFloat(uaMatch[1]) < 10) {
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

	   function addHeadElement(elementName, attributes) {
	      var element = document.createElement(elementName);
	      (0, _object.forEach)(attributes, function (val, key) {
	         element[key] = val;
	      });
	      document.getElementsByTagName('head')[0].appendChild(element);
	   }
	};

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	   value: true
	});
	exports.create = create;

	var _path = __webpack_require__(8);

	var path = _interopRequireWildcard(_path);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function create(layoutsRoot, themesRoot, cssLoader, themeManager, fileResourceProvider, cache) {
	   return {
	      load: function load(layout) {
	         return resolveLayout(layout).then(function (layoutInfo) {
	            if (layoutInfo.css) {
	               cssLoader.load(layoutInfo.css);
	            }
	            if (layoutInfo.html) {
	               return fileResourceProvider.provide(layoutInfo.html).then(function (htmlContent) {
	                  layoutInfo.htmlContent = htmlContent;
	                  if (cache) {
	                     cache.put(layoutInfo.html, htmlContent);
	                  }
	                  return layoutInfo;
	               });
	            }
	            return layoutInfo;
	         });
	      }
	   };

	   ////////////////////////////////////////////////////////////////////////////////////////////////////////

	   function resolveLayout(layout) {
	      var layoutPath = path.join(layoutsRoot, layout);
	      var layoutName = layoutPath.substr(layoutPath.lastIndexOf('/') + 1);
	      var layoutFile = layoutName + '.html';
	      var cssFile = 'css/' + layoutName + '.css';

	      return themeManager.urlProvider(path.join(layoutPath, '[theme]'), path.join(themesRoot, '[theme]', 'layouts', layout)).provide([layoutFile, cssFile]).then(function (results) {
	         return {
	            html: results[0],
	            css: results[1],
	            className: layoutName.replace(/\//g, '').replace(/_/g, '-') + '-layout'
	         };
	      });
	   }
	} /**
	   * Copyright 2016 aixigo AG
	   * Released under the MIT license.
	   * http://laxarjs.org/license
	   */

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	   value: true
	});

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; /**
	                                                                                                                                                                                                                                                   * Copyright 2016 aixigo AG
	                                                                                                                                                                                                                                                   * Released under the MIT license.
	                                                                                                                                                                                                                                                   * http://laxarjs.org/license
	                                                                                                                                                                                                                                                   */


	exports.create = create;

	var _assert = __webpack_require__(2);

	var _assert2 = _interopRequireDefault(_assert);

	var _object = __webpack_require__(4);

	var object = _interopRequireWildcard(_object);

	var _string = __webpack_require__(10);

	var string = _interopRequireWildcard(_string);

	var _path = __webpack_require__(8);

	var path = _interopRequireWildcard(_path);

	var _validator = __webpack_require__(13);

	var jsonValidator = _interopRequireWildcard(_validator);

	var _features_provider = __webpack_require__(12);

	var featuresProvider = _interopRequireWildcard(_features_provider);

	var _pages = __webpack_require__(18);

	var _pages2 = _interopRequireDefault(_pages);

	var _page = __webpack_require__(38);

	var _page2 = _interopRequireDefault(_page);

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var SEGMENTS_MATCHER = /[_/-]./g;

	var ID_SEPARATOR = '-';
	var ID_SEPARATOR_MATCHER = /\-/g;
	var SUBTOPIC_SEPARATOR = '+';

	var JSON_SUFFIX_MATCHER = /\.json$/;
	var COMPOSITION_EXPRESSION_MATCHER = /^(!?)\$\{([^}]+)\}$/;
	var COMPOSITION_TOPIC_PREFIX = 'topic:';

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function PageLoader(baseUrl, fileResourceProvider) {
	   this.baseUrl_ = baseUrl;
	   this.fileResourceProvider_ = fileResourceProvider;
	   this.idCounter_ = 0;
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Loads a page specification and resolves all extension and compositions. The result is a page were all
	 * referenced page fragments are merged in to one JavaScript object. As loading of all relevant files is
	 * already asynchronous, this method is also asynchronous and thus returns a promise that is either
	 * resolved with the constructed page or rejected with a JavaScript `Error` instance.
	 *
	 * @param {String} pageName
	 *    the page to load. This is in fact a path relative to the base url this page loader was instantiated
	 *    with and the `.json` suffix omitted
	 *
	 * @returns {Promise}
	 *    the result promise
	 *
	 * @private
	 */
	PageLoader.prototype.load = function (pageName) {
	   return loadPageRecursively(this, pageName, []);
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function loadPageRecursively(self, pageName, extensionChain) {
	   var page = void 0;
	   var pageUrl = assetUrl(self.baseUrl_, pageName);

	   if (extensionChain.indexOf(pageName) !== -1) {
	      throwError({ name: pageName }, 'Cycle in page extension detected: ' + extensionChain.concat([pageName]).join(' -> '));
	   }

	   return load(self, pageUrl).then(function (foundPage) {
	      validatePage(foundPage, pageName);

	      page = foundPage;
	      page.name = pageName.replace(JSON_SUFFIX_MATCHER, '');

	      if (!page.areas) {
	         page.areas = {};
	      }
	   }, function () {
	      throwError({ name: pageName }, 'Page could not be found at location "' + pageUrl + '"');
	   }).then(function () {
	      return processExtends(self, page, extensionChain);
	   }).then(function () {
	      generateMissingIds(self, page);
	      // we need to check ids before and after expanding compositions
	      checkForDuplicateIds(self, page);
	      return processCompositions(self, page, pageName);
	   }).then(function () {
	      checkForDuplicateIds(self, page);
	      removeDisabledWidgets(self, page);
	   }).then(function () {
	      _pages2.default.setPageDefinition(pageName, page, _pages2.default.FLAT);
	      return page;
	   });
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	// Processing inheritance (i.e. the `extends` keyword)
	//
	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function processExtends(self, page, extensionChain) {
	   if (has(page, 'extends')) {
	      return loadPageRecursively(self, page['extends'], extensionChain.concat([page.name])).then(function (basePage) {
	         mergePageWithBasePage(page, basePage);
	      });
	   }
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function mergePageWithBasePage(page, basePage) {
	   var extendingAreas = page.areas;
	   var mergedPageAreas = object.deepClone(basePage.areas);
	   if (has(basePage, 'layout')) {
	      if (has(page, 'layout')) {
	         throwError(page, string.format('Page overwrites layout set by base page "[name]', basePage));
	      }
	      page.layout = basePage.layout;
	   }

	   object.forEach(extendingAreas, function (widgets, areaName) {
	      if (!(areaName in mergedPageAreas)) {
	         mergedPageAreas[areaName] = widgets;
	         return;
	      }

	      mergeWidgetLists(mergedPageAreas[areaName], widgets, page);
	   });

	   page.areas = mergedPageAreas;
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	// Processing compositions
	//
	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function processCompositions(self, topPage, topPageName) {

	   return processNestedCompositions(topPage, null, []);

	   function processNestedCompositions(page, instanceId, compositionChain) {

	      var promise = Promise.resolve();

	      object.forEach(page.areas, function (widgets) {
	         /*jshint loopfunc:true*/
	         for (var i = widgets.length - 1; i >= 0; --i) {
	            (function (widgetSpec) {
	               if (widgetSpec.enabled === false) {
	                  return;
	               }
	               ensureWidgetSpecHasId(self, widgetSpec);

	               if (has(widgetSpec, 'widget')) {
	                  return;
	               }

	               if (has(widgetSpec, 'composition')) {
	                  (function () {
	                     var compositionName = widgetSpec.composition;
	                     if (compositionChain.indexOf(compositionName) !== -1) {
	                        var message = 'Cycle in compositions detected: ' + compositionChain.concat([compositionName]).join(' -> ');
	                        throwError(topPage, message);
	                     }

	                     // Loading compositionUrl can be started asynchronously, but replacing the according widgets
	                     // in the page needs to take place in order. Otherwise the order of widgets could be messed up.
	                     promise = promise.then(function () {
	                        return load(self, assetUrl(self.baseUrl_, compositionName));
	                     }).then(function (composition) {
	                        return prefixCompositionIds(composition, widgetSpec);
	                     }).then(function (composition) {
	                        return processCompositionExpressions(composition, widgetSpec, function (message) {
	                           var messagePrefix = 'Error loading composition "' + compositionName + '"' + ' (id: "' + widgetSpec.id + '"). ';
	                           throwError({ name: page.name }, messagePrefix + message);
	                        });
	                     }).then(function (composition) {
	                        var chain = compositionChain.concat(compositionName);
	                        return processNestedCompositions(composition, widgetSpec.id, chain).then(function () {
	                           _pages2.default.setCompositionDefinition(topPageName, widgetSpec.id, composition, _pages2.default.FLAT);
	                           return composition;
	                        });
	                     }).then(function (composition) {
	                        mergeCompositionAreasWithPageAreas(composition, page, widgets, widgetSpec);
	                     });
	                  })();
	               }
	            })(widgets[i]);
	         }
	      });

	      // now that all IDs have been created, we can store a copy of the page prior to composition expansion
	      if (page === topPage) {
	         _pages2.default.setPageDefinition(topPageName, page, _pages2.default.COMPACT);
	      } else {
	         _pages2.default.setCompositionDefinition(topPageName, instanceId, page, _pages2.default.COMPACT);
	      }

	      return promise;
	   }
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function mergeCompositionAreasWithPageAreas(composition, page, widgets, compositionSpec) {
	   object.forEach(composition.areas, function (compositionAreaWidgets, areaName) {
	      if (areaName === '.') {
	         insertAfterEntry(widgets, compositionSpec, compositionAreaWidgets);
	         return;
	      }

	      if (!(areaName in page.areas)) {
	         page.areas[areaName] = compositionAreaWidgets;
	         return;
	      }

	      mergeWidgetLists(page.areas[areaName], compositionAreaWidgets, page);
	   });

	   removeEntry(widgets, compositionSpec);

	   function insertAfterEntry(arr, entry, replacements) {
	      var index = arr.indexOf(entry);
	      arr.splice.apply(arr, [index, 0].concat(replacements));
	   }

	   function removeEntry(arr, entry) {
	      var index = arr.indexOf(entry);
	      arr.splice(index, 1);
	   }
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function prefixCompositionIds(composition, widgetSpec) {
	   var prefixedAreas = {};
	   object.forEach(composition.areas, function (widgets, areaName) {
	      widgets.forEach(function (widget) {
	         if (has(widget, 'id')) {
	            widget.id = widgetSpec.id + ID_SEPARATOR + widget.id;
	         }
	      });

	      if (areaName.indexOf('.') > 0) {
	         // All areas prefixed with a local widget id need to be prefixed as well
	         prefixedAreas[widgetSpec.id + ID_SEPARATOR + areaName] = widgets;
	         return;
	      }

	      prefixedAreas[areaName] = widgets;
	   });
	   composition.areas = prefixedAreas;
	   return composition;
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function processCompositionExpressions(composition, widgetSpec, throwPageError) {
	   var expressionData = {};

	   // feature definitions in compositions may contain generated topics for default resource names or action
	   // topics. As such these are generated before instantiating the composition's features.
	   composition.features = iterateOverExpressions(composition.features || {}, replaceExpression);
	   expressionData.features = featuresProvider.featuresForWidget(composition, widgetSpec, throwPageError);

	   if (_typeof(composition.mergedFeatures) === 'object') {
	      (function () {
	         var mergedFeatures = iterateOverExpressions(composition.mergedFeatures, replaceExpression);

	         Object.keys(mergedFeatures).forEach(function (featurePath) {
	            var currentValue = object.path(expressionData.features, featurePath, []);
	            var values = mergedFeatures[featurePath];
	            object.setPath(expressionData.features, featurePath, values.concat(currentValue));
	         });
	      })();
	   }

	   composition.areas = iterateOverExpressions(composition.areas, replaceExpression);

	   function replaceExpression(subject) {
	      var matches = subject.match(COMPOSITION_EXPRESSION_MATCHER);
	      if (!matches) {
	         return subject;
	      }

	      var possibleNegation = matches[1];
	      var expression = matches[2];
	      var result = void 0;
	      if (expression.indexOf(COMPOSITION_TOPIC_PREFIX) === 0) {
	         result = topicFromId(widgetSpec.id) + SUBTOPIC_SEPARATOR + expression.substr(COMPOSITION_TOPIC_PREFIX.length);
	      } else {
	         result = object.path(expressionData, expression);
	      }

	      return typeof result === 'string' && possibleNegation ? possibleNegation + result : result;
	   }

	   return composition;
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function iterateOverExpressions(obj, replacer) {
	   if (obj === null) {
	      return obj;
	   }

	   if (Array.isArray(obj)) {
	      return obj.map(function (value) {
	         if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
	            return iterateOverExpressions(value, replacer);
	         }

	         return typeof value === 'string' ? replacer(value) : value;
	      }).filter(function (item) {
	         return typeof item !== 'undefined';
	      });
	   }

	   var result = {};
	   object.forEach(obj, function (value, key) {
	      var replacedKey = replacer(key);
	      if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
	         result[replacedKey] = iterateOverExpressions(value, replacer);
	         return;
	      }

	      var replacedValue = typeof value === 'string' ? replacer(value) : value;
	      if (typeof replacedValue !== 'undefined') {
	         result[replacedKey] = replacedValue;
	      }
	   });

	   return result;
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	// Additional Tasks
	//
	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function removeDisabledWidgets(self, page) {

	   object.forEach(page.areas, function (widgetList, index) {
	      page.areas[index] = widgetList.filter(function (widgetSpec) {
	         if (widgetSpec.enabled === false) {
	            return false;
	         }
	         return true;
	      });
	   });
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function checkForDuplicateIds(self, page) {
	   var idCount = {};

	   object.forEach(page.areas, function (widgetList) {
	      object.forEach(widgetList, function (widgetSpec) {
	         idCount[widgetSpec.id] = idCount[widgetSpec.id] ? idCount[widgetSpec.id] + 1 : 1;
	      });
	   });

	   var duplicates = Object.keys(idCount).filter(function (widgetId) {
	      return idCount[widgetId] > 1;
	   });

	   if (duplicates.length) {
	      throwError(page, 'Duplicate widget/composition ID(s): ' + duplicates.join(', '));
	   }
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function generateDefaultWidgetSpecName(widgetSpec) {
	   return artifactName().replace(SEGMENTS_MATCHER, dashToCamelcase);

	   function artifactName() {
	      if (widgetSpec.hasOwnProperty('widget')) {
	         return widgetSpec.widget.split('/').pop();
	      }
	      if (widgetSpec.hasOwnProperty('composition')) {
	         return widgetSpec.composition;
	      }
	      if (widgetSpec.hasOwnProperty('layout')) {
	         return widgetSpec.layout;
	      }
	      // Assume that non-standard items do not require a specific name.
	      return '';
	   }
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function ensureWidgetSpecHasId(self, widgetSpec) {
	   if (widgetSpec.hasOwnProperty('id')) {
	      return;
	   }
	   widgetSpec.id = nextId(self, generateDefaultWidgetSpecName(widgetSpec));
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function generateMissingIds(self, page) {
	   object.forEach(page.areas, function (widgetList) {
	      object.forEach(widgetList, function (widgetSpec) {
	         ensureWidgetSpecHasId(self, widgetSpec);
	      });
	   });
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function validatePage(foundPage, pageName) {
	   var result = jsonValidator.create(_page2.default).validate(foundPage);
	   if (result.errors.length) {
	      var errorString = result.errors.reduce(function (errorString, errorItem) {
	         return errorString + '\n - ' + errorItem.message;
	      }, '');

	      throwError({ name: pageName }, 'Schema validation failed: ' + errorString);
	   }
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////
	//
	// Common functionality and utility functions
	//
	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function mergeWidgetLists(targetList, sourceList, page) {
	   sourceList.forEach(function (widgetConfiguration) {
	      if (widgetConfiguration.insertBeforeId) {
	         for (var i = 0, length = targetList.length; i < length; ++i) {
	            if (targetList[i].id === widgetConfiguration.insertBeforeId) {
	               targetList.splice(i, 0, widgetConfiguration);
	               return;
	            }
	         }

	         throwError(page, string.format('No id found that matches insertBeforeId value "[insertBeforeId]"', widgetConfiguration));
	      }

	      targetList.push(widgetConfiguration);
	   });
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function assetUrl(base, asset) {
	   if (!asset.match(JSON_SUFFIX_MATCHER)) {
	      asset += '.json';
	   }
	   return path.join(base, asset);
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function has(object, what) {
	   return typeof object[what] === 'string' && object[what].length;
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function load(self, url) {
	   return self.fileResourceProvider_.provide(url);
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function nextId(self, prefix) {
	   return prefix + ID_SEPARATOR + 'id' + self.idCounter_++;
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function dashToCamelcase(segmentStart) {
	   return segmentStart.charAt(1).toUpperCase();
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function topicFromId(id) {
	   return id.replace(ID_SEPARATOR_MATCHER, SUBTOPIC_SEPARATOR).replace(SEGMENTS_MATCHER, dashToCamelcase);
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function throwError(page, message) {
	   var text = string.format('Error loading page "[name]": [0]', [message], page);
	   throw new Error(text);
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Creates and returns a new page loader instance.
	 *
	 * @param {String} baseUrl
	 *    the url where all pages are located
	 * @param {FileResourceProvider} fileResourceProvider
	 *    a FileResourceProvider to load application assets

	 * @return {PageLoader}
	 *    a page loader instance
	 *
	 * @private
	 */
	function create(baseUrl, fileResourceProvider) {
	   (0, _assert2.default)(baseUrl).isNotNull();
	   (0, _assert2.default)(fileResourceProvider).isNotNull();

	   return new PageLoader(baseUrl, fileResourceProvider);
	}

/***/ },
/* 38 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	   value: true
	});
	/**
	 * Copyright 2016 aixigo AG
	 * Released under the MIT license.
	 * http://laxarjs.org/license
	 */
	exports.default = {
	   "$schema": "http://json-schema.org/draft-04/schema#",
	   "type": "object",
	   "properties": {

	      "layout": {
	         "type": "string",
	         "description": "The layout to use. May be omitted if another page in the extension hierarchy defines one."
	      },

	      "extends": {
	         "type": "string",
	         "description": "The name of the page to extend."
	      },

	      "areas": {
	         "type": "object",
	         "description": "A map from area name to a list of widgets to display within that area.",
	         "patternProperties": {
	            "^[a-z][\\.a-zA-Z0-9_]*$": {
	               "type": "array",
	               "items": {
	                  "type": "object",
	                  "properties": {

	                     "widget": {
	                        "type": "string",
	                        "description": "Path to the widget that should be rendered."
	                     },
	                     "composition": {
	                        "type": "string",
	                        "description": "Path to the composition that should be included."
	                     },
	                     "layout": {
	                        "type": "string",
	                        "description": "Path to the layout that should be inserted."
	                     },
	                     "id": {
	                        "type": "string",
	                        "pattern": "^[a-z][a-zA-Z0-9_]*$",
	                        "description": "ID of the widget or composition. Will be generated if missing."
	                     },
	                     "insertBeforeId": {
	                        "type": "string",
	                        "description": "The ID of the widget this widget or composition should be inserted before."
	                     },
	                     "features": {
	                        "type": "object",
	                        "description": "Configuration of the features defined by the widget or composition."
	                     },
	                     "enabled": {
	                        "type": "boolean",
	                        "default": true,
	                        "description": "Set to false to omit widgets e.g. for debugging purposes."
	                     }

	                  },
	                  "additionalProperties": false
	               }
	            }
	         },
	         "additionalProperties": false
	      }

	   },
	   "additionalProperties": false
	};

/***/ },
/* 39 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	   value: true
	});
	exports.bootstrap = bootstrap;
	exports.create = create;
	exports.applyViewChanges = applyViewChanges;
	/**
	 * Copyright 2016 aixigo AG
	 * Released under the MIT license.
	 * http://laxarjs.org/license
	 */
	var laxarServices = void 0;

	var widgetModules = {};

	var technology = exports.technology = 'plain';

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function bootstrap(modules, services) {
	   laxarServices = services;
	   modules.forEach(function (module) {
	      widgetModules[module.name] = module;
	   });
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 *
	 * @param {Object}      environment
	 * @param {HTMLElement} environment.anchorElement
	 * @param {Object}      environment.context
	 * @param {EventBus}    environment.context.eventBus
	 * @param {Object}      environment.context.features
	 * @param {Function}    environment.context.id
	 * @param {Object}      environment.context.widget
	 * @param {String}      environment.context.widget.area
	 * @param {String}      environment.context.widget.id
	 * @param {String}      environment.context.widget.path
	 * @param {Object}      environment.specification
	 *
	 * @return {Object}
	 */
	function create(environment) {

	   var exports = {
	      createController: createController,
	      domAttachTo: domAttachTo,
	      domDetach: domDetach,
	      destroy: function destroy() {}
	   };

	   var widgetName = environment.specification.name;
	   var moduleName = widgetName.replace(/^./, function (_) {
	      return _.toLowerCase();
	   });
	   var context = environment.context;
	   var controller = null;

	   ////////////////////////////////////////////////////////////////////////////////////////////////////////

	   function createController(config) {
	      var module = widgetModules[moduleName];
	      var availableInjections = {
	         axContext: context,
	         axEventBus: context.eventBus,
	         axFeatures: context.features || {},
	         axFlowService: laxarServices.flowService,
	         axConfiguration: laxarServices.configuration,
	         axGlobalEventBus: laxarServices.globalEventBus
	      };
	      var injections = (module.injections || []).map(function (injection) {
	         if (!(injection in availableInjections)) {
	            throw new Error('Trying to inject unknown service "' + injection + '".');
	         }
	         return availableInjections[injection];
	      });

	      config.onBeforeControllerCreation(environment, Object.freeze(availableInjections));
	      controller = module.create.apply(module, injections);
	   }

	   ////////////////////////////////////////////////////////////////////////////////////////////////////////

	   function domAttachTo(areaElement, htmlTemplate) {
	      if (htmlTemplate === null) {
	         return;
	      }

	      environment.anchorElement.innerHTML = htmlTemplate;
	      areaElement.appendChild(environment.anchorElement);
	      controller.renderTo(environment.anchorElement);
	   }

	   ////////////////////////////////////////////////////////////////////////////////////////////////////////

	   function domDetach() {
	      var parent = environment.anchorElement.parentNode;
	      if (parent) {
	         parent.removeChild(environment.anchorElement);
	      }
	   }

	   ////////////////////////////////////////////////////////////////////////////////////////////////////////

	   return exports;
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////

	function applyViewChanges() {
	   // no-op
	}

/***/ }
/******/ ])
});
;