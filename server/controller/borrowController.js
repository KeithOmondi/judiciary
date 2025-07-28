import { Book } from "../models/booksModel.js";
import { User } from "../models/userModel.js";
import { Borrow } from "../models/borrowModel.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { sendEmail } from "../utils/sendMail.js";

// ──────────────── USER CONTROLLERS ────────────────

// ✅ Borrow a Book (by Email)
// ✅ Borrow a Book (by Email)
// ✅ Borrow a Book (by Email)
export const recordBorrowedBook = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params; // Book ID
  const { email } = req.body;

  const book = await Book.findById(id);
  if (!book) return next(new ErrorHandler(404, "Book not found."));

  const user = await User.findOne({ email, accountVerified: true });
  if (!user)
    return next(new ErrorHandler(404, "User not found or account not verified."));

  if (book.quantity === 0)
    return next(new ErrorHandler(400, "This book is currently unavailable."));

  const alreadyBorrowed = await Borrow.findOne({
    user: user._id,
    book: book._id,
    returnDate: null,
  });
  if (alreadyBorrowed)
    return next(new ErrorHandler(400, "You have already borrowed this book."));

  // Update book
  book.quantity -= 1;
  book.availability = book.quantity > 0;
  await book.save();

  // Prepare borrow data
  const borrowedDate = new Date();
  const dueDate = new Date(borrowedDate.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Update user record
  user.borrowedBooks.push({
    bookId: book._id,
    bookTitle: book.title,
    borrowedDate,
    dueDate,
    returned: false,
  });
  await user.save();

  // Save borrow
  await Borrow.create({
    user: user._id,
    book: book._id,
    dueDate,
    price: book.price,
  });

  // Prepare styled HTML email
  const subject = "📚 Book Borrowed Successfully";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9; color: #333;">
      <h2 style="color: #2c3e50;">Hello ${user.name},</h2>

      <p style="font-size: 16px;">
        You have successfully borrowed <strong style="color: #2c3e50;">${book.title}</strong>.
      </p>

      <p style="font-size: 16px;">
        <strong>Borrowed Date:</strong> ${borrowedDate.toDateString()}
      </p>

      <p style="font-size: 16px;">
        <strong>Due Date:</strong> ${dueDate.toDateString()}
      </p>

      <p style="font-size: 16px;">
        Please note: If the book is returned late, a fine of <strong>Ksh 20/day</strong> will be applied.
      </p>

      <hr style="margin: 20px 0;" />

      <p style="font-size: 16px;">Happy reading!</p>
      <p style="font-size: 16px;"><strong>Blessed Hope Library System</strong></p>
    </div>
  `;

  await sendEmail({
    email: user.email,
    subject,
    html,
  });

  res.status(200).json({
    success: true,
    message: "Book borrowed successfully.",
    book,
  });
});


// ✅ Return a Borrowed Book
// ✅ Return a Borrowed Book
// ✅ Return a Borrowed Book
export const returnBorrowedBook = catchAsyncErrors(async (req, res, next) => {
  const { bookId } = req.params;
  const { email } = req.body;

  const book = await Book.findById(bookId);
  if (!book) return next(new ErrorHandler(404, "Book not found."));

  const user = await User.findOne({ email, accountVerified: true });
  if (!user) return next(new ErrorHandler(404, "User not found or account not verified."));

  const borrowedBook = user.borrowedBooks.find(
    (b) => b.bookId.toString() === bookId && !b.returned
  );
  if (!borrowedBook)
    return next(new ErrorHandler(400, "This book was not borrowed or already returned."));

  borrowedBook.returned = true;
  await user.save();

  book.quantity += 1;
  book.availability = book.quantity > 0;
  await book.save();

  const borrowRecord = await Borrow.findOne({
    user: user._id,
    book: book._id,
    returnDate: null,
  });
  if (!borrowRecord)
    return next(new ErrorHandler(404, "Borrow record not found."));

  const today = new Date();
  const due = new Date(borrowRecord.dueDate);
  const lateDays = Math.max(0, Math.floor((today - due) / (1000 * 60 * 60 * 24)));
  const fine = lateDays > 0 ? lateDays * 20 : 0;

  borrowRecord.returnDate = today;
  borrowRecord.fine = fine;
  await borrowRecord.save();

  // Email message
  const subject = "📕 Book Returned Successfully";
 const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9; color: #333;">
    <h2 style="color: #2c3e50;">Hello ${user.name},</h2>
    
    <p style="font-size: 16px;">
      You have successfully returned <strong style="color: #2c3e50;">${book.title}</strong>.
    </p>

    <p style="font-size: 16px;">
      <strong>Return Date:</strong> ${today.toDateString()}
    </p>

    <p style="font-size: 16px;">
      <strong>Due Date:</strong> ${due.toDateString()}
    </p>

    <p style="font-size: 16px;">
      <strong>Status:</strong>
      ${
        fine > 0
          ? `<span style="color: red;">Late return - Fine incurred: <strong>Ksh ${fine}</strong></span>`
          : `<span style="color: green;">Returned on time - No fine incurred ✅</span>`
      }
    </p>

    <hr style="margin: 20px 0;" />

    <p style="font-size: 16px;">Thank you!</p>
    <p style="font-size: 16px;"><strong>Blessed Hope Library System</strong></p>
  </div>
`;


  await sendEmail({ email: user.email, subject, html });

  res.status(200).json({
    success: true,
    message: fine > 0
      ? `Book returned successfully. Fine incurred: Ksh ${fine}. Total: Ksh ${book.price + fine}`
      : `Book returned successfully. Total Price: Ksh ${book.price}`,
  });
});



// ✅ Get Borrowed Books (Logged-in User)
export const borrowedBooks = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("borrowedBooks");

  if (!user) return next(new ErrorHandler(404, "User not found."));

  res.status(200).json({
    success: true,
    borrowedBooks: user.borrowedBooks,
  });
});

// ✅ Self-Service Borrow (Logged-in User)
export const userBorrowBook = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params; // Book ID
  const user = await User.findById(req.user._id);

  if (!user || !user.accountVerified)
    return next(new ErrorHandler(403, "User not found or not verified."));

  const book = await Book.findById(id);
  if (!book) return next(new ErrorHandler(404, "Book not found."));
  if (book.quantity === 0)
    return next(new ErrorHandler(400, "This book is currently unavailable."));

  const alreadyBorrowed = await Borrow.findOne({
    user: user._id,
    book: book._id,
    returnDate: null,
  });

  if (alreadyBorrowed)
    return next(new ErrorHandler(400, "You have already borrowed this book."));

  book.quantity -= 1;
  book.availability = book.quantity > 0;
  await book.save();

  const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  user.borrowedBooks.push({
    bookId: book._id,
    bookTitle: book.title,
    borrowedDate: new Date(),
    dueDate,
    returned: false,
  });
  await user.save();

  await Borrow.create({
    user: user._id,
    book: book._id,
    dueDate,
    price: book.price,
  });

  res.status(200).json({
    success: true,
    message: "Book borrowed successfully.",
    book,
  });
});


// ──────────────── ADMIN CONTROLLER ────────────────

// ✅ View All Borrowed Books
export const getBorrowedBooksForAdmin = catchAsyncErrors(async (req, res, next) => {
  const borrowedBooks = await Borrow.find()
    .populate("book", "title author price")
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  if (!borrowedBooks || borrowedBooks.length === 0)
    return next(new ErrorHandler(404, "No borrowed books found."));

  res.status(200).json({
    success: true,
    count: borrowedBooks.length,
    borrowedBooks,
  });
});

// ✅ Get Borrows by User ID (for Admin View or Detailed View Popup)
export const getBorrowsByUserId = catchAsyncErrors(async (req, res, next) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select("name email");
  if (!user) return next(new ErrorHandler(404, "User not found."));

  const borrowedBooks = await Borrow.find({ user: userId })
    .populate("book", "title author price")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    borrowedBooks,
  });
});
