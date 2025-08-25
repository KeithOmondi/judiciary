import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import recordReducer from "./slices/recordsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    records: recordReducer,
  },
});
