import { Router } from "express";

import userRoutes from "./UserRoutes.js";
import categoryTreeRoutes from "./CategoryTreeRoutes.js";
import treeRoutes from "./TreeRoutes.js";
import archiveRoutes from "./ArchiveRoutes.js";
import certificateRoutes from "./CertificateRoutes.js";
import refreshRoutes from "./Refresh.js";
import pixpaymentRoutes from "./PixPaymentRoutes.js";
import loginRoutes from "./loginRoutes.js";
const routes = Router();

routes
  .use("/user", userRoutes)
  .use("/tree", treeRoutes)
  .use("/archive", archiveRoutes)
  .use("/categoryTree", categoryTreeRoutes)
  .use("/certificate", certificateRoutes)
  .use("/refresh",refreshRoutes)
  .use("/pixpayment", pixpaymentRoutes)
  .use("/login", loginRoutes);

export default routes;
