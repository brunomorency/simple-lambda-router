'use strict'
const path = require('path')
const joi = require('joi')
const hoek = require('hoek')
module.exports = {
  handler: (request, context) => {
    return new Promise((resolve, reject) => {
      resolve({
        statusCode: 200,
        body: {
          executedFile: path.basename(__filename, '.js')
        }
      })
    })
  },
  validate: {
    queryStringParameters: joi.object({
      status: joi.string().valid(['opened','completed']).required(),
    })
  }
}
