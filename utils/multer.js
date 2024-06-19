// Multer configuration
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Set the destination folder where images will be uploaded
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Keep the original filename
  },
});

// const uploadMiddleware = multer({ storage: storage });
const uploadMiddleware = multer({ storage: storage }).array("images", 5);  


module.exports = uploadMiddleware;