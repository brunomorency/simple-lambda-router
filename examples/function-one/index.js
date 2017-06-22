'use strict'

const Router = require('simple-lambda-router')
const path = require('path')

let objectList = [
  {id: 1, title: 'Title of resource 1', status: 'completed'},
  {id: 2, title: 'Title of resource 2', status: 'completed'},
  {id: 3, title: 'Title of resource 3', status: 'opened'},
  {id: 4, title: 'Title of resource 4', status: 'completed'},
  {id: 5, title: 'Title of resource 5', status: 'opened'},
  {id: 6, title: 'Title of resource 6', status: 'completed'}
]

exports.handler = Router.route(
  {
    resources: {
      'GET:/items': path.resolve('list'),
      'POST:/items': path.resolve('create'),
      'GET:/items/{id}': path.resolve('get-id'),
      'DELETE:/items/{id}': path.resolve('delete-id')
    },
    headers: {
      'Access-Control-Allow-Methods': "GET,OPTIONS,POST",
      'Access-Control-Allow-Origin': "*",
      'Access-Control-Allow-Headers': "Content-Type,Authorization,Origin,Accept,Accept-Encoding,Accept-Language,X-Amz-Date,X-Api-Key,X-Amz-Security-Token"
    }
  },
  objectList
)
