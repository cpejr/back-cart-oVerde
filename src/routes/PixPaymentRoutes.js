import { Router } from "express";
import PixPaymentValidator from "../Validators/PixPaymentValidator.js";
import PixPayment from "../Controllers/PixPaymentController.js";

const pixpaymentRoutes = Router();

pixpaymentRoutes.route("/").post(PixPaymentValidator.create, PixPayment.create);

export default pixpaymentRoutes;
