import { Router } from "express";
import { UserController } from "./user.controller";
import { validateBody, validateParams } from "../../middleware/validation.middleware";
import { uploadAvatar, handleUploadError } from "../../middleware/upload.middleware";
import {
    registerSchema,
    loginSchema,
    updateUserSchema,
    passwordRecoverySchema,
} from "./user.validation";
import { optionalAuthentication } from "../../middleware/auth.middleware";
import { getServicesParamsSchema } from "../services/services.validation";
import { servicesController } from "../services/services.controller";

const router = Router();
const userController = new UserController();

router.post("/register", validateBody(registerSchema), userController.register);

router.post("/login", validateBody(loginSchema), userController.login);

// User services - MUST come before /:id route to avoid route conflict
router.get(
    "/services",
    optionalAuthentication,
    validateParams(getServicesParamsSchema),
    servicesController.getUserServices
);

router.get("/:id", userController.getUserById);

router.put("/:id", validateBody(updateUserSchema), userController.updateUser);

router.delete("/:id", userController.deleteUser);

router.post(
    "/password-recovery",
    validateBody(passwordRecoverySchema),
    userController.passwordRecovery
);

// Avatar routes
router.post("/:id/avatar", uploadAvatar, handleUploadError, userController.uploadAvatar);
export default router;
