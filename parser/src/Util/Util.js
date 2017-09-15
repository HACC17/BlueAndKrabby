const Path = require('path');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('graceful-fs'));

// File Functions

module.exports.readfile = function (path) {
  return fs.readFileAsync( path, {encoding: 'utf8'} ).then(file=>file);
};

module.exports.getFilename = function (path) {
  return Path.basename(path, '.htm');
};

module.exports.isHTM = function (path) {
  return (Path.extname(path) === '.htm');
};

// Folder Functions

module.exports.readdir = function (path){
  return fs.readdirAsync( path ).then(files=>files);
}

module.exports.isDirectory = function (path) {
  return fs.lstatAsync(path).then(file=>file.isDirectory());
}