import { RouteError } from '../../index.mjs'

export const handler = (request, context) => {
  return new Promise((resolve, reject) => {
    reject(new RouteError({ statusCode:403, message: 'Can\'t touch this. Doooom Doom Doom Doom.' }))
  })
}
