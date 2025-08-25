import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const RECORD_API = "http://localhost:8000/api/v1/records";

// Fetch all records (public, paginated)
export const fetchRecords = createAsyncThunk(
  "records/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${RECORD_API}/user-records`);
      return res.data; // { records, currentPage, totalPages, totalRecords }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch records");
    }
  }
);

// Fetch all records for admin (no pagination)
export const fetchAllRecordsForAdmin = createAsyncThunk(
  "records/fetchAllAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${RECORD_API}/admin`, { withCredentials: true });
      return res.data.records; // full array of records
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch admin records");
    }
  }
);

// Add record
export const addRecord = createAsyncThunk(
  "records/add",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${RECORD_API}/create`, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to add record");
    }
  }
);

// Update record
export const updateRecord = createAsyncThunk(
  "records/update",
  async ({ id, recordData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${RECORD_API}/update/${id}`, recordData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update record");
    }
  }
);

// Delete record
export const deleteRecord = createAsyncThunk(
  "records/delete",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${RECORD_API}/delete/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete record");
    }
  }
);

const recordsSlice = createSlice({
  name: "records",
  initialState: {
    records: [],
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    selectedRecord: null,
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    clearSelectedRecord: (state) => {
      state.selectedRecord = null;
    },
    resetRecordState: (state) => {
      state.loading = false;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch records
      .addCase(fetchRecords.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload.records;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.totalRecords = action.payload.totalRecords;
      })
      .addCase(fetchRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch all records for admin
      .addCase(fetchAllRecordsForAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllRecordsForAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(fetchAllRecordsForAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add record
      .addCase(addRecord.fulfilled, (state, action) => {
        state.records.unshift(action.payload);
        state.message = "Record added successfully";
      })

      // Update record
      .addCase(updateRecord.fulfilled, (state, action) => {
        state.records = state.records.map((r) =>
          r._id === action.payload._id ? action.payload : r
        );
        state.message = "Record updated successfully";
      })

      // Delete record
      .addCase(deleteRecord.fulfilled, (state, action) => {
        state.records = state.records.filter((r) => r._id !== action.payload);
        state.message = "Record deleted successfully";
      });
  },
});

export const { clearSelectedRecord, resetRecordState } = recordsSlice.actions;
export default recordsSlice.reducer;
