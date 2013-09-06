/*!
 * Constructor
 * 
 * Developed by Ourai Lin, http://ourai.ws/
 * 
 * Copyright (c) 2013 JavaScript Revolution
 */
define(function( require, exports, module ) {

"use strict";

// {
//     package: "String",
//     handlers: [
//         {
//             name: "example"
//             value: null,
//             validator: function() {},
//             handler: function() {}
//         }
//     ]
// }
var settings = {
        validator: function() {}
    };
var storage = {};

function L( host, data, context ) {
    storage.host = host;

    if ( arguments.length < 3 ) {
        context = host;
    }

    if ( data instanceof Array ) {
        var idx = 0;

        for ( ; idx < data.length; idx++ ) {
            batch( data[idx].handlers, data[idx].package, context );
        }
    }
    else {
        batch( data.handlers, data.package, context );
    }
}

// Override global setting
L.config = function( setting ) {
    var key;

    for ( key in setting ) {
        settings[key] = setting[key];
    }
};

L.prototype = {
    add: function( set ) {
        return attach(set);
    }
};

function batch( set, pkg, context ) {
    var idx = 0;

    for ( ; idx < set.length; idx++ ) {
        attach(set[idx], pkg, context);
    }
}

function attach( set, pkg, context ) {
    var host = storage.host;
    var name = set.name;

    if ( !isFunc(host[name]) ) {
        var validator = set.validator;
        var handler = set.handler;
        var value = set.value;

        if ( !isFunc(validator) ) {
            validator = settings.validator;
        }

        if ( !isFunc(validator) ) {
            validator = function() {};
        }

        host[name] = function() {
            return validator.apply(context, arguments) === true && isFunc(handler) ? handler.apply(context, arguments) : value;
        };

        if ( typeof pkg === "string" ) {
            host[name].package = pkg;
        }
    }
}

function isFunc( obj ) {
    return typeof obj === "function";
}

module.exports = L;

});
