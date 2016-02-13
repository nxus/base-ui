# @nxus/base-ui

[![Build Status](https://travis-ci.org/nxus/base-ui.svg?branch=master)](https://travis-ci.org/nxus/base-ui)

Base UI pages including 404 and error page handlers.

## Installation

    > npm install @nxus/base-ui --save

## Usage

The module registers two handlers:

1.  404: If no other handler responds the route, the module will render the `404` template and return the rendered content.
2.  `/error`: On a 50x error, the router will redirecto to `/error` and the module will render the `500` template and return the rendered content.

## Customizing

If you want to provide your own 404 or 500 page, define the relevant new template. Base-ui will use these to handle the routes above.

### 404 Page Template

    app.get('templater').template('404', 'ejs', 'path/to/my/404template.ejs')

### 500 Page Template

    app.get('templater').template('500', 'ejs', 'path/to/my/500template.ejs')

## API
