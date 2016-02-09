/* 
* @Author: Mike Reich
* @Date:   2016-02-09 10:24:46
* @Last Modified 2016-02-09 @Last Modified time: 2016-02-09 10:24:46
*/

'use strict';

import BaseUI from '../src/'

import TestApp from '@nxus/core/lib/test/support/TestApp';

describe("BaseUI", () => {
  var baseui;
  var app = new TestApp();
 
  beforeEach(() => {
    app = new TestApp();
    baseui = new BaseUI(app);
  });
  
  describe("Load", () => {
    it("should not be null", () => BaseUI.should.not.be.null)

    it("should be instantiated", () => {
      baseui.should.not.be.null;
    });
  });
});