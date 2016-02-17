'use strict';

import ViewBase from '../src/viewBase'

import TestApp from '@nxus/core/lib/test/support/TestApp';

class TestView extends ViewBase {
  base () {
    return "/test"
  }
  model () {
    return 'testModel'
  }
  templateDir () {
    return './views'
  }
}

describe("ViewBase", () => {
  var module;
  var app = new TestApp();
 
  beforeEach(() => {
    app = new TestApp();
  });
  
  describe("Load", () => {
    it("should not be null", () => ViewBase.should.not.be.null)

    it("should be instantiated", () => {
      module = new TestView(app);
      module.should.not.be.null;
    });
  });
  describe("Init", () => {
    beforeEach(() => {
      module = new TestView(app);
    });

    it("should have a base url", () => {
      module.base().should.equal('/test');
    });
    
    it("should have routes", () => {
      app.get('router').provide.calledWith('get', '/test').should.be.true;
      app.get('router').provide.calledWith('get', '/test/:id').should.be.true;
    })
    it("should have a template prefix", () => {
      module.templatePrefix().should.equal('view-test-model');
    })
    it("should have an titleField", () => {
      module.titleField().should.equal('name');
    })
  });
});
