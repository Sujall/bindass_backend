import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Convert port to number if it's coming from a .env file
const port = parseInt(process.env.SMTP_PORT || "465", 10);

if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  throw new Error("Missing SMTP configuration in environment variables.");
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port,
  secure: port === 465, // True for 465, false for other ports (e.g., 587)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP connection failed:", error);
  } else {
    console.log("SMTP server is ready to send emails");
  }
});

export default transporter;
