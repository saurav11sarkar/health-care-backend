import catchAsycn from "../../../shared/catchAsycn";
import pick from "../../../shared/pick";
import sendResponse from "../../../shared/sendResponse";
import { doctorService } from "./doctor.service";

const getAllDoctors = catchAsycn(async (req, res) => {
  const filters = pick(req.query, [
    "searchTerm",
    "email",
    "contactNumber",
    "gender",
    "apointmentFee",
    "specialties",
  ]);

  // console.log("filters: ", filters);

  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await doctorService.getAllDoctor(filters, options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctor retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getIdByDoctor = catchAsycn(async (req, res) => {
  const result = await doctorService.getIdByDoctor(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctor retrieved successfully",
    data: result,
  });
});

const updateIdByDoctor = catchAsycn(async (req, res) => {
  const result = await doctorService.updateIdByDoctor(req.params.id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctor updated successfully",
    data: result,
  });
});

const deletedIdByDoctor = catchAsycn(async (req, res) => {
  const result = await doctorService.deletedIdByDoctor(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctor deleted successfully",
    data: result,
  });
});

const softDeletedIdByDoctor = catchAsycn(async (req, res) => {
  const result = await doctorService.softDeletedIdByDoctor(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Doctor soft deleted successfully",
    data: result,
  });
});

export const doctorController = {
  getAllDoctors,
  getIdByDoctor,
  updateIdByDoctor,
  deletedIdByDoctor,
  softDeletedIdByDoctor,
};
