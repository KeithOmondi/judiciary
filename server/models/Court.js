import mongoose from "mongoose";

const courtSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // e.g. "High Court"
    type: { type: String }, // e.g. "Superior", "Subordinate"
    location: { type: String }, // e.g. "Nairobi"
  },
  { timestamps: true }
);

export default mongoose.model("Court", courtSchema);
