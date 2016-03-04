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

function arrayToCsv(arr, delimiter) {
  return _.map(arr, function(value) {
    if (typeof value === "string") {

      // handle numeric and empty string
      if (/^\d+$/gi.test(value)) {
        return value;
      } else if (!value) {
        return value;
      }

      // escape a string with stringify
      value = JSON.stringify(value);
    }
    return value;
  }).join(delimiter || ',');
}

function writeFile(obj, outFile, cout) {
  outFile = path.resolve(outFile);

  var basePath = path.dirname(outFile);
  if (!exists(basePath, true)) {
    mkdirp.sync(basePath);
  }

  if (!exists(outFile)) {
    fs.writeFileSync(
      outFile,
      arrayToCsv(cout.headers, cout.options.delimiter) + cout.options.rowDelimiter
    );
  }

  var arr = _.map(cout.headers, function(k) {
    return obj[k];
  });

  fs.appendFileSync(
    outFile,
    arrayToCsv(arr, cout.options.delimiter) + cout.options.rowDelimiter
  );
}

function appendObject(items, cb) {
  var $that = this;
  _.each(items, function(obj, k) {
    var config = $that.config;
    var cout = config.output;
    var outFiles = config.getDestFiles ? config.getDestFiles(obj) : [];
    _.each(outFiles, function(v, k) {
      writeFile(obj, v, cout);
    });
  });

  cb();
}

module.exports = function(filePath, configFile) {
  config = require(configFile);
  var batchRequestStream = createBatchRequestStream({
    request: appendObject,
    batchSize: 100,
    maxLiveRequests: 100,
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

  readStream.on('end', function() {
    if (config.finally) {
      config.finally();
    }

    process.exit(0);
  });

  setInterval(function() {
    // noop
  }, 1000);
};
