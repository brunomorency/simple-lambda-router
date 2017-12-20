'use strict'
const path = require('path')
const router = require('simple-lambda-router')

module.exports.handler = (request, context, knownCities) => {
  return new Promise((resolve, reject) => {
    let cityName = request.pathParameters.name
    if (knownCities.indexOf(cityName) != -1) {
      resolve({
        statusCode: 200,
        body: {
          name: cityName,
          information: `https://duckduckgo.com/?q=${cityName}`
        }
      })
    } else {
      reject(new router.error({
        statusCode: 404,
        message: `No info for '${cityName}'. See /cities for list of known cities`
      }))
    }
  })
}
