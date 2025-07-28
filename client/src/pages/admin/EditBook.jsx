import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminBooks, updateBook } from "../../store/slices/bookSlice";

const EditBook = ({ id, onClose }) => {
  const dispatch = useDispatch();
  const { books, loading, error } = useSelector((state) => state.books);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    price: "",
    quantity: "",
  });

  useEffect(() => {
    if (books.length === 0) {
      dispatch(fetchAdminBooks());
    }
  }, [dispatch, books.length]);

  useEffect(() => {
    const book = books.find((b) => b._id === id);
    if (book) {
      setFormData({
        title: book.title,
        author: book.author,
        description: book.description,
        price: book.price,
        quantity: book.quantity,
      });
    }
  }, [books, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(updateBook({ id, bookData: formData }));
    if (!result.error) {
      onClose(); // close modal on success
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Edit Book</h2>
      {loading && <p className="text-blue-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="author"
          placeholder="Author"
          value={formData.author}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Update Book
        </button>
      </form>
    </div>
  );
};

export default EditBook;
