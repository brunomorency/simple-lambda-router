'use strict'

const path = require('path')

module.exports = {
  handler: (request, context, item) => {
    return Promise.resolve({
      statusCode: 200,
      body: null
    })
  }
}
