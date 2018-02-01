'use strict'
const router = require('../../index')
const path = require('path')
const joi = require('joi')

module.exports = {
  handler: (request, context, item) => {
    if (request.pathParameters.id > 5) {
      return Promise.reject(new router.error({
        statusCode: 400,
        message: `Item id ${request.pathParameters.id} has no sub`
      }))
    }
    else {
      item.sub = `item ${item.id} sub`
      return Promise.resolve({
        statusCode: 200,
        body: {
          executedFile: path.basename(__filename, '.js'),
          pathParameters: request.pathParameters,
          item
        }
      })
    }
  },
  validate: {
    queryStringParameters: joi.object({
      soccer: joi.string().valid(['imfc']),
    })
  }
}
