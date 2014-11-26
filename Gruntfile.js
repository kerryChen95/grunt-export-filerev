;'use strict'
var assert = require('assert')
var hashMap = require('./test/hash-map')
var _ = require('lodash')
var bindArgs = require('bind-args')

module.exports = function (grunt) {
  grunt.initConfig({
    'export-filerev': Object.create(prototype)
      .addTargetAlgorithm('md5').addTargetAlgorithm('sha1')
  })

  require('load-grunt-tasks')(grunt)

  grunt.loadTasks('tasks')
  grunt.registerTask('test', ['export-filerev'])
}

var prototype = {
  addTargetAlgorithm: function (algorithm) {
    var exportFilerevTask = this
    exportFilerevTask[algorithm] = {
      expand: true,
      cwd: 'test/fixtures',
      src: ['*', '**/*'],
      options: {
        algorithm: algorithm,
        onFileDone: bindArgs(this._assert, algorithm),
        onAllFilesDone: function (summary, done) {
          _.forOwn(summary, bindArgs(exportFilerevTask._assert, algorithm))
          done()
        }
      }
    }
    return this
  },
  // assert bound argumets for centain algorithm
  _assert: function (algorithm, actualRev, file, done) {
    assert.strictEqual(
      actualRev,
      hashMap[file][algorithm],
      'should support ' + algorithm + ' algorithm on file: ' + file
    )
    if (typeof done === 'function') {
      done()
    }
  }
}
