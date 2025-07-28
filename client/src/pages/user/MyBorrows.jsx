import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBorrowedBooks, returnBook } from "../../store/slices/borrowSlice";
import { toast } from "react-toastify";

const MyBorrows = () => {
  const dispatch = useDispatch();
  const { borrowedBooks, loading, error, message } = useSelector(
    (state) => state.borrow
  );
  const userEmail = useSelector((state) => state.auth.user?.email);

  useEffect(() => {
    dispatch(fetchBorrowedBooks());
  }, [dispatch]);

  useEffect(() => {
    if (message) toast.success(message);
    if (error) toast.error(error);
  }, [message, error]);

  const handleReturn = (bookId) => {
    if (!userEmail) return toast.warning("Please login to return books.");
    if (window.confirm("Are you sure you want to return this book?")) {
      dispatch(returnBook({ bookId, email: userEmail }));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">My Borrowed Books</h1>

      {loading && <p className="text-blue-500">Loading borrowed books...</p>}
      {!loading && borrowedBooks?.length === 0 && (
        <p className="text-gray-500">You haven’t borrowed any books yet.</p>
      )}

      {!loading && borrowedBooks?.length > 0 && (
        <div className="overflow-x-auto mt-4">
          <table className="w-full table-auto border-collapse border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Title</th>
                <th className="border p-2">Borrowed On</th>
                <th className="border p-2">Due Date</th>
                <th className="border p-2">Return Date</th>
                <th className="border p-2">Fine (Ksh)</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {borrowedBooks.map((book) => (
                <tr key={book._id || book.bookId}>
                  <td className="border p-2">{book.bookTitle || book.title}</td>
                  <td className="border p-2">
                    {book.borrowedDate
                      ? new Date(book.borrowedDate).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="border p-2">
                    {book.dueDate
                      ? new Date(book.dueDate).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="border p-2">
                    {book.returnDate
                      ? new Date(book.returnDate).toLocaleDateString()
                      : book.returned
                      ? "Returned"
                      : "Not returned"}
                  </td>
                  <td className="border p-2 text-center">
                    {book.fine && book.fine > 0 ? (
                      <span className="text-red-600 font-semibold">
                        {book.fine}
                      </span>
                    ) : (
                      "0"
                    )}
                  </td>
                  <td className="border p-2">
                    <span
                      className={`font-medium ${
                        book.returned
                          ? book.fine > 0
                            ? "text-red-600"
                            : "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {book.returned
                        ? book.fine > 0
                          ? "Returned Late"
                          : "Returned"
                        : "Not Returned"}
                    </span>
                  </td>
                  <td className="border p-2">
                    {!book.returned ? (
                      <button
                        onClick={() => handleReturn(book.bookId)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Return
                      </button>
                    ) : (
                      <span className="text-gray-400 italic">No action</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyBorrows;
