var path = require('path');
var _ = require('lodash');
var moment = require('moment');
var startTime = new Date();

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
   * example: [./out/{tom,dick,harry}/recordId.csv]
   * this method return an array of file path or an empty array
   * if you do not want to persist the record
   * @param  {[type]} row the record
   * @return {[type]}     an array of file paths
   */
  getDestFiles: function(row) {
    // this is where you can configure your out path
    var basePath = './out';
    var filePath = path.join(basePath, row.Source);
    return [path.join(filePath, row.Id + '.csv')];
  },
  finally: function() {
    var endTime = new Date();
    // write out summary
    var summary = {
      startTime: moment(startTime).utc().format(),
      endTime: moment(endTime).utc().format(),
      duration: (endTime - startTime) / 1000
    };
    console.log(JSON.stringify(summary, null, 2));

    // do something else before exit
    process.exit(0);
  }
};
