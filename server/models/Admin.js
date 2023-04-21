import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const AdminSchema = new mongoose.Schema({
  adminEmail: {
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
  adminPassword: {
    type: String,
    required: [true],
    maxlength: [15, "password cannot be more than 10 characters"],
    minlength: [7, "password cannot be less then 7 characters"],
  },
});

//Hashing the password before storing it in the database
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("adminPassword")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.adminPassword = await bcrypt.hash(this.adminPassword, salt);
});

//match hash password with user entered password
AdminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.adminPassword);
};

AdminSchema.methods.getSignedJWTToken = function () {
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

export default mongoose.model("Admin", AdminSchema);
