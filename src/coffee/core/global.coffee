###
# Compare objects' values or references.
# 
# @private
# @method  compareObjects
# @param   base {Array/Object}
# @param   target {Array/Object}
# @param   strict {Boolean}
# @param   connate {Boolean}
# @return  {Boolean}
###
compareObjects = ( base, target, strict, connate ) ->
  result = false
  lib = this
  plain = lib.isPlainObject base

  if (plain or connate) and strict
    result = target is base
  else
    if plain
      isRun = compareObjects.apply lib, [lib.keys(base), lib.keys(target), false, true]
    else
      isRun = target.length is base.length
    
    if isRun
      lib.each base, ( n, i ) ->
        type = lib.type n

        if lib.inArray(type, ["string", "number", "boolean", "null", "undefined"]) > -1
          return result = target[i] is n
        else if lib.inArray(type, ["date", "regexp", "function"]) > -1
          return result = if strict then target[i] is n else target[i].toString() is n.toString()
        else if lib.inArray(type, ["array", "object"]) > -1
          return result = compareObjects.apply lib, [n, target[i], strict, connate]

  return result

storage.modules.Core.push [
  validator: ->
    return true

  handlers: [
    {
      ###
      # Returns the namespace specified and creates it if it doesn't exist.
      # Be careful when naming packages.
      # Reserved words may work in some browsers and not others.
      #
      # @method  namespace
      # @param   [hostObj] {Object}      Host object namespace will be added to
      # @param   [ns_str_1] {String}     The first namespace string
      # @param   [ns_str_2] {String}     The second namespace string
      # @param   [ns_str_*] {String}     Numerous namespace string
      # @param   [global] {Boolean}      Whether set window as the host object
      # @return  {Object}                A reference to the last namespace object created
      ###
      name: "namespace"

      handler: ->
        args = arguments
        lib = this
        ns = {}
        hostObj = args[0]
        
        # Determine the host object.
        (hostObj = if args[args.length - 1] is true then window else this) if not lib.isPlainObject hostObj

        lib.each args, ( arg ) ->
          if lib.isString(arg) and /^[0-9A-Z_.]+[^_.]$/i.test(arg)
            obj = hostObj

            lib.each arg.split("."), ( part, idx, parts ) ->
              (obj[ part ] = if idx is parts.length - 1 then null else {}) if obj[part] is undefined
              obj = obj[part]
              return true

            ns = obj

          return true

        return ns
    },
    {
      ###
      # 判断是否为 window 对象
      # 
      # @method  isWindow
      # @param   object {Mixed}
      # @return  {String}
      ###
      name: "isWindow"

      handler: ( object ) ->
        return object and typeof object is "object" and "setInterval" of object
    },
    {
      ###
      # 判断是否为数字类型（字符串）
      # 
      # @method  isNumeric
      # @param   object {Mixed}
      # @return  {Boolean}
      ###
      name: "isNumeric"

      handler: ( object ) ->
        return not isNaN(parseFloat(object)) and isFinite(object)
    },
    {
      ###
      # Determine whether a number is an integer.
      #
      # @method  isInteger
      # @param   object {Mixed}
      # @return  {Boolean}
      ###
      name: "isInteger"

      handler: ( object ) ->
        return @isNumeric(object) and /^-?[1-9]\d*$/.test(object)
    },
    {
      ###
      # 判断对象是否为纯粹的对象（由 {} 或 new Object 创建）
      # 
      # @method  isPlainObject
      # @param   object {Mixed}
      # @return  {Boolean}
      ###
      name: "isPlainObject"

      handler: ( object ) ->
        # This is a copy of jQuery 1.7.1.
        
        # Must be an Object.
        # Because of IE, we also have to check the presence of the constructor property.
        # Make sure that DOM nodes and window objects don't pass through, as well
        if not object or @type(object) isnt "object" or object.nodeType or @isWindow(object)
          return false

        try
          # Not own constructor property must be Object
          if object.constructor and not @hasProp(object, "constructor") and not @hasProp(object.constructor.prototype, "isPrototypeOf")
            return false
        catch error
            # IE8,9 will throw exceptions on certain host objects
            return false

        key for key of object

        return key is undefined or @hasProp(object, key)
    },
    {
      ###
      # Determin whether a variable is considered to be empty.
      #
      # A variable is considered empty if its value is or like:
      #  - null
      #  - undefined
      #  - false
      #  - ""
      #  - []
      #  - {}
      #  - 0
      #  - 0.0
      #  - "0"
      #  - "0.0"
      #
      # @method  isEmpty
      # @param   object {Mixed}
      # @return  {Boolean}
      #
      # refer: http://www.php.net/manual/en/function.empty.php
      ###
      name: "isEmpty"

      handler: ( object ) ->
        result = false

        if not object? or not object
          result = true
        else if typeof object is "object"
          result = true

          for name of object
            result = false
            break

        return result

      validator: ->
        return true
    },
    {
      ###
      # 是否为类数组对象
      #
      # @method  isArrayLike
      # @param   object {Mixed}
      # @return  {Boolean}
      ###
      name: "isArrayLike"

      handler: ( object ) ->
        result = false

        if typeof object is "object" and object isnt null
          if not @isWindow object
            type = @type object
            length = object.length

            result = true if object.nodeType is 1 and length or
              type is "array" or
              type isnt "function" and
              (length is 0 or @isNumber(length) and length > 0 and (length - 1) of object)

        return result
    },
    {
      ###
      # Compares two objects for equality.
      #
      # @method  equal
      # @param   base {Mixed}
      # @param   target {Mixed}
      # @param   strict {Boolean}    whether compares the two objects' references
      # @return  {Boolean}
      ###
      name: "equal"

      handler: ( base, target, strict ) ->
        result = false
        lib = this
        type_b = lib.type( base )

        if lib.type(target) is type_b
          plain_b = lib.isPlainObject base

          if plain_b and lib.isPlainObject(target) or type_b isnt "object"
            # 是否为“天然”的数组（以别于后来将字符串等转换成的数组）
            connate = lib.isArray base

            if not plain_b and not connate
              base = [base]
              target = [target]

            # If 'strict' is true, then compare the objects' references, else only compare their values.
            strict = false if not lib.isBoolean strict

            result = compareObjects.apply(lib, [base, target, strict, connate])

        return result
    },
    {
      ###
      # Returns a random integer between min and max, inclusive.
      # If you only pass one argument, it will return a number between 0 and that number.
      #
      # @method  random
      # @param   min {Number}
      # @param   max {Number}
      # @return  {Number}
      ###
      name: "random"

      handler: ( min, max ) ->
        if not max?
          max = min
          min = 0

        return min + Math.floor Math.random() * (max - min + 1)
    }
  ]
]
    # /**
    #  * 别名
    #  * 
    #  * @method  alias
    #  * @param   name {String}
    #  * @return
    #  */
    # /*alias: function( name ) {
    #     // 通过 _alias 判断是否已经设置过别名
    #     // 设置别名时要将原来的别名释放
    #     // 如果设置别名了，是否将原名所占的空间清除？（需要征求别人意见）

    #     if ( this.type( name ) === "string" ) {
    #         if ( window[name] === undefined ) {
    #             window[name] = this;
    #         }
    #     }

    #     return window[ String(name) ];
    # },*/

    # /**
    #  * 恢复原名
    #  * 
    #  * @method  revert
    #  * @return
    #  */
    # // "revert": function() {},

    # /**
    #  * 新建对象子集
    #  * 
    #  * @method  create
    #  * @param   namespace {String}  Name of sub-collection
    #  * @param   object {Object}     Object added to the main object
    #  * @return
    #  */
    # /*create: function( namespace, object ) {
    #     this.namespace = object;
    # },*/

    # /**
    #  * 打印信息到控制台
    #  */
    # // "log": function() {}
