import { RouteError } from '../../index.mjs'
import joi from 'joi'

export const handler = (request, context) => {
  if (request.pathParameters.id > 9) {
    return Promise.reject(new RouteError({
      statusCode: 404,
      message: `Item with id ${request.pathParameters.id} doesn't exist`
    }))
  }
  else {
    return Promise.resolve({
      id: +request.pathParameters.id,
      valid: true
    })
  }
}

export const validate = {
  queryStringParameters: joi.object({
    hockey: joi.string().valid('habs'),
  }).unknown()
}
