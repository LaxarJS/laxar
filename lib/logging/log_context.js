/**
 * Copyright 2014 aixigo AG
 * Released under the MIT license.
 * http://laxarjs.org/license
 */
define( [
   '../utilities/assert',
   '../utilities/storage'
], function( assert, storage ) {
   'use strict';

   /**
    * A context for a logger instance. Each context manages a stack of scopes where each scope can hold a
    * different set of log tags. Initially a context already has one scope on its stack, that cannot be left.
    * Trying to do so will lead to an error. Thus each party entering a scope is also responsible for leaving
    * that scope again.
    *
    * @constructor
    */
   function LogContext() {
      this.scopes_ = [];
      this.enterScope();

      var store = storage.getSessionStorage();
      var instanceId = store.getItem( INST_SESSION_KEY );
      if( !instanceId ) {
         instanceId = '' + new Date().getTime() + Math.floor( Math.random() * 100 );
         store.setItem( INST_SESSION_KEY, instanceId );
      }
      this.addTag( 'INST', instanceId );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Enters a new scope by pushing a scope object with an empty set of tags onto the stack.
    */
   LogContext.prototype.enterScope = function() {
      this.scopes_.push( { tags: {} } );
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Leaves the current scope and thus discards all tags set on this scope. An error is raised if an attempt
    * to remove the root scope is made.
    */
   LogContext.prototype.leaveScope = function() {
      assert.state( this.scopes_.length > 1, 'Cannot leave the root scope.' );

      this.scopes_.pop();
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Adds a value for a log tag to the scope entered last, i.e. the one on the top of the stack. If a tag
    * is already known for the current scope, the value is appended to the existing one using a `;` as
    * separator. Note that no formatting of the value takes place and a non-string value will just have its
    * appropriate `toString` method called.
    *
    * @param {String} tag
    *    the id of the tag to add a value for
    * @param {String} value
    *    the value to add
    */
   LogContext.prototype.addTag = function( tag, value ) {
      assert( tag ).hasType( String ).isNotNull();

      var tags = this.scopes_[ this.scopes_.length - 1 ].tags;
      if( !tags[ tag ] ) {
         tags[ tag ] = value;
      }
      else {
         tags[ tag ] += ';' + value;
      }
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Sets a value for a log tag to the scope entered last, i.e. the one on the top of the stack. If a tag
    * is already known for the current scope, the value is overwritten by the given one. Note that no
    * formatting of the value takes place and a non-string value will just have its appropriate `toString`
    * method called.
    *
    * @param {String} tag
    *    the id of the tag to set a value for
    * @param {String} value
    *    the value to set
    */
   LogContext.prototype.setTag = function( tag, value ) {
      assert( tag ).hasType( String ).isNotNull();

      this.scopes_[ this.scopes_.length - 1 ].tags[ tag ] = value;
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   /**
    * Returns a map of all tags gathered from all scopes. If there are multiple values for the same tag across
    * different scopes, their values are concatenated using a `;` as separator.
    *
    * @return {Object}
    *    a mapping from tag to its value(s)
    */
   LogContext.prototype.gatherTags = function() {
      return this.scopes_.reduce( function( tags, scope ) {
         Object.keys( scope.tags ).forEach( function( tag ) {
            var value = scope.tags[ tag ];
            if( !tags[ tag ] ) {
               tags[ tag ] = value;
            }
            else {
               tags[ tag ] += ';' + value;
            }
         } );
         return tags;
      }, {} );
   };

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   var INST_SESSION_KEY =  'ax.log.tags.INST';

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return {

      /**
       * Creates and returns a new log context instance.
       *
       * @return {LogContext}
       */
      create: function() {
         return new LogContext();
      }

   };

} );
