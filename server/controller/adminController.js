import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { Book } from "../models/booksModel.js";
import { Borrow } from "../models/borrowModel.js";
import { User } from "../models/userModel.js";

export const getAdminDashboard = catchAsyncErrors(async (req, res) => {
  // Total counts
  const totalBooks = await Book.countDocuments();
  const totalUsers = await User.countDocuments();
  const totalBorrows = await Borrow.countDocuments();

  // Monthly borrows aggregation
  const monthlyBorrowsRaw = await Borrow.aggregate([
    {
      $group: {
        _id: { $month: "$createdAt" },
        borrows: { $sum: 1 },
      },
    },
    {
      $project: {
        month: "$_id",
        borrows: 1,
        _id: 0,
      },
    },
    { $sort: { month: 1 } },
  ]);

  // Convert numeric month to short string (e.g. 1 → Jan)
  const monthNames = [
    "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const monthlyBorrows = monthlyBorrowsRaw.map(item => ({
    ...item,
    month: monthNames[item.month] || item.month,
  }));

  // Book categories distribution
  const categories = await Book.aggregate([
    {
      $group: {
        _id: "$category",
        value: { $sum: 1 },
      },
    },
    {
      $project: {
        name: "$_id",
        value: 1,
        _id: 0,
      },
    },
  ]);

  // Recent activity (last 5 borrows or returns)
  const recentBorrows = await Borrow.find()
    .sort({ updatedAt: -1 })
    .limit(5)
    .populate("user", "name")
    .populate("book", "title");

  const recentActivity = recentBorrows.map(item => ({
    user: item.user?.name || "Unknown",
    book: item.book?.title || "Unknown",
    action: item.returnDate ? "returned" : "borrowed",
    date: item.updatedAt.toISOString().slice(0, 10),
  }));

  // Send dashboard data
  res.status(200).json({
    stats: {
      totalBooks,
      totalUsers,
      totalBorrows,
    },
    monthlyBorrows,
    categories,
    recentActivity,
  });
});
