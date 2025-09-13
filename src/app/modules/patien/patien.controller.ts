import catchAsycn from "../../../shared/catchAsycn";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { patienService } from "./patien.service";

const getAllPatien = catchAsycn(async (req, res) => {
  const filters = pick(req.query, [
    "searchTerm",
    "name",
    "email",
    "contactNumber",
    "address",
  ]);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const result = await patienService.getAllPatien(filters, options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Patien retrive successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getPatienById = catchAsycn(async (req, res) => {
  const id = req.params.id;
  const result = await patienService.getPatienById(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Patien retrive successfully",
    data: result,
  });
});

export const patienController = {
  getAllPatien,
  getPatienById,
};
