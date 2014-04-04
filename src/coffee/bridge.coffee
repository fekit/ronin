# Built-in methods from Miso
storage.modules.Core.push [
  validator: ->
    return true

  handlers: (name: name, handler: func for name, func of Miso.__builtIn__)
]

_H = ->

new Miso storage.modules.Core, _H
