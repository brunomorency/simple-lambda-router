'use strict'
const path = require('path')
const router = require('simple-lambda-router')

module.exports.handler = (request, context, objectList) => {
  return new Promise((resolve, reject) => {
    let idx = objectList.findIndex(r => r.id == +request.pathParameters.id)
    if (idx >= 0) {
      objectList.splice(idx,1)
      resolve({
        statusCode: 204
      })
    } else {
      reject(new router.error({
        statusCode: 404,
        message: 'There are no resources with this id'
      }))
    }
  })
}
