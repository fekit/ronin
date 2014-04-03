(function( global, factory ) {

  if ( typeof module === "object" && typeof module.exports === "object" ) {
    module.exports = global.document ?
      factory(global, true) :
      function( w ) {
        if ( !w.document ) {
          throw new Error("Requires a window with a document");
        }
        return factory(w);
      };
  } else {
    factory(global);
  }

}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

"use strict";
var BuiltIn, Constructor, LIB_CONFIG, NAMESPACE_EXP, attach, batch, hasOwn, namespace, settings, storage, toString, _H, _builtin;

LIB_CONFIG = {
  name: "Miso",
  version: "0.1.1"
};

toString = {}.toString;

hasOwn = {}.hasOwnProperty;

NAMESPACE_EXP = /^[0-9A-Z_.]+[^_.]?$/i;

settings = {
  validator: function() {}
};

storage = {
  core: {},
  types: {},
  modules: {
    Core: {
      BuiltIn: null
    }
  }
};


/*
 * 添加命名空间
 *
 * @private
 * @method  namespace
 * @param   ns_str {String}     a namespace format string (e.g. 'Module.Package')
 * @return  {Object}
 */

namespace = function(ns_str) {
  var obj;
  obj = null;
  if (_builtin.isString(ns_str) && NAMESPACE_EXP.test(ns_str)) {
    obj = storage.modules;
    _builtin.each(ns_str.split("."), function(part, idx) {
      if (obj[part] === void 0) {
        obj[part] = {};
      }
      return obj = obj[part];
    });
  }
  return obj;
};


/*
 * 批量添加 method
 *
 * @private
 * @method  batch
 * @param   host {Object}       the host of methods to be added
 * @param   handlers {Object}   data of a method
 * @param   data {Object}       data of a module
 * @return
 */

batch = function(host, handlers, data) {
  var context;
  context = this;
  if (_builtin.isArray(data)) {
    _builtin.each(data, function(d) {
      var _ref;
      return batch.apply(context, [(typeof d[1] === "string" && NAMESPACE_EXP.test(d[1]) ? namespace(d[1]) : host), (_ref = d[0]) != null ? _ref.handlers : void 0, d[0]]);
    });
  } else if (_builtin.isObject(data)) {
    _builtin.each(handlers, function(info) {
      return attach.apply(context, [host, info, data]);
    });
  }
  return true;
};


/*
 * 构造 method
 *
 * @private
 * @method  attach
 * @param   host {Object}       the host of methods to be added
 * @param   set {Object}        data of a method
 * @param   data {Object}       data of a module
 * @param   isCore {Boolean}    whether copy to the core-method-object
 * @return
 */

attach = function(host, set, data) {
  var handler, method, name, validator, validators, value, _i, _len;
  name = set.name;
  if (!_builtin.isFunction(host[name])) {
    handler = set.handler;
    value = hasOwn.call(set, "value") ? set.value : data.value;
    validators = [set.validator, data.validator, settings.validator, function() {}];
    for (_i = 0, _len = validators.length; _i < _len; _i++) {
      validator = validators[_i];
      if (_builtin.isFunction(validator)) {
        break;
      }
    }
    method = function() {
      if (_builtin.isFunction(handler) === true && validator.apply(host, arguments)) {
        return handler.apply(host, arguments);
      } else {
        return value;
      }
    };
    host[name] = method;
  }
  return true;
};

BuiltIn = (function() {
  function BuiltIn() {}


  /*
   * 扩展指定对象
   * 
   * @method  mixin
   * @param   unspecified {Mixed}
   * @return  {Object}
   */

  BuiltIn.prototype.mixin = function() {
    var args, copy, i, length, name, opts, target, _ref;
    args = arguments;
    length = args.length;
    target = (_ref = args[0]) != null ? _ref : {};
    i = 1;
    if (length === 1) {
      target = this;
      i--;
    }
    while (i < length) {
      opts = args[i];
      if (typeof opts === "object") {
        for (name in opts) {
          copy = opts[name];
          if (copy === target) {
            continue;
          }
          if (copy !== void 0) {
            target[name] = copy;
          }
        }
      }
      i++;
    }
    return target;
  };


  /*
   * 遍历
   * 
   * @method  each
   * @param   object {Object/Array/Function}
   * @param   callback {Function}
   * @return  {Mixed}
   */

  BuiltIn.prototype.each = function(object, callback) {
    var ele, index, name, type, value;
    type = this.type(object);
    if (type === "object" || type === "function") {
      for (name in object) {
        value = object[name];
        if (callback.apply(value, [value, name, object]) === false) {
          break;
        }
      }
    } else if (type === "array" || type === "string") {
      index = 0;
      while (index < object.length) {
        ele = type === "array" ? object[index] : object.charAt(index);
        if (callback.apply(object[index], [ele, index++, object]) === false) {
          break;
        }
      }
    }
    return object;
  };


  /*
   * 获取对象类型
   * 
   * @method  type
   * @param   object {Mixed}
   * @return  {String}
   */

  BuiltIn.prototype.type = function(object) {
    if (object == null) {
      return String(object);
    } else {
      return storage.types[toString.call(object)] || "object";
    }
  };

  return BuiltIn;

})();

_builtin = new BuiltIn;

_builtin.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(name, i) {
  var lc;
  storage.types["[object " + name + "]"] = lc = name.toLowerCase();
  return _builtin["is" + name] = function(target) {
    return this.type(target) === lc;
  };
});


/*
 * A constructor to construct methods
 *
 * @class   Constructor
 * @constructor
 */

Constructor = (function() {
  function Constructor() {
    var data;
    this.constructor = Constructor;
    this.object = {};
    data = arguments[0];
    batch.apply(this, [this.object, data != null ? data.handlers : void 0, data]);
  }

  Constructor.prototype.toString = function() {
    return "[object " + LIB_CONFIG.name + "]";
  };

  Constructor.prototype.add = function(set) {
    return attach(set);
  };

  return Constructor;

})();

_builtin.mixin(Constructor, {
  __builtIn__: _builtin,
  toString: function() {
    return "function " + LIB_CONFIG.name + "() { [native code] }";
  },
  config: function(setting) {
    return _builtin.mixin(settings, setting);
  }
});

_H = Constructor;

window[LIB_CONFIG.name] = _H;

}));

(function( global, factory ) {

  if ( typeof module === "object" && typeof module.exports === "object" ) {
    module.exports = global.document ?
      factory(global, true) :
      function( w ) {
        if ( !w.document ) {
          throw new Error("Requires a window with a document");
        }
        return factory(w);
      };
  } else {
    factory(global);
  }

}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

"use strict";
var LIB_CONFIG, NAMESPACE_EXP, compareObjects, func, hasOwn, name, settings, slicer, storage, toString, _H;

LIB_CONFIG = {
  name: "Ronin",
  version: "0.2.1"
};

toString = {}.toString;

hasOwn = {}.hasOwnProperty;

NAMESPACE_EXP = /^[0-9A-Z_.]+[^_.]?$/i;

settings = {
  validator: function() {}
};

storage = {
  modules: {
    Core: []
  }
};


/*
 * 切割 Array Like 片段
 *
 * @private
 * @method   slicer
 * @return
 */

slicer = function(args, index) {
  return [].slice.call(args, Number(index) || 0);
};


/*
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

compareObjects = function(base, target, strict, connate) {
  var isRun, lib, plain, result;
  result = false;
  lib = this;
  plain = lib.isPlainObject(base);
  if ((plain || connate) && strict) {
    result = target === base;
  } else {
    if (plain) {
      isRun = compareObjects.apply(lib, [lib.keys(base), lib.keys(target), false, true]);
    } else {
      isRun = target.length === base.length;
    }
    if (isRun) {
      lib.each(base, function(n, i) {
        var type;
        type = lib.type(n);
        if (lib.inArray(type, ["string", "number", "boolean", "null", "undefined"]) > -1) {
          return result = target[i] === n;
        } else if (lib.inArray(type, ["date", "regexp", "function"]) > -1) {
          return result = strict ? target[i] === n : target[i].toString() === n.toString();
        } else if (lib.inArray(type, ["array", "object"]) > -1) {
          return result = compareObjects.apply(lib, [n, target[i], strict, connate]);
        }
      });
    }
  }
  return result;
};

storage.modules.Core.push([
  {
    validator: function() {
      return true;
    },
    handlers: [
      {

        /*
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
        name: "namespace",
        handler: function() {
          var args, hostObj, lib, ns;
          args = arguments;
          lib = this;
          ns = {};
          hostObj = args[0];
          if (!lib.isPlainObject(hostObj)) {
            hostObj = args[args.length - 1] === true ? window : this;
          }
          lib.each(args, function(arg) {
            var obj;
            if (lib.isString(arg) && /^[0-9A-Z_.]+[^_.]$/i.test(arg)) {
              obj = hostObj;
              lib.each(arg.split("."), function(part, idx, parts) {
                if (obj[part] === void 0) {
                  obj[part] = idx === parts.length - 1 ? null : {};
                }
                obj = obj[part];
                return true;
              });
              ns = obj;
            }
            return true;
          });
          return ns;
        }
      }, {

        /*
         * 判断是否为 window 对象
         * 
         * @method  isWindow
         * @param   object {Mixed}
         * @return  {String}
         */
        name: "isWindow",
        handler: function(object) {
          return object && typeof object === "object" && "setInterval" in object;
        }
      }, {

        /*
         * 判断是否为数字类型（字符串）
         * 
         * @method  isNumeric
         * @param   object {Mixed}
         * @return  {Boolean}
         */
        name: "isNumeric",
        handler: function(object) {
          return !isNaN(parseFloat(object)) && isFinite(object);
        }
      }, {

        /*
         * Determine whether a number is an integer.
         *
         * @method  isInteger
         * @param   object {Mixed}
         * @return  {Boolean}
         */
        name: "isInteger",
        handler: function(object) {
          return this.isNumeric(object) && /^-?[1-9]\d*$/.test(object);
        }
      }, {

        /*
         * 判断对象是否为纯粹的对象（由 {} 或 new Object 创建）
         * 
         * @method  isPlainObject
         * @param   object {Mixed}
         * @return  {Boolean}
         */
        name: "isPlainObject",
        handler: function(object) {
          var error, key;
          if (!object || this.type(object) !== "object" || object.nodeType || this.isWindow(object)) {
            return false;
          }
          try {
            if (object.constructor && !hasOwn.call(object, "constructor") && !hasOwn.call(object.constructor.prototype, "isPrototypeOf")) {
              return false;
            }
          } catch (_error) {
            error = _error;
            return false;
          }
          for (key in object) {
            key;
          }
          return key === void 0 || hasOwn.call(object, key);
        }
      }, {

        /*
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
        name: "isEmpty",
        handler: function(object) {
          var name, result;
          result = false;
          if ((object == null) || !object) {
            result = true;
          } else if (typeof object === "object") {
            result = true;
            for (name in object) {
              result = false;
              break;
            }
          }
          return result;
        },
        validator: function() {
          return true;
        }
      }, {

        /*
         * 是否为类数组对象
         *
         * @method  isArrayLike
         * @param   object {Mixed}
         * @return  {Boolean}
         */
        name: "isArrayLike",
        handler: function(object) {
          var length, result, type;
          result = false;
          if (typeof object === "object" && object !== null) {
            if (!this.isWindow(object)) {
              type = this.type(object);
              length = object.length;
              if (object.nodeType === 1 && length || type === "array" || type !== "function" && (length === 0 || this.isNumber(length) && length > 0 && (length - 1) in object)) {
                result = true;
              }
            }
          }
          return result;
        }
      }, {

        /*
         * Compares two objects for equality.
         *
         * @method  equal
         * @param   base {Mixed}
         * @param   target {Mixed}
         * @param   strict {Boolean}    whether compares the two objects' references
         * @return  {Boolean}
         */
        name: "equal",
        handler: function(base, target, strict) {
          var connate, lib, plain_b, result, type_b;
          result = false;
          lib = this;
          type_b = lib.type(base);
          if (lib.type(target) === type_b) {
            plain_b = lib.isPlainObject(base);
            if (plain_b && lib.isPlainObject(target) || type_b !== "object") {
              connate = lib.isArray(base);
              if (!plain_b && !connate) {
                base = [base];
                target = [target];
              }
              if (!lib.isBoolean(strict)) {
                strict = false;
              }
              result = compareObjects.apply(lib, [base, target, strict, connate]);
            }
          }
          return result;
        }
      }, {

        /*
         * Returns a random integer between min and max, inclusive.
         * If you only pass one argument, it will return a number between 0 and that number.
         *
         * @method  random
         * @param   min {Number}
         * @param   max {Number}
         * @return  {Number}
         */
        name: "random",
        handler: function(min, max) {
          if (max == null) {
            max = min;
            min = 0;
          }
          return min + Math.floor(Math.random() * (max - min + 1));
        }
      }
    ]
  }
]);

storage.modules.Core.push([
  {
    validator: function() {
      return true;
    },
    handlers: [
      {

        /*
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
        name: "keys",
        handler: function(object, value) {
          var keys;
          keys = [];
          this.each(object, function(v, k) {
            if (v === value) {
              keys = k;
              return false;
            } else {
              return keys.push(k);
            }
          });
          if (this.isArray(keys)) {
            return keys.sort();
          } else {
            return keys;
          }
        },
        validator: function(object) {
          var _ref;
          return object !== null && !(object instanceof Array) && ((_ref = typeof object) === "object" || _ref === "function");
        },
        value: []
      }
    ]
  }
]);

storage.modules.Core.push([
  {
    validator: function() {
      return true;
    },
    handlers: (function() {
      var _ref, _results;
      _ref = Miso.__builtIn__;
      _results = [];
      for (name in _ref) {
        func = _ref[name];
        _results.push({
          name: name,
          handler: func
        });
      }
      return _results;
    })()
  }
]);

_H = function() {};

Miso.__builtIn__.mixin(_H, (new Miso(storage.modules.Core)).object);

window[LIB_CONFIG.name] = _H;

}));
