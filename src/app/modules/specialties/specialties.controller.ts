import catchAsycn from "../../../shared/catchAsycn";
import sendResponse from "../../../shared/sendResponse";
import { specialtiesService } from "./specialties.service";

const insertSpecialty = catchAsycn(async (req, res) => {
  const result = await specialtiesService.insertSpecialty(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Specialty inserted successfully",
    data: result,
  });
});

const getSpecialties = catchAsycn(async (req, res) => {
  const result = await specialtiesService.getSpecialties();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Specialties fetched successfully",
    data: result,
  });
});

const deletedSpecialty = catchAsycn(async (req, res) => {
  const result = await specialtiesService.deletedSpecialty(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Specialty deleted successfully",
    data: result,
  });
});

export const specialtiesController = {
  insertSpecialty,
  getSpecialties,
  deletedSpecialty,
};
