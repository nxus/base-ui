'use strict';

import {HasModels} from '@nxus/storage'
import pluralize from 'pluralize'
import _ from 'underscore'
import morph from 'morph'

/**
 * The ViewBase class provides a helper module for defining Base-UI based pages.
 * 
 * @example class TodoView extends ViewBase {
 *  base () {
 *     return '/todo'
 *   }
 *  model () {
 *     return 'todo'
 *   }
 *  templateDir () {
 *     return __dirname+'/views'
 *   }
 * }
 * 
 */
export default class ViewBase extends HasModels {
  constructor(app, opts={}) {
    super(app)

    this.app = app
    this.opts = opts
    this.router = app.get('router')
    this.templater = app.get('templater')

    if(this.templateDir())
      this.templater.templateDir('ejs', this.templateDir(), this.templatePrefix())

    this.router.route('get', this.base(), this.list.bind(this))
    this.router.route('get', this.base()+'/:id', this.detail.bind(this))

    this.app.log.debug('registering template', this.templatePrefix()+'-list')
    this.templater.template(this.templatePrefix()+'-list', 'ejs', __dirname+"/../views/list.ejs")
    this.templater.template(this.templatePrefix()+'-form', 'ejs', __dirname+"/../views/form.ejs")
  }

  /**
   * Fields in the model to ignore in the UI
   * @return {string}
   */
  ignore() {
    return this.opts.ignore || ['id', 'createdAt', 'updatedAt']
  }
  
  /**
   * Fields in the model to use for the instance title
   * @return {string}
   */
  titleField() {
    return this.opts.titleField || 'name'
  }

  /**
   * The base url for the UI pages. 
   * @return {string} Defaults to `/<models>`
   */
  base() {
   return this.opts.base || "/"+pluralize(this.model())
  }

  /**
   * The directory to find the templates.
   * @return {string} Defaults to null.
   */
  templateDir() {
    return null
  }

  /**
   * The prefix to use for the templates. Defaults to `view-<model>-`
   * @return {string}
   */
  templatePrefix() {
    return this.opts.templatePrefix || "view-"+morph.toDashed(this.model())
  }

  /**
   * The display name for the model to use in the  UI
   * @return {string} Defaults to `<model>`
   */
  displayName() {
    return this.opts.displayName || morph.toTitle(this.model())
  }

  /**
   * Define the primary model for this view module
   * @return {string} 
   */
  model() {
    if(!this.opts.model) throw new Error(this.constructor.name+".model() not defined")
    return this.opts.model
  }

  /**
   * Define any populated relationships for the model
   * @return {array} 
   */
  model_populate () {
    return this.opts.modelPopulate
  }

  model_names () {
    let ret = {}
    ret[this.model()] = 'model'
    return ret;
  }
  
  list (req, res) {
    let find = this.models.model.find().where({})
    if (this.populate) {
      find = find.populate(...this.populate)
    }
    return find.then((insts) => {
      return this.templater.render(this.templatePrefix()+'-list', {
        req,
        base: this.base(),
        user: req.user,
        title: 'All '+ pluralize(this.displayName()),
        instanceTitleField: this.titleField(),
        insts,
        name: this.displayName(),
        attributes: this._getAttrs(this.models.model)
      });
    }).catch((e) => {console.log('caught on find', e)})
  }

  detail (req, res) {
    let find = this.models.model.findOne().where(req.params.id)
    if (this.populate) {
      find = find.populate(...this.populate)
    }
    return find.then((inst) => {
      return this.templater.render(this.templatePrefix()+'-detail', {
        req,
        base: this.base(),
        user: req.user,
        title: 'View '+ this.displayName(),
        instanceTitleField: this.titleField(),
        inst,
        name: this.displayName(),
        attributes: this._getAttrs(this.models.model)
      })
    })
  }

  _getAttrs(model) {
    let ignore = this.ignore()
    let ignoreType = ['objectId']
    return _(model._attributes)
    .keys()
    .map((k) => {let ret = model._attributes[k]; ret.name = k; if(!ret.label) ret.label = this._sanitizeName(k); return ret})
    .filter((k) => {
      let ret = _(ignore).contains(k.name) 
      if(!ret) ret = _(ignoreType).contains(k.type)
      return !ret
    })
  }

  _sanitizeName(string) {
    return morph.toTitle(string)
  }
  
}
