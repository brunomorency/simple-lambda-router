export const handler = (request, context) => {
  return new Promise((resolve, reject) => {
    resolve({
      statusCode: 200,
      body: {
        executedFile: 'another-one-path',
        pathParameters: request.pathParameters
      }
    })
  })
}
