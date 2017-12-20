'use strict'
const path = require('path')
const router = require('simple-lambda-router')

module.exports.handler = (request, context, objectList) => {
  return new Promise((resolve, reject) => {
    let res = objectList.find(r => r.id === +request.pathParameters.id)
    if (res) {
      resolve({
        statusCode: 200,
        body: ['https://www.npmjs.com/package/simple-lambda-router']
      })
    } else {
      reject(new router.error({
        statusCode: 404,
        message: 'There are no resources with this id'
      }))
    }
  })
}
