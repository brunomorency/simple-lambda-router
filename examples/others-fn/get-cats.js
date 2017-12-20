'use strict'
const path = require('path')

module.exports = {
  handler: (request, context, knownCities) => {
    return new Promise((resolve, reject) => {
      resolve({
        statusCode: 303,
        body: null,
        headers: {
          Location: 'https://duckduckgo.com/?q=cats&iax=images&ia=images'
        }
      })
    })
  }
}
