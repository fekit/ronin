/*!
 * Object
 * 
 * Developed by Ourai Lin, http://ourai.ws/
 * 
 * Copyright (c) 2013 JavaScript Revolution
 */
define(function( require, exports, module ) {

"use strict";

module.exports = {
    package: "Object",
    handlers: [
        /**
         * Get a set of keys/indexes.
         * It will return a key or an index when pass the 'value' parameter.
         *
         * @method  keys
         * @param   object {Object/Function}    被操作的目标
         * @param   value {Mixed}               指定值
         * @return  {Array/String}
         *
         * refer: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
         */
        {
            name: "keys",
            handler: function( object, value ) {
                var keys = [];

                this.each( object, function( v, k ) {
                    if ( v === value ) {
                        keys = k;

                        return false;
                    }
                    else {
                        keys.push( k );
                    }
                });

                return this.isArray( keys ) ? keys.sort() : keys;
            },
            validator: function( object ) {
                return object !== null && !(object instanceof Array) && typeof object in { "object": true, "function": true };
            },
            value: []
        }
    ]
};

});
