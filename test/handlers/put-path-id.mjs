export const handler = (request, context) => {
  return new Promise((resolve, reject) => {
    resolve({
      statusCode: 200,
      body: {
        executedFile: 'put-path-id',
        pathParameters: request.pathParameters
      }
    })
  })
}
