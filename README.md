# nxus-base-ui

## 

[![Build Status](https://travis-ci.org/nxus/base-ui.svg?branch=master)](https://travis-ci.org/nxus/base-ui)

Base UI pages including 404 and error page handlers.

### Installation

    > npm install nxus-base-ui --save

### Usage

The module registers two handlers:

1.  404: If no other handler responds the route, the module will render the `404` template and return the rendered content.
2.  `/error`: On a 50x error, the router will redirecto to `/error` and the module will render the `500` template and return the rendered content.

### Model View helpers

The module provides a helper for generating list/detail views from a model:

    app.get('base-ui').viewModel('user', {base: '/users', titleField: 'email'})

You may pass in an options object, as in this example, or subclass of ViewBase, or a string path to a subclass of ViewBase.

    import {ViewBase} from '@nxus/base-ui'

    class UserView extends ViewBase {
      model() {
        return 'user'
      }
      base() {
        return '/users'
      }
      titleField() {
        return 'email
      }
    }

    app.get('base-ui').viewModel(UserView)

### Customizing

If you want to provide your own 404 or 500 page, define the relevant new template. Base-ui will use these to handle the routes above.

#### 404 Page Template

    app.get('templater').template('path/to/my/404.ejs')

#### 500 Page Template

    app.get('templater').template('path/to/my/500.ejs')

#### List and Detail View

You can specify your own list view template to use instead of the default. The base-ui module looks for a template matching the following 
pattern: `view-<model>-list` and `view-<model>-detail`.

Each template will be passed either a model instance (for detail view) or an array of models (for list view), using the model name.

So using the examples above:

    app.get('templater').template('view-user-list', (opts) => {
      return app.get('renderer').render("<% users.forEach(function(user){ .... }) %>", opts)
    })

    app.get('templater').template('view-user-detail', (opts) => {
      return app.get('renderer').render("<%= user.email %>", opts)
    })

### API

* * *

## ViewBase

The ViewBase class provides a helper module for defining Base-UI based pages.

**Examples**

```javascript
class TodoView extends ViewBase {
 base () {
    return '/todo'
  }
 model () {
    return 'todo'
  }
 templateDir () {
    return __dirname+'/views'
  }
}
```

### base

The base url for the UI pages.

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Defaults to `/<models>`

### detailTemplate

The template to use to display the detail partial. Defaults to 'page'.

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 

### display

Fields in the model to show

Returns **[array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 

### displayName

The display name for the model to use in the  UI

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Defaults to `<model>`

### idField

The ID field to use to display a single itme

Returns **[array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 

### ignore

Fields in the model to ignore in the UI

Returns **[array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 

### itemsPerPage

The number of results to display per page

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Defaults to `<model>`

### listTemplate

The template to use for the list partial. Defaults to 'page'.

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 

### model

Define the primary model for this view module

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 

### modelPopulate

Define any populated relationships for the model

Returns **[array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 

### sortDirection

List sort direction

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 

### sortField

Fields in the model to use for sorting the list

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 

### templateDir

The directory to find the templates.

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Defaults to null.

### templatePrefix

The prefix to use for the templates. Defaults to `view-<model>-`

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 

### titleField

Fields in the model to use for the instance title

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 

## BaseUI

The base-ui module class.

### getViewModel

Returns a viewModel, if it has been regsitered

**Parameters**

-   `model` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** the name of the model to return

Returns **ViewBase** An instance of the viewModel

### getViewModels

Returns all the registered viewModel instances

Returns **[array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** An array of the viewModel/viewBase instances.

### viewModel

Creates a List and Detail UI for the specified model, including all routes and views.  You can pass in the following combinations:

1.  a model name and opts hash.
2.  a path to a file which is a subclass of ViewBase
3.  a class which is a subclass of ViewBase

Routes created are:

-   `/<base>`: list page 
-   `/<base>/:id`: detail page

Views which can be overriden are:

-   `view-<model>-list`: the list page view
-   `view-<model>-detail`: the detail page view

Options available are:

-   `base`: the url at which the paths are created. For example, '/users'.
-   `templatePrefix`: a custom prefix for generated templates. Defaults to `view-<model>`.
-   `ignore`: an array of model fields to ignore in the UI. Defaults to `['id', 'createdAt', 'updatedAt']`
-   `templateDir`: a directory containing the list/form templates for the model. Defaults to none.
-   `displayName`: an alternate name to use for the display in the UI. Defaults to `model`.
-   `instanceTitle`: attribute of instance to use for title and link

**Parameters**

-   `model` **([string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)|class)** Can either be a model name, a path to a file or an ViewBase Subclass.
-   `opts` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)=(default {})** An options hash, wich is used to configure the UI.
