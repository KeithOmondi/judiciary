import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminBooks,
  deleteBook,
} from "../../store/slices/bookSlice";
import { MdEdit, MdDelete } from "react-icons/md";
import EditBook from "./EditBook";
import { toast } from "react-toastify";

const ManageBooks = () => {
  const dispatch = useDispatch();
  const { adminBooks: books, loading, error, message } = useSelector(
    (state) => state.books
  );

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminBooks());
  }, [dispatch]);

  // Watch for errors/messages to toast
  useEffect(() => {
    if (error) toast.error(error);
    if (message) toast.success(message);
  }, [error, message]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      dispatch(deleteBook(id));
    }
  };

  const openEditModal = (id) => {
    setSelectedBookId(id);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setSelectedBookId(null);
    setShowEditModal(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Manage Books</h1>

      {loading && <p className="text-blue-500">Loading books...</p>}
      {!loading && books.length === 0 && <p>No books found.</p>}

      <div className="overflow-x-auto mt-4">
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Title</th>
              <th className="border p-2">Author</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">Quantity</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book._id}>
                <td className="border p-2">{book.title}</td>
                <td className="border p-2">{book.author}</td>
                <td className="border p-2">${book.price}</td>
                <td className="border p-2">{book.quantity}</td>
                <td className="border p-2 flex gap-2">
                  <button
                    onClick={() => openEditModal(book._id)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <MdEdit size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(book._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <MdDelete size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-lg relative">
            <button
              onClick={closeEditModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-lg"
            >
              &times;
            </button>
            <EditBook id={selectedBookId} onClose={closeEditModal} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBooks;
