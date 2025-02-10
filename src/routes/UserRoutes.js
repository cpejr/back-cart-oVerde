import { Router } from "express";
import UserController from "../Controllers/UserController.js";
import UserValidator from "../Validators/UserValidator.js";
import verifyJwt from "../Middlewares/VerifyJwt.js";
import verifyIsAdm from "../Middlewares/VerifyisAdm.js";
import verifyUser from "../Middlewares/VerifyUser.js";

const userRoutes = Router();

userRoutes.route("/").post(UserValidator.create, UserController.create).get(UserController.readAll);

userRoutes
  .route("/:id")
  .get(verifyJwt, verifyUser, UserValidator.get, UserController.read)
  .delete(verifyJwt, verifyIsAdm, UserValidator.destroy, UserController.destroy)
  .put(verifyJwt, verifyIsAdm, UserValidator.update, UserController.update);

export default userRoutes;
