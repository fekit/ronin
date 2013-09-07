/*!
 * Core
 * 
 * Developed by Ourai Lin, http://ourai.ws/
 * 
 * Copyright (c) 2013 JavaScript Revolution
 */
define(function( require, exports, module ) {

"use strict";

var _types = {};                // Object types
var _pool = {
        modules: {}             // collection of modules
    };
var _name;                      // library's original name
var _alias;                     // 记录别名的名字，只能设置一个别名

// Save a reference to some core methods
var toString = Object.prototype.toString;
var hasOwn = Object.prototype.hasOwnProperty;

// Method constructor
var Constructor = (function() {
        var settings = {
                validator: function() {}
            };
        var storage = {};

        function C( host, data, context ) {
            storage.host = host;

            if ( arguments.length < 3 ) {
                context = host;
            }

            if ( data instanceof Array ) {
                var idx = 0;

                for ( ; idx < data.length; idx++ ) {
                    batch( data[idx].handlers, data[idx], context );
                }
            }
            else {
                batch( data.handlers, data, context );
            }
        }

        // Override global setting
        C.config = function( setting ) {
            var key;

            for ( key in setting ) {
                settings[key] = setting[key];
            }
        };

        C.prototype = {
            add: function( set ) {
                return attach(set);
            }
        };

        function batch( set, data, context ) {
            var idx = 0;

            for ( ; idx < set.length; idx++ ) {
                attach(set[idx], data, context);
            }
        }

        function attach( set, data, context ) {
            var host = storage.host;
            var name = set.name;

            if ( !isFunc(host[name]) ) {
                var handler = set.handler;
                var value = set.value === undefined ? data.value : set.value;
                var validators = [set.validator, data.validator, settings.validator, function() {}];
                var validator;
                
                for ( var idx = 0; idx < validators.length; idx++ ) {
                    validator = validators[idx];

                    if ( isFunc(validator) ) {
                        break;
                    }
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

        return C;
    })();

// a shortname for Library
var L = {
    /**
     * 扩展指定对象
     * 
     * @method  mixin
     * @param   unspecified {Mixed}
     * @return  {Object}
     */
    mixin: function() {
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
    },

    /**
     * 将其他组件组装到核心对象上
     * 
     * @method  absorb
     * @param   object {Object}
     * @return
     */
    absorb: function( object ) {
        if ( this.isArray(object) ) {
            var inst = new Constructor(this, object);
        }

        return this;
    },

    /**
     * 遍历
     * 
     * @method  each
     * @param   object {Object/Array/Function}
     * @param   callback {Function}
     * @return  {Mixed}
     */
    each: function( object, callback ) {
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

    /**
     * Returns the namespace specified and creates it if it doesn't exist.
     * Be careful when naming packages.
     * Reserved words may work in some browsers and not others.
     *
     * @method  namespace
     * @param   [hostObj] {Object}      Host object namespace will be added to
     * @param   [ns_str_1] {String}     The first namespace string
     * @param   [ns_str_2] {String}     The second namespace string
     * @param   [ns_str_*] {String}     Numerous namespace string
     * @param   [global] {Boolean}      Whether set window as the host object
     * @return  {Object}                A reference to the last namespace object created
     */
    namespace: function() {
        var args = arguments;
        var lib = this;
        var ns = {};
        var hostObj = args[0];
        
        // Determine the host object.
        if ( !lib.isPlainObject( hostObj ) ) {
            hostObj = args[args.length - 1] === true ? window : this;
        }

        lib.each( args, function( arg ) {
            if ( lib.isString( arg ) && /^[0-9A-Z_.]+[^_.]$/i.test( arg ) ) {
                var obj = hostObj;

                lib.each( arg.split("."), function( part, idx, parts ) {
                    if ( obj[ part ] === undefined ) {
                        obj[ part ] = idx === parts.length - 1 ? null : {};
                    }

                    obj = obj[ part ];
                });

                ns = obj;
            }
        });

        return ns;
    },

    /**
     * 获取对象类型
     * 
     * @method  type
     * @param   object {Mixed}
     * @return  {String}
     */
    type: function( object ) {
        return object == null ? String(object) : _types[ toString.call(object) ] || "object";
    },

    /**
     * 判断是否为 window 对象
     * 
     * @method  isWindow
     * @param   object {Mixed}
     * @return  {String}
     */
    isWindow: function( object ) {
        return object && typeof object === "object" && "setInterval" in object;
    },

    /**
     * 判断是否为数字类型（字符串）
     * 
     * @method  isNumeric
     * @param   object {Mixed}
     * @return  {Boolean}
     */
    isNumeric: function( object ) {
        return !isNaN( parseFloat(object) ) && isFinite( object );
    },

    /**
     * Determine whether a number is an integer.
     *
     * @method  isInteger
     * @param   object {Mixed}
     * @return  {Boolean}
     */
    isInteger: function( object ) {
        return this.isNumeric( object ) && /^-?[1-9]\d*$/.test( object );
    },

    /**
     * 判断对象是否为纯粹的对象（由 {} 或 new Object 创建）
     * 
     * @method  isPlainObject
     * @param   object {Mixed}
     * @return  {Boolean}
     */
    isPlainObject: function( object ) {
        // This is a copy of jQuery 1.7.1.
        
        // Must be an Object.
        // Because of IE, we also have to check the presence of the constructor property.
        // Make sure that DOM nodes and window objects don't pass through, as well
        if ( !object || this.type( object ) !== "object" || object.nodeType || this.isWindow( object ) ) {
            return false;
        }

        try {
            // Not own constructor property must be Object
            if ( object.constructor &&
                !hasOwn.call(object, "constructor") &&
                !hasOwn.call(object.constructor.prototype, "isPrototypeOf") ) {
                return false;
            }
        }
        catch( e ) {
            // IE8,9 will throw exceptions on certain host objects
            return false;
        }

        var key;

        for ( key in object ) {
        }

        return key === undefined || hasOwn.call( object, key );
    },

    /**
     * Determin whether a variable is considered to be empty.
     *
     * A variable is considered empty if its value is or like:
     *  - null
     *  - undefined
     *  - false
     *  - ""
     *  - []
     *  - {}
     *  - 0
     *  - 0.0
     *  - "0"
     *  - "0.0"
     *
     * @method  isEmpty
     * @param   object {Mixed}
     * @return  {Boolean}
     *
     * refer: http://www.php.net/manual/en/function.empty.php
     */
    isEmpty: function( object ) {
        var result = false;

        if ( object == null || object == false ) {
            result = true;
        }
        else if ( typeof object === "object" ) {
            var name;

            result = true;

            for ( name in object ) {
                result = false;
                break;
            }
        }

        return result;
    },

    /**
     * 是否为类数组对象
     *
     * @method  isArrayLike
     * @param   object {Mixed}
     * @return  {Boolean}
     */
    isArraylike: function( object ) {
        var result = false;

        if ( typeof object === "object" && object !== null ) {
            if ( !this.isWindow( object ) ) {
                var type = this.type( object );
                var length = object.length;

                if ( object.nodeType === 1 && length ||
                    type === "array" ||
                    type !== "function" && (
                        length === 0 ||
                        this.isNumber(length) && length > 0 && ( length - 1 ) in object
                    ) ) {
                    result = true;
                }
            }
        }

        return result;
    },

    /**
     * Compares two objects for equality.
     *
     * @method  equal
     * @param   base {Mixed}
     * @param   target {Mixed}
     * @param   strict {Boolean}    whether compares the two objects' references
     * @return  {Boolean}
     */
    equal: function( base, target, strict ) {
        var result = false;
        var lib = this;
        var type_b = lib.type( base );

        if ( lib.type( target ) === type_b ) {
            var plain_b = lib.isPlainObject( base );

            if ( plain_b && lib.isPlainObject( target ) || type_b !== "object" ) {
                // 是否为“天然”的数组（以别于后来将字符串等转换成的数组）
                var connate = lib.isArray( base );

                if ( !plain_b && !connate ) {
                    base = [base];
                    target = [target];
                }

                // If 'strict' is true, then compare the objects' references, else only compare their values.
                if ( !lib.isBoolean( strict ) ) {
                    strict = false;
                }

                result = compareObjects.apply( lib, [base, target, strict, connate] );
            }
        }

        return result;
    },

    /**
     * Returns a random integer between min and max, inclusive.
     * If you only pass one argument, it will return a number between 0 and that number.
     *
     * @method  random
     * @param   min {Number}
     * @param   max {Number}
     * @return  {Number}
     */
    random: function( min, max ) {
        if ( max == null ) {
            max = min;
            min = 0;
        }

        return min + Math.floor( Math.random() * ( max - min + 1 ) );
    }
    /**
     * 别名
     * 
     * @method  alias
     * @param   name {String}
     * @return
     */
    /*alias: function( name ) {
        // 通过 _alias 判断是否已经设置过别名
        // 设置别名时要将原来的别名释放
        // 如果设置别名了，是否将原名所占的空间清除？（需要征求别人意见）

        if ( this.type( name ) === "string" ) {
            if ( window[name] === undefined ) {
                window[name] = this;
            }
        }

        return window[ String(name) ];
    },*/

    /**
     * 恢复原名
     * 
     * @method  revert
     * @return
     */
    // "revert": function() {},

    /**
     * 新建对象子集
     * 
     * @method  create
     * @param   namespace {String}  Name of sub-collection
     * @param   object {Object}     Object added to the main object
     * @return
     */
    /*create: function( namespace, object ) {
        this.namespace = object;
    },*/

    /**
     * 打印信息到控制台
     */
    // "log": function() {}
};

L.each(
    "Boolean Number String Function Array Date RegExp Object".split(" "),
    function( name, i ) {
        var lc = name.toLowerCase();

        // populate the _types map
        _types[ "[object " + name + "]" ] = lc;

        // add methods such as isNumber/isBoolean/...
        L[ "is" + name ] = function( obj ) {
            return L.type( obj ) === lc;
        };
    }
);

/**
 * Compare objects' values or references.
 * 
 * @private
 * @method  compareObjects
 * @param   base {Array/Object}
 * @param   target {Array/Object}
 * @param   strict {Boolean}
 * @param   connate {Boolean}
 * @return  {Boolean}
 */
function compareObjects( base, target, strict, connate ) {
    var result = false;
    var lib = this;
    var plain = lib.isPlainObject( base );

    if ( (plain || connate) && strict ) {
        result = target === base;
    }
    else {
        var isRun;

        if ( plain ) {
            isRun = compareObjects.apply( lib, [lib.keys( base ), lib.keys( target ), false, true] );
        }
        else {
            isRun = target.length === base.length;
        }
        
        if ( isRun ) {
            lib.each( base, function( n, i ) {
                var type = lib.type( n );

                if ( lib.inArray( type, ["string", "number", "boolean", "null", "undefined"] ) > -1 ) {
                    return result = target[i] === n;
                }
                else if ( lib.inArray( type, ["date", "regexp", "function"] ) > -1 ) {
                    return result = strict ? target[i] === n : target[i].toString() === n.toString();
                }
                else if ( lib.inArray( type, ["array", "object"] ) > -1 ) {
                    return result = compareObjects.apply( lib, [n, target[i], strict, connate] );
                }
            });
        }
    }

    return result;
}

module.exports = L;

});
