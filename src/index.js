/* 
* @Author: Mike Reich
* @Date:   2016-02-05 07:45:34
* @Last Modified 2016-04-10
*/
/** 
 * [![Build Status](https://travis-ci.org/nxus/base-ui.svg?branch=master)](https://travis-ci.org/nxus/base-ui)
 * 
 * Base UI pages including 404 and error page handlers.
 * 
 * ## Installation
 * 
 *     > npm install @nxus/base-ui --save
 * 
 * ## Usage
 * 
 * The module registers two handlers:
 * 
 * 1.  404: If no other handler responds the route, the module will render the `404` template and return the rendered content.
 * 2.  `/error`: On a 50x error, the router will redirecto to `/error` and the module will render the `500` template and return the rendered content.
 * 
 * ## Model View helpers
 * 
 * The module provides a helper for generating list/detail views from a model:
 * 
 *     app.get('base-ui').viewModel('user', {base: '/users', titleField: 'email'})
 * 
 * You may pass in an options object, as in this example, or subclass of ViewBase, or a string path to a subclass of ViewBase.
 * 
 *     import {ViewBase} from '@nxus/base-ui'
 * 
 *     class UserView extends ViewBase {
 *       model() {
 *         return 'user'
 *       }
 *       base() {
 *         return '/users'
 *       }
 *       titleField() {
 *         return 'email
 *       }
 *     }
 * 
 *     app.get('base-ui').viewModel(UserView)
 * 
 * ## Customizing
 * 
 * If you want to provide your own 404 or 500 page, define the relevant new template. Base-ui will use these to handle the routes above.
 * 
 * ### 404 Page Template
 * 
 *     app.get('templater').template('404', 'ejs', 'path/to/my/404template.ejs')
 * 
 * ### 500 Page Template
 * 
 *     app.get('templater').template('500', 'ejs', 'path/to/my/500template.ejs')
 * 
 * ### List and Detail View
 *
 * You can specify your own list view template to use instead of the default. The base-ui module looks for a template matching the following 
 * pattern: `view-<model>-list` and `view-<model>-detail`.
 *
 * Each template will be passed either a model instance (for detail view) or an array of models (for list view), using the model name.
 *
 * So using the examples above:
 *
 * ```
 * app.get('templater').template('view-user-list', 'ejs', () => {
 *   return "<% users.forEach(function(user){ .... }) %>"
 * })
 * 
 * app.get('templater').template('view-user-detail', 'ejs', () => {
 *   return "<%= user.email %>"
 * })
 * ```
 * 
 * 
 * ## API
 * --------
 */

'use strict';

import ViewBaseClass from './viewBase'
import _ from 'underscore'
import path from 'path'

export var ViewBase = ViewBaseClass

/**
 * The base-ui module class.
 */
export default class BaseUI {
  constructor(app) {
    this.app = app
    this.app.get('base-ui').use(this)
      .gather('viewModel')
      .respond('getViewModel')
      .respond('getViewModels')

    this.models = {}

    this._setupErrorRoutes()
    this._setupHomePageDefault()

    this._setupTemplates()
  }

  _setupTemplates() {
    this.app.get('templater').template('paginator', 'ejs', __dirname+"/../views/paginator.ejs")
  }

  /**
   * Creates a List and Detail UI for the specified model, including all routes and views.  You can pass in the following combinations:
   *   1. a model name and opts hash.
   *   1. a path to a file which is a subclass of ViewBase
   *   1. a class which is a subclass of ViewBase
   *
   * Routes created are:
   *   * `/<base>`: list page 
   *   * `/<base>/:id`: detail page
   *
   * Views which can be overriden are:
   *   * `view-<model>-list`: the list page view
   *   * `view-<model>-detail`: the detail page view
   * 
   * Options available are:
   *   * `base`: the url at which the paths are created. For example, '/users'.
   *   * `templatePrefix`: a custom prefix for generated templates. Defaults to `view-<model>`.
   *   * `ignore`: an array of model fields to ignore in the UI. Defaults to `['id', 'createdAt', 'updatedAt']`
   *   * `templateDir`: a directory containing the list/form templates for the model. Defaults to none.
   *   * `displayName`: an alternate name to use for the display in the UI. Defaults to `model`.
   *   * `instanceTitle`: attribute of instance to use for title and link
   *   
   * @param  {string|class} model Can either be a model name, a path to a file or an ViewBase Subclass.
   * @param  {Object} opts  An options hash, wich is used to configure the UI.
   */
  viewModel(model, opts = {}) {
    var viewModel;
    if(_.isString(model) && model.indexOf(path.sep) == -1) {
      this.app.log.debug('Loading view model', model)
      opts.model = model
      viewModel = new ViewBase(this.app, opts)
      console.log('viewmodel name', viewModel.model())
      this.models[model] = viewModel
    } else if(_.isString(model) && model.indexOf(path.sep) > -1) {
      if(fs.existsSync(model)) {
        this.app.log.debug('Loading view model file at', model)
        model = require(model);
        viewModel = new model(this.app);
        console.log('viewmodel name', viewModel.model())
        this.models[viewModel.model()] = viewModel
      } else
        throw new Error('Class path '+model+' is not a valid file')
    } else if(_.isFunction(model)) {
      viewModel = new model(this.app)
      console.log('viewmodel name', viewModel.model())
      this.models[viewModel.model()] = viewModel
    }
  }

  /**
   * Returns a viewModel, if it has been regsitered
   * @param  {string} model the name of the model to return
   * @return {ViewBase}       An instance of the viewModel
   */
  getViewModel(model) {
    return this.models[model] ? this.models[model] : null
  }

  /**
   * Returns all the registered viewModel instances
   * @return {array} An array of the viewModel/viewBase instances.
   */
  getViewModels() {
    return this.models
  }

  _setupErrorRoutes() {
    var app = this.app
    app.once('launch', () => {
      app.get('router').getExpressApp().then((expressApp) => {
        expressApp.use(function notFoundHandler(req, res, next) {
          app.get('templater').render('404', {opts: app.config, req, user: req.user}).then((body) => {
            res.status(404).send(body)
            next()
          })
        })
      })
    })

    app.get('router').route("GET", '/error', (req, res) => {
      return this.app.get('templater').render('500', {opts: this.app.config, req, user: req.user}).then(res.send.bind(res))
    })
  }

  _setupHomePageDefault() {
    this.app.get('router').default().route('GET', '/', (req, res) => {
      let content = "<h1>Welcome to Nxus!</h1>"
      return this.app.get('templater').render('default', { opts: this.app.config, req, user: req.user, content}).then(res.send.bind(res));
    })
  }
} 
