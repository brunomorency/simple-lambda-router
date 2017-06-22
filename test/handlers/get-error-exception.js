'use strict'
const path = require('path')
const router = require('simple-lambda-router')

module.exports.handler = (request, context) => {
  return new Promise((resolve, reject) => {
    let x = doing.something.wrong()
    resolve({
      statusCode: 200,
      body: {
        executedFile: path.basename(__filename, '.js')
      }
    })
  })
}
