import catchAsycn from "../../../shared/catchAsycn";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { adminFilterableFields } from "./admin.constans";
import { adminService } from "./admin.service";
import http from "http-status-codes";

const getAllAdmin = catchAsycn(async (req, res) => {
  const filter = pick(req.query, adminFilterableFields);
  const option = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await adminService.getAllAdmin(filter, option);
  sendResponse(res, {
    statusCode: http.OK,
    success: true,
    message: "Admins retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getAdminById = catchAsycn(async (req, res) => {
  const { id } = req.params;
  const result = await adminService.getAdminById(id);
  sendResponse(res, {
    statusCode: http.OK,
    success: true,
    message: "Admin retrieved successfully",
    data: result,
  });
});

const updatedAdminById = catchAsycn(async (req, res) => {
  const result = await adminService.updatedAdminById(req.params.id, req.body);
  sendResponse(res, {
    statusCode: http.OK,
    success: true,
    message: "Admin updated successfully",
    data: result,
  });
});
const deleteAdminById = catchAsycn(async (req, res) => {
  const result = await adminService.deleteAdminById(req.params.id);
  sendResponse(res, {
    statusCode: http.OK,
    success: true,
    message: "Admin deleted successfully",
    data: result,
  });
});

const softDeletedAdminById = catchAsycn(async (req, res) => {
  const result = await adminService.softDeletedAdminById(req.params.id);
  sendResponse(res, {
    statusCode: http.OK,
    success: true,
    message: "Admin soft deleted successfully",
    data: result,
  });
});

export const adminController = {
  getAllAdmin,
  getAdminById,
  updatedAdminById,
  deleteAdminById,
  softDeletedAdminById,
};
