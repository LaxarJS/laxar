/**
 * Copyright 2016 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */

/* eslint-disable quotes,max-len */
export default {
   "$schema": "http://json-schema.org/draft-04/schema#",
   "type": "object",
   "required": [ "places" ],
   "properties": {

      "redirectOn": {
         "type": "object",
         "description": "Globally defined redirects for certain edge cases",
         "properties": {
            "unknownPlace": {
               "type": "string",
               "description": "This place is loaded whenever the requested place doesn't exist."
            }
         },
         "default": {},
         "additionalProperties": false
      },

      "places": {
         "type": "object",
         "description": "The places for this flow.",
         "additionalProperties": {
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
               "defaultParameters": {
                  "type": "object",
                  "default": {},
                  "additionalProperties": {
                     "type": [ "string", "boolean", "null" ]
                  },
                  "description": "Default values for optional (query) parameters."
               },
               "targets": {
                  "type": "object",
                  "patternProperties": {
                     "[a-z][a-zA-Z0-9_]*": {
                        "type": "string"
                     }
                  },
                  "description": "A map of symbolic targets to places reachable from this place."
               }

            },
            "additionalProperties": false
         }
      }

   },
   "additionalProperties": false
};
