'use strict'

const nodeEnv = process.env.NODE_ENV || 'development'

module.exports = {
  isDev: nodeEnv === 'development',
  isProd: nodeEnv === 'production'
}
