# Use Case
When building an serverless application on AWS Lambda driven by events from API Gateway, there are several popular patterns:

1. Every single HTTP endpoint and method gets its own dedicated lambda function implementing it
1. There's a single HTTP endpoint sending all requests to one big lambda function
1. You have a couple resources defined in API gateway which send requests to a set of lambda functions each handling a scope of your logic. For example, there could be a function handling all `GET`/`POST`/`PUT`/`DELETE` requests related to a `users` entity and another to handle requests for a `todos` entity.

For case 2 and 3 above, your lambda function will need to route the incoming request to the appropriate code to respond to it. *This is what I built this little library for*.

## Bonus functionality

In addition to routing requests to the right handler, this package adds a few useful things:

- **Promises**: Uses promises for async logic. Your handler code is expected to return a `Promise` when called.
- **Error handling**: The router catches exceptions from the handler code result in a clean 500 error. Also, there's an extended `Error` class useful to reject requests with a specific status code.
- **Response headers**: You can define default headers to be included in responses for all requests (e.g. CORS headers) and add more headers for specific requests in the handler code.
- **Input validation**: You can define body and query parameters validation rules and the router will apply them. If body or query parameters don't match your validation rules, the request is rejected with appropriate error code and your handler code isn't executed. The way validation works allows setting default value for optional input.
- **Request body parsing**: If the incoming request has a `Content-Type` header indicating the body is JSON data. It will be parsed into a JS object before it is passed to you handler code.

# How It Works

## Lambda Function Handler
The package exposes a `route()` method. It takes routing configuration and its return value is the handler of your lambda function. For example, if the code below is in a `index.js` file of your function, then `index.handler` would be defined as the handler for your lambda function.

#### Routing based on `request.resource`:
```javascript
const Router = require('simple-lambda-router')
exports.handler = Router.route(
  {
    resources: {
      '<HTTP_METHOD>:<API_RESOURCE>': <FILE_HANDLING_THAT_REQUEST>
    },
    headers: {
      '<SOME_HTTP_RESPONSE_HEADER>': '<HEADER_VALUE>'
    }
  },
  <OTHER_ARGUMENTS_TO_BE_PASSED_TO_YOUR_REQUEST_HANDLERS>
)
```

#### Routing based on `request.path`:
```javascript
const Router = require('simple-lambda-router')
exports.handler = Router.route(
  {
    paths: {
      '<HTTP_METHOD>:<API_PATH>': <FILE_HANDLING_THAT_REQUEST>
    },
    headers: {
      '<SOME_HTTP_RESPONSE_HEADER>': '<HEADER_VALUE>'
    }
  },
  <OTHER_ARGUMENTS_TO_BE_PASSED_TO_YOUR_REQUEST_HANDLERS>
)
```

## Route Handler Files
Files defined as handlers as defined in call `Router.route()` above must export a function called `handler` and may also export a `validate` object as follows:

```javascript
const joi = require('joi')
module.exports = {
  handler: (request, context, <OTHER_ARGUMENTS_FROM_CALL_TO_ROUTER.ROUTE>) => {
    return new Promise((resolve, reject) => {
      resolve({
        statusCode: 200,
        body: {
          someProp: 'the value'
        },
        headers: {
          '<SOME_HTTP_RESPONSE_HEADER>': '<HEADER_VALUE>'
        }
      })
    })
  },
  validate: {
    queryStringParameters: <QUERYSTRING_VALIDATION_RULES>,
    body: <BODY_VALIDATION_RULES>,
  }
}
```

### `handler`
The `handler` function gets the `request` and `context` arguments as if they were handling the  lambda function directly. It also gets all other arguments passed after the config in `Route.route()` (see first snippet above).

Your handler function must return a Promise. It resolves to an object that must contains a `statusCode` and `body` property, it may also contain a `headers` property:

- If `body` is an object, it will go through `JSON.stringify()` before being sent back as the response body.
- HTTP headers defined in the `headers` property are included in the response in addition to those included in the initial `Router.route()` call. If the same HTTP header is defined in both places, the value in the promise resolution of the handler has precedence.

If your Promise is rejected or has uncaught exceptions, the router will send a `500 Internal Server Error` response back to lambda. You can reject with a specific HTTP error as follows:

```javascript
const Router = require('simple-lambda-router')
module.exports.handler = (request, context) => {
  return new Promise((resolve, reject) => {
    reject(new Router.error({
      statusCode:403,
      message: 'Check with your admin to get access to this.'
    }))
  })
}
```

### `validate`
The validate object lets you define validation rules for the request body and/or query parameters. Validation is super easy to use with the [Joi Object schema validation library](https://github.com/hapijs/joi) but you can use anything as long as you wrap it in a `validate` method compatible with [the Joi validate method](https://github.com/hapijs/joi/blob/master/API.md#validatevalue-schema-options-callback).

```javascript
const joi = require('joi')
module.exports = {
  handler: (request, context) => {
    ...
  },
  validate: {
    // Validating using Joi library
    queryStringParameters: joi.object({
      status: joi.string().valid(['opened','completed']).required(),
    }),
    // Custom body validation/augment code
    body: {
      validate: (requestBody) => {
        let error = null
        if (!('requiredProp' in requestBody)) {
          error = {
            details: [
              { message: 'Request body must contain a "requiredProp" property.' }
            ]
          }
        }
        let value = Object.assign({}, { propWithDefaultVal: 'default val' }, requestBody)
        return { error, value }
      }
    }
  }
}
```

## Routing based on `request.path`

If your API gateway has a [proxy resource with a greedy path variable `{proxy+}`](http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-set-up-simple-proxy.html), the `request.resource` value will be that greedy path and the `request.path` will be the actual path with no extracted parameters showing in `request.pathParameters`. 

> **Example**:
>    
> Your API declares a `/{proxy+}` resource and receives a `GET /items/34`. Upon receiving that request, API Gateway sends an object to your Lambda function with a `resource` property set to `/{proxy+}` and `path` property set to `/items/34`.

This package allows you to define path-based routing. In other words, the routing logic looks at `/items/34` from the example above, not `/{proxy+}` as it would with resource-based routing. Note that your path route can contain named parameter the same way they are defined in an API Gateway resource path. Those parameters will be extracted and added in the `pathParameters` property of the request object sent to your handler.

> **Example** [ctnd]:
>  
> A path key of `GET:/items/{id}` will match the request from the example and your handler will have `request.pathParameters.id` set to `34`

## Chaining handlers

It is possible to handle requests to a path or resource through a chain of handlers instead of a single handler file. This is useful if many endpoints have common validations (e.g. handlers for `/items/4`, `/items/4/links`, and `/items/4/foo` would all need to check if item 4 actually exist and return a 404 if it doesn't). 

You chain handlers by setting the handlers as an array of files. Each step in the handler chain follows the same structure as a single-file handler (it returns an object with a `handler` function returning a Promise and an optional `validate` object). Validation rules are enforced for each step of the chain and each step gets the value the previous step resolves to as one if its arguments.

See examples under `items-fn` or the `test-07-chained-handlers.js` file for more details.

# Examples
See the `examples` directory for a more complete example. Looking at tests may also be useful.
