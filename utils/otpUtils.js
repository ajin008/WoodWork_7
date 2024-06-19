// otpUtils.js

const nodemailer = require("nodemailer");

// Creating transporter using SMTP
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "woodworksonlinestore@gmail.com",
    pass: "eemn qazd qztq kunr",
  },
});

// Function to generate and send OTP
const sendOTP = async (email) => {
  // Generate a random OTP (e.g., a 6-digit number)
  const otp = Math.floor(100000 + Math.random() * 900000); // Generates a random 6-digit OTP

  // Email content
  const mailOptions = {
    from: "woodworksonlinestore@gmail.com",
    to: email,
    subject: "OTP for Account Verification",
    text: `Your OTP (One-Time Password) for account verification is: ${otp}`,
  };

  // Send the email
  try {
    await transporter.sendMail(mailOptions);
    return otp; // Return the generated OTP
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP"); // Handle the error appropriately
  }
};

// Function to send a welcome email
const sendWelcomeEmail = async (email) => {
  // Email content
  const mailOptions = {
    from: "woodworksonlinestore@gmail.com",
    to: email,
    subject: "Welcome to WoodWorks Online Store",
    text: `Dear user,\n\nWelcome to WoodWorks Online Store! We are thrilled to have you with us. Start shopping for the best woodworks products today.\n\nBest regards,\nThe WoodWorks Team`,
  };

  // Send the email
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new Error("Failed to send welcome email"); // Handle the error appropriately
  }
};

module.exports = { sendOTP, sendWelcomeEmail };
