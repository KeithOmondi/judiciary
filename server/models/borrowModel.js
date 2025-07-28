import mongoose from "mongoose";

const borrowSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // ✅ now references the User model
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true,
  },
  borrowDate: {
    type: Date,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  returnDate: {
    type: Date,
    default: null,
  },
  fine: {
    type: Number,
    default: 0,
  },
  notified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

export const Borrow = mongoose.model("Borrow", borrowSchema);
