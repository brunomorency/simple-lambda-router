'use strict'
const path = require('path')
const joi = require('joi')

module.exports = {
  handler: (request, context, objectList) => {
    return new Promise((resolve, reject) => {
      resolve({
        statusCode: 200,
        body: objectList.filter(r => r.status === request.queryStringParameters.status)
      })
    })
  },
  validate: {
    queryStringParameters: joi.object({
      status: joi.string().valid(['opened','completed']).required(),
    })
  }
}
