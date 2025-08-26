import { Doctor, Prisma } from "@prisma/client";
import pagination from "../../../helper/pagenation";
import prisma from "../../../shared/prisma";
import { IPagenation } from "../../interfaces/pagenation";
import AppError from "../../error/appError";

const getAllDoctor = async (param: any, option: IPagenation) => {
  const { page, skip, limit, sortBy, sortOrder } = pagination(option);
  const { searchTerm, specialties, ...fileldData } = param;

  const searchConditions: Prisma.DoctorWhereInput[] = [];
  const doctorSearchableFields = [
    "name",
    "email",
    "contactNumber",
    "address",
    "qualification",
    "designation",
  ];

  if (searchTerm) {
    searchConditions.push({
      OR: doctorSearchableFields.map((fieldName) => ({
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

  if (specialties && specialties.length > 0) {
    searchConditions.push({
      doctorSpecialties: {
        some: {
          specielties: {
            title: {
              contains: specialties,
              mode: "insensitive",
            },
          },
        },
      },
    });
  }

  const whereCondition: Prisma.DoctorWhereInput =
    searchConditions.length > 0 ? { AND: searchConditions } : {};

  const result = await prisma.doctor.findMany({
    where: { ...whereCondition, isDeleted: false },
    include: {
      doctorSpecialties: {
        include: { specielties: true },
      },
    },
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const total = await prisma.doctor.count({
    where: { ...whereCondition, isDeleted: false },
  });

  return { data: result, meta: { total, page, limit } };
};

const getIdByDoctor = async (id: string) => {
  const result = await prisma.doctor.findUniqueOrThrow({
    where: { id },
  });
  return result;
};

const updateIdByDoctor = async (id: string, payload: any) => {
  const { specialties, ...doctorData } = payload;

  const doctorinfo = await prisma.doctor.findUnique({
    where: { id, isDeleted: false },
  });
  if (!doctorinfo) throw new AppError(404, "doctor is not found");

  await prisma.$transaction(async (tsc) => {
    const doctor = await tsc.doctor.update({
      where: { id },
      data: doctorData,
      include: {
        doctorSpecialties: true,
      },
    });

    if (specialties && specialties.length > 0) {
      // delete specialties
      const deletedSpecialties = specialties.filter((s: any) => s.isDeleted);
      for (const s of deletedSpecialties) {
        await tsc.doctorSpecialties.deleteMany({
          where: {
            doctorId: doctor.id,
            specialtiesId: s.specialtiesId,
          },
        });
      }

      // add specialties
      const addedSpecialties = specialties.filter((s: any) => !s.isDeleted);
      for (const s of addedSpecialties) {
        const exists = await tsc.doctorSpecialties.findFirst({
          where: {
            doctorId: doctor.id,
            specialtiesId: s.specialtiesId,
          },
        });

        if (!exists) {
          await tsc.doctorSpecialties.create({
            data: {
              doctorId: doctor.id,
              specialtiesId: s.specialtiesId,
            },
          });
        }
      }
    }
  });

  const result = await prisma.doctor.findUniqueOrThrow({
    where: { id: doctorinfo.id, isDeleted: false },
    include: {
      doctorSpecialties: true,
    },
  });

  return result;
};

const deletedIdByDoctor = async (id: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id, isDeleted: false },
  });
  if (!doctor) throw new AppError(404, "doctor is not found");
  const result = await prisma.$transaction(async (tsc) => {
    const doctor = await tsc.doctor.delete({
      where: { id },
    });
    await tsc.user.delete({
      where: { email: doctor.email },
    });

    return doctor;
  });
  return result;
};

const softDeletedIdByDoctor = async (id: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id, isDeleted: false },
  });
  if (!doctor) throw new AppError(404, "admin user is not found");
  const result = await prisma.doctor.update({
    where: { id },
    data: { isDeleted: true },
  });
  return result;
};

export const doctorService = {
  getAllDoctor,
  getIdByDoctor,
  updateIdByDoctor,
  deletedIdByDoctor,
  softDeletedIdByDoctor,
};
