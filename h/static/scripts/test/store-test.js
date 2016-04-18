'use strict';

var angular = require('angular');
var proxyquire = require('proxyquire');

var util = require('./util');

describe('store', function () {
  var $httpBackend = null;
  var sandbox = null;
  var store = null;

  before(function () {
    angular.module('h', ['ngResource'])
    .service('store', proxyquire('../store', util.noCallThru({
      angular: angular,
      './retry-util': {
        retryPromiseOperation: function (fn) {
          return fn();
        },
      },
    })));
  });

  beforeEach(angular.mock.module('h'));

  beforeEach(angular.mock.module(function ($provide) {
    sandbox = sinon.sandbox.create();
    $provide.value('settings', {apiUrl: 'http://example.com/api'});
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
    sandbox.restore();
  });

  beforeEach(angular.mock.inject(function ($q, _$httpBackend_, _store_) {
    $httpBackend = _$httpBackend_;
    store = _store_;

    $httpBackend.expectGET('http://example.com/api').respond({
      links: {
         annotation: {
           create: {
             method: 'POST',
             url: 'http://example.com/api/annotations',
           },
           delete: {},
           read: {},
           update: {},
         },
         search: {
           url: 'http://example.com/api/search',
         },
      },
    });
    $httpBackend.flush();
  }));

  it('reads the operations from the backend', function () {
    assert.isFunction(store.AnnotationResource);
    assert.isFunction(store.SearchResource);
  });

  it('saves a new annotation', function () {
    var annotation = new store.AnnotationResource({id: 'test'});
    var saved = {};

    annotation.$create().then(function () {
      assert.isNotNull(saved.id);
    });

    $httpBackend.expectPOST('http://example.com/api/annotations', {id: 'test'})
    .respond(function () {
      saved.id = annotation.id;
      return [201, {}, {}];
    });
    $httpBackend.flush();
  });

  it('removes internal properties before sending data to the server', function () {
    var annotation = new store.AnnotationResource({
      $highlight: true,
      $notme: 'nooooo!',
      allowed: 123
    });
    annotation.$create();
    $httpBackend.expectPOST('http://example.com/api/annotations', {
      allowed: 123
    })
    .respond(function () { return {id: 'test'}; });
    $httpBackend.flush();
  });

  // Our backend service interprets semicolons as query param delimiters, so we
  // must ensure to encode them in the query string.
  it('encodes semicolons in query parameters', function () {
    store.SearchResource.get({'uri': 'http://example.com/?foo=bar;baz=qux'});
    $httpBackend.expectGET('http://example.com/api/search?uri=http%3A%2F%2Fexample.com%2F%3Ffoo%3Dbar%3Bbaz%3Dqux')
    .respond(function () { return [200, {}, {}]; });
    $httpBackend.flush();
  });
});
