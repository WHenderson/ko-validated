# ko-validation-base
Knockout validation framework. Do one thing. Do it Well.
[![Build Status](https://travis-ci.org/WHenderson/ko-validation-base.svg?branch=master)](https://travis-ci.org/WHenderson/ko-validation-base)
[![Coverage Status](https://coveralls.io/repos/WHenderson/ko-validation-base/badge.svg?branch=master&service=github)](https://coveralls.io/github/WHenderson/ko-validation-base?branch=master)

## Installation

### Node
    npm install ko-validation-base

### Web
    bower install ko-validation-base

## Usage

### node
```js
require('ko-validation-base');
```

### web (global)
```html
<html>
    <head>
        <script type="text/javascript" src="ko-validation-base.web.min.js"></script>
    </head>
    <body>
        <script>
        </script>
    </body>
</html>
```

### web (amd)
```js
require.config({
  paths: {
      "ko-validation-base": "ko-validation-base.web.min.js"
  }
});
require(['ko-validation-base'], function () {
});
```

## API

### methods
