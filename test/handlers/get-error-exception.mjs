export const handler = (request, context) => {
  return new Promise((resolve, reject) => {
    let x = doing.something.wrong()
    resolve({
      statusCode: 200,
      body: {
        executedFile: 'get-error-exception',
        pathParameters: request.pathParameters
      }
    })
  })
}
