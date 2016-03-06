var yargs = require('yargs');
var main = require('./main.js');
var pkg = require('../package.json');
var path = require('path');

module.exports = function(currentDir) {
  var argv = yargs
    .usage('$0 yourConfig.js yourFile.csv')
    .help('help').alias('help', 'h').describe('h', 'Show help.')
    .epilog('Home page and docs: https://github.com/niiknow/filehose')
    .demand(2)
    .argv;

  var configFile = argv._[0];
  var filePath = argv._[1];

  if (configFile.indexOf('./') > -1 || configFile.indexOf('/') < 0) {
    configFile = path.join(currentDir, configFile);
  }

  if (filePath.indexOf('./') > -1 || filePath.indexOf('/') < 0) {
    filePath = path.join(currentDir, filePath);
  }

  main(filePath, configFile);
};