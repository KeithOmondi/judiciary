import Record from "../models/Record.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";

/**
 * Create new record (Admin only)
 */
/**
 * Create new record (Admin only)
 */
export const createRecord = async (req, res) => {
  try {
    const {
      courtStation,
      causeNo,
      nameOfDeceased,
      dateReceived,
      statusAtGP,
      rejectionReason,
      volumeNo,
      datePublished,
    } = req.body;

    // Enforce rejection reason if status is "Rejected"
    if (statusAtGP === "Rejected" && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required when status is Rejected",
      });
    }

    // Find last record and auto-increment `no`
    const lastRecord = await Record.findOne().sort({ no: -1 });
    const nextNo = lastRecord ? lastRecord.no + 1 : 1;

    const record = new Record({
      no: nextNo,
      courtStation,
      causeNo,
      nameOfDeceased,
      dateReceived,
      statusAtGP,
      rejectionReason: statusAtGP === "Rejected" ? rejectionReason : "",
      volumeNo,
      datePublished,
    });

    await record.save();

    res.status(201).json({
      success: true,
      data: record,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create record",
      error: error.message,
    });
  }
};

/**
 * Get all records (Public) with pagination, filtering, and search
 */
export const getRecords = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      court = "",
      status = "",
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { causeNo: { $regex: search, $options: "i" } },
        { nameOfDeceased: { $regex: search, $options: "i" } },
        { courtStation: { $regex: search, $options: "i" } },
      ];
    }

    if (court) query.courtStation = court;
    if (status) query.statusAtGP = status;

    const records = await Record.find(query)
      .sort({ datePublished: -1, no: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Record.countDocuments(query);

    res.json({
      records,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single record by ID
 */
export const getRecordById = async (req, res, next) => {
  try {
    const record = await Record.findById(req.params.id);
    if (!record) return res.status(404).json({ message: "Record not found" });
    res.json(record);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all records (Admin only)
 */
export const getAllRecordsForAdmin = async (req, res, next) => {
  try {
    // Fetch all records, sorted by creation date descending
    const records = await Record.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      records,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch records",
      error: error.message,
    });
  }
};

/**
 * Update record (Admin only)
 */
export const updateRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { statusAtGP, rejectionReason, ...rest } = req.body;

    // Enforce rejection reason if status is "Rejected"
    if (statusAtGP === "Rejected" && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required when status is Rejected",
      });
    }

    const updatedRecord = await Record.findByIdAndUpdate(
      id,
      {
        ...rest,
        statusAtGP,
        rejectionReason: statusAtGP === "Rejected" ? rejectionReason : "",
      },
      { new: true, runValidators: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedRecord,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update record",
      error: error.message,
    });
  }
};

/**
 * Delete record (Admin only)
 */
export const deleteRecord = async (req, res, next) => {
  try {
    const record = await Record.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ message: "Record not found" });
    res.json({ message: "Record deleted successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk upload records (Admin only)
 */
export const bulkUploadRecords = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No PDF files uploaded" });
    }

    const uploadedRecords = [];

    for (const file of req.files) {
      // Upload PDF to Cloudinary
      const result = await cloudinary.uploader.upload(file.path, {
        resource_type: "raw", // needed for PDFs
        folder: "records",    // folder in your Cloudinary account
      });

      // Create record in MongoDB
      const record = await Record.create({
        pdfUrl: result.secure_url,
        originalName: file.originalname,
        // Optional: add extra fields like datePublished if needed
      });

      uploadedRecords.push(record);

      // Delete temp file
      fs.unlinkSync(file.path);
    }

    res.status(201).json({
      message: `${uploadedRecords.length} PDFs uploaded successfully`,
      count: uploadedRecords.length,
      records: uploadedRecords,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    res.status(500).json({ message: "Failed to upload PDFs", error: error.message });
  }
};
