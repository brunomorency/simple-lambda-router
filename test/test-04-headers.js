const chaiAsPromised = require('chai-as-promised')
const chai = require('chai')
const should = chai.should()
chai.use(chaiAsPromised)

const fs = require('fs')
const path = require('path')

let fnHandler = require('../index').route({
  resources: {
    'GET:/path': path.resolve('handlers/get-path'),
    'GET:/html': path.resolve('handlers/get-html')
  },
  headers: {
    'Access-Control-Allow-Methods': 'OPTIONS,GET,POST',
    'Content-Type': 'application/json'
  }
})

describe('Response headers:', function () {

  it('includes headers defined in routes config as default', function (done) {
    let fakeReq = {
      "resource": "/path",
      "httpMethod": "GET"
    }
    fnHandler(fakeReq, {}, function (err,res) {
      try {
        res.headers.should.have.property('Access-Control-Allow-Methods')
        res.headers.should.have.property('Content-Type')
        res.headers['Access-Control-Allow-Methods'].should.equal('OPTIONS,GET,POST')
        res.headers['Content-Type'].should.equal('application/json')
        done()
      }
      catch(e) { done(e) }
    })
  })

  it('includes headers from handler in response', function (done) {
    let fakeReq = {
      "resource": "/html",
      "httpMethod": "GET"
    }
    fnHandler(fakeReq, {}, function (err,res) {
      try {
        res.headers.should.have.property('Content-Length')
        res.headers['Content-Length'].should.be.a('number')
        done()
      }
      catch(e) { done(e) }
    })
  })

  it('maintains headers from config if handler specifies different headers', function (done) {
    let fakeReq = {
      "resource": "/html",
      "httpMethod": "GET"
    }
    fnHandler(fakeReq, {}, function (err,res) {
      try {
        res.headers.should.have.property('Access-Control-Allow-Methods')
        res.headers['Access-Control-Allow-Methods'].should.equal('OPTIONS,GET,POST')
        done()
      }
      catch(e) { done(e) }
    })
  })

  it('gives priority to headers from handler above same header from config', function (done) {
    let fakeReq = {
      "resource": "/html",
      "httpMethod": "GET"
    }
    fnHandler(fakeReq, {}, function (err,res) {
      try {
        res.headers.should.have.property('Content-Type')
        res.headers['Content-Type'].should.equal('text/html')
        done()
      }
      catch(e) { done(e) }
    })
  })

})
