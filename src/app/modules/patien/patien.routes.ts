import express from "express";
import { patienController } from "./patien.controller";
const router = express.Router();

router.get("/", patienController.getAllPatien);
router.get("/:id", patienController.getPatienById);
router.put("/:id", patienController.updatePatien);

export const patienRoutes = router;
