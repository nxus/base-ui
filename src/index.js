/* 
* @Author: Mike Reich
* @Date:   2016-02-05 07:45:34
* @Last Modified 2016-02-05
*/

'use strict';

export default class Module {
  constructor(app) {
    app.onceAfter('startup', () => {
      app.get('router').request('getExpressApp').then((expressApp) => {
        expressApp.use(function notFoundHandler(req, res, next) {
          app.get('templater').request('render', '404', {req, user: req.user}).then((body) => {
            res.status(404).send(body)
            next()
          })
        })
      })
    })

    app.get('router').provide('route', "GET", '/error', (req, res) => {
      return app.get('templater').request('render', '500', {req, user: req.user}).then(res.send.bind(res))
    })
  }
} 