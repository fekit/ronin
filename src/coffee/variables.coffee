# Save a reference to some core methods.
toString = {}.toString

# Regular expressions
NAMESPACE_EXP = /^[0-9A-Z_.]+[^_.]?$/i

# storage for internal usage
storage =
  modules:
    Core: {}
