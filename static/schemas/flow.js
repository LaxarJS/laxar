
export const schema = {
   "$schema": "http://json-schema.org/draft-04/schema#",
   "type": "object",
   "required": [ "places" ],
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
