import express from "express";
import {
  adminLogin,
  adminLogout,
  adminSignup,
  deleteEmployee,
  viewEmpDetails,
  updateEmployee,
  viewSignleEmployee,
  employeeCount,
  viewEmployeeFiles,
  deleteEmployeeFile,
  updateEmployeeFile,
} from "../controllers/admin_controller";
import protect from "../middleware/employeeAuth";
import uploads from "../middleware/upload";
const router = express.Router();

router.route("/signup").post(adminSignup);
router.route("/login").post(adminLogin);
router.route("/logout").get(protect, adminLogout);
router.route("/view/:key?").get(protect, viewEmpDetails);
router.route("/count").get(protect, employeeCount);
router.route("/viewone/:id").get(protect, viewSignleEmployee);
router.route("/delete/:id").delete(protect, deleteEmployee);
router.route("/update/:id").patch(protect, updateEmployee);
router.route("/viewFiles/:id").get(protect, viewEmployeeFiles);

router
  .route("/deleteFile/:employeeId/:fileId")
  .delete(protect, deleteEmployeeFile);

router
  .route("/updateFile/:employeeId/:fileId")
  .patch(protect, uploads.single("updatedFile"), updateEmployeeFile);
export default router;
