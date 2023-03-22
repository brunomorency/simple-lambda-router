import { RouteError } from '../../index.mjs'
import joi from 'joi'

export const handler = (request, context, item) => {
  if (request.pathParameters.id > 5) {
    return Promise.reject(new RouteError({
      statusCode: 400,
      message: `Item id ${request.pathParameters.id} has no sub`
    }))
  }
  else {
    item.sub = `item ${item.id} sub`
    return Promise.resolve({
      statusCode: 200,
      body: {
        executedFile: 'get-item-id-sub',
        pathParameters: request.pathParameters,
        item
      }
    })
  }
}

export const validate = {
  queryStringParameters: joi.object({
    soccer: joi.string().valid('imfc'),
  })
}
