import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBorrowsByUserId } from "../../store/slices/borrowSlice";
import { getAllUsers } from "../../store/slices/authSlice";

const AllBorrows = () => {
  const dispatch = useDispatch();
  const { users, error: authError } = useSelector((state) => state.auth);
  const { userBorrows, loading, error: borrowError } = useSelector((state) => state.borrow);

  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const handleView = useCallback(
    (userId) => {
      dispatch(fetchBorrowsByUserId(userId));
      const user = users.find((u) => u._id === userId);
      setSelectedUser(user || null);
      setShowModal(true);
    },
    [dispatch, users]
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Users</h1>

      {authError && <p className="text-red-500 mb-4">{authError}</p>}

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(users) && users.length > 0 ? (
            users.map((user) => (
              <tr key={user._id}>
                <td className="border p-2">{user.name}</td>
                <td className="border p-2">{user.email}</td>
                <td className="border p-2">
                  <button
                    onClick={() => handleView(user._id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    View Borrows
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center py-4">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-md w-[90%] max-w-2xl p-6 relative">
            <button
              aria-label="Close modal"
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-3 text-lg text-red-600"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">
              {selectedUser?.name}'s Borrowed Books
            </h2>

            {borrowError && (
              <p className="text-red-500 mb-4">{borrowError}</p>
            )}

            {loading ? (
              <p className="text-blue-500">Loading...</p>
            ) : (
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2">Book Title</th>
                    <th className="border p-2">Author</th>
                    <th className="border p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(userBorrows) && userBorrows.length > 0 ? (
                    userBorrows.map((borrow, index) => (
                      <tr key={borrow._id || index}>
                        <td className="border p-2">
                          {borrow.book?.title || "N/A"}
                        </td>
                        <td className="border p-2">
                          {borrow.book?.author || "N/A"}
                        </td>
                        <td className="border p-2">
                          {borrow.returnDate ? (
                            <span className="text-green-600">Returned</span>
                          ) : (
                            <span className="text-yellow-600">Borrowed</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center py-4">
                        No borrowed books.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AllBorrows;
