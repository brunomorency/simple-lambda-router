'use strict'

module.exports = {
  handler: (request, context, item) => {
    return Promise.resolve({
      statusCode: 200,
      body: request.pathParameters.nb
    })
  }
}
