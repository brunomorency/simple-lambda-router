import chaiAsPromised from 'chai-as-promised'
import chai from 'chai'
const should = chai.should()
chai.use(chaiAsPromised)

import path from 'node:path'
import { Route } from '../index.mjs'

let fnHandler = Route({
  resources: {
    'GET:/path': path.resolve('handlers/get-path.mjs'),
    'GET:/path/{id}': path.resolve('handlers/get-path-id.mjs'),
    'GET:/path/{id}/sub': path.resolve('handlers/get-path-id-sub.mjs'),
    'PUT:/path/{id}': path.resolve('handlers/put-path-id.mjs'),
    'DELETE:/path/{id}': path.resolve('handlers/delete-path-id.mjs'),
    'GET:/another/{id}/one': path.resolve('handlers/another-one-resource.mjs')
  },
  paths: {
    'GET:/another/{id}/one': path.resolve('handlers/another-one-path.mjs')
  }
})

// function getFakeRequest(filename) {
//   return JSON.parse(fs.readFileSync(path.resolve(filename)))
// }

describe('Routing from request.resource:', function () {

  it('Routes to correct handler for a simple path', function (done) {
    let fakeReq = {
      resource: '/path',
      path: '/path',
      httpMethod: 'GET'
    }
    fnHandler(fakeReq, {}, function (err,res) {
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
      path: '/path/1234',
      httpMethod: 'GET'
    }
    fnHandler(fakeReq, {}, function (err,res) {
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
      path: '/path/1234/sub',
      httpMethod: 'GET'
    }
    fnHandler(fakeReq, {}, function (err,res) {
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
      fnHandler(fakeReq, {}, function (err,res) {
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
        path: '/path/1234',
        httpMethod: 'DELETE'
      }
      fnHandler(fakeReq, {}, function (err,res) {
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
      path: '/does/not/matter',
      httpMethod: 'OPTIONS'
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
      resource: '/path/{id}',
      path: '/path/1234',
      httpMethod: 'POST'
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
      resource: '/path/{id}/invalid',
      path: '/path/1234/invalid',
      httpMethod: 'GET'
    }
    fnHandler(fakeReq, {}, function (err,res) {
      try {
        res.statusCode.should.equal(404)
        done()
      }
      catch(e) { done(e) }
    })
  })

  it('Takes precedence over path-based routing when both match a request', function (done) {
    let fakeReq = {
      resource: '/another/{id}/one',
      path: '/another/1234/one',
      httpMethod: 'GET'
    }
    fnHandler(fakeReq, {}, function (err,res) {
      try {
        let body = JSON.parse(res.body)
        body.executedFile.should.equal('another-one-resource')
        done()
      }
      catch(e) { done(e) }
    })
  })

})
