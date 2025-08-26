import { Gender, UserStatus } from "@prisma/client";
import z from "zod";

const createAdminSchema = z.object({
  password: z.string("Password is requried"),
  admin: z.object({
    name: z.string("Name is required"),
    email: z.string("Email is required"),
    contactNumber: z.string("Phone is required"),
  }),
});

const createDoctorSchema = z.object({
  password: z.string("Password is requried"),
  doctor: z.object({
    name: z.string("Name is required"),
    email: z.string("Email is required"),
    contactNumber: z.string("Phone is required"),
    address: z.string("Address is required").optional(),
    registrationNumber: z.string("Registration Number is required"),
    exprience: z.number("Experience is required").optional(),
    gender: z.enum(
      [Gender.MALE, Gender.FEMALE, Gender.OTHER],
      "gender is requried"
    ),
    appointmentFree: z.number("Appointment Fee is required"),
    quelification: z.string("Qualification is required").optional(),
    currentWorkingPlace: z
      .string("Current Working Place is required")
      .optional(),
  }),
});

const createPatientSchema = z.object({
  password: z.string("Password is requried"),
  patient: z.object({
    name: z.string("Name is required"),
    email: z.string("Email is required"),
    contactNumber: z.string("Phone is required"),
    address: z.string("Address is required").optional(),
  }),
});

const updatedStatus = z.object({
  body: z.object({
    status: z
      .enum([UserStatus.ACTIVE, UserStatus.BLOCKED, UserStatus.DELETED])
      .optional(),
  }),
});
export const userValidation = {
  createAdminSchema,
  createDoctorSchema,
  createPatientSchema,
  updatedStatus
};
