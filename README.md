# ko-validated
Knockout validation framework. Do one thing. Do it Well.
[![Build Status](https://travis-ci.org/WHenderson/ko-validated.svg?branch=master)](https://travis-ci.org/WHenderson/ko-validated)
[![Coverage Status](https://coveralls.io/repos/WHenderson/ko-validated/badge.svg?branch=master&service=github)](https://coveralls.io/github/WHenderson/ko-validated?branch=master)

## Installation

### Node
    npm install ko-validated

### Web
    bower install ko-validated

## Usage

### node
```js
require('ko-validated');
```

### web (global)
```html
<html>
    <head>
        <script type="text/javascript" src="ko-validated.web.min.js"></script>
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
      "ko-validated": "ko-validated.web.min.js"
  }
});
require(['ko-validated'], function () {
});
```

## API

### methods
