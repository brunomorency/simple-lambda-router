'use strict'
const path = require('path')
const joi = require('joi')

module.exports = {
  handler: (request, context, objectList) => {
    return new Promise((resolve, reject) => {
      try {
        let newRes = {
          id: objectList.reduce((max, r) => Math.max(max,r.id), 0) + 1,
          title: request.body.title,
          status: request.body.status
        }
        objectList.push(newRes)
        resolve({
          statusCode: 201,
          body: newRes
        })
      } catch (e) {
        reject(e)
      }
    })
  },
  validate: {
    body: joi.object({
      title: joi.string().required(),
      status: joi.string().valid(['opened','completed']).default('opened')
    })
  }
}
