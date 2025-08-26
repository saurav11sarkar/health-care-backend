import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export default {
  port: process.env.PORT,
  env: process.env.NODE_ENV,
  round: process.env.ROUND,
  jwt: {
    jwt_secret: process.env.JWT_SECRET,
    jwt_expires: process.env.JWT_EXPIRES_IN,
    jwt_refresh_secret: process.env.JWR_REFRESH_SECRET,
    jwt_refresh_expires: process.env.JWT_REFRESH_EXPIRES_IN,
    reset_pass_secret: process.env.RESET_PASSWORD_TOKEN,
    reset_pass_expires: process.env.RESET_PASSWORD_TOKEN_EXPIRES_IN,
  },
  reset_password_link: process.env.RESET_PASSWORD_LINK,
  emailSender: {
    nodemailer_email: process.env.NODEMAIL_EMAIL,
    nodemailer_password: process.env.NODEMAIL_PASSWORD,
  },
};
