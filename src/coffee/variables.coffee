# Save a reference to some core methods.
toString = {}.toString

# Regular expressions
NAMESPACE_EXP = /^[0-9A-Z_.]+[^_.]?$/i

# default settings
settings =
  validator: ->

# storage for internal usage
storage =
  modules:
    Core: []
