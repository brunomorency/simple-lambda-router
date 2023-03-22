import joi from 'joi'

export const handler = (request, context) => {
  return new Promise((resolve, reject) => {
    resolve({
      statusCode: 200,
      body: {
        executedFile: 'post-path-validated',
        originalRequestBody: request.body,
        requestBodyType: typeof request.body,
        pathParameters: request.pathParameters
      }
    })
  })
}

export const validate = {
  body: joi.object({
    props: {
      year: joi.number().integer().required(),
      month: joi.string().required(),
      day: joi.number().integer()
    },
    aBoolean: joi.boolean().default(false),
    aString: joi.string().required()
  })
}
