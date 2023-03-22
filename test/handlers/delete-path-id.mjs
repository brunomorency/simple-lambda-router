export const handler = (request, context) => {
  return new Promise((resolve, reject) => {
    resolve({
      statusCode: 200,
      body: {
        executedFile: 'delete-path-id',
        pathParameters: request.pathParameters
      }
    })
  })
}
