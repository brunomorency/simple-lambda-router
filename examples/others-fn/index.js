'use strict'

const Router = require('simple-lambda-router')
const path = require('path')

let knownCities = ['Montreal', 'Paris', 'San Francisco', 'Chicago', 'London', 'New York', 'Berlin', 'Tokyo']
exports.handler = Router.route(
  {
    paths: {
      'GET:/cats': path.resolve('get-cats'),
      'GET:/cities': path.resolve('get-cities'),
      'GET:/cities/{name}': [
        path.resolve('init-city'),
        path.resolve('get-city-by-name')
      ],
      'GET:/cities/{name}/restaurants': [
        path.resolve('init-city'),
        path.resolve('get-city-restaurants')
      ],
      'GET:/cities/{name}/weather': [
        path.resolve('init-city'),
        path.resolve('get-city-weather')
      ],
    },
    headers: {
      'Access-Control-Allow-Methods': "OPTIONS,GET,POST,DELETE",
      'Access-Control-Allow-Origin': "*",
      'Access-Control-Allow-Headers': "Content-Type,Authorization,Origin,Accept,Accept-Encoding,Accept-Language,X-Amz-Date,X-Api-Key,X-Amz-Security-Token"
    },
    debug: true
  },
  knownCities
)
