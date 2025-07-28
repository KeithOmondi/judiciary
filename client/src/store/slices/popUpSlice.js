// src/store/slices/popupSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Initial state for popups
const initialState = {
  addNewAdminPopup: false,
  settingPopup: false,
};

const popupSlice = createSlice({
  name: "popup",
  initialState,
  reducers: {
    toggleAddNewAdminPopup: (state) => {
      state.addNewAdminPopup = !state.addNewAdminPopup;
    },
    toggleSettingPopup: (state) => {
      state.settingPopup = !state.settingPopup;
    },
    closeAllPopups: (state) => {
      state.addNewAdminPopup = false;
      state.settingPopup = false;
    },
  },
});

// Export actions
export const {
  toggleAddNewAdminPopup,
  toggleSettingPopup,
  closeAllPopups,
} = popupSlice.actions;

// Export reducer
export default popupSlice.reducer;
