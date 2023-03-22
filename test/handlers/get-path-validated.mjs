import joi from 'joi'

export const handler = (request, context) => {
  return new Promise((resolve, reject) => {
    resolve({
      statusCode: 200,
      body: {
        executedFile: 'get-path-validated',
        pathParameters: request.pathParameters
      }
    })
  })
}

export const validate = {
  queryStringParameters: joi.object({
    status: joi.string().valid('opened','completed').required(),
  })
}
