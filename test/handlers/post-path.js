'use strict'
const path = require('path')
const joi = require('joi')

module.exports = {
  handler: (request, context) => {
    return new Promise((resolve, reject) => {
      resolve({
        statusCode: 200,
        body: {
          executedFile: path.basename(__filename, '.js'),
          originalRequestBody: request.body,
          requestBodyType: typeof request.body,
          pathParameters: request.pathParameters
        }
      })
    })
  }
}
