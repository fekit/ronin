_H = Miso storage.modules

# Set the library' info as a meta data
try
  Object.defineProperty _H, "__meta__",
    __proto__: null
    writable: true
    value: LIB_CONFIG
catch error
  _H.mixin
    __meta__: LIB_CONFIG

window[LIB_CONFIG.name] = _H
