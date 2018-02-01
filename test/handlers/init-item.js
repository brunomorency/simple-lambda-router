'use strict'
const router = require('../../index')
const path = require('path')
const joi = require('joi')

module.exports = {
  handler: (request, context) => {
    if (request.pathParameters.id > 9) {
      return Promise.reject(new router.error({
        statusCode: 404,
        message: `Item with id ${request.pathParameters.id} doesn't exist`
      }))
    }
    else {
      return Promise.resolve({
        id: +request.pathParameters.id,
        valid: true
      })
    }
  },
  validate: {
    queryStringParameters: joi.object({
      hockey: joi.string().valid(['habs']),
    }).unknown()
  }
}
