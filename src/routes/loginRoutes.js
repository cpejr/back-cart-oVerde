import { Router } from "express";
import AuthValidator from "../Validators/AuthValidator.js";
import AuthController from "../Controllers/AuthController.js";

const loginRoutes = Router();

loginRoutes.route("/").post(AuthValidator.login, AuthController.login);

export default loginRoutes;
