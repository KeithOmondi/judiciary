import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = "http://localhost:8000/api/v1/borrow";

// ─────────────────────────────────────────────
// Async Thunks
// ─────────────────────────────────────────────

// 1. User: Fetch own borrowed books
export const fetchBorrowedBooks = createAsyncThunk(
  "borrow/fetchBorrowedBooks",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${API_BASE}/my-borrowed-books`, {
        withCredentials: true,
      });
      return response.data.borrowedBooks;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch borrowed books"
      );
    }
  }
);

// 2. Admin: Fetch all borrowed books
export const fetchBorrowedBooksForAdmin = createAsyncThunk(
  "borrow/fetchBorrowedBooksForAdmin",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${API_BASE}/borrowed-books-by-user`, {
        withCredentials: true,
      });
      return response.data.borrowedBooks;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch admin borrowed books"
      );
    }
  }
);

// 3. Admin: Fetch borrowed books by user ID
export const fetchBorrowsByUserId = createAsyncThunk(
  "borrow/fetchByUserId",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/user/${userId}`, {
        withCredentials: true,
      });
      return response.data.borrowedBooks;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user borrows"
      );
    }
  }
);

// 4. Borrow a book (User or Admin)
export const borrowBook = createAsyncThunk(
  "borrow/borrowBook",
  async ({ id, email }, thunkAPI) => {
    try {
      const response = await axios.post(
        `${API_BASE}/borrow-books/${id}`,
        { email },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to borrow book"
      );
    }
  }
);

// 5. Return a book (Admin)
export const returnBook = createAsyncThunk(
  "borrow/returnBook",
  async ({ bookId, email }, thunkAPI) => {
    try {
      const response = await axios.put(
        `${API_BASE}/user-return-book/${bookId}`,
        { email },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to return book"
      );
    }
  }
);

// 6. Return a book (User)
export const userReturnBook = createAsyncThunk(
  "borrow/userReturnBook",
  async ({ bookId }, thunkAPI) => {
    try {
      const response = await axios.put(
        `${API_BASE}/user-return-book/${bookId}`,
        {},
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      return { bookId, message: response.data.message };
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to return book"
      );
    }
  }
);

// ─────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────

const borrowSlice = createSlice({
  name: "borrow",
  initialState: {
    borrowedBooks: [],
    adminBorrowedBooks: [],
    userBorrows: [], // For admin viewing a specific user
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    resetBorrowState: (state) => {
      state.borrowedBooks = [];
      state.adminBorrowedBooks = [];
      state.userBorrows = [];
      state.loading = false;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user's borrowed books
      .addCase(fetchBorrowedBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBorrowedBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.borrowedBooks = action.payload;
      })
      .addCase(fetchBorrowedBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Admin: fetch all borrowed books
      .addCase(fetchBorrowedBooksForAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBorrowedBooksForAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.adminBorrowedBooks = action.payload;
      })
      .addCase(fetchBorrowedBooksForAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Admin: fetch specific user's borrowed books
      .addCase(fetchBorrowsByUserId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBorrowsByUserId.fulfilled, (state, action) => {
        state.loading = false;
        state.userBorrows = action.payload;
      })
      .addCase(fetchBorrowsByUserId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Borrow book
      .addCase(borrowBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(borrowBook.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.borrowedBooks.push(action.payload.borrow);
      })
      .addCase(borrowBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Admin: return book
      .addCase(returnBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(returnBook.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.borrowedBooks = state.borrowedBooks.map((b) =>
          b._id === action.payload.borrowId
            ? { ...b, returnDate: new Date() }
            : b
        );
      })
      .addCase(returnBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // User: return book
      .addCase(userReturnBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(userReturnBook.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.borrowedBooks = state.borrowedBooks.map((b) =>
          b.book._id === action.payload.bookId
            ? { ...b, returnDate: new Date() }
            : b
        );
      })
      .addCase(userReturnBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetBorrowState } = borrowSlice.actions;
export default borrowSlice.reducer;
