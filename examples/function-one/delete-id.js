'use strict'
const path = require('path')
const router = require('lambda-router')

module.exports.handler = (request, context, objectList) => {
  return new Promise((resolve, reject) => {
    let oldCount = objectList.length
    objectList = objectList.filter(r => r.id !== +request.pathParameters.id)
    if (oldCount > objectList.length) {
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
