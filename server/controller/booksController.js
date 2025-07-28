// src/controllers/bookController.js

import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { Book } from "../models/booksModel.js";
import cloudinary from "cloudinary";
import fs from "fs";


// ──────────────── ADMIN CONTROLLERS ────────────────

// ➕ Add Book (Admin)
export const addBook = catchAsyncErrors(async (req, res, next) => {
  const { title, author, description, price, quantity } = req.body;

  if (!req.file) {
    return next(new ErrorHandler("Please upload a book image", 400));
  }

  // Convert image buffer to base64
  const fileBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload(fileBase64, {
    folder: "bookstore",
  });

  // Save book with Cloudinary URL
  const book = await Book.create({
    title,
    author,
    description,
    price,
    quantity,
    image: result.secure_url,
  });

  res.status(201).json({
    success: true,
    message: "Book added successfully",
    book,
  });
});;


// 📝 Update Book (Admin)
export const updateBook = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  let book = await Book.findById(id);
  if (!book) return next(new ErrorHandler(404, "Book not found."));

  book = await Book.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Book updated successfully",
    book,
  });
});

// ❌ Delete Book (Admin)
export const deleteBook = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const book = await Book.findById(id);
  if (!book) return next(new ErrorHandler(404, "Book not found."));

  await book.deleteOne();

  res.status(200).json({
    success: true,
    message: "Book deleted successfully",
  });
});

// 📚 Get All Books (Admin View)
export const getAllBooksAdmin = catchAsyncErrors(async (req, res, next) => {
  const books = await Book.find().sort({ createdAt: -1 }); // Includes all, even unavailable
  res.status(200).json({
    success: true,
    books,
  });
});

// ──────────────── USER CONTROLLER ────────────────

// 📖 Get All Books (User - Available Only)
export const getAllBooks = catchAsyncErrors(async (req, res, next) => {
  const books = await Book.find({ availability: true });
  res.status(200).json({
    success: true,
    books,
  });
});
