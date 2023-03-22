class RouteError extends Error {
  constructor({statusCode, message}) {
    super(message)
    this.statusCode = statusCode
  }
}

export const error = RouteError;

export const route = (config, ...handlerParams) => (request, context, lambdaCallback) => {

  let cfg = Object.assign({}, {
    resources: null,
    headers: {},
    paths: null,
    debug: false
  }, config)
  let _debugLog = (cfg.debug) ? (msg) => console.log(`ROUTER: ${msg}`) : () => {};

  _debugLog(`request: ${JSON.stringify(request)}`)

  if (request.httpMethod.toUpperCase() == 'OPTIONS') {

    _debugLog(`Response to OPTIONS request`)
    return lambdaCallback(null, {
      statusCode: 204,
      headers: cfg.headers,
      body: ''
    })

  } else {

    let genericInternalErrorResponse = {
      statusCode:500,
      headers: cfg.headers,
      body:JSON.stringify({ message: "Interval Server Error" })
    }

    let handler = _getRequestHandlerFile(cfg, request)
    if (handler) {

      try {

        if (cfg.debug) {
          if (handler.type == 'resource') {
            _debugLog(`[method: ${request.httpMethod}, resource: ${request.resource}] Executing matching resource handler ${cfg.resources[handler.key]}`)
          } else {
            _debugLog(`[method: ${request.httpMethod}, path: ${request.path}] Executing matching path handler ${cfg.paths[handler.key]}`)
          }
        }

        if (request.headers) {
          let requestContentType = request.headers[Object.keys(request.headers).find(header => header.toLowerCase() == 'content-type')]
          if (requestContentType && typeof requestContentType == 'string' && requestContentType.search(/^application\/json(;|$)/) === 0) {
            request.body = JSON.parse(request.body)
          }
        }

        _runImplementation((handler.type == 'resource') ? cfg.resources[handler.key] : cfg.paths[handler.key])
        .then(response => {

          _debugLog(`handler success: ${JSON.stringify(response)}`)
          // apply headers from config and augment with headers from handler response
          if (!('headers' in response)) {
            response.headers = cfg.headers
          }
          else {
            response.headers = Object.assign({}, cfg.headers, response.headers)
          }

          if (response.body && typeof response.body == 'object') {
            response.body = JSON.stringify(response.body)
            response.headers['Content-Type'] = 'application/json'
          } else {
            response.body = response.body || ''
          }

          return lambdaCallback(null, response)
        })
        .catch(err => {

          _debugLog(`Error: ${err.message}`)
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

        function _runImplementation(handler) {
          if (Array.isArray(handler)) {
            return handler.reduce((p, stepFile) => p.then(previousStepOutput => {
              return import(stepFile).then((handlerMod) => {
                return _runImplementationStep(handlerMod, previousStepOutput)
              })
            }), Promise.resolve(null))
          } else {
            return import(handler).then((handlerMod) => {
              return _runImplementationStep(handlerMod)
            })
          }
        }

        function _runImplementationStep(step, previousStepOutput=null) {
          // validate request parameters
          if ('validate' in step) {
            for (let part in step.validate) {
              _debugLog(`Validating request.${part}`)
              let {error, value} = step.validate[part].validate(request[part] || {});
              if (error) {
                // parts of the request isn't valid
                _debugLog(`Validation error: ${JSON.stringify(error.details)}`)
                return Promise.reject(new RouteError({
                  statusCode: 400,
                  message: error.details.map(e => e.message).join('. ')
                }))
              } else {
                request[part] = value
              }
            }
          }
          // handle the API request
          if (previousStepOutput) {
            return step.handler(request, context, previousStepOutput, ...handlerParams)
          } else {
            return step.handler(request, context, ...handlerParams)
          }
        }

      } catch (err) {
        _debugLog(`handler error:`, err.message)
        return lambdaCallback(null, genericInternalErrorResponse)
      }

    } else {
      _debugLog(`No handler defined for method ${request.httpMethod} on resource ${request.resource} or path ${request.path}`)

      // If there is at least one method defined for the requested resource
      // or path we'll return a 405 response. Otherwise, we'll return a 404
      let exists = cfg.resources && Object.keys(cfg.resources).some(r => {
        let [method, resource] = r.split(':')
        return (resource === request.resource)
      })
      if (!exists && cfg.paths) exists = Object.keys(cfg.paths).some(p => {
        return _pathMatchesPattern(request.path, p.split(':').pop())
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

function _getRequestHandlerFile(cfg, request) {

  // Attempt to find matching resource handler for request.resource

  let resourceHandlerFileKey = [request.httpMethod.toUpperCase(), request.resource.toLowerCase()].join(':')

  if (cfg.resources && resourceHandlerFileKey in cfg.resources) {
    return { type: 'resource', key: resourceHandlerFileKey }
  } else if (cfg.paths) {

    // Go through configured paths to find one that matches request.path
    // Configured paths may define parameters, we must capture those values

    let reqPathParts = request.path.toLowerCase().split('/')

    let matchingPathKey = Object.keys(cfg.paths).find((pathPattern) => {
      let [method,pattern] = pathPattern.split(':')
      return (request.httpMethod.toUpperCase() == method.toUpperCase() && _pathMatchesPattern(reqPathParts,pattern))
    })

    if (matchingPathKey) {
      let originalReqPathParts = request.path.split('/')
      if (!('pathParameters' in request)) request.pathParameters = {}
      matchingPathKey.split(':').pop().split('/').forEach((part, idx) => {
        if (part.substring(0,1) == '{' && part.substring(part.length - 1) == '}') {
          request.pathParameters[part.slice(1,-1)] = decodeURIComponent(originalReqPathParts[idx])
        }
      })
      return { type: 'path', key: matchingPathKey }
    } else {
      return null
    }

  } else {
    return null
  }

}

function _pathMatchesPattern(path, pattern) {
  let _path = (Array.isArray(path)) ? path : path.split('/')
  let _parts = pattern.split('/')
  return _parts.length == _path.length && _parts.every((part, idx) => {
    return (part == _path[idx] || (part.substring(0,1) == '{' && part.substring(part.length - 1) == '}'))
  })
}
