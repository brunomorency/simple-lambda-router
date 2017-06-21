const chaiAsPromised = require('chai-as-promised')
const chai = require('chai')
const should = chai.should()
chai.use(chaiAsPromised)
const assert = require('assert')

const fs = require('fs')
const path = require('path')

let router = require('../index').route({
  resources: {
    'POST:/path': path.resolve('handlers/post-path'),
    'POST:/path/validated': path.resolve('handlers/post-path-validated'),
    'GET:/path/validated': path.resolve('handlers/get-path-validated')
  }
})

describe('Handling requests body:', function () {

  it('automatically JSON.parse(body) when request Content-Type is application/json', function (done) {
    let fakeReq = {
      "resource": "/path",
      "httpMethod": "POST",
      "headers": {
        "Content-Type": "application/json; charset=utf-8"
      },
      "queryStringParameters": null,
      "body": "{\"aBoolean\":false,\"props\":{\"year\":2017}}"
    }
    router(fakeReq, {}, function (err,res) {
      try {
        let body = JSON.parse(res.body)
        body.requestBodyType.should.equal('object')
        assert.deepEqual(Object.keys(body.originalRequestBody), ['aBoolean','props'])
        done()
      }
      catch(e) { done(e) }
    })
  })

  it('Returns 200 when body passes handler validation test', function (done) {
    let fakeReq = {
      "resource": "/path/validated",
      "httpMethod": "POST",
      "headers": {
        "Content-Type": "application/json; charset=utf-8"
      },
      "queryStringParameters": null,
      "body": "{\"aBoolean\":false,\"props\":{\"year\":2017,\"month\":\"June\"},\"aString\":\"toto\"}"
    }
    router(fakeReq, {}, function (err,res) {
      try {
        res.statusCode.should.equal(200)
        done()
      }
      catch(e) { done(e) }
    })
  })

  it('Returns 400 when body fails handler validation test', function (done) {
    let fakeReq = {
      "resource": "/path/validated",
      "httpMethod": "POST",
      "headers": {
        "Content-Type": "application/json; charset=utf-8"
      },
      "queryStringParameters": null,
      "body": "{\"props\":{\"month\":\"June\"},\"aString\":\"toto\"}"
    }
    router(fakeReq, {}, function (err,res) {
      try {
        res.statusCode.should.equal(400)
        let body = JSON.parse(res.body)
        should.exist(body.message)
        body.message.should.equal('"year" is required')
        done()
      }
      catch(e) { done(e) }
    })
  })

})

describe('Handling requests query parameters:', function () {

  it('Returns 200 when query parameters pass handler validation test', function (done) {
    let fakeReq = {
      "resource": "/path/validated",
      "httpMethod": "GET",
      "queryStringParameters": {
        "status": "opened"
      }
    }
    router(fakeReq, {}, function (err,res) {
      try {
        res.statusCode.should.equal(200)
        done()
      }
      catch(e) { done(e) }
    })
  })

  it('Returns 400 when query parameters fail handler validation test', function (done) {
    let fakeReq = {
      "resource": "/path/validated",
      "httpMethod": "GET",
      "queryStringParameters": {
        "status": "inprogress"
      }
    }
    router(fakeReq, {}, function (err,res) {
      try {
        res.statusCode.should.equal(400)
        let body = JSON.parse(res.body)
        should.exist(body.message)
        body.message.should.equal('"status" must be one of [opened, completed]')
        done()
      }
      catch(e) { done(e) }
    })
  })

})
