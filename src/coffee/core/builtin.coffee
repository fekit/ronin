# ====================
# Built-in methods from Miso
# ====================

storage.modules.Core.BuiltIn =
  validator: ->
    return true

  handlers: (name: name, handler: func for name, func of Miso when func.__miso__ is true)
