import mongoose from "mongoose";

const recordSchema = new mongoose.Schema(
  {
    no: { type: Number, required: true, unique: true }, // Auto-generated Serial No.
    courtStation: { type: String, required: true },
    causeNo: { type: String, required: true },
    nameOfDeceased: { type: String, required: true },
    dateReceived: { type: Date, required: true },
    statusAtGP: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    rejectionReason: {
      type: String,
      default: "", // Empty if not rejected
    },
    datePublished: { type: Date }, // Optional until published
    volumeNo: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Record", recordSchema);
