const chaiAsPromised = require('chai-as-promised')
const chai = require('chai')
const should = chai.should()
chai.use(chaiAsPromised)

const fs = require('fs')
const path = require('path')

let fnHandler = require('../index').route({
  paths: {
    'GET:/path': path.resolve('handlers/get-path'),
    'GET:/path/{id}': path.resolve('handlers/get-path-id'),
    'GET:/path/{id}/sub': path.resolve('handlers/get-path-id-sub'),
    'PUT:/path/{id}': path.resolve('handlers/put-path-id'),
    'DELETE:/path/{id}': path.resolve('handlers/delete-path-id')
  }
})

describe('Routing from request.path:', function () {

  it('Routes to correct handler for a simple path', function (done) {
    let fakeReq = {
      resource: '/{proxy+}',
      path: '/path',
      httpMethod: 'GET',
      pathParameters: {}
    }
    fnHandler(fakeReq, {}, function (err,res) {
      try {
        let body = JSON.parse(res.body)
        body.should.have.property('executedFile')
        body.executedFile.should.equal('get-path')
        done()
      }
      catch(e) { done(e) }
    })
  })

  it('Routes to correct handler and extracts params for a path with a param', function (done) {
    let fakeReq = {
      resource: '/{proxy+}',
      path: '/path/TheId',
      httpMethod: 'GET',
      pathParameters: {}
    }
    fnHandler(fakeReq, {}, function (err,res) {
      try {
        let body = JSON.parse(res.body)
        body.should.have.property('executedFile')
        body.should.have.property('pathParameters')
        body.executedFile.should.equal('get-path-id')
        body.pathParameters.should.have.property('id')
        body.pathParameters.id.should.equal('TheId')
        done()
      }
      catch(e) { done(e) }
    })
  })

  it('Routes to correct handler and extracts params for a deeper path with a param', function (done) {
    let fakeReq = {
      resource: '/{proxy+}',
      path: '/path/1234/sub',
      httpMethod: 'GET',
      pathParameters: {}
    }
    fnHandler(fakeReq, {}, function (err,res) {
      try {
        let body = JSON.parse(res.body)
        body.should.have.property('executedFile')
        body.should.have.property('pathParameters')
        body.executedFile.should.equal('get-path-id-sub')
        body.pathParameters.should.have.property('id')
        body.pathParameters.id.should.equal('1234')
        done()
      }
      catch(e) { done(e) }
    })
  })

  describe('Routes same resource to correct handler based on HTTP method', function () {
    it('calls PUT handler when HTTP method is PUT', function (done) {
      let fakeReq = {
        resource: '/{proxy+}',
        path: '/path/1234',
        httpMethod: 'PUT',
        pathParameters: {}
      }
      fnHandler(fakeReq, {}, function (err,res) {
        try {
          let body = JSON.parse(res.body)
          body.should.have.property('executedFile')
          body.should.have.property('pathParameters')
          body.executedFile.should.equal('put-path-id')
          body.pathParameters.should.have.property('id')
          body.pathParameters.id.should.equal('1234')
          done()
        }
        catch(e) { done(e) }
      })
    })
    it('calls DELETE handler when HTTP method is DELETE', function (done) {
      let fakeReq = {
        resource: '/{proxy+}',
        path: '/path/1234',
        httpMethod: 'DELETE',
        pathParameters: {}
      }
      fnHandler(fakeReq, {}, function (err,res) {
        try {
          let body = JSON.parse(res.body)
          body.should.have.property('executedFile')
          body.should.have.property('pathParameters')
          body.executedFile.should.equal('delete-path-id')
          body.pathParameters.should.have.property('id')
          body.pathParameters.id.should.equal('1234')
          done()
        }
        catch(e) { done(e) }
      })
    })
  })

  it('Returns 204 response for any OPTIONS request', function (done) {
    let fakeReq = {
      resource: '/{proxy+}',
      path: '/does/not/matter',
      httpMethod: 'OPTIONS',
      pathParameters: {}
    }
    fnHandler(fakeReq, {}, function (err,res) {
      try {
        res.statusCode.should.equal(204)
        done()
      }
      catch(e) { done(e) }
    })
  })

  it('Returns 405 errors when no route is defined for a requested method', function (done) {
    let fakeReq = {
      resource: '/{proxy+}',
      path: '/path/1234',
      httpMethod: 'POST',
      pathParameters: {}
    }
    fnHandler(fakeReq, {}, function (err,res) {
      try {
        res.statusCode.should.equal(405)
        done()
      }
      catch(e) { done(e) }
    })
  })

  it('Returns 404 errors when no route (any method) is defined for a requested resource', function (done) {
    let fakeReq = {
      resource: '/{proxy+}',
      path: '/path/1234/invalid',
      httpMethod: 'GET',
      pathParameters: {}
    }
    fnHandler(fakeReq, {}, function (err,res) {
      try {
        res.statusCode.should.equal(404)
        done()
      }
      catch(e) { done(e) }
    })
  })

})
