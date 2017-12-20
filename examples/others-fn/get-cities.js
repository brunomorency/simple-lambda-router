'use strict'
const path = require('path')

module.exports = {
  handler: (request, context, knownCities) => {
    return new Promise((resolve, reject) => {
      resolve({
        statusCode: 200,
        body: knownCities
      })
    })
  }
}
