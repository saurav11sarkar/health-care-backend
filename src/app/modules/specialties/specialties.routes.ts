import express, { NextFunction, Request, Response } from "express";
import { specialtiesController } from "./specialties.controller";
import { fileUploader } from "../../../helper/fileUploader";
import { specialtiesValidation } from "./specialties.interface";
const router = express.Router();

router.post(
  "/",
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = specialtiesValidation.specialtiesSchema.parse(
      JSON.parse(req.body.data)
    );
    return specialtiesController.insertSpecialty(req, res, next);
  }
);

router.get("/", specialtiesController.getSpecialties);
router.delete("/:id", specialtiesController.deletedSpecialty);

export const specialtiesRoutes = router;
