'use strict'

const app = require('lambda-router')
const aCustomGlobalLib = require('custom-global-lib')
const path = require('path')

exports.handler = app.route(
  {
    resources: {
      'GET:/projects': path.resolve('list'),
      'POST:/projects': path.resolve('create'),
      'GET:/projects/{id}': path.resolve('get-by-id'),
      'DELETE:/projects/{id}': path.resolve('delete'),
      'GET:/projects/{id}/tasks': path.resolve('project-tasks'),
      'POST:/projects/{id}/tasks': path.resolve('project-create-task')
    },
    headers: {
      'Access-Control-Allow-Methods': "GET,OPTIONS,POST",
      'Access-Control-Allow-Origin': "*",
      'Access-Control-Allow-Headers': "Content-Type,Authorization,Origin,Accept,Accept-Encoding,Accept-Language,X-Amz-Date,X-Api-Key,X-Amz-Security-Token"
    }
  },
  aCustomGlobalLib
)
