;'use strict'
var crypto = require('crypto')
var eachAsync = require('each-async')
var fs = require('fs')
var chalk = require('chalk')

module.exports = function (grunt) {
  grunt.registerMultiTask(
    'export-filerev',
    'Calculate file revision based on file content and export revision by' +
    'callback for your custom useage',
    function () {
      var args = [].slice.call(arguments)
      args.unshift(grunt)
      exportFilerev.apply(this, args)
    }
  )
}

function exportFilerev (grunt) {
  var taskDone = this.async()
  var HEX
  var options = this.options({
    algorithm: 'md5',
    length: 8,
    // Optional values: `16`, `32`
    digit: HEX = 16,
    onFileDone: noop,
    onDone: noop
  })
  var summary = {}
  var task = this

  eachAsync(task.files, function (el, i, eachDone) {
    eachAsync(el.src, function (srcFile, j, eachDone2) {
      // readable and writable stream
      var hash = crypto.createHash(options.algorithm)
      var fileStream = fs.createReadStream(srcFile)
      .on('readable', function () {
        var buffer = fileStream.read()
        hash.update(buffer)
      })
      .on('end', function () {
        var revision = hash.digest('hex')
        if (options.digit !== HEX) {
          revision = parseInt(revision, HEX).toString(options.digit)
        }
        options.onFileDone(srcFile, revision)
        summary[srcFile] = revision
        eachDone2()
      })
    }, function finish2 (error) {
      if (error) {
        grunt.fail.fatal(error)
      }
      eachDone()
    })
  }, function finish (error) {
    if (error) {
      grunt.fail.fatal(error)
    }
    grunt.log.writeln(
      'Export file revision:\n' + JSON.stringify(summary, null, 2)
    )
    grunt.config(this.name + ':' + this.target, summary)
    options.onDone(summary)
    taskDone()
  })
}

function noop () {}
