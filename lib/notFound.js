function notFound () {
  return function (req, res, next) {
    res.respond('NotFound');
  }
}

module.exports = notFound;
