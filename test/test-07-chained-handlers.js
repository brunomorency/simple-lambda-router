import chaiAsPromised from 'chai-as-promised'
import chai from 'chai'
const should = chai.should()
chai.use(chaiAsPromised)

import path from 'node:path'
import { route } from '../index.mjs'

let fnHandler = route({
  paths: {
    'GET:/item/{id}/sub': [
      path.resolve('handlers/init-item.mjs'),
      path.resolve('handlers/get-item-id-sub.mjs')
    ],
    'GET:/exception/{id}/sub': [
      path.resolve('handlers/get-error-exception.mjs'),
      path.resolve('handlers/get-item-id-sub.mjs')
    ],
    'GET:/item/{id}/exception': [
      path.resolve('handlers/init-item.mjs'),
      path.resolve('handlers/get-error-exception.mjs')
    ]
  }
})

describe('Chaining handlers:', function () {

  it('Last handler gets output from previous handler and returns as expected', function (done) {
    let fakeReq = {
      resource: '/{proxy+}',
      path: '/item/2/sub',
      httpMethod: 'GET'
    }
    fnHandler(fakeReq, {}, function (err,res) {
      try {
        let body = JSON.parse(res.body)
        body.executedFile.should.equal('get-item-id-sub')
        body.pathParameters.should.have.property('id')
        body.pathParameters.id.should.equal('2')
        body.item.should.have.property('id')
        body.item.should.have.property('sub')
        body.item.id.should.equal(2)
        body.item.sub.should.equal('item 2 sub')
        done()
      }
      catch(e) { done(e) }
    })
  })

  describe('Errors on first steps:', function () {

    it('Known error in handler stops chain and returns expected status code', function (done) {
      let fakeReq = {
        resource: '/{proxy+}',
        path: '/item/12/sub',
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

    it('Code exception in handler stops chain and returns expected status code', function (done) {
      let fakeReq = {
        resource: '/{proxy+}',
        path: '/exception/2/sub',
        httpMethod: 'GET'
      }
      fnHandler(fakeReq, {}, function (err,res) {
        try {
          res.statusCode.should.equal(500)
          done()
        }
        catch(e) { done(e) }
      })
    })

    it('Validation error stops chain and returns expected status code', function (done) {
      let fakeReq = {
        resource: '/{proxy+}',
        path: '/item/12/sub',
        httpMethod: 'GET',
        queryStringParameters: {
          hockey: 'bruins'
        }
      }
      fnHandler(fakeReq, {}, function (err,res) {
        try {
          res.statusCode.should.equal(400)
          let body = JSON.parse(res.body)
          body.message.should.equal('"hockey" must be [habs]')
          done()
        }
        catch(e) { done(e) }
      })
    })
  })

  describe('Errors on last step:', function () {

    it('Known error in handler returns expected status code', function (done) {
      let fakeReq = {
        resource: '/{proxy+}',
        path: '/item/8/sub',
        httpMethod: 'GET'
      }
      fnHandler(fakeReq, {}, function (err,res) {
        try {
          res.statusCode.should.equal(400)
          let body = JSON.parse(res.body)
          body.message.should.equal('Item id 8 has no sub')
          done()
        }
        catch(e) { done(e) }
      })
    })

    it('Code exception in handler returns expected status code', function (done) {
      let fakeReq = {
        resource: '/{proxy+}',
        path: '/item/2/exception',
        httpMethod: 'GET'
      }
      fnHandler(fakeReq, {}, function (err,res) {
        try {
          res.statusCode.should.equal(500)
          done()
        }
        catch(e) { done(e) }
      })
    })

    it('Validation error returns expected status code', function (done) {
      let fakeReq = {
        resource: '/{proxy+}',
        path: '/item/2/sub',
        httpMethod: 'GET',
        queryStringParameters: {
          soccer: 'tfc'
        }
      }
      fnHandler(fakeReq, {}, function (err,res) {
        try {
          res.statusCode.should.equal(400)
          let body = JSON.parse(res.body)
          body.message.should.equal('"soccer" must be [imfc]')
          done()
        }
        catch(e) { done(e) }
      })
    })
  })

})
