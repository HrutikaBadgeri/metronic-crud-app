//attributes - name, email, password, age, gender, salary, country, city, state, contact number,
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fileSchema from "./Files";
const EmployeeSchema = new mongoose.Schema({
  employeeName: {
    type: String,
    required: [true, "must provide a name"],
    trim: true,
    maxLength: [30, "name cannot be more than 30 characters"],
  },
  employeeEmail: {
    type: String,
    required: [true, "must provide an email"],
    trim: true,
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "please fill a valid email address",
    ],
  },
  employeePassword: {
    type: String,
    required: [true],
    maxlength: [15, "password cannot be more than 10 characters"],
    minlength: [4, "password cannot be less then 4 characters"],
  },
  employeeAge: {
    type: Number,
    required: [true, "must provide an age"],
    trim: true,
    minimum: 10,
  },
  employeeSalary: {
    type: Number,
    required: [true, "must provide salary"],
    trim: true,
  },
  employeeContact: {
    type: String,
    required: [true],
    trim: true,
    unique: true,
    maxlength: [10, "phone number cannot be greater than 10 digits"],
    minlength: [10, "phone number cannot be less than 10 digits"],
  },
  employeeGender: {
    type: String,
    enum: ["Male", "Female", "Others"],
    trim: true,
    required: [true, "must mention a gender"],
  },
  employeeCountry: {
    type: String,
    trim: true,
    required: [true],
  },
  employeeCity: {
    type: String,
    trim: true,
    required: [true],
  },
  employeeState: {
    type: String,
    trim: true,
    required: [true],
  },
  files: [fileSchema],
});

//Hashing the password before storing it in the database
EmployeeSchema.pre("save", async function (next) {
  if (!this.isModified("employeePassword")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.employeePassword = await bcrypt.hash(this.employeePassword, salt);
});

//match hash password with user entered password
EmployeeSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.employeePassword);
};

EmployeeSchema.methods.getSignedJWTToken = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );
};

export default mongoose.model("Employee", EmployeeSchema);
