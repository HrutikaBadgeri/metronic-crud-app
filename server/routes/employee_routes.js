import express from "express";
import upload from "../middleware/upload";
import {
  getAllDetails,
  employeeSignup,
  employeeLogin,
  updatePassword,
  employeeUpdateDetails,
  employeeLogout,
  uploadMultipleFiles,
  updateFile,
  deleteFile,
  getAllFiles,
  findEmployeeByToken,
} from "../controllers/employee_controller";
import protect from "../middleware/employeeAuth";
const router = express.Router();

router.route("/getempdetails").get(protect, getAllDetails);
router.route("/signup").post(employeeSignup);
router.route("/login").post(employeeLogin);
router.route("/updatePassword").put(protect, updatePassword);
router.route("/updateDetails").patch(protect, employeeUpdateDetails);
router.route("/logout").get(protect, employeeLogout);
router
  .route("/upload")
  .post(protect, upload.array("employeeFiles"), uploadMultipleFiles);
router
  .route("/updateFile/:id")
  .patch(protect, upload.single("updatedFile"), updateFile);
router.route("/deleteFile/:id").delete(protect, deleteFile);
router.route("/viewFiles").get(protect, getAllFiles);
router.route("/findEmployeeByToken").get(protect, findEmployeeByToken);
export default router;
