/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
//>>includeStart("disableJsonValidation", pragmas.disableJsonValidation);
   './permissive-validator',
//>>includeEnd("disableJsonValidation");
//>>excludeStart("disableJsonValidation", pragmas.disableJsonValidation);
   './real-validator',
//>>excludeEnd("disableJsonValidation");
   './schema' // not really needed, only used as a syntactic hack, to make this file parse without preprocessing
], function(
//>>includeStart("disableJsonValidation", pragmas.disableJsonValidation);
   permissiveValidator,
//>>includeEnd("disableJsonValidation");
//>>excludeStart("disableJsonValidation", pragmas.disableJsonValidation);
   realValidator,
//>>excludeEnd("disableJsonValidation");
   schema  ) {
   'use strict';
   var validator;
//>>includeStart("disableJsonValidation", pragmas.disableJsonValidation);
   validator = permissiveValidator;
//>>includeEnd("disableJsonValidation");
//>>excludeStart("disableJsonValidation", pragmas.disableJsonValidation);
   validator = realValidator;
//>>excludeEnd("disableJsonValidation");
   return validator;
} );
