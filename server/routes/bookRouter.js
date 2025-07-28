import express from "express";
import {
  addBook,
  getAllBooks,
  updateBook,
  deleteBook,
  getAllBooksAdmin,
} from "../controller/booksController.js";
import {
  isAuthenticated,
  isAuthorized,
} from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

// USER ROUTE
router.get("/all", isAuthenticated, getAllBooks);

// ADMIN ROUTES
router.get("/admin/all", isAuthenticated, isAuthorized("Admin"), getAllBooksAdmin);

router.post(
  "/admin/add",
  isAuthenticated,
  isAuthorized("Admin"),
  upload.single("image"),
  addBook
);

router.put(
  "/update/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  updateBook
);

router.delete(
  "/delete/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  deleteBook
);

export default router;
