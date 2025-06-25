import { Router } from "express";
import { UserController } from "./user.controller";
import { validateBody, validateParams } from "../../middleware/validation.middleware";
import { uploadAvatar, handleUploadError } from "../../middleware/upload.middleware";
import {
    registerSchema,
    loginSchema,
    updateUserSchema,
    passwordRecoverySchema,
    userIdSchema,
} from "./user.validation";
import { optionalAuthentication } from "../../middleware/auth.middleware";
import { getServicesParamsSchema } from "../services/services.validation";
import { servicesController } from "../services/services.controller";

const router = Router();
const userController = new UserController();

router.post("/register", validateBody(registerSchema), userController.register);

router.post("/login", validateBody(loginSchema), userController.login);

router.get("/:id", validateParams(userIdSchema), userController.getUserById);

router.put(
    "/:id",
    validateParams(userIdSchema),
    validateBody(updateUserSchema),
    userController.updateUser
);

router.delete("/:id", userController.deleteUser);

router.post(
    "/password-recovery",
    validateBody(passwordRecoverySchema),
    userController.passwordRecovery
);

// Avatar routes
router.post(
    "/:id/avatar",
    validateParams(userIdSchema),
    uploadAvatar,
    handleUploadError,
    userController.uploadAvatar
);

// User services
router.get(
    "/services",
    optionalAuthentication,
    validateParams(getServicesParamsSchema),
    servicesController.getUserServices
);
export default router;
