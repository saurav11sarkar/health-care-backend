import express from "express";
import { userRouter } from "../modules/user/user.routes";
import { adminRouter } from "../modules/admin/admin.routes";
import { authRouter } from "../modules/auth/auth.routes";
import { specialtiesRoutes } from "../modules/specialties/specialties.routes";
import { doctorRoutes } from "../modules/doctor/doctor.routes";
import { patienRoutes } from "../modules/patien/patien.routes";
const router = express.Router();

const healthCareRouter = [
  { path: "/user", name: userRouter },
  { path: "/admin", name: adminRouter },
  { path: "/auth", name: authRouter },
  { path: "/specialties", name: specialtiesRoutes },
  { path: "/doctor", name: doctorRoutes },
  { path: "/patien", name: patienRoutes },
];

healthCareRouter.forEach((route) => {
  router.use(route.path, route.name);
});

export default router;
