var fs = require('fs');
var csv = require('csv');
var path = require('path');
var createBatchRequestStream = require('batch-request-stream');
var mkdirp = require('mkdirp');
var _ = require('lodash');
var config = {};

function exists(filePath, isFolder) {
  try {
    var stat = fs.statSync(filePath);
    return isFolder ? stat.isDirectory() : stat.isFile();
  } catch (err) {
    return false;
  }
}

function appendObject(items, cb) {
  var $that = this;
  _.each(items, function(obj, k) {
    var config = $that.config;
    var outFile = config.getDestFile ? config.getDestFile(obj) : './out/out.json';
    var configData = '[]';
    outFile = path.resolve(outFile);

    if (exists(outFile)) {
      configData = fs.readFileSync(outFile);
    }

    var basePath = path.dirname(outFile);
    if (!exists(basePath, true)) {
      console.log(basePath);
      mkdirp.sync(basePath);
    }

    var config = JSON.parse(configData);
    config.push(obj);
    var configJSON = JSON.stringify(config);
    fs.writeFileSync(outFile, configJSON);
  });

  cb();
}

module.exports = function(filePath, configFile) {
  config = require(configFile);
  var batchRequestStream = createBatchRequestStream({
    request: appendObject,
    batchSize: 100,
    maxLiveRequests: 2,
    streamOptions: {
      objectMode: true
    },
    config: config
  });

  var readStream = fs.createReadStream(filePath);
  readStream.on('open', function() {
    readStream.pipe(csv.parse(config.input.options))
      .pipe(csv.transform(function(row) {
        var record = config.transform(row, filePath);
        return record;
      })).pipe(batchRequestStream);;
  });

  readStream.on('end', config.finally || function() {
      console.log('finish');
      process.exit(0);
    });

  setInterval(function() {
    // noop
    var a = 1;
  }, 1000);
};
