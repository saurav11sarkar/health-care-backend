import nodemailer from "nodemailer";
import config from "../../../config";

const emailSender = async (email: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: config.emailSender.nodemailer_email,
      pass: config.emailSender.nodemailer_password,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const info = await transporter.sendMail({
    from: '"Health Care" <sauravsarkar.developer@gmail.com>',
    to: email,
    subject: "Reset Password Link",
    // text: "Hello world?",
    html: html, // HTML body
  });

  console.log("Message sent:", info.messageId);
};

export default emailSender;
