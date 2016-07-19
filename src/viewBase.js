'use strict';

import {HasModels} from 'nxus-storage'
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
      this.templater.templateDir(this.templateDir())

    if(typeof opts.list == 'undefined' || opts.list === false)
      this.router.route('get', this.base(), this.list.bind(this))

    if(typeof opts.detail == 'undefined' || opts.detail === false)
      this.router.route('get', this.base()+'/:'+this.idField(), this.detail.bind(this))

    this.templater.default('templateFunction', this.templatePrefix()+'-list', this.listTemplate(), (opts, name) => {
      return this.templater.render("base-ui-list", opts)
    })

    this.templater.default('templateFunction', this.templatePrefix()+'-detail', this.detailTemplate(), (opts, name) => {
      return this.templater.render("base-ui-detail", opts)
    })  
  }

  /**
   * Fields in the model to ignore in the UI
   * @return {array}
   */
  ignore() {
    return this.opts.ignore || ['id', 'createdAt', 'updatedAt']
  }
  
  /**
   * The ID field to use to display a single item
   * @return {string}
   */
  idField() {
    return this.opts.idField || 'id'
  }
  
  /**
   * Fields in the model to show
   * @return {array}
   */
  display() {
    return this.opts.display || []
  }

  /**
   * Field in the model to use for the instance title
   * @return {string}
   */
  titleField() {
    return this.opts.titleField || 'name'
  }

  /**
   * Field in the model to use for sorting the list
   * @return {string}
   */
  sortField() {
    return this.opts.sortField || 'updatedAt'
  }

  /**
   * List sort direction
   * @return {string} `ASC` for ascending, `DESC` for descending order
   */
  sortDirection() {
    return this.opts.sortDirection || 'ASC'
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
   * The template to use for the list partial. Defaults to 'page'. 
   * @return {string}
   */
  listTemplate() {
    return this.opts.listTemplate || "page"
  }

  /**
   * The template to use to display the detail partial. Defaults to 'page'.
   * @return {string}
   */
  detailTemplate() {
    return this.opts.detailTemplate || "page"
  }

  /**
   * The prefix to use for the templates. Defaults to `view-<model>-`,
   * where `<model>` is the model name morphed into dashed format.
   * @return {string}
   */
  templatePrefix() {
    return this.opts.templatePrefix || "view-"+morph.toDashed(this.model())
  }

  /**
   * The display name for the model to use in the  UI
   * @return {string} Defaults to `<model>`, the model name morphed into title-case format.
   */
  displayName() {
    return this.opts.displayName || morph.toTitle(this.model())
  }

  /**
   * The number of results to display per page
   * @return {string} Defaults to `<model>`
   */
  itemsPerPage() {
    return this.opts.itemsPerPage || 10
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
  modelPopulate () {
    return this.opts.modelPopulate || []
  }

  modelNames () {
    let ret = {}
    ret[this.model()] = this.model()
    return ret;
  }
  
  list (req, res, opts = {}) {
    let sort = this.sortField()+" "+this.sortDirection()
    let page = parseInt(req.param('page')) || 1
    let find = this.models[this.model()].find().where({}).sort(sort)
      .limit(this.itemsPerPage()).skip((page-1)*this.itemsPerPage())
    find = this._populate(find)
    let count = this.models[this.model()].count().where({})
    return count.then((count) => {
      return [count, find]
    }).spread((total, insts) => {
      opts = _.extend({
        req,
        total,
        page,
        itemsPerPage: this.itemsPerPage(),
        base: this.base(),
        user: req.user,
        title: 'All '+ pluralize(this.displayName()),
        instanceTitleField: this.titleField(),
        insts,
        idField: this.idField(),
        name: this.displayName(),
        attributes: this._getAttrs(this.models[this.model()])
      }, opts)
      if(!opts[pluralize(this.model())]) opts[pluralize(this.model())] = insts
      else opts.insts = opts[pluralize(this.model())]
      return this.templater.render(this.templatePrefix()+'-list', opts).then(res.send.bind(res));
    }).catch((e) => {console.log('caught', e)})
  }

  detail (req, res, opts = {}) {
    let query = {}
    query[this.idField()] = req.params[this.idField()]
    let find = this.models[this.model()].findOne().where(query)
    find = this._populate(find)
    return find.then((inst) => {
      if(!inst) return res.status(404).send()
      opts = _.extend({
        req,
        base: this.base(),
        user: req.user,
        title: inst[this.titleField()],
        inst,
        itemsPerPage: this.itemsPerPage(),
        name: this.displayName(),
        attributes: this._getAttrs(this.models[this.model()])
      }, opts)
      if(!opts[this.model()]) opts[this.model()] = inst;
      else opts.inst = opts[this.model()]
      return this.templater.render(this.templatePrefix()+'-detail', opts).then(res.send.bind(res));
    })
  }

  _getAttrs(model) {
    let ignore = this.ignore()
    let display = this.display()
    let ignoreType = ['objectId']
    return _(model._attributes)
    .keys()
    .map((k) => {let ret = model._attributes[k]; ret.name = k; if(!ret.label) ret.label = this._sanitizeName(k); return ret})
    .filter((k) => {
      if(display.length > 0)
        return _(display).contains(k.name)
      else
        return true
    })
    .filter((k) => {
      let ret = _(ignore).contains(k.name) 
      if(!ret) ret = _(ignoreType).contains(k.type)
      return !ret
    })
  }

  _populate(find) {
    let populate = this.modelPopulate()
    if (populate.length > 0) find = find.populate(populate)
    return find
  }

  _sanitizeName(string) {
    return morph.toTitle(string)
  }
  
}
