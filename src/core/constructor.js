/*!
 * Core
 * 
 * Developed by Ourai Lin, http://ourai.ws/
 * 
 * Copyright (c) 2013 JavaScript Revolution
 */
define(function( require, exports, module ) {

"use strict";

// default settings
var settings = {
        validator: function() {}
    };
// storage for internal usage
var storage = {
        host: null,
        types: {},
        modules: {}
    };

/**
 * Constructor
 *
 * @method  C
 * @param   host {Object/String}
 * @param   data {Array}
 * @param   context {Mixed}
 * @return
 */
function C( host, data, context ) {
    // Handle's default context is the host variable.
    if ( arguments.length < 3 ) {
        context = host;
    }

    if ( C.isArray(data) ) {
        C.each( data, function( d ) {
            batch( d.handlers, d, context );
        });
    }
    else if ( C.isObject(data) ) {
        batch( data.handlers, data, context );
    }
}

C.mixin = function() {
    var args = arguments;
    var target = args[0] || {};
    var i = 1;

    // 只传一个参数时，扩展自身
    if ( args.length === 1 ) {
        target = this;
        i--;
    }

    for ( ; i < args.length; i++ ) {
        var opts = args[i];

        if ( typeof opts === "object" ) {
            var name;

            for ( name in opts ) {
                var copy = opts[name];

                // 阻止无限循环
                if ( copy === target ) {
                    continue;
                }

                if ( copy !== undefined ) {
                    target[name] = copy;
                }
            }
        }
    }

    return target;
};

C.mixin({
    each: function ( object, callback ) {
        var type = this.type( object );
        var index = 0;
        var name;

        if ( type in { "object": true, "function": true } ) {
            for ( name in object ) {
                if ( callback.apply( object[name], [ object[name], name, object ] ) === false ) {
                    break;
                }
            }
        }
        else if ( type in { "array": true, "string": true } ) {
            var ele;

            for ( ; index < object.length; ) {
                if ( type === "array" ) {
                    ele = object[index];
                }
                else {
                    ele = object.charAt(index);
                }

                if ( callback.apply( object[index], [ ele, index++, object ] ) === false ) {
                    break;
                }
            }
        }

        return object;
    },

    type: function( object ) {
        return object == null ? String(object) : storage.types[ toString.call(object) ] || "object";
    }
});

C.each( "Boolean Number String Function Array Date RegExp Object".split(" "), function( name, i ) {
        var lc = name.toLowerCase();

        // populate the storage.types map
        storage.types["[object " + name + "]"] = lc;

        // add methods such as isNumber/isBoolean/...
        C["is" + name] = function( obj ) {
            return this.type(obj) === lc;
        };
    }
);

C.modules = storage.modules;

// Override global setting
// C.config = function( setting ) {
//     var key;

//     for ( key in setting ) {
//         settings[key] = setting[key];
//     }
// };

C.prototype = {
    add: function( set ) {
        return attach(set);
    }
};

function batch( set, data, context ) {
    C.each( set, function( info ) {
        attach(info, data, context);
    });
}

function attach( set, data, context ) {
    var host = data.module;
    var name = set.name;

    // Generate an object when the host variable is a namespace string.
    if ( C.isString( host ) && /^[0-9A-Z_.]+[^_.]$/i.test( host ) ) {
        var obj = storage.modules;

        C.each( host.split("."), function( part, idx ) {
            if ( obj[ part ] === undefined ) {
                obj[ part ] = {};
            }

            obj = obj[ part ];
        });

        host = obj;
    }

    if ( !C.isFunction(host[name]) ) {
        var handler = set.handler;
        var value = set.value === undefined ? data.value : set.value;
        var validators = [set.validator, data.validator, settings.validator, function() {}];
        var validator;
        
        for ( var idx = 0; idx < validators.length; idx++ ) {
            validator = validators[idx];

            if ( C.isFunction(validator) ) {
                break;
            }
        }

        host[name] = function() {
            return validator.apply(context, arguments) === true && C.isFunction(handler) ? handler.apply(context, arguments) : value;
        };
    }
}

module.exports = C;

});
