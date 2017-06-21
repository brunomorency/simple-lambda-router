const chaiAsPromised = require('chai-as-promised')
const chai = require('chai')
const should = chai.should()
chai.use(chaiAsPromised)
const assert = require('assert')

const fs = require('fs')
const path = require('path')

let router = require('../index').route({
  resources: {
    'GET:/error/explicit': path.resolve('handlers/get-error-explicit'),
    'GET:/error/exception': path.resolve('handlers/get-error-exception')
  }
})

describe('Handling errors from route handlers:', function () {

  it('Handler rejecting with a RouteError generates the expected status code and message', function (done) {
    let fakeReq = {
      "resource": "/error/explicit",
      "httpMethod": "GET"
    }
    router(fakeReq, {}, function (err,res) {
      try {
        res.statusCode.should.equal(403)
        let body = JSON.parse(res.body)
        should.exist(body.message)
        body.message.should.equal('Can\'t touch this. Doooom Doom Doom Doom.')
        done()
      }
      catch(e) { done(e) }
    })
  })

  it('Code exceptions in handler generate a 500 response', function (done) {
    let fakeReq = {
      "resource": "/error/exception",
      "httpMethod": "GET"
    }
    router(fakeReq, {}, function (err,res) {
      try {
        res.statusCode.should.equal(500)
        let body = JSON.parse(res.body)
        should.exist(body.message)
        body.message.should.equal('Interval Server Error')
        done()
      }
      catch(e) { done(e) }
    })
  })

})
