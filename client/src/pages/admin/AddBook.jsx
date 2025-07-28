import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addBook, resetBookState } from "../../store/slices/bookSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddBook = () => {
  const dispatch = useDispatch();
  const { loading, error, message } = useSelector((state) => state.books);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    price: "",
    quantity: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Handle toast notifications and reset state
  useEffect(() => {
    if (message) {
      toast.success(message);
      setFormData({
        title: "",
        author: "",
        description: "",
        price: "",
        quantity: "",
      });
      setImageFile(null);
      setPreview(null);
      dispatch(resetBookState());
    }

    if (error) {
      toast.error(error);
      dispatch(resetBookState());
    }
  }, [message, error, dispatch]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }

    if (preview) URL.revokeObjectURL(preview); // Revoke old preview URL

    setPreview(URL.createObjectURL(file));
    setImageFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { title, author, description, price, quantity } = formData;

    if (!title || !author || !description || !price || !quantity || !imageFile) {
      toast.error("Please fill in all fields and upload an image.");
      return;
    }

    const bookForm = new FormData();
    bookForm.append("title", title);
    bookForm.append("author", author);
    bookForm.append("description", description);
    bookForm.append("price", Number(price));
    bookForm.append("quantity", Number(quantity));
    bookForm.append("image", imageFile); // Must match Multer's field name

    dispatch(addBook(bookForm));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded shadow">
      <ToastContainer position="top-right" autoClose={3000} />

      <h2 className="text-3xl font-bold mb-6 text-gray-800">📚 Add New Book</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Author</label>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Price (Ksh)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="1"
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              min="1"
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 font-medium">Book Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full"
          />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="mt-4 h-48 w-auto rounded shadow"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Adding..." : "Add Book"}
        </button>
      </form>
    </div>
  );
};

export default AddBook;
