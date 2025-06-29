import { Router } from "express";
import { UserController } from "./user.controller";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../middleware/validation.middleware";
import {
  uploadAvatar,
  handleUploadError,
} from "../../middleware/upload.middleware";
import {
  registerSchema,
  loginSchema,
  updateUserSchema,
  passwordRecoverySchema,
  initiatePasswordResetSchema,
  verifyPinSchema,
  resetPasswordWithPinSchema,
} from "./user.validation";
import { optionalAuthentication } from "../../middleware/auth.middleware";
import { getServicesParamsSchema } from "../services/services.validation";
import { servicesController } from "../services/services.controller";

const router = Router();
const userController = new UserController();

router.post("/register", validateBody(registerSchema), userController.register);

router.post("/login", validateBody(loginSchema), userController.login);

router.post(
  "/password-recovery",
  validateBody(passwordRecoverySchema),
  userController.passwordRecovery
);

router.post(
  "/password-reset/initiate",
  validateBody(initiatePasswordResetSchema),
  userController.initiatePasswordReset
);

router.post(
  "/password-reset/verify-pin",
  validateBody(verifyPinSchema),
  userController.verifyPin
);

router.post(
  "/password-reset/reset",
  validateBody(resetPasswordWithPinSchema),
  userController.resetPasswordWithPin
);

router.get(
  "/services",
  optionalAuthentication,
  validateQuery(getServicesParamsSchema),
  servicesController.getUserServices
);

router.post(
  "/:id/avatar",
  uploadAvatar,
  handleUploadError,
  userController.uploadAvatar
);

router.get("/:id", userController.getUserById);

router.put("/:id", validateBody(updateUserSchema), userController.updateUser);

router.get("/:id", userController.getUserById);

router.put("/:id", validateBody(updateUserSchema), userController.updateUser);

router.delete("/:id", userController.deleteUser);

export default router;
