const chaiAsPromised = require('chai-as-promised')
const chai = require('chai')
const should = chai.should()
chai.use(chaiAsPromised)

const fs = require('fs')
const path = require('path')

let router = require('../index').route({
  resources: {
    'GET:/path': path.resolve('handlers/get-path'),
    'GET:/path/{id}': path.resolve('handlers/get-path-id'),
    'GET:/path/{id}/sub': path.resolve('handlers/get-path-id-sub'),
    'PUT:/path/{id}': path.resolve('handlers/put-path-id'),
    'DELETE:/path/{id}': path.resolve('handlers/delete-path-id')
  }
})

// function getFakeRequest(filename) {
//   return JSON.parse(fs.readFileSync(path.resolve(filename)))
// }

describe('Routing from request.resource:', function () {

  it('Routes to correct handler for a simple path', function (done) {
    let fakeReq = {
      resource: '/path',
      httpMethod: 'GET'
    }
    router(fakeReq, {}, function (err,res) {
      try {
        let body = JSON.parse(res.body)
        body.executedFile.should.equal('get-path')
        done()
      }
      catch(e) { done(e) }
    })
  })

  it('Routes to correct handler for a path with a param', function (done) {
    let fakeReq = {
      resource: '/path/{id}',
      httpMethod: 'GET'
    }
    router(fakeReq, {}, function (err,res) {
      try {
        let body = JSON.parse(res.body)
        body.executedFile.should.equal('get-path-id')
        done()
      }
      catch(e) { done(e) }
    })
  })

  it('Routes to correct handler for a deeper path with a param', function (done) {
    let fakeReq = {
      resource: '/path/{id}/sub',
      httpMethod: 'GET'
    }
    router(fakeReq, {}, function (err,res) {
      try {
        let body = JSON.parse(res.body)
        body.executedFile.should.equal('get-path-id-sub')
        done()
      }
      catch(e) { done(e) }
    })
  })

  describe('Routes same resource to correct handler based on HTTP method', function () {
    it('calls PUT handler when HTTP method is PUT', function (done) {
      let fakeReq = {
        resource: '/path/{id}',
        httpMethod: 'PUT'
      }
      router(fakeReq, {}, function (err,res) {
        try {
          let body = JSON.parse(res.body)
          body.executedFile.should.equal('put-path-id')
          done()
        }
        catch(e) { done(e) }
      })
    })
    it('calls DELETE handler when HTTP method is DELETE', function (done) {
      let fakeReq = {
        resource: '/path/{id}',
        httpMethod: 'DELETE'
      }
      router(fakeReq, {}, function (err,res) {
        try {
          let body = JSON.parse(res.body)
          body.executedFile.should.equal('delete-path-id')
          done()
        }
        catch(e) { done(e) }
      })
    })
  })

  it('Returns 204 response for any OPTIONS request', function (done) {
    let fakeReq = {
      resource: '/does/not/matter',
      httpMethod: 'OPTIONS'
    }
    router(fakeReq, {}, function (err,res) {
      try {
        res.statusCode.should.equal(204)
        done()
      }
      catch(e) { done(e) }
    })
  })

  it('Returns 405 errors when no route is defined for a requested method', function (done) {
    let fakeReq = {
      resource: '/path/{id}',
      httpMethod: 'POST'
    }
    router(fakeReq, {}, function (err,res) {
      try {
        res.statusCode.should.equal(405)
        done()
      }
      catch(e) { done(e) }
    })
  })

  it('Returns 404 errors when no route (any method) is defined for a requested resource', function (done) {
    let fakeReq = {
      resource: '/path/{id}/invalid',
      httpMethod: 'GET'
    }
    router(fakeReq, {}, function (err,res) {
      try {
        res.statusCode.should.equal(404)
        done()
      }
      catch(e) { done(e) }
    })
  })

})