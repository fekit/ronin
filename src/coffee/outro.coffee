__util = __proc storage.modules

# Set the library' info as a meta data
try
  Object.defineProperty __util, "__meta__",
    __proto__: null
    writable: true
    value: LIB_CONFIG
catch error
  __util.mixin
    __meta__: LIB_CONFIG

window[LIB_CONFIG.name] = __util
