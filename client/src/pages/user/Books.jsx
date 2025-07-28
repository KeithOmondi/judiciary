import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";

const Books = () => {
  const dispatch = useDispatch();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const userEmail = useSelector((state) => state.auth.user?.email);
  const booksPerPage = 8;

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8000/api/v1/book/all", {
        withCredentials: true,
      });
      setBooks(res.data.books);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleBorrow = async (bookId) => {
    if (!userEmail) {
      toast.warning("Please login to borrow books.");
      return;
    }
    setBorrowLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/borrow/borrow-books/" + bookId,
        { id: bookId, email: userEmail },
        { withCredentials: true }
      );
      toast.success(res.data.message);
      fetchBooks(); // Refresh books after borrow
    } catch (err) {
      toast.error(err.response?.data?.message || "Borrow failed");
    } finally {
      setBorrowLoading(false);
    }
  };

  const filteredBooks = books?.filter((book) => {
    const term = searchTerm.toLowerCase();
    return (
      book.title.toLowerCase().includes(term) ||
      book.author.toLowerCase().includes(term)
    );
  }) || [];

  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * booksPerPage,
    currentPage * booksPerPage
  );

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  const getImage = (url) =>
    url && url.startsWith("http") ? url : "/placeholder-book.jpg";

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <h1 className="text-3xl font-bold text-gray-800 mb-4">Available Books</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by title or author..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full sm:w-1/2 border px-4 py-2 rounded shadow-sm focus:outline-none"
        />
      </div>

      {loading ? (
        <p className="text-blue-500">Loading books...</p>
      ) : filteredBooks.length === 0 ? (
        <p className="text-gray-500">No books match your search.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedBooks.map((book) => (
              <div
                key={book._id}
                className="bg-white rounded-lg shadow hover:shadow-md transition p-4 flex flex-col justify-between"
              >
                <img
                  src={getImage(book.image)}
                  onError={(e) => (e.target.src = "/placeholder-book.jpg")}
                  alt={book.title}
                  className="h-48 w-full object-cover rounded mb-3"
                />
                <h2 className="text-lg font-semibold text-gray-800">
                  {book.title}
                </h2>
                <p className="text-sm text-gray-600">by {book.author}</p>
                <div className="text-sm text-gray-700 mt-2">
                  <p>Price: <span className="font-medium">Ksh {book.price}</span></p>
                  <p>Available: <span className="font-medium">{book.quantity}</span></p>
                </div>
                <div className="mt-4 flex justify-between gap-2">
                  <button
                    onClick={() => setSelectedBook(book)}
                    className="flex-1 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleBorrow(book._id)}
                    disabled={book.quantity === 0 || borrowLoading}
                    className={`flex-1 px-3 py-1 text-sm rounded text-white ${
                      book.quantity === 0 || borrowLoading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {book.quantity === 0
                      ? "Unavailable"
                      : borrowLoading
                      ? "Processing..."
                      : "Borrow"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`px-3 py-1 rounded ${
                    currentPage === idx + 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-md p-6 w-full max-w-md shadow-lg relative">
            <button
              onClick={() => setSelectedBook(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
            >
              &times;
            </button>
            <img
              src={getImage(selectedBook.image)}
              onError={(e) => (e.target.src = "/placeholder-book.jpg")}
              alt={selectedBook.title}
              className="w-full h-60 object-contain rounded mb-4"
            />
            <h2 className="text-2xl font-bold mb-1">{selectedBook.title}</h2>
            <p className="text-gray-600 mb-1">Author: {selectedBook.author}</p>
            <p className="text-sm text-gray-700 mb-2">
              {selectedBook.description || "No description provided."}
            </p>
            <p className="mb-1">Price: <strong>Ksh {selectedBook.price}</strong></p>
            <p>Available: <strong>{selectedBook.quantity}</strong></p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setSelectedBook(null)}
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleBorrow(selectedBook._id);
                  setSelectedBook(null);
                }}
                disabled={selectedBook.quantity === 0 || borrowLoading}
                className={`px-3 py-1 text-white rounded ${
                  selectedBook.quantity === 0 || borrowLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {selectedBook.quantity === 0
                  ? "Unavailable"
                  : borrowLoading
                  ? "Processing..."
                  : "Borrow"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;