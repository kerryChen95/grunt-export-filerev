;'use strict'
var crypto = require('crypto')
var eachAsync = require('each-async')
var fs = require('fs')
var chalk = require('chalk')
var bindArgs = require('bind-args')

module.exports = function (grunt) {
  grunt.registerMultiTask(
    'export-filerev',
    'Calculate file revision based on file content and export revision by' +
    'callback for your custom useage',
    bindArgs(exportFilerev, grunt)
  )
}

function exportFilerev (grunt) {
  var taskDone = this.async()
  var HEX
  var options = this.options({
    algorithm: 'md5',
    length: 8,
    // Optional values: `16`, `32`
    // radix: HEX = 16,
    onFileDone: function (revision, file, done) {
      done()
    },
    onAllFilesDone: function (summary, done) {
      done()
    }
  })
  var summary = {}
  var task = this
  var filesSrc = task.filesSrc.filter(function (file) {
    return grunt.file.isFile(file)
  })

  eachAsync(
    filesSrc,
    function (file, i, eachDone) {
      // `hash` is readable and writeable stream
      var hash = crypto.createHash(options.algorithm)
      var readStream = fs.createReadStream(file)
      .on('readable', function () {
        var buffer = readStream.read()
        hash.update(buffer)
      })
      .on('end', function () {
        var revision = hash.digest('hex')
        revision = revision.slice(0, options.length)
        // if (options.radix !== HEX) {
        //   revision = parseInt(revision, HEX).toString(options.radix)
        // }
        summary[file] = revision
        grunt.verbose.writeln(
          'Revision: ' + chalk.cyan(file) + '->' + chalk.cyan(revision)
        )
        options.onFileDone(revision, file, eachDone)
      })
    },
    function finish (error) {
      if (error) {
        grunt.fail.fatal(error)
      }
      grunt.log.writeln(
        chalk.cyan('Export the summary of file revision:\n') + JSON.stringify(summary, null, 2)
      )
      grunt.config(task.nameArgs, summary)
      options.onAllFilesDone(summary, taskDone)
    }
  )
}
