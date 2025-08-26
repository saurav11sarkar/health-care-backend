import catchAsycn from "../../../shared/catchAsycn";
import sendResponse from "../../../shared/sendResponse";
import { authService } from "./auth.service";
import http from "http-status-codes";

const loginUser = catchAsycn(async (req, res) => {
  const result = await authService.loginUser(req.body);

  const { refreshToken } = result;

  res.cookie("refreshToken", refreshToken, {
    secure: false,
    httpOnly: true,
  });

  sendResponse(res, {
    statusCode: http.OK,
    success: true,
    message: "User logged in successfully",
    data: {
      accessToken: result.accessToken,
      needPasswordChange: result.needPasswordChange,
    },
  });
});

const refreshToken = catchAsycn(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await authService.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: http.OK,
    success: true,
    message: "User Refresh token",
    data: {
      accessToken: result.accessToken,
      needPasswordChange: result.needPasswordChange,
    },
  });
});

const changePassword = catchAsycn(async (req, res) => {
  const result = await authService.changePassword(req.body, req.user);
  sendResponse(res, {
    statusCode: http.OK,
    success: true,
    message: "Password changed successfully",
    data: result,
  });
});

const forgetPassword = catchAsycn(async (req, res) => {
  await authService.forgetPassword(req.body);
  sendResponse(res, {
    statusCode: http.OK,
    success: true,
    message: "Reset link sent to your email",
    data: null,
  });
});

const resetPassword = catchAsycn(async (req, res) => {
  const token = req.headers.authorization || "";
  const result = await authService.resetPassword( token,req.body);
  sendResponse(res, {
    statusCode: http.OK,
    success: true,
    message: "Password reset successfully",
    data: result,
  });
});

export const authController = {
  loginUser,
  refreshToken,
  changePassword,
  forgetPassword,
  resetPassword,
};
