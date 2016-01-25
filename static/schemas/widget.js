export default {
   "$schema": "http://json-schema.org/draft-04/schema#",
   "type": "object",
   "required": [ "name", "description" ],
   "properties": {

      "name": {
         "type": "String",
         "description": "The name of the widget or activity in camel case syntax."
      },

      "description": {
         "type": "String",
         "description": "A short description of the purpose of this widget."
      },

      "integration": {
         "type": "object",
         "description": "How this widget should be loaded by the LaxarJS runtime.",
         "properties": {
            "type": {
               "type": "string",
               "description": "Type of the artifact, e.g. widget or activity.",
               "default": "widget"
            },
            "technology": {
               "type": "string",
               "description": "Underlying technology of the widget, which will be used to load the controller and template.",
               "default": "angular"
            }
         },
         "default": {
            "type": "widget",
            "technology": "angular"
         },
         "additionalProperties": false
      },

      "controls": {
         "type": "array",
         "description": "Each control as a path that can be resolved using requirejs",
         "default": [],
         "items": {
            "type": "string"
         }
      },

      "features": {
         "type": "object",
         "description": "A JSON schema for the widget feature configuration.",
         "default": {}
      },

      "compatibility": {
         "type": "array",
         "description": "Compatibility flags set for this widget",
         "default": [],
         "items": {
            "type": "string",
            "enum": [ "json-patch" ]
         }
      }

   },
   "additionalProperties": false
};
