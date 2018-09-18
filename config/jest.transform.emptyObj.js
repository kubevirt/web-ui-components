'use strict'

// Custom Jest transformer that turns module imports into empty objects.

module.exports = {
  process () {
    return 'module.exports = {};'
  }
}
