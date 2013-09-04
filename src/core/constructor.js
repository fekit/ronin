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
//     functions: [
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

function L( host, data ) {
    var idx = 0;
    var funcSet = data.functions;

    storage.host = host;

    for ( ; idx < funcSet.length; idx++ ) {
        attach(funcSet[idx]);
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
    },

    remove: function( funcName ) {
        var func = storage.host[funcName];

        if ( isFunc(func) ) {
            delete func;
        }
    }
};

function attach( set ) {
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
            return validator.apply(window, arguments) === true && isFunc(handler) ? handler.apply(window, arguments) : value;
        };
    }
}

function isFunc( obj ) {
    return typeof obj === "function";
}

module.exports = L;

});
