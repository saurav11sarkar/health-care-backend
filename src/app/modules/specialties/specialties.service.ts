import { Request } from "express";
import { fileUploader } from "../../../helper/fileUploader";
import prisma from "../../../shared/prisma";
import AppError from "../../error/appError";

const insertSpecialty = async (req: Request) => {
  const file = req.file;
  if (file) {
    const fileUploaderCloudanary = await fileUploader.uploadToCloudinary(file);
    req.body.icon = fileUploaderCloudanary?.secure_url;
  }

  const result = await prisma.specialties.create({
    data: req.body,
  });
  if (!result) throw new AppError(404, "Error creating specialty");
  return result;
};

const getSpecialties = async () => {
  const result = await prisma.specialties.findMany();
  if (!result) throw new AppError(404, "Error getting specialties");
  return result;
};

const deletedSpecialty = async (id: string) => {
  const result = await prisma.specialties.delete({
    where: {
      id,
    },
  });
  if (!result) throw new AppError(404, "Error deleting specialty");
  return result;
};

export const specialtiesService = {
  insertSpecialty,
  getSpecialties,
  deletedSpecialty,
};
