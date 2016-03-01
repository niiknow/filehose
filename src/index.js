var yargs = require('yargs');
var main = require('./main.js');
var pkg = require('../package.json');
var path = require('path');

module.exports = function(currentDir) {
  var argv = yargs
    .usage('$0 [options] <source>')
    .options({
      config: {
        alias: 'c',
        description: 'Name of the configuration file.',
        default: './default.config.js'
      }
    })
    .help('help').alias('help', 'h').describe('h', 'Show help.')
    .example('$0 yourFile.csv', 'Process yourFile.csv default config.')
    .example('$0 -c override.js yourFile.csv', 'Process yourFile.csv with override.js config file.')
    .epilog('Home page and docs: https://github.com/niiknow/filehose')
    .demand(1)
    .argv;

  var configFile = argv.c;
  var filePath = argv._[0];

  if (configFile.indexOf('./') > -1 || configFile.indexOf('/') < 0) {
    configFile = path.join(currentDir, argv.c);
  }

  if (filePath.indexOf('./') > -1 || filePath.indexOf('/') < 0) {
    filePath = path.join(currentDir, filePath);
  }

  main(filePath, configFile);
};