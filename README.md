# @nxus/base-ui

[![Build Status](https://travis-ci.org/nxus/base-ui.svg?branch=master)](https://travis-ci.org/nxus/base-ui)

Base UI pages including 404 and error page handlers.

## Installation

    > npm install @nxus/base-ui --save

## Usage

The module registers two handlers:

1.  404: If no other handler responds the route, the module will render the `404` template and return the rendered content.
2.  `/error`: On a 50x error, the router will redirecto to `/error` and the module will render the `500` template and return the rendered content.

## Model View helpers

The module provides a helper for generating list/detail views from a model:

    app.get('base-ui').modelView('user', {base: '/users', titleField: 'email'})

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

    app.get('base-ui').modelView(UserView)

## Customizing

If you want to provide your own 404 or 500 page, define the relevant new template. Base-ui will use these to handle the routes above.

### 404 Page Template

    app.get('templater').template('404', 'ejs', 'path/to/my/404template.ejs')

### 500 Page Template

    app.get('templater').template('500', 'ejs', 'path/to/my/500template.ejs')

## API

### ViewBase

[src/viewBase.js:24-174](https://github.com/nxus/base-ui/blob/dc004e929e375183efc805d81f669e980338ed78/src/viewBase.js#L24-L174 "Source code on GitHub")

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

#### base

[src/viewBase.js:63-65](https://github.com/nxus/base-ui/blob/dc004e929e375183efc805d81f669e980338ed78/src/viewBase.js#L63-L65 "Source code on GitHub")

The base url for the UI pages.

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Defaults to `/<models>`

#### displayName

[src/viewBase.js:87-89](https://github.com/nxus/base-ui/blob/dc004e929e375183efc805d81f669e980338ed78/src/viewBase.js#L87-L89 "Source code on GitHub")

The display name for the model to use in the  UI

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Defaults to `<model>`

#### ignore

[src/viewBase.js:47-49](https://github.com/nxus/base-ui/blob/dc004e929e375183efc805d81f669e980338ed78/src/viewBase.js#L47-L49 "Source code on GitHub")

Fields in the model to ignore in the UI

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 

#### model

[src/viewBase.js:95-98](https://github.com/nxus/base-ui/blob/dc004e929e375183efc805d81f669e980338ed78/src/viewBase.js#L95-L98 "Source code on GitHub")

Define the primary model for this view module

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 

#### model\_populate

[src/viewBase.js:104-106](https://github.com/nxus/base-ui/blob/dc004e929e375183efc805d81f669e980338ed78/src/viewBase.js#L104-L106 "Source code on GitHub")

Define any populated relationships for the model

Returns **[array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 

#### templateDir

[src/viewBase.js:71-73](https://github.com/nxus/base-ui/blob/dc004e929e375183efc805d81f669e980338ed78/src/viewBase.js#L71-L73 "Source code on GitHub")

The directory to find the templates.

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** Defaults to null.

#### templatePrefix

[src/viewBase.js:79-81](https://github.com/nxus/base-ui/blob/dc004e929e375183efc805d81f669e980338ed78/src/viewBase.js#L79-L81 "Source code on GitHub")

The prefix to use for the templates. Defaults to `view-<model>-`

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 

#### titleField

[src/viewBase.js:55-57](https://github.com/nxus/base-ui/blob/dc004e929e375183efc805d81f669e980338ed78/src/viewBase.js#L55-L57 "Source code on GitHub")

Fields in the model to use for the instance title

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 

### viewModel

[src/index.js:50-67](https://github.com/nxus/base-ui/blob/dc004e929e375183efc805d81f669e980338ed78/src/index.js#L50-L67 "Source code on GitHub")

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
-   `opts` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** An options hash, wich is used to configure the UI.
