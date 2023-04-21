import jwt from "jsonwebtoken";
import asyncWrapper from "./async";
import Admin from "../models/Admin";
import dotenv from "dotenv";

dotenv.config();
//Protecting the routes
const protect = asyncWrapper(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }
  //checking if token exists
  if (!token) {
    return res
      .status(401)
      .json({ message: "Not authorized to access this route" });
  }
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.admin = await Admin.findById(decodedToken.id);
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Protected route" });
  }
});
export default protect;
