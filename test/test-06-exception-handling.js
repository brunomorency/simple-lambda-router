import chaiAsPromised from 'chai-as-promised'
import chai from 'chai'
const should = chai.should()
chai.use(chaiAsPromised)

import path from 'node:path'
import { Route } from '../index.mjs'

let fnHandler = Route({
  resources: {
    'GET:/error/explicit': path.resolve('handlers/get-error-explicit.mjs'),
    'GET:/error/exception': path.resolve('handlers/get-error-exception.mjs')
  }
})

describe('Handling errors from route handlers:', function () {

  it('Handler rejecting with a RouteError generates the expected status code and message', function (done) {
    let fakeReq = {
      "resource": "/error/explicit",
      "httpMethod": "GET"
    }
    fnHandler(fakeReq, {}, function (err,res) {
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
    fnHandler(fakeReq, {}, function (err,res) {
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
