# grunt-export-filerev

> Calculate a revision value for each file based on file content, and export revision values by callback and `grunt.config()` for your custom usage, such as rename file, archive all files' revisions

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-export-filerev --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-export-filerev')
```

## The "export-filerev" task

### Overview
This task will calculate a revision value for each file based on file content, and export revision values by callback and `grunt.config()` for your custom usage, such as rename file, archive all files' revisions

```js
var fs = require('fs')
var pkg = requrie('./packge.json')

grunt.initConfig({
  'export-filerev': {
    options: {
      algorithm: 'md5', // default: 'md5'
      length: 8,
      onFileDone: function (revision, file, done) {
        // custom usage about revision value of a certain file
        fs.rename(file, path.join(revision, file), function (error) {
          if (error) {
            grunt.fail.warn(error)
          }
          done()
        })
      },
      onAllFilesDone: function (summary, done) {
        // custom usage about revisions summary
        var archiveFile = path.join('archive', pkg.version, 'revision-summary.json')
        summary = JSON.stringify(summary, null, 2)
        fs.writeFile(archive, summary, function (error) {
          if (error) {
            grunt.fail.warn(error)
          }
          done()
        })
      }
    },
    target1: {
      src: ['a.js', 'b.css', 'c.png'],
    }
  }
})
```

### Options

#### option.algorithm

Type: `string`

Default: `'md5'`

algorithm supported by [`crypto.createHash(algorithm)`](http://nodejs.org/api/crypto.html#crypto_crypto_createhash_algorithm), such as `'md5'`, `'sha1'`, `'sha256'`, `'sha512'`

#### option.length

Type: `number`

Default: `8`

The number of characters of revision value

#### option.onFileDone

Type: `function (revision, file, done)`

Default: `function (revision, file, done) { done() }`

Params:

* `revision`: `string` Revision value based on file content
* `file`: `string` Path to a certain src file
* `done`: `function` Invoke this callback when you finish your custom operation, designed to support asynchronize

This callback will be invoked for each file after their revision value is calculated.

#### option.onAllFilesDone

Type: `function (summary, done)`

Default: `function (summary, done) { done() }`

Params:

* `summary`: `object` A map from src files to corresponding revision values
* `done`: `function` The same with the param `done` of `option.onFileDone`

This callback will be invoked after revision values of all src files are calculated. **Notice directories are ignore internally**.

### Share revision values across multiple tasks

Apart from callback, this task also export revision summary on [`grunt.option()`](http://gruntjs.com/frequently-asked-questions#globals-and-configs) with the key as the name of the task, including any colon-separated arguments or flags specified on the command-line, actually [`this.nameArgs` inside tasks](http://gruntjs.com/api/inside-tasks#this.nameargs) is used as the key.
