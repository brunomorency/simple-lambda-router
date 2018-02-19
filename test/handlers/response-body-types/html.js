'use strict'

module.exports.handler = (request, context) => {
  let htmlText = '<html><body><p>This is some text</p></body></html>'
  return Promise.resolve({
    statusCode: 200,
    body: htmlText,
    headers: {
      'Content-Type': 'text/html',
      'Content-Length': Buffer.byteLength(htmlText)
    }
  })
}
