'use strict'
const path = require('path')
module.exports.handler = (request, context) => {
  return new Promise((resolve, reject) => {
    let htmlText = '<html><body><p>This is some text</p></body></html>'
    resolve({
      statusCode: 200,
      body: htmlText,
      headers: {
        'Content-Type': 'text/html',
        'Content-Length': Buffer.byteLength(htmlText)
      }
    })
  })
}
