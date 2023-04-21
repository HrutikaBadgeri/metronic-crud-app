import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  contentType: { type: String, required: true },
  data: { type: Buffer, required: true },
  name: { type: String, required: true },
});

export default fileSchema;
