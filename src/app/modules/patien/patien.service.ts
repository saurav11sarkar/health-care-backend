import { Patient } from "@prisma/client";
import pagination, { IOption } from "../../../helper/pagenation";
import prisma from "../../../shared/prisma";

const getAllPatien = async (params: any, options: IOption) => {
  const { page, skip, limit, sortBy, sortOrder } = pagination(options);
  const { searchTerm, ...filterData } = params;

  const pageFields = ["name", "email", "contactNumber", "address"];

  const andCondition = [];
  if (searchTerm) {
    andCondition.push({
      OR: pageFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length) {
    andCondition.push({
      AND: Object.entries(filterData).map(([field, value]) => ({
        [field]: { equals: value },
      })),
    });
  }
  const whereCondition = andCondition.length > 0 ? { AND: andCondition } : {};

  const result = await prisma.patient.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      medicalReports: true,
      patientHealthData: true,
    },
  });

  andCondition.push({ isDeleted: false });

  const total = await prisma.patient.count({ where: whereCondition });

  return { meta: { page, limit, total }, data: result };
};

const getPatienById = async (id: string) => {
  const result = await prisma.patient.findUniqueOrThrow({
    where: { id },
    include: {
      medicalReports: true,
      patientHealthData: true,
    },
  });

  return result;
};

const updatePatien = async (id: string, payload: Partial<Patient>) => {
  await prisma.patient.findUniqueOrThrow({
    where: { id },
  });
  const result = await prisma.patient.update({
    where: { id },
    data: payload,
    include: {
      medicalReports: true,
      patientHealthData: true,
    },
  });
  return result;
};

export const patienService = {
  getAllPatien,
  getPatienById,
  updatePatien,
};
