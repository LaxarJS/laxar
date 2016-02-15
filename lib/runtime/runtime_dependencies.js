/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
import ng from 'angular';
import * as ngSanitizeModule from 'angular-sanitize';
import * as runtimeServicesModule from './runtime_services';
import * as flowModule from './flow';
import * as pageModule from './page';
import * as directives from '../directives/directives';
import * as profilingModule from '../profiling/profiling';

export const name = ng.module( 'axRuntimeDependencies', [
   'ngSanitize',

   runtimeServicesModule.name,
   flowModule.name,
   pageModule.name,
   directives.id.name,
   directives.widgetArea.name,
   profilingModule.name
] ).name;
