import express from "express";
import {
  borrowedBooks,
  getBorrowedBooksForAdmin,
  getBorrowsByUserId,
  recordBorrowedBook,
  returnBorrowedBook,
  userBorrowBook,
} from "../controller/borrowController.js"; // 🛠️ .js extension added

import {
  isAuthenticated,
  isAuthorized,
} from "../middlewares/authMiddleware.js"; // 🛠️ .js extension added

const router = express.Router();

// ✅ Admin records a borrowed book for a user
router.post(
  "/record-borrow-books/:id",
  isAuthenticated,
  isAuthorized("Admin"),
  recordBorrowedBook
);

// ✅ Admin gets all borrowed books by all users
router.get(
  "/borrowed-books-by-user",
  isAuthenticated,
  isAuthorized("Admin"),
  getBorrowedBooksForAdmin
);

router.get("/borrowed-books", isAuthenticated, borrowedBooks);

// ✅ Authenticated user fetches their own borrowed books
router.get("/my-borrowed-books", isAuthenticated, borrowedBooks);

// ✅ Admin marks a book as returned
router.put(
  "/return-borrowed-book/:bookId",
  isAuthenticated,
  returnBorrowedBook
);

router.post("/borrow-books/:id", isAuthenticated, userBorrowBook);

// User returns their own book
router.put("/user-return-book/:bookId", isAuthenticated, returnBorrowedBook);

router.get(
  "/user/:userId",
  isAuthenticated,
  isAuthorized("Admin"),
  getBorrowsByUserId
);

export default router;
