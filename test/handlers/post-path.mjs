export const handler = (request, context) => {
  return new Promise((resolve, reject) => {
    resolve({
      statusCode: 200,
      body: {
        executedFile: 'post-path',
        originalRequestBody: request.body,
        requestBodyType: typeof request.body,
        pathParameters: request.pathParameters
      }
    })
  })
}
