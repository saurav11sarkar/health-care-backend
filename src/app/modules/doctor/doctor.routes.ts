import express from "express";
const router = express.Router();
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { doctorController } from "./doctor.controller";

router.get(
  "/",
  // auth(UserRole.SUPER_ADMIN, UserRole.DOCTOR),
  doctorController.getAllDoctors
);

router.get(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.DOCTOR),
  doctorController.getIdByDoctor
);

router.patch(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.DOCTOR),
  doctorController.updateIdByDoctor
);

router.delete(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.DOCTOR),
  doctorController.deletedIdByDoctor
);

router.delete(
  "/soft/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.DOCTOR),
  doctorController.softDeletedIdByDoctor
);

export const doctorRoutes = router;
