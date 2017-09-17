const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('graceful-fs'));

module.exports.status = function (message) {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(message);
};

module.exports.console = function (message) {
  console.log(message);
};

module.exports.report = function (message) {
  fs.appendFile('output/report.txt', message+'\n');
}