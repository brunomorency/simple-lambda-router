'use strict'
const path = require('path')
const router = require('simple-lambda-router')

module.exports.handler = (request, context, knownCities) => {
  let cityName = request.pathParameters.name
  if (knownCities.indexOf(cityName) != -1) {
    // we could initialize a class or something else about the resource
    // to be used for all path handlers chained after this one
    Promise.resolve({
      name: cityName,
      getDdgLink: function () {
        return `https://duckduckgo.com/?q=${this.name}`
      }
    })
  } else {
    // This will stop the handler chain and return with a 404 Response
    Promise.reject(new router.error({
      statusCode: 404,
      message: `No info for '${cityName}'. See /cities for list of known cities`
    }))
  }
}
