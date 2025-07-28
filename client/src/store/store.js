import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import popupReducer from './slices/popupSlice';
import bookReducer from './slices/bookSlice';
import borrowReducer from './slices/borrowSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        popup: popupReducer,
        books: bookReducer,
        borrow: borrowReducer,
    }
})