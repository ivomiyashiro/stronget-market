import { Router } from "express";
import userRoutes from "../features/user/user.routes";
import trainersRoutes from "../features/trainers/trainers.routes";
import servicesRoutes from "../features/services/services.routes";

const router = Router();

router.use("/users", userRoutes);
router.use("/trainers", trainersRoutes);
router.use("/services", servicesRoutes);

export default router;
