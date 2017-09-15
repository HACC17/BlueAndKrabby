module.exports.status = function (message) {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(message);
};

module.exports.console = function (message) {
  console.log(message);
};