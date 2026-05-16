'use strict'
const path = require('path')
const nconf = require('nconf')

module.exports = [
  ['respond', require('@hitokoto/koa-respond')()],
  // MiddleWares
  ['requestId', require('../src/middlewares/requestId')()],
  ['RequestsCounter', require('../src/middlewares/RequestsCounter')()],
  ['responseHandler', require('../src/middlewares/responseHandler')()],

  // Recover Error
  ['RecoverError', require('../src/middlewares/recoverError')()],

  // Basic Plugins
  [
    'koa-helmet',
    require('koa-helmet')({
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: {
        policy: 'cross-origin',
      },
    }),
  ],
  ['koa-query-pretty', require('koa-query-pretty')()],
  ['koa-jsonp', require('@hitokoto/koa-jsonp')()],
  [
    '@koa/bodyparser',
    require('@koa/bodyparser').bodyParser({
      enableTypes: ['json', 'form'],
      formLimit: '10mb',
      jsonLimit: '10mb',
    }),
  ],
  [
    '@koa/cors',
    require('@koa/cors')({
      origin: '*',
      allowMethods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'PATCH'],
      exposeHeaders: ['X-Request-Id'],
    }),
  ],
  [
    'koa-favicon',
    (() => {
      try {
        const faviconPath = path.join(__dirname, '../public/favicon.ico');
        if (require('fs').existsSync(faviconPath)) {
          return require('koa-favicon')(faviconPath);
        }
      } catch {
        // favicon 文件不可用，跳过此中间件
      }
      return false;
    })(),
  ],
  !nconf.get('server:compress_body') || [
    'koa-compress',
    require('koa-compress')({
      filter(contentType) {
        return /text/i.test(contentType)
      },
      threshold: 2048,
      gzip: {
        flush: require('zlib').constants.Z_SYNC_FLUSH,
      },
      deflate: {
        flush: require('zlib').constants.Z_SYNC_FLUSH,
      },
    }),
  ],
  ['logger', require('../src/middlewares/logger')()],
  !nconf.get('telemetry:performance') ||
    nconf.get('dev') || [
      'performanceTracing',
      require('../src/middlewares/performanceTracing'),
    ],
]
