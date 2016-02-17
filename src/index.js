/* 
* @Author: Mike Reich
* @Date:   2016-02-05 07:45:34
* @Last Modified 2016-02-17
*/

'use strict';

import ViewBaseClass from './viewBase'

export var ViewBase = ViewBaseClass

export default class BaseUI {
  constructor(app) {
    this.app = app
    this.app.get('base-ui').use(this)
      .gather('modelView')

    this._setupErrorRoutes()
    this._setupHomePageDefault()
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
  modelView(model, opts) {
    var viewModel;
    if(_.isString(model) && model.indexOf(path.sep) == -1) {
      this.app.log.debug('Loading view model', model)
      opts.model = model
      viewModel = new ViewBase(this.app, opts)
    } else if(_.isString(model) && model.indexOf(path.sep) > -1) {
      if(fs.existsSync(model)) {
        this.app.log.debug('Loading view model file at', model)
        model = require(model);
        viewModel = new model(this.app)
      } else
        throw new Error('Class path '+model+' is not a valid file')
    } else if(_.isFunction(model)) {
      viewModel = new model(this.app)
    }
    
  }

  _setupErrorRoutes() {
    var app = this.app
    app.onceAfter('startup', () => {
      app.get('router').getExpressApp().then((expressApp) => {
        expressApp.use(function notFoundHandler(req, res, next) {
          app.get('templater').render('404', {req, user: req.user}).then((body) => {
            res.status(404).send(body)
            next()
          })
        })
      })
    })

    app.get('router').route("GET", '/error', (req, res) => {
      return this.app.get('templater').render('500', {req, user: req.user}).then(res.send.bind(res))
    })
  }

  _setupHomePageDefault() {
    this.app.get('router').provideBefore('route', 'GET', '/', (req, res) => {
      let content = "<h1>Welcome to Nxus!</h1>"
      return this.app.get('templater').render('default', { req: req, user: req.user, content}).then(res.send.bind(res));
    })
  }
} 
