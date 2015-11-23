# ko-validation
Knockout validation framework. Do one thing. Do it Well.
[![Build Status](https://travis-ci.org/WHenderson/ko-validation.svg?branch=master)](https://travis-ci.org/WHenderson/ko-validation)
[![Coverage Status](https://coveralls.io/repos/WHenderson/ko-validation/badge.svg?branch=master&service=github)](https://coveralls.io/github/WHenderson/ko-validation?branch=master)

## Installation

### Node
    npm install ko-validation

### Web
    bower install ko-validation

## Usage

### node
```js
require('ko-validation');
```

### web (global)
```html
<html>
    <head>
        <script type="text/javascript" src="ko-validation.web.min.js"></script>
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
      "ko-validation": "ko-validation.web.min.js"
  }
});
require(['ko-validation'], function () {
});
```

## API

### methods
