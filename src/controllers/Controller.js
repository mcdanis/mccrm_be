class Controller {
  response(res, data, code = 200) {
    res.status(code).json(data);
  }
}

module.exports = Controller;
