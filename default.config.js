var path = require('path');
var _ = require('lodash');
var moment = require('moment');

var input = {
  options: {
    delimiter: ',',
    rowDelimiter: '\n',
    trim: true,
    columns: true
  }
};

// Let say you have 3 source files with different columns
// and no header in any file
// Let say you like them to output the same
// tom-yyyy-mm-dd.csv
// dick-yyyy-mm-dd.csv
// harry-yyy-mm-dd.csv
// 
// You can define the header schema/columns like so
var schema = {
  tom: 'FirstName,LastName,MiddleName,BirthDate,Id',
  dick: 'Id,LastName,FirstName,BirthDate',
  harry: 'Id,BirthDate,LastName,FirstName'
};

var output = {
  options: {
    delimiter: ',',
    rowDelimiter: '\n'
  },
  headers: [
    "Id",
    "FirstName",
    "LastName"
  ]
};

module.exports = {
  input: input,
  output: output,
  transform: function(row, fullPath) {
    // get the filename
    var fileName = path.basename(fullPath);

    // get the first part of the file as fileSource
    var fileParts = fileName.split('-');
    var fileSource = fileParts[0].toLowerCase();

    // get the schema from the filesource and create a record
    var schemaIdx = schema[fileSource].split(',');
    var newRecord = {
      Source: fileSource
    };
    _.each(schemaIdx, function(v, k) {
      // make sure the key is trimmed just in case user added space
      var cleanKey = k.replace(/^\s+|\s$/gi, '');
      newRecord[k] = row[k];
    });

    // return the new record
    return newRecord;
  },
  /**
   * get the destination/output file names base on row data
   * example: [./out/{tom,dick,harry}/recordId.json]
   * this method return an array of file path or an empty array
   * if you do not want to persist the record
   * @param  {[type]} row the record
   * @return {[type]}     an array of file paths
   */
  getDestFiles: function(row) {
    // this is where you can configure your out path
    var basePath = './out';
    var filePath = path.join(basePath, row.Source);
    return [path.join(filePath, row.Id + '.json')];
  },
  finally: function() {
    // do something you want before exit
    process.exit(0);
  }
};
