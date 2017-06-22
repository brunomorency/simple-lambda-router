# Use Case
When building an serverless application on AWS Lambda  driven by events from API Gateway, there are several popular patterns: 

1. Every single HTTP endpoint and method gets its own dedicated lambda function implementing it
1. There's a single HTTP endpoint sending all requests to one big lambda function
1. You have a couple resources defined in API gateway which send requests to a set of lambda functions each handling a scope of your logic. For example, there could be a function handling all `GET`/`POST`/`PUT`/`DELETE` requests related to a `users` entity and another to handle requests for a `todos` entity.

For case 2 and 3 above, your lambda function will need to route the incoming request to the appropriate code to respond to it. *This is what I built this little library for*. 

**NOTE**: In its current state, routing is driven by the `resource` property of the request, not the `path`. This means that it works well if each valid path is defined as a resource in API gateway. However, until I complete routing based on `path`, it won't help you much if you have a single API resource setup with a greedy path. That's because all these requests will get to lambda with the same `resource` property, only the `path` will differ.

## Bonus functionality

In addition to routing requests to the right handler, this package adds a few useful things:

- **Promises**: Uses promises for async logic. Your handler code is expected to return a `Promise` when called.
- **Error handling**: The router catches exceptions from the handler code result in a clean 500 error. Also, there's an extended `Error` class useful to reject requests with a specific status code.
- **Response headers**: You can define default headers to be included in responses for all requests (e.g. CORS headers) and add more headers for specific requests in the handler code.
- **Input validation**: You can define body and query parameters validation rules and the router will apply them. If body or query parameters don't match your validation rules, the request is rejected with appropriate error code and your handler code isn't executed. The way validation works allows setting default value for optional input.
- **Request body parsing**: If the incoming request as a `Content-Type` header indicating the body is JSON data. It will be parsed into a JS object before it is passed to you handler code. 

# How It Works

## Lambda Function Handler
The package exposes a `route()` method. It takes routing configuration and its return value is the handler of your lambda function. For example, if the code below is in a `index.js` file of your function, then `index.handler` would be defined as the handler for your lambda function.

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

## Route Handler Files
Files defined as handlers for a `method:resource` combo defined in `Router.route()` above must export a function called `handler` and may also export a `validate` object as follows:

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
The `handler` function gets the `request` and `context` arguments as if they were handling the  lambda function directly. It also gets all other arguments passed after the config in `Route.route()` 
(see first snippet above). 

Your handler function must return a Promise. It resolves to an object that contains a `statusCode`, `body` and (optional) `headers` property:

- If `body` is an object, it will go through `JSON.stringify()` before being sent back. 
- HTTP header defined in the `headers` property are included in the response in addition to those included in the initial `Router.route()` call. If a given header is defined in both places, the value given in the here as precedence.

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

# Complete Example
See the `example` directory for a more complete example. Looking at tests may also be useful.

