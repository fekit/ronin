# Built-in methods from Miso
storage.modules.Core.push [
  validator: ->
    return true

  handlers: (name: name, handler: func for name, func of Miso.__builtIn__)
]

_H = ->

Miso.__builtIn__.mixin _H, (new Miso storage.modules.Core).object
