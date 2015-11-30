System.config({
  baseURL: "/",
  defaultJSExtensions: true,
  transpiler: "babel",
  babelOptions: {
    "optional": [
      "runtime",
      "optimisation.modules.system"
    ]
  },
  paths: {
    "github:*": "jspm_packages/github/*",
    "npm:*": "jspm_packages/npm/*"
  },
  bundles: {
    "laxar-dist.js": [
      "laxar.js",
      "npm:angular@1.4.8",
      "lib/logging/log.js",
      "lib/directives/directives.js",
      "lib/event_bus/event_bus.js",
      "lib/file_resource_provider/file_resource_provider.js",
      "lib/i18n/i18n.js",
      "lib/loaders/widget_loader.js",
      "lib/utilities/assert.js",
      "lib/utilities/configuration.js",
      "lib/utilities/fn.js",
      "lib/utilities/object.js",
      "lib/utilities/path.js",
      "lib/utilities/storage.js",
      "lib/utilities/string.js",
      "lib/runtime/runtime.js",
      "lib/runtime/runtime_dependencies.js",
      "lib/runtime/controls_service.js",
      "lib/runtime/theme_manager.js",
      "lib/widget_adapters/adapters.js",
      "lib/directives/id/id.js",
      "lib/logging/console_channel.js",
      "npm:angular@1.4.8/index",
      "lib/directives/layout/layout.js",
      "lib/directives/widget_area/widget_area.js",
      "lib/loaders/paths.js",
      "lib/loaders/features_provider.js",
      "npm:angular-sanitize@1.4.8",
      "lib/runtime/flow.js",
      "lib/runtime/runtime_services.js",
      "lib/runtime/page.js",
      "lib/widget_adapters/plain_adapter.js",
      "lib/profiling/profiling.js",
      "lib/widget_adapters/angular_adapter.js",
      "lib/json/validator.js",
      "lib/utilities/timer.js",
      "npm:angular-sanitize@1.4.8/index",
      "npm:angular-route@1.4.8",
      "lib/loaders/layout_loader.js",
      "npm:angular@1.4.8/angular",
      "lib/loaders/page_loader.js",
      "lib/runtime/layout_widget_adapter.js",
      "lib/runtime/area_helper.js",
      "lib/runtime/locale_event_manager.js",
      "lib/runtime/visibility_event_manager.js",
      "lib/profiling/output.js",
      "npm:jjve@0.5.1",
      "npm:jjv@1.0.2",
      "lib/json/schema.js",
      "npm:angular-route@1.4.8/index",
      "npm:angular-sanitize@1.4.8/angular-sanitize",
      "github:jspm/nodelibs-process@0.1.2",
      "npm:jjve@0.5.1/jjve",
      "github:jspm/nodelibs-process@0.1.2/index",
      "npm:angular-route@1.4.8/angular-route",
      "npm:jjv@1.0.2/index",
      "static/schemas/flow.js",
      "static/schemas/page.js",
      "npm:process@0.11.2",
      "npm:jjv@1.0.2/lib/jjv",
      "npm:process@0.11.2/browser"
    ]
  },

  map: {
    "angular": "npm:angular@1.4.8",
    "angular-route": "npm:angular-route@1.4.8",
    "angular-sanitize": "npm:angular-sanitize@1.4.8",
    "babel": "npm:babel-core@5.8.34",
    "babel-runtime": "npm:babel-runtime@5.8.34",
    "core-js": "npm:core-js@1.2.6",
    "jjv": "npm:jjv@1.0.2",
    "jjve": "npm:jjve@0.5.1",
    "github:jspm/nodelibs-assert@0.1.0": {
      "assert": "npm:assert@1.3.0"
    },
    "github:jspm/nodelibs-path@0.1.0": {
      "path-browserify": "npm:path-browserify@0.0.0"
    },
    "github:jspm/nodelibs-process@0.1.2": {
      "process": "npm:process@0.11.2"
    },
    "github:jspm/nodelibs-util@0.1.0": {
      "util": "npm:util@0.10.3"
    },
    "npm:angular@1.4.8": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:assert@1.3.0": {
      "util": "npm:util@0.10.3"
    },
    "npm:babel-runtime@5.8.34": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:core-js@1.2.6": {
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:inherits@2.0.1": {
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:jjv@1.0.2": {
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:path-browserify@0.0.0": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:process@0.11.2": {
      "assert": "github:jspm/nodelibs-assert@0.1.0"
    },
    "npm:util@0.10.3": {
      "inherits": "npm:inherits@2.0.1",
      "process": "github:jspm/nodelibs-process@0.1.2"
    }
  }
});
