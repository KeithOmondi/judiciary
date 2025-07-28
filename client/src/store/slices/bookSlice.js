// src/store/slices/bookSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = "http://localhost:8000/api/v1/book";

// ──────────────── Async Thunks ────────────────

// 📚 Fetch all books (User)
export const fetchUserBooks = createAsyncThunk("books/fetchUserBooks", async (_, thunkAPI) => {
  try {
    const res = await axios.get(`${API_BASE}/all`, { withCredentials: true });
    return res.data.books;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch books");
  }
});

// 📚 Fetch all books (Admin)
export const fetchAdminBooks = createAsyncThunk("books/fetchAdminBooks", async (_, thunkAPI) => {
  try {
    const res = await axios.get(`${API_BASE}/admin/all`, { withCredentials: true });
    return res.data.books;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch admin books");
  }
});

// ➕ Add a new book
export const addBook = createAsyncThunk("books/addBook", async (bookData, thunkAPI) => {
  try {
    const res = await axios.post(`${API_BASE}/admin/add`, bookData, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data.book;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to add book");
  }
});

// ✏️ Update book
export const updateBook = createAsyncThunk("books/updateBook", async ({ id, bookData }, thunkAPI) => {
  try {
    const res = await axios.put(`${API_BASE}/update/${id}`, bookData, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return res.data.book;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to update book");
  }
});

// ❌ Delete book
export const deleteBook = createAsyncThunk("books/deleteBook", async (id, thunkAPI) => {
  try {
    await axios.delete(`${API_BASE}/delete/${id}`, { withCredentials: true });
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to delete book");
  }
});


// ──────────────── Slice ────────────────

const bookSlice = createSlice({
  name: "books",
  initialState: {
    books: [],        // For user-facing view
    adminBooks: [],   // For admin dashboard
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    resetBookState: (state) => {
      state.loading = false;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // ─────── USER FETCH ───────
      .addCase(fetchUserBooks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload;
      })
      .addCase(fetchUserBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ─────── ADMIN FETCH ───────
      .addCase(fetchAdminBooks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.adminBooks = action.payload;
      })
      .addCase(fetchAdminBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ─────── ADD BOOK ───────
      .addCase(addBook.pending, (state) => {
        state.loading = true;
      })
      .addCase(addBook.fulfilled, (state, action) => {
        state.loading = false;
        state.adminBooks.push(action.payload);
        state.message = "Book added successfully";
      })
      .addCase(addBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ─────── UPDATE BOOK ───────
      .addCase(updateBook.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateBook.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.adminBooks.findIndex((book) => book._id === action.payload._id);
        if (index !== -1) {
          state.adminBooks[index] = action.payload;
        }
        state.message = "Book updated successfully";
      })
      .addCase(updateBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ─────── DELETE BOOK ───────
      .addCase(deleteBook.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.loading = false;
        state.adminBooks = state.adminBooks.filter((book) => book._id !== action.payload);
        state.message = "Book deleted successfully";
      })
      .addCase(deleteBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetBookState } = bookSlice.actions;
export default bookSlice.reducer;
