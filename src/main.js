var fs = require('fs');
var csv = require('csv');
var path = require('path');
var createBatchRequestStream = require('batch-request-stream');
var mkdirp = require('mkdirp');
var config = {};

function exists(filePath, isFolder) {
  try {
    var stat = fs.statSync(filePath);
    return isFolder ? stat.isDirectory() : stat.isFile();
  } catch (err) {
    return false;
  }
}

function appendObject(obj) {
  var outFile = config.getDestPath ? config.getDestFile(record) : './out/out.json';
  var configData = '[]';

  if (!exists(outFile)) {
    configData = fs.readFileSync(outFile);
  }

  var basePath = path.dirname(outFile);
  if (!exists(basePath, true)) {
    mkdirp(basePath);
  }

  var config = JSON.parse(outFile);
  config.push(obj);
  var configJSON = JSON.stringify(config);
  fs.writeFileSync(outFile, configJSON);
}

var batchRequestStream = createBatchRequestStream({
  request: appendObject,
  batchSize: 200,
  maxLiveRequests: 1,
  streamOptions: {
    objectMode: true
  }
});

module.exports = function(filePath, configFile) {
  config = require(configFile);

  var readStream = fs.createReadStream(filePath);
  readStream.on('open', function() {
    readStream.pipe(csv.parse(config.input.options))
      .pipe(csv.transform(function(row) {
        return config.transform(row, filePath);
      }))
      .pipe(batchRequestStream)
  });

  readStream.on('end', config.finally || function() {
      process.exit(0);
    });
};
