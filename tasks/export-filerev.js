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
  var options = this.options({
    algorithm: 'md5',
    length: 8,
    onFileDone: noop,
    onDone: noop
  })
  var summary = {}
  var task = this

  eachAsync(task.files, function (el, i, eachDone) {
    eachAsync(el.src, function (srcFile, j, eachDone2) {
      if (grunt.file.isDir(srcFile)) {
        return
      }

      // readable and writable stream
      var hash = crypto.createHash(options.algorithm)
      var fileStream = fs.createReadStream(srcFile)
      .on('readable', function () {
        var buffer = fileStream.read()
        hash.update(buffer)
      })
      .on('end', function () {
        var revision = hash.digest('hex')
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
    options.onDone(summary)
    grunt.log.writeln(
      'Export file revision:\n' + JSON.stringify(summary, null, 2)
    )
    taskDone()
  })
}

function noop () {}