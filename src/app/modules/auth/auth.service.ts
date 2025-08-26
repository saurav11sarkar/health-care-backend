import prisma from "../../../shared/prisma";
import bcrypt from "bcryptjs";
import AppError from "../../error/appError";
import http from "http-status-codes";
import { jwtHelpers } from "../../../helper/jwtHelpers";
import { UserStatus } from "@prisma/client";
import config from "../../../config";
import { Secret } from "jsonwebtoken";
import emailSender from "./emailSender";

const loginUser = async (payload: { email: string; password: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.password,
    userData.password
  );
  if (!isCorrectPassword)
    throw new AppError(http.BAD_REQUEST, "password is not currect");

  const accessToken = jwtHelpers.genaretToken(
    { email: userData.email, role: userData.role },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expires
  );

  const refreshToken = jwtHelpers.genaretToken(
    { email: userData.email, role: userData.role },
    config.jwt.jwt_refresh_secret as Secret,
    config.jwt.jwt_refresh_expires
  );

  return {
    accessToken,
    refreshToken,
    needPasswordChange: userData.needPasswordChange,
  };
};

const refreshToken = async (token: string) => {
  let decodedData;
  try {
    decodedData = jwtHelpers.verifyToken(
      token,
      config.jwt.jwt_refresh_secret as Secret
    );
  } catch (error) {
    throw new AppError(http.FORBIDDEN, "Invalid Refresh Token");
  }

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email,
      status: UserStatus.ACTIVE,
    },
  });

  const accessToken = jwtHelpers.genaretToken(
    { email: userData.email, role: userData.role },
    config.jwt.jwt_secret as Secret,
    config.jwt.jwt_expires
  );

  return {
    accessToken,
    needPasswordChange: userData.needPasswordChange,
  };
};

const changePassword = async (payload: any, user: any) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
  });

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.oldPassword,
    userData.password
  );
  if (!isCorrectPassword)
    throw new AppError(http.FORBIDDEN, "Old Password is not currect");
  const hashedPassword: string = await bcrypt.hash(
    payload.newPassword,
    Number(config.round)
  );

  const result = await prisma.user.update({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
    data: {
      password: hashedPassword,
      needPasswordChange: false,
    },
  });

  if (!result) throw new AppError(http.FORBIDDEN, "Password change failed");
  return result;
};

const forgetPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
    include: {
      admin: true,
      doctor: true,
      patient: true,
    },
  });
  if (!userData) throw new AppError(http.NOT_FOUND, "User not found");

  const resetPassword = jwtHelpers.genaretToken(
    { email: userData.email, role: userData.role },
    config.jwt.reset_pass_secret as Secret,
    config.jwt.reset_pass_expires
  );

  const resetPasswordLink = `${config.reset_password_link}?userId=${userData.id}&resetPasswordToken=${resetPassword}`;
  await emailSender(
    userData.email,
    `
    <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <h2 style="color: #333;">Dear ${
          userData.admin?.name ||
          userData.doctor?.name ||
          userData.patient?.name ||
          "user"
        },</h2>
        <p style="font-size: 16px; color: #555;">
          You requested to reset your password. Please click the button below to proceed:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetPasswordLink}" style="text-decoration: none;">
            <button style="background-color: #4CAF50; color: white; padding: 12px 24px; border: none; border-radius: 5px; font-size: 16px; cursor: pointer;">
              Reset Password
            </button>
          </a>
        </div>
        <p style="font-size: 14px; color: #999;">
          If you didn't request a password reset, please ignore this email.
        </p>
        <p style="margin-top: 40px; font-size: 14px; color: #333;">
          Regards,<br/>
          <strong>Health Care Team</strong>
        </p>
      </div>
      <p>${resetPasswordLink}</p>
    </div>
    `
  );
};

const resetPassword = async (
  token: string,
  payload: { id: string; password: string }
) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id: payload.id,
      status: UserStatus.ACTIVE,
    },
  });

  const isValidToken = jwtHelpers.verifyToken(
    token,
    config.jwt.reset_pass_secret as Secret
  );

  if (!isValidToken) throw new AppError(http.FORBIDDEN, "Invalid Token");

  const hassPassword = await bcrypt.hash(
    payload.password,
    Number(config.round)
  );

  const result = await prisma.user.update({
    where: {
      id: userData.id,
      status: UserStatus.ACTIVE,
    },
    data: {
      password: hassPassword,
      needPasswordChange: false,
    },
  });

  if (!result) throw new AppError(http.FORBIDDEN, "Password change failed");
  return result;
};

export const authService = {
  loginUser,
  refreshToken,
  changePassword,
  forgetPassword,
  resetPassword,
};
