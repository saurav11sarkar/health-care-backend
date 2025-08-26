import catchAsycn from "../../../shared/catchAsycn";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { userService } from "./user.service";

const createAdmin = catchAsycn(async (req, res) => {
  const result = await userService.createAdmin(req);
  res.status(201).json({
    success: true,
    message: "Admin created successfully",
    data: result,
  });
});

const createDoctor = catchAsycn(async (req, res) => {
  const result = await userService.createDoctor(req);
  res.status(201).json({
    success: true,
    message: "Doctor created successfully",
    data: result,
  });
});

const createPatient = catchAsycn(async (req, res) => {
  const result = await userService.createPatient(req);
  res.status(201).json({
    success: true,
    message: "Patient created successfully",
    data: result,
  });
});

const getAllFromUser = catchAsycn(async (req, res) => {
  const filters = pick(req.query, ["searchTerm", "email", "role", "status"]);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await userService.getAllFromUser(filters, options);
  res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const updateUserStatus = catchAsycn(async (req, res) => {
  const { id } = req.params;
  const result = await userService.updateUserStatus(id, req.body);
  res.status(200).json({
    success: true,
    message: "User status updated successfully",
    data: result,
  });
});

const getMyProfile = catchAsycn(async (req, res) => {
  const user = req.user;

  const result = await userService.getMyProfile(user);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile fetched successfully",
    data: result,
  });
});

const updatedMyPfofile = catchAsycn(async (req, res) => {
  const user = req.user;
  const result = await userService.updatedMyPfofile(user, req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

export const userController = {
  createAdmin,
  createDoctor,
  createPatient,
  getAllFromUser,
  updateUserStatus,
  getMyProfile,
  updatedMyPfofile,
};
