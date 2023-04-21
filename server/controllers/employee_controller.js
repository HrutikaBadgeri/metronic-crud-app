import Employee from "../models/Employee";
import mongoose from "mongoose";
import asyncWrapper from "../middleware/async";
import multer from "multer";
import fs from "fs";
import path, { dirname } from "path";
import mime from "mime-types";

//@description show all emp details
//@route GET /api/v1/employee
//@access public
export const getAllDetails = asyncWrapper(async (req, res) => {
  res.status(200).json({ success: true, data: req.employee });
});

//@description register a new employee
//@route POST /api/v1/employee/signup
//@access public
export const employeeSignup = asyncWrapper(async (req, res) => {
  console.log(req.body);
  const employee = await Employee.create(req.body);

  sendTokenResponse(employee, 200, res);
});

//@description login an employee
//@route POST /api/v1/employee/login
//@access public
export const employeeLogin = asyncWrapper(async (req, res) => {
  const { employeeEmail, employeePassword } = req.body;

  //validation
  if (!employeeEmail || !employeePassword) {
    return res
      .status(404)
      .json({ message: "Please enter EmaiID and password" });
  }

  //check if employee exists in the database
  const employee = await Employee.findOne({ employeeEmail });
  if (!employee) {
    return res.status(401).json({
      success: false,
      errorIn: "email",
      message: "Employee with this email does not exist",
    });
  }

  //check if password matches the hashed password in database
  const isMatch = await employee.matchPassword(employeePassword);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      errorIn: "password",
      message: "Incorrect Password",
    });
  }
  sendTokenResponse(employee, 200, res);
});

//@description UPDATE currently logged in user's password
//@route PUT /api/v1/employee/updatePassword
//@access private
export const updatePassword = asyncWrapper(async (req, res) => {
  const employee = await Employee.findById(req.employee.id);

  //if the current password and new password are not entered
  if (!req.body.currentemployeePassword || !req.body.newemployeePassword) {
    return res.status(401).json({
      message: "Incomplete details, please enter current and new password",
    });
  }

  //check current password
  if (!(await employee.matchPassword(req.body.currentemployeePassword))) {
    return res.status(401).json({ message: "Password is incorrect" });
  }
  employee.employeePassword = req.body.newemployeePassword;
  employee.save();
  sendTokenResponse(employee, 200, res);
});

//@description upload file/files by an employee
//@route POST /api/v1/employee/uploadFile
//@access private
export const uploadMultipleFiles = asyncWrapper(async (req, res) => {
  //gets the current working directory
  const __dirname = dirname(new URL(import.meta.url).pathname).substring(1);

  //create an array of empty files
  const files = [];

  //iterate through each file in the files array and append in files
  req.files.forEach((file) => {
    files.push({
      contentType: file.mimetype,
      data: fs.readFileSync(
        path.join(
          __dirname.split("/").slice(0, -1).join("/") +
            "/uploads/" +
            file.filename
        )
      ),
      name: file.filename,
    });
  });

  //append the old files in the mongodb file array
  req.employee.files.forEach((file) => {
    files.push(file);
  });

  //update the status of the employee
  const employeeUpdate = await Employee.findByIdAndUpdate(
    req.employee._id,
    {
      files,
    },
    {
      runValidators: true,
      new: true,
    }
  );
  //delete the uploaded file from the local repository
  req.files.forEach(async (file) => {
    await fs.unlink(
      path.join(
        __dirname.split("/").slice(0, -1).join("/") +
          "/uploads/" +
          file.filename
      ),
      (err) => {
        if (err) throw err;
      }
    );
  });

  res.status(200).json({ success: true, data: employeeUpdate });
});

export const getAllFiles = asyncWrapper(async (req, res) => {
  res.status(200).json({ success: true, data: req.employee.files });
});

//description get employee details by token
//route GET /api/v1/employee/findEmployeeByToken
//access private
export const findEmployeeByToken = asyncWrapper(async (req, res) => {
  res.status(200).json({ success: true, data: req.employee });
});

// @description returns total number of files uploaded by a single employee
// @route POST /api/v1/employee/count
// @access public
export const employeeFileCount = asyncWrapper((req, res) => {
  const total_files = req.employee.files.length;
  console.log(total_files);
  if (!total_files) {
    res.status(404).json({ message: "count cannot be fetched" });
  }
  res.status(200).json({ message: "Count fetched", data: { total_files } });
});

//@description update file by an employee
//@route POST /api/v1/employee/updateFile
//@access private
export const updateFile = asyncWrapper(async (req, res) => {
  const __dirname = dirname(new URL(import.meta.url).pathname).substring(1);
  //id of the file that is to be updated
  const fileid = req.params.id;
  console.log(req.file);
  const updatedEmployee = await Employee.updateOne(
    { _id: req.employee._id, "files._id": fileid },
    {
      $set: {
        "files.$.contentType": mime.lookup(req.file.filename),
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

  //delete the uploaded file from the local repository
  await fs.unlink(
    path.join(
      __dirname.split("/").slice(0, -1).join("/") +
        "/uploads/" +
        req.file.filename
    ),
    (err) => {
      if (err) throw err;
    }
  );

  res.status(200).json({
    success: true,
    message: "File updated successfully",
    employee: updatedEmployee,
  });
});

//@description delete file by an employee
//@route POST /api/v1/employee/deleteFile
//@access private
export const deleteFile = asyncWrapper(async (req, res) => {
  const fileid = req.params.id;
  const updatedEmployee = await Employee.updateOne(
    { _id: req.employee._id },
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

//@route POST /api/v1/employee/logout
//@access private
export const employeeLogout = asyncWrapper(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, data: {} });
});

//@description UPDATE currently logged in emp's details
//@route PATCH /api/v1/employee/updateDetails
// @access private
export const employeeUpdateDetails = asyncWrapper(async (req, res, next) => {
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
  const employee = await Employee.findByIdAndUpdate(
    req.employee._id.toString(),
    fieldsToUpdate,
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json({ success: true, data: employee });
});

//Get token from model, create a cookie and send response
const sendTokenResponse = (employee, statusCode, res) => {
  //create a token
  const token = employee.getSignedJWTToken();
  const expireTime = new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
  );
  const options = {
    expires: expireTime,
    httpOnly: false,
  };
  console.log(expireTime);
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};
