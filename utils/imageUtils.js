const sharp = require("sharp");

async function resizeAndCropImage(imageBuffer) {
  console.log("Input image buffer:", imageBuffer); // Log the input buffer
  return await sharp(imageBuffer)
    .resize({ width: 500, height: 500, fit: "inside" }) // Set predefined dimensions and fit
    .toBuffer(); // Convert back to buffer
}

module.exports = { resizeAndCropImage };
