import { Router } from "express";
import { UserController } from "./user.controller";
import { validateBody, validateParams } from "../../middleware/validation.middleware";
import {
  registerSchema,
  loginSchema,
  updateUserSchema,
  passwordRecoverySchema,
  userIdSchema,
} from "./user.validation";

const router = Router();
const userController = new UserController();

router.post("/register", validateBody(registerSchema), userController.register);

router.post("/login", validateBody(loginSchema), userController.login);

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

export default router;
