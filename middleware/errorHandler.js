const { ErrorCode } = require("../utils/enums");

const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);
  let errorMessage;

  switch (err.code) {
    case ErrorCode.USER_NOT_FOUND:
      errorMessage = "User not found";
      break;
    case ErrorCode.INVALID_REQUEST:
      errorMessage = "Invalid request";
      break;
    default:
      errorMessage = "Internal Server Error";
  }

  res.status(err.code || ErrorCode.INTERNAL_SERVER_ERROR).render("error", {
    errorCode: err.code || ErrorCode.INTERNAL_SERVER_ERROR,
    errorMessage: errorMessage,
  });
};

module.exports = errorHandler;
