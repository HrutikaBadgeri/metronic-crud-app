import express from "express";
import connectDB from "./database/connect";
import dotenv from "dotenv";
import employeeRouter from "./routes/employee_routes";
import adminRouter from "./routes/admin_routes";
import cookieParser from "cookie-parser";
import cors from "cors";
dotenv.config();
const app = express();
app.use(cors());
app.use(function (req, res, next) {
  res.header("Content-Type", "application/json;charset=UTF-8");
  res.header("Access-Control-Allow-Credentials", true);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes
app.use("/api/v1/employee", employeeRouter);
app.use("/api/v1/admin", adminRouter);
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(3000, console.log("Server is listening on port 3000"));
  } catch (error) {
    console.log(error);
  }
};
start();
