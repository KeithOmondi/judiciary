// src/pages/admin/BorrowedBooksList.jsx

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { fetchBorrowedBooksForAdmin } from "../../store/slices/borrowSlice"; // ✅ Correct thunk

const BorrowedBooksList = () => {
  const dispatch = useDispatch();

  const {
    adminBorrowedBooks,
    loading,
    error,
  } = useSelector((state) => state.borrow);

  useEffect(() => {
    dispatch(fetchBorrowedBooksForAdmin()); // ✅ Use admin thunk
  }, [dispatch]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Borrowed Books (Admin)</h1>

      {loading && <p className="text-blue-600">Loading borrowed books...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && adminBorrowedBooks?.length === 0 && (
        <p className="text-gray-500">No borrow records found.</p>
      )}

      <div className="overflow-x-auto mt-4">
        <table className="min-w-full table-auto border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">#</th>
              <th className="border px-4 py-2 text-left">User</th>
              <th className="border px-4 py-2 text-left">Book Title</th>
              <th className="border px-4 py-2">Borrowed</th>
              <th className="border px-4 py-2">Due</th>
              <th className="border px-4 py-2">Returned</th>
              <th className="border px-4 py-2">Fine</th>
            </tr>
          </thead>
          <tbody>
            {adminBorrowedBooks?.map((borrow, idx) => (
              <tr key={borrow._id}>
                <td className="border px-4 py-2">{idx + 1}</td>
                <td className="border px-4 py-2">
                  {borrow.user?.name ? (
                    <>
                      {borrow.user.name}
                      <br />
                      <span className="text-xs text-gray-500">
                        {borrow.user.email}
                      </span>
                    </>
                  ) : (
                    <span className="text-red-500">Unknown User</span>
                  )}
                </td>
                <td className="border px-4 py-2">
                  {borrow.book?.title || "N/A"}
                </td>
                <td className="border px-4 py-2">
                  {dayjs(borrow.createdAt).format("MMM DD, YYYY")}
                </td>
                <td className="border px-4 py-2">
                  {dayjs(borrow.dueDate).format("MMM DD, YYYY")}
                </td>
                <td className="border px-4 py-2">
                  {borrow.returnDate ? (
                    <span className="text-green-600">Returned</span>
                  ) : (
                    <span className="text-yellow-600">Not Returned</span>
                  )}
                </td>
                <td className="border px-4 py-2 text-center">
                  {borrow.fine > 0 ? `Ksh${borrow.fine}` : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BorrowedBooksList;
