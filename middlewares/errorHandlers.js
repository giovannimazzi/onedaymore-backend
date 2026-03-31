function error404(req, res, next) {
  return res.status(404).json({
    message: "endpoint not found",
  });
}

function error500(err, req, res, next) {
  console.log(err.message);
  return res.status(500).json({
    message: "internal server error",
  });
}

module.exports = { error404, error500 };
