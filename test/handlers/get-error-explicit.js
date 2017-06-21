'use strict'
const router = require('../../index')

module.exports.handler = (request, context) => {
  return new Promise((resolve, reject) => {
    reject(new router.error({ statusCode:403, message: 'Can\'t touch this. Doooom Doom Doom Doom.' }))
  })
}
