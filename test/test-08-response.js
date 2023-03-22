import chaiAsPromised from 'chai-as-promised'
import chai from 'chai'
const should = chai.should()
chai.use(chaiAsPromised)

import path from 'node:path'
import assert from 'node:assert'
import { Route } from '../index.mjs'

let fnHandler = Route({
  resources: {
    'GET:/json': path.resolve('handlers/response-body-types/json.mjs'),
    'GET:/string': path.resolve('handlers/response-body-types/string.mjs'),
    'GET:/null': path.resolve('handlers/response-body-types/null.mjs')
  },
  paths: {
    'GET:/number/{nb}': path.resolve('handlers/response-body-types/number.mjs'),
  }
})

describe('Handler response body:', function () {

  it('is automatically JSON.stringified if it\'s a JS Object', function (done) {
    let fakeReq = {
      resource: "/json",
      httpMethod: "GET"
    }
    fnHandler(fakeReq, {}, function (err,res) {
      try {
        assert(typeof res.body == 'string')
        res.headers['Content-Type'].should.equal('application/json')
        let body = JSON.parse(res.body)
        body.should.have.property('executedFile')
        done()
      }
      catch(e) { done(e) }
    })
  })

  it('turns into an empty string if sent as null', function (done) {
    // note that typeof null => 'object' so returning a body set to null
    // is handled eactly the same as returning an actual object
    let fakeReq = {
      resource: "/null",
      httpMethod: "GET"
    }
    fnHandler(fakeReq, {}, function (err,res) {
      try {
        assert(typeof res.body == 'string')
        assert(res.body === '')
        done()
      }
      catch(e) { done(e) }
    })
  })

  it('turns integers into their string representation', function (done) {
    // note that typeof null => 'object' so returning a body set to null
    // is handled eactly the same as returning an actual object
    let fakeReq = {
      resource: "/number/{nb}",
      path: "/number/12",
      httpMethod: "GET",
      pathParameters: {}
    }
    fnHandler(fakeReq, {}, function (err,res) {
      try {
        assert(typeof res.body == 'string')
        res.body.should.equal('12')
        done()
      }
      catch(e) { done(e) }
    })
  })

  it('maintains strings as is', function (done) {
    // note that typeof null => 'object' so returning a body set to null
    // is handled eactly the same as returning an actual object
    let fakeReq = {
      resource: "/string",
      httpMethod: "GET"
    }
    fnHandler(fakeReq, {}, function (err,res) {
      try {
        assert(typeof res.body == 'string')
        res.body.should.equal('string')
        done()
      }
      catch(e) { done(e) }
    })
  })

})
