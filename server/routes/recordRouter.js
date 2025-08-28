import express from "express";
import {
  createRecord,
  getRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  getAllRecordsForAdmin,
  getRecordStats,
  bulkAddRecords,
  verifyRecords,
} from "../controller/recordController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";
import { uploadExcel } from "../middlewares/uploadExcel.js";
import { uploadVerify } from "../middlewares/uploadVerify.js";

const router = express.Router();

// ========== CRUD Routes ==========

// Create a record (Admin only)
router.post("/create", isAuthenticated, isAuthorized("Admin"), createRecord);

// Get all records (Public) with pagination, filtering, search
router.get("/user-records", getRecords);

// Get single record by ID (Public)
router.get("/get/:id", getRecordById);

// Update record (Admin only)
router.put("/update/:id", isAuthenticated, isAuthorized("Admin"), updateRecord);

// Delete record (Admin only)
router.delete("/delete/:id", isAuthenticated, isAuthorized("Admin"), deleteRecord);

// Admin-only
router.get("/admin", isAuthenticated, isAuthorized("Admin"), getAllRecordsForAdmin);

// routes/recordRoutes.js
router.get("/stats", isAuthenticated, isAuthorized("Admin"), getRecordStats);

// bulk addRecordRoute
router.post("/bulk-upload", isAuthenticated, isAuthorized("Admin"), uploadExcel.single("file"), bulkAddRecords)

// ✅ POST /api/v1/records/verify
router.post("/verify",isAuthenticated,isAuthorized("Admin"), uploadVerify, verifyRecords);


export default router;
