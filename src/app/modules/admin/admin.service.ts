import { Admin, Prisma, UserStatus } from "@prisma/client";
import { adminSearchableFields } from "./admin.constans";
import pagination from "../../../helper/pagenation";
import prisma from "../../../shared/prisma";
import AppError from "../../error/appError";
import { IAdminFilterRequest } from "./admin.interface";
import { IPagenation } from "../../interfaces/pagenation";

const getAllAdmin = async (param: IAdminFilterRequest, option: IPagenation) => {
  const { page, skip, limit, sortBy, sortOrder } = pagination(option);
  const { searchTerm, ...fileldData } = param;

  const searchConditions: Prisma.AdminWhereInput[] = [];
  if (searchTerm) {
    searchConditions.push({
      OR: adminSearchableFields.map((fieldName) => ({
        [fieldName]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(fileldData).length > 0) {
    searchConditions.push({
      AND: Object.keys(fileldData).map((key) => ({
        [key]: {
          equals: (fileldData as any)[key],
        },
      })),
    });
  }

  const whereCondition: Prisma.AdminWhereInput =
    searchConditions.length > 0 ? { AND: searchConditions } : {};

  const result = await prisma.admin.findMany({
    where: { ...whereCondition, isDeleted: false },
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const total = await prisma.admin.count({
    where: { ...whereCondition, isDeleted: false },
  });

  return { data: result, meta: { total, page, limit } };
};

const getAdminById = async (id: string): Promise<Admin | null> => {
  const result = await prisma.admin.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
    include:{
      user:{
        select:{
          id:true,
          email:true,
          status:true,
          role:true,
          createdAt:true,
          updatedAt:true
        }
      }
    }
  });
  return result;
};

const updatedAdminById = async (
  id: string,
  payload: Partial<Admin>
): Promise<Admin | null> => {
  const admin = await prisma.admin.findUnique({
    where: { id, isDeleted: false },
  });
  if (!admin) throw new AppError(404, "admin user is not found");

  const result = await prisma.admin.update({
    where: {
      id,
      isDeleted: false,
    },
    data: payload,
  });

  if (!result) throw new AppError(404, "updated failed");

  return result;
};

const deleteAdminById = async (id: string): Promise<Admin | null> => {
  const admin = await prisma.admin.findUnique({
    where: { id, isDeleted: false },
  });

  if (!admin) throw new AppError(404, "Admin user is not found");

  const result = await prisma.$transaction(async (tsc) => {
    const deletedAdmin = await tsc.admin.delete({
      where: {
        id: admin.id,
      },
    });

    await tsc.user.delete({
      where: {
        email: admin.email,
      },
    });

    return deletedAdmin;
  });

  return result;
};

const softDeletedAdminById = async (id: string): Promise<Admin | null> => {
  const isExited = await prisma.admin.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });
  if (!isExited) throw new AppError(404, "Admin user is not found");

  const result = await prisma.$transaction(async (tsc) => {
    const admin = await tsc.admin.update({
      where: {
        id,
        isDeleted: false,
      },
      data: {
        isDeleted: true,
      },
    });

    await tsc.user.update({
      where: {
        email: admin.email,
        status: UserStatus.ACTIVE,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });

    return admin;
  });

  return result;
};

export const adminService = {
  getAllAdmin,
  getAdminById,
  updatedAdminById,
  deleteAdminById,
  softDeletedAdminById,
};
