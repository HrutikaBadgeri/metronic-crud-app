import Admin from "../models/Admin";
import Employee from "../models/Employee";
import asyncWrapper from "../middleware/async";
import mongoose from "mongoose";
import path, { dirname } from "path";
import fs from "fs";

//@description login an admin
//@route POST /api/v1/admin/login
//@access public
export const adminLogin = asyncWrapper(async (req, res) => {
  //   const admin = await Admin.find({});
  //   res.status(200).json({ data: admin });
  const { adminEmail, adminPassword } = req.body;

  //validation
  if (!adminEmail || !adminPassword) {
    return res
      .status(404)
      .json({ message: "Please enter an EmaiID and password" });
  }

  //check if admin exists in the database
  const admin = await Admin.findOne({ adminEmail });
  if (!admin) {
    return res.status(401).json({
      success: false,
      errorIn: "email",
      message: "Employee with this email does not exist",
    });
  }

  //check if password matches the hashed password in database
  const isMatch = await admin.matchPassword(adminPassword);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      errorIn: "password",
      message: "Incorrect Password",
    });
  }
  sendTokenResponse(admin, 200, res);
});

//@description register a new admin
//@route POST /api/v1/admin/signup
//@access public
export const adminSignup = asyncWrapper(async (req, res) => {
  const admin = await Admin.create(req.body);
  sendTokenResponse(admin, 200, res);
});

//@route POST /api/v1/admin/logout
//@access private
export const adminLogout = asyncWrapper(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, data: {} });
});

// @description returns total number of employees
// @route POST /api/v1/admin/count
// @access public
export const employeeCount = asyncWrapper(async (req, res) => {
  const count = await Employee.estimatedDocumentCount();
  if (!count) {
    res.status(404).json({ message: "count cannot be fetched" });
  }
  res.status(200).json({ message: "Count fetched", data: { count } });
});

// @description show and search all emp details to admin
// @route POST /api/v1/admin/view
// @access public
export const viewEmpDetails = asyncWrapper(async (req, res) => {
  const sort = req.query.sort;

  const page = req.query.p || 1;
  const employeePerPage = 5;

  let obj = {};
  if (req.params.key) {
    obj = {
      $or: [
        { employeeName: { $regex: req.params.key } },
        { employeeEmail: { $regex: req.params.key } },
      ],
    };
  }

  let emp = Employee.find(obj);
  if (sort) {
    emp = emp.sort(sort);
  }
  emp = emp.skip((page - 1) * employeePerPage).limit(employeePerPage);
  emp = await emp;
  if (!emp) {
    return res
      .status(404)
      .json({ status: false, message: "Employee not found" });
  }
  return res.status(200).json({ status: true, success: true, data: { emp } });
});

// @description show a single emp details to admin
// @route POST /api/v1/admin/viewSingleEmployee
// @access public
export const viewSignleEmployee = asyncWrapper(async (req, res) => {
  const ObjectId = mongoose.Types.ObjectId;
  const empid = new ObjectId(req.params.id);
  let emp = await Employee.findById(empid);
  if (!emp) {
    return res.status(401).json({ message: "Employee with this id not found" });
  }
  return res
    .status(200)
    .json({ message: "Employee found successfully", data: emp });
});

//@description delete employee
//@route GET /api/admin/deleteEmployee/:id
//@access private
export const deleteEmployee = asyncWrapper(async (req, res) => {
  const empid = req.params.id;
  let emp = await Employee.findByIdAndDelete(empid);
  if (!emp) {
    return res
      .status(401)
      .json({ success: false, message: "Employee with this id not found" });
  }
  return res
    .status(200)
    .json({ success: true, message: "Employee deleted successfully" });
});

//@description update employee details
//@route GET /api/admin/update/:id
//@access private
export const updateEmployee = asyncWrapper(async (req, res) => {
  const ObjectId = mongoose.Types.ObjectId;
  const id = new ObjectId(req.params.id);
  let fieldsToUpdate = {};
  const {
    employeeName,
    employeeEmail,
    employeeAge,
    employeeSalary,
    employeeContact,
    employeeGender,
    employeeCountry,
    employeeCity,
    employeeState,
  } = req.body;
  if (employeeName) {
    fieldsToUpdate = { ...fieldsToUpdate, employeeName };
  }
  if (employeeEmail) {
    fieldsToUpdate = { ...fieldsToUpdate, employeeEmail };
  }
  if (employeeAge) {
    fieldsToUpdate = { ...fieldsToUpdate, employeeAge };
  }
  if (employeeSalary) {
    fieldsToUpdate = { ...fieldsToUpdate, employeeSalary };
  }
  if (employeeContact) {
    fieldsToUpdate = { ...fieldsToUpdate, employeeContact };
  }
  if (employeeGender) {
    fieldsToUpdate = { ...fieldsToUpdate, employeeGender };
  }
  if (employeeCountry) {
    fieldsToUpdate = { ...fieldsToUpdate, employeeCountry };
  }
  if (employeeCity) {
    fieldsToUpdate = { ...fieldsToUpdate, employeeCity };
  }
  if (employeeState) {
    fieldsToUpdate = { ...fieldsToUpdate, employeeState };
  }
  const employee = await Employee.findByIdAndUpdate(id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });
  if (!employee) {
    return res.status(401).json({
      message: "Employee with this id not found",
    });
  }
  return res.status(200).json({
    success: true,
    data: employee,
    message: "Employee details updated successfully",
  });
});

export const viewEmployeeFiles = asyncWrapper(async (req, res) => {
  const ObjectId = mongoose.Types.ObjectId;
  const id = new ObjectId(req.params.id);
  let emp = await Employee.findById(id);
  if (!emp) {
    return res
      .status(401)
      .json({ success: false, message: "employee with this  id not found" });
  }
  return res.status(200).json({
    message: "employee files found",
    success: true,
    data: emp.files,
  });
});

//read buffer data from the backend
//convert the buffer data to base64
//send the base64 data to the frontend
//convert the base64 data to blob
//download the blob
export const downloadEmployeeFile = asyncWrapper(async (req, res) => {
  const ObjectId = mongoose.Types.ObjectId;
  const fileid = new ObjectId(req.params.fileId);
  const employeeId = new ObjectId(req.params.employeeId);
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }
  const file = employee.files.id(fileid);
  if (!file) {
    return res.status(404).json({ message: "File not found" });
  }
  const buffer = file.data;
  const base64 = buffer.toString("base64");
  res.status(200).json({
    message: "File downloaded successfully",
    file: base64,
  });
});

export const deleteEmployeeFile = asyncWrapper(async (req, res) => {
  const ObjectId = mongoose.Types.ObjectId;
  const fileid = new ObjectId(req.params.fileId);
  const employeeId = new ObjectId(req.params.employeeId);
  const updatedEmployee = await Employee.updateOne(
    { _id: employeeId },
    { $pull: { files: { _id: fileid } } }
  );

  if (updatedEmployee.nModified === 0) {
    // If no documents were modified, return an error
    return res.status(404).json({ message: "File not found" });
  }

  res.status(200).json({
    message: "File deleted successfully",
    employee: updatedEmployee,
  });
});

export const updateEmployeeFile = asyncWrapper(async (req, res) => {
  const ObjectId = mongoose.Types.ObjectId;
  const fileid = new ObjectId(req.params.fileId);
  const employeeId = new ObjectId(req.params.employeeId);
  const __dirname = dirname(new URL(import.meta.url).pathname).substring(1);
  const updatedEmployee = await Employee.updateOne(
    { _id: employeeId, "files._id": fileid },
    {
      $set: {
        "files.$.contentType": req.file.mimeType,
        "files.$.data": fs.readFileSync(
          path.join(
            __dirname.split("/").slice(0, -1).join("/") +
              "/uploads/" +
              req.file.filename
          )
        ),
        "files.$.name": req.file.filename,
      },
    }
  );

  if (updatedEmployee.nModified === 0) {
    return res.status(404).json({ success: false, message: "File not found" });
  }

  res.status(200).json({
    success: true,
    message: "File updated successfully",
    employee: updatedEmployee,
  });
});

//@description search employee by name or email
//@route GET /api/admin/search/:key
//@access private
// export const searchEmployee = asyncWrapper(async (req, res) => {
//   const emp_data = await Employee.find({
//     $or: [
//       { employeeName: { $regex: req.params.key } },
//       { employeeEmail: { $regex: req.params.key } },
//     ],
//   });
//   if (!emp_data) {
//     return res
//       .status(401)
//       .json({ message: "Could not find employee with this name" });
//   }
//   return res.status(200).json({ message: "Employee found", data: emp_data });
// });
//Get token from model, create a cookie and send response
const sendTokenResponse = (admin, statusCode, res) => {
  //create a token
  const token = admin.getSignedJWTToken();
  const expireTime = new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
  );
  const options = {
    expires: expireTime,
    httpOnly: false,
  };
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};
