import {
  Admin,
  Doctor,
  Prisma,
  PrismaClient,
  UserRole,
  UserStatus,
} from "@prisma/client";
import AppError from "../../error/appError";
import http from "http-status-codes";
const prisma = new PrismaClient();
import bcrypt from "bcryptjs";
import config from "../../../config";
import { fileUploader } from "../../../helper/fileUploader";
import { Request } from "express";
import { IPagenation } from "../../interfaces/pagenation";
import pagination from "../../../helper/pagenation";
import { userSerchableFiled } from "./user.constans";
import { IUserFilterRequest } from "./user.interface";
import { IAuthUser } from "../../interfaces/comment";

const createAdmin = async (req: Request): Promise<Admin> => {
  const file = req.file;
  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    console.log(uploadToCloudinary);
    req.body.admin.profilePhoto = uploadToCloudinary?.secure_url;

    if (!uploadToCloudinary) {
      throw new AppError(http.BAD_REQUEST, "Image is not uploaded");
    }
  }

  const hashPassword = await bcrypt.hash(
    req.body.password,
    Number(config.round)
  );

  const userData = {
    password: hashPassword,
    email: req.body.admin.email,
    role: UserRole.ADMIN,
  };

  const result = await prisma.$transaction(async (trs) => {
    await trs.user.create({
      data: userData,
    });
    const admin = await trs.admin.create({
      data: req.body.admin,
    });

    return admin;
  });

  if (!result) {
    throw new AppError(http.BAD_GATEWAY, "Admin is not created");
  }

  return result;
};

const createDoctor = async (req: Request): Promise<Doctor> => {
  const file = req.file;
  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.doctor.profilePhoto = uploadToCloudinary?.secure_url;

    if (!uploadToCloudinary) {
      throw new AppError(http.BAD_REQUEST, "Image is not uploaded");
    }
  }

  const hashPassword = await bcrypt.hash(
    req.body.password,
    Number(config.round)
  );

  const userData = {
    password: hashPassword,
    email: req.body.doctor.email,
    role: UserRole.DOCTOR,
  };

  const user = await prisma.user.findUnique({
    where: {
      email: userData.email,
    },
  });

  if (user) {
    throw new AppError(http.BAD_REQUEST, "This email already exists");
  }

  const result = await prisma.$transaction(async (trs) => {
    await trs.user.create({
      data: userData,
    });

    const doctor = await trs.doctor.create({
      data: req.body.doctor,
    });

    return doctor;
  });

  if (!result) {
    throw new AppError(http.BAD_GATEWAY, "Doctor is not created");
  }

  return result;
};

const createPatient = async (req: Request) => {
  const file = req.file;
  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.patient.profilePhoto = uploadToCloudinary?.secure_url;

    if (!uploadToCloudinary) {
      throw new AppError(http.BAD_REQUEST, "Image is not uploaded");
    }
  }

  const hashPassword = await bcrypt.hash(
    req.body.password,
    Number(config.round)
  );

  const userData = {
    password: hashPassword,
    email: req.body.patient.email,
    role: UserRole.PATIENT,
  };

  const result = await prisma.$transaction(async (trs) => {
    await trs.user.create({
      data: userData,
    });

    const patient = await trs.patient.create({
      data: req.body.patient,
    });

    return patient;
  });

  if (!result) {
    throw new AppError(http.BAD_GATEWAY, "Patient is not created");
  }

  return result;
};

const getAllFromUser = async (
  param: IUserFilterRequest,
  option: IPagenation
) => {
  const { page, skip, limit, sortBy, sortOrder } = pagination(option);
  const { searchTerm, ...fileldData } = param;

  const andCondition: Prisma.UserWhereInput[] = [];

  if (searchTerm) {
    andCondition.push({
      OR: userSerchableFiled.map((fieldName) => ({
        [fieldName]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(fileldData).length > 0) {
    andCondition.push({
      AND: Object.keys(fileldData).map((fieldName) => ({
        [fieldName]: {
          equals: (fileldData as any)[fieldName],
        },
      })),
    });
  }

  const whereCondition: Prisma.UserWhereInput =
    andCondition.length > 0 ? { AND: andCondition } : {};

  const result = await prisma.user.findMany({
    where: { ...whereCondition, status: UserStatus.ACTIVE },
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      password: false,
      createdAt: true,
      updatedAt: true,
      needPasswordChange: true,
    },
  });

  const total = await prisma.user.count({
    where: { ...whereCondition, status: UserStatus.ACTIVE },
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const updateUserStatus = async (id: string, status: UserStatus) => {
  const isExist = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!isExist) {
    throw new AppError(http.NOT_FOUND, "User not found");
  }

  const result = await prisma.user.update({
    where: {
      id,
    },
    data: status,
  });

  return result;
};

const getMyProfile = async (user: IAuthUser) => {
  console.log(user)
  const userinfo = await prisma.user.findUnique({
    where: {
      email: user?.email,
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      password: false,
      needPasswordChange: true,
    },
  });

  if (!userinfo) throw new AppError(http.NOT_FOUND, "User not found");

  let profileInfo;
  if (userinfo.role === "SUPER_ADMIN") {
    profileInfo = await prisma.admin.findUnique({
      where: {
        email: user?.email,
      },
    });
  } else if (userinfo.role === "ADMIN") {
    profileInfo = await prisma.admin.findUnique({
      where: {
        email: user?.email,
      },
    });
  } else if (userinfo.role === "DOCTOR") {
    profileInfo = await prisma.doctor.findUnique({
      where: {
        email: user?.email,
      },
    });
  } else if (userinfo.role === "PATIENT") {
    profileInfo = await prisma.patient.findUnique({
      where: {
        email: user?.email,
      },
    });
  }

  return { ...userinfo, ...profileInfo };
};

const updatedMyPfofile = async (user: IAuthUser, req: Request) => {
  const userinfo = await prisma.user.findUnique({
    where: {
      email: user?.email,
      status: UserStatus.ACTIVE,
    },
  });

  if (!userinfo) throw new AppError(http.NOT_FOUND, "User not found");

  const file = req.file as Express.Multer.File;

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    if (!uploadToCloudinary.secure_url)
      throw new AppError(http.BAD_REQUEST, "Image is not uploaded");
    req.body.profilePhoto = uploadToCloudinary.secure_url;
  }

  let profileInfo;
  if (userinfo.role === "SUPER_ADMIN") {
    profileInfo = await prisma.admin.update({
      where: {
        email: user?.email,
      },
      data: req.body,
    });
  } else if (userinfo.role === "ADMIN") {
    profileInfo = await prisma.admin.update({
      where: {
        email: user?.email,
      },
      data: req.body,
    });
  } else if (userinfo.role === "DOCTOR") {
    profileInfo = await prisma.doctor.update({
      where: {
        email: user?.email,
      },
      data: req.body,
    });
  } else if (userinfo.role === "PATIENT") {
    profileInfo = await prisma.patient.update({
      where: {
        email: user?.email,
      },
      data: req.body,
    });
  }

  return profileInfo;
};

export const userService = {
  createAdmin,
  createDoctor,
  createPatient,
  getAllFromUser,
  updateUserStatus,
  getMyProfile,
  updatedMyPfofile,
};
