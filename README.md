# Nosg

![draft](https://img.shields.io/badge/stability-draft-lightgrey.svg?style=flat-square)

![Branch : master](https://img.shields.io/badge/Branch-master-blue.svg)
[![version](https://img.shields.io/badge/version-0.0.0-blue.svg)](https://github.com/AlexisTessier/nosg#readme)
[![npm version](https://badge.fury.io/js/nosg.svg)](https://badge.fury.io/js/nosg)

[![Build Status](https://travis-ci.org/AlexisTessier/nosg.svg?branch=master)](https://travis-ci.org/AlexisTessier/nosg)
[![Coverage Status](https://coveralls.io/repos/AlexisTessier/nosg/badge.svg?branch=master&service=github)](https://coveralls.io/github/AlexisTessier/nosg?branch=master)

[![Dependency Status](https://david-dm.org/AlexisTessier/nosg.svg)](https://david-dm.org/AlexisTessier/nosg)
[![devDependency Status](https://david-dm.org/AlexisTessier/nosg/dev-status.svg)](https://david-dm.org/AlexisTessier/nosg#info=devDependencies)

Not only static generator

-   [Section Name](#section-name)
-   [Documentation](#documentation)
-   [License](#license)

## Section Name

### Title

#### Subtitle

paragraph content

```javascript
// javascript code
```

    // cli code

-   list element

## Documentation

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### check-sources-directory

Ensure that a sources directory is present and readable.

**Parameters**

-   `options` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** An object containing the command options.
    -   `options.sourcesDirectory` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The path to the sources directory of the nosg project to check.

Returns **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The absolute path to sources directory.

### list-matching-filepaths

Take a nosg component path and return the list of matching filepaths.

**Parameters**

-   `options` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** An object containing the command options.
    -   `options.componentPath` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The nosg component path from which find the matching filepaths.
    -   `options.sourcesDirectory` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The path to the sources directory of the nosg project to use.

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** An array of filepaths matching the component path

### run-generator

Run a NOSG generator. A NOSG generator is a function which generate files using a generate function.

**Parameters**

-   `options` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** An object containing the command options.
    -   `options.generator` **([function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function) \| [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String))** The generator to use. It can be a function, the name of one nosg generator in the generators layers, or a Javascript Value Locator to a function.
    -   `options.options` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** The options passed to the generator function.
    -   `options.sourcesDirectory` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The path to the sources directory of the nosg project to use.
    -   `options.timeout` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** The command timeout. If the command is not terminated after this duration, an error will be thrown.
    -   `options.generate` **([function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function) \| [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | JVL)** The generate function to pass to the generator.

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** A promise which resolve when all the generator ends to generate files.

## License

nosg is released under [MIT](http://opensource.org/licenses/MIT). 
Copyright (c) 2017-present [Alexis Tessier](https://github.com/AlexisTessier)
