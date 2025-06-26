import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Required for port 465
  auth: {
    user: "bindaaspay@gmail.com",
    pass: "nqouaxbsffpoehij",
  },
});

export default transporter;

transporter.verify((err, success) => {
  if (err) {
    console.error("SMTP Error:", err);
  } else {
    console.log("SMTP server ready to send emails");
  }
});