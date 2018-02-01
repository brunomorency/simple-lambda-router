'use strict'
const path = require('path')
const router = require('simple-lambda-router')

module.exports.handler = (request, context, cityItem, knownCities) => {
  // no need to make sure the city exists or initialize an object, this
  // happened in previous steps of the handler chain
  return Promise.resolve({
    statusCode: 200,
    body: [
      // .. list of restaurants here
    ]
  })
}
