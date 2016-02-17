/* 
* @Author: Mike Reich
* @Date:   2016-02-05 07:45:34
* @Last Modified 2016-02-17
*/

'use strict';

export default class Module {
  constructor(app) {
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
      return app.get('templater').render('500', {req, user: req.user}).then(res.send.bind(res))
    })

    app.get('router').provideBefore('route', 'GET', '/', function(req, res) {
      let content = "<h1>Welcome to Nxus!</h1>"
      return app.get('templater').render('default', { req: req, user: req.user, content}).then(res.send.bind(res));
    })
  }
} 