'use strict'
const path = require('path')
module.exports.handler = (request, context) => {
  return new Promise((resolve, reject) => {
    resolve({
      statusCode: 200,
      body: {
        executedFile: path.basename(__filename, '.js'),
        pathParameters: request.pathParameters
      }
    })
  })
}
