import { Router } from "express";
import userRoutes from "../features/user/user.routes";
import trainersRoutes from "../features/trainers/trainers.routes";
import servicesRoutes from "../features/services/services.routes";
import hiringRoutes from "../features/hiring/hiring.routes";
import reviewsRoutes from "../features/reviews/reviews.routes";
import archivesRoutes from "../features/archives/archives.routes";

const router = Router();

router.use("/users", userRoutes);
router.use("/trainers", trainersRoutes);
router.use("/services", servicesRoutes);
router.use("/hirings", hiringRoutes);
router.use("/reviews", reviewsRoutes);
router.use("/archives", archivesRoutes);

export default router;
