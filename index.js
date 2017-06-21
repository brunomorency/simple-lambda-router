'use strict'

class RouteError extends Error {
  constructor({statusCode, message}) {
    super(message)
    this.statusCode = statusCode
  }
}

module.exports = {

  error: RouteError,

  route: (config, ...handlerParams) => (request, context, lambdaCallback) => {

    let cfg = Object.assign({}, {
      resources: {},
      headers: {},
      paths: {},
      debug: false
    }, config)
    let debugLog = (cfg.debug) ? (msg) => console.log(`ROUTER: ${msg}`) : () => {};

    debugLog(`request: ${JSON.stringify(request)}`)

    if (request.httpMethod.toUpperCase() == 'OPTIONS') {

      debugLog(`Response to OPTIONS request`)
      return lambdaCallback(null, {
        statusCode: 204,
        headers: cfg.headers,
        body: ''
      })

    } else {

      let handlerFileKey = [request.httpMethod.toUpperCase(), request.resource.toLowerCase()].join(':')
      let genericInternalErrorResponse = {
        statusCode:500,
        headers: cfg.headers,
        body:JSON.stringify({ message: "Interval Server Error" })
      }

      if (handlerFileKey in cfg.resources) {

        try {

          debugLog(`Executing handler ${cfg.resources[handlerFileKey]} for ${request.httpMethod} on ${request.resource}`)
          let implementation = require(cfg.resources[handlerFileKey])

          if (request.headers) {
            let requestContentType = request.headers[Object.keys(request.headers).find(header => header.toLowerCase() == 'content-type')]
            if (requestContentType && typeof requestContentType == 'string' && requestContentType.search(/^application\/json(;|$)/) === 0) {
              request.body = JSON.parse(request.body)
            }
          }

          // validate request parameters
          if ('validate' in implementation) {
            for (let part in implementation.validate) {
              debugLog(`Validating request.${part}`)
              let {error, value} = implementation.validate[part].validate(request[part] || {});
              if (error) {
                // parts of the request isn't valid
                debugLog(`Validation error: ${JSON.stringify(error.details)}`)
                let errMessage = error.details.map(e => e.message).join('. ')
                return lambdaCallback(null, {
                  statusCode:400,
                  headers: cfg.headers,
                  body: JSON.stringify({ message: errMessage })
                })
              } else {
                request[part] = value
              }
            }
          }

          // handle the API request
          implementation.handler(request, context, ...handlerParams)
          .then(response => {
            debugLog(`handler success: ${JSON.stringify(response)}`)
            response.body = (response.body) ? JSON.stringify(response.body) : ''
            if (!('headers' in response)) response.headers = cfg.headers
            else {
              for (let header in cfg.headers) {
                response.headers[header] = cfg.headers[header]
              }
            }
            return lambdaCallback(null, response)
          })
          .catch(err => {
            debugLog(`handler promise error:`, err)
            if (err instanceof RouteError) {
              return lambdaCallback(null,{
                statusCode: err.statusCode,
                headers: cfg.headers,
                body:JSON.stringify({ message: err.message })
              })
            } else {
              return lambdaCallback(null, genericInternalErrorResponse)
            }
          })

        } catch (err) {
          debugLog(`handler error:`, err)
          return lambdaCallback(null, genericInternalErrorResponse)
        }

      } else {
        debugLog(`No handler defined for ${request.httpMethod} on ${request.resource}`)

        // If there is at least one method defined for the requested resource
        // we'll return a 405 response. Otherwise, we'll return a 404
        let exists = Object.keys(cfg.resources).some(r => {
          let [method, resource] = r.split(':')
          return (resource === request.resource)
        })

        let response = (exists) ? [405, 'Method Not Allowed'] : [404, 'Not Found']
        return lambdaCallback(null, {
          statusCode: response[0],
          headers: cfg.headers,
          body:JSON.stringify({ message: response[1] })
        })
      }
    }
  }
}
