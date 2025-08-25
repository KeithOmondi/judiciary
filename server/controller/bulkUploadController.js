import fs from "fs";
import pdfParse from "pdf-parse";
import Tesseract from "tesseract.js";
import BulkRecord from "../models/BulkRecord.js";

// Upload PDFs and parse into records
export const bulkUploadRecords = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No PDF files uploaded" });
    }

    const uploadedRecords = [];

    for (const file of req.files) {
      console.log(`Processing file: ${file.originalname}`);

      // Read PDF
      let pdfBuffer;
      try {
        pdfBuffer = fs.readFileSync(file.path);
      } catch (err) {
        console.error("Failed to read PDF file:", file.originalname, err.message);
        continue;
      }

      // Extract text from PDF
      let text = "";
      try {
        const parsed = await pdfParse(pdfBuffer);
        text = parsed.text || "";

        // Fallback to OCR if PDF has no text
        if (!text.trim()) {
          console.log("No text found, using OCR...");
          const { data: { text: ocrText } } = await Tesseract.recognize(pdfBuffer, "eng");
          text = ocrText;
        }
      } catch (err) {
        console.error("Failed to parse PDF:", err.message);
        continue;
      }

      text = text.replace(/\r\n|\n/g, " ").replace(/\s{2,}/g, " ");

      // Extract Volume No from filename
      const volumeMatch = file.originalname.match(/Vol\.\s*(\d+)/i);
      const volumeNo = volumeMatch ? volumeMatch[1] : "Unknown";

      // Get next record number
      let lastRecord = await BulkRecord.findOne().sort({ no: -1 });
      let nextNo = lastRecord ? lastRecord.no + 1 : 1;

      // Split PDF text into individual records
      const blocks = text.split(/CAUSE NO\./gi);

      for (const block of blocks) {
        const cleanBlock = block.trim();
        if (!cleanBlock) continue;

        // Extract Cause No
        const causeMatch = cleanBlock.match(/E\s*\d{1,4}\s*OF\s*\d{4}/i);
        if (!causeMatch) continue;
        const causeNo = causeMatch[0].trim();

        // Extract Name of Deceased
        const nameMatch = cleanBlock.match(/By\s+(?:\(1\)\s+)?([\s\S]*?),.*?the deceased/i);
        if (!nameMatch) continue;
        const nameOfDeceased = nameMatch[1].trim();

        // Extract Court Station
        let courtStation = "Unknown";
        const courtPatterns = [
          /IN THE HIGH COURT OF KENYA AT\s+([A-Z\s]+)/i,
          /IN THE COURT AT\s+([A-Z\s]+)/i,
          /CHIEF MAGISTRATE\S* COURT AT\s+([A-Z\s]+)/i,
          /MAGISTRATE COURT OF\s+([A-Z\s]+)/i,
        ];

        for (const pattern of courtPatterns) {
          const match = cleanBlock.match(pattern);
          if (match && match[1]) {
            const city = match[1]
              .trim()
              .split(/\s+/)
              .slice(0, 3) // take only first 1-3 words
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ");

            courtStation = /HIGH COURT/i.test(match[0])
              ? `${city} High Court`
              : `${city} Magistrate Court`;
            break;
          }
        }

        // Extract Date Published
        let datePublished = null;
        let dateMatch = cleanBlock.match(/(\d{1,2}(st|nd|rd|th)?\s+\w+\s+\d{4})/i);
        if (dateMatch) datePublished = new Date(dateMatch[0]);

        if (!datePublished || isNaN(datePublished.getTime())) {
          dateMatch = cleanBlock.match(/(\d{1,2}[–-]\d{1,2}[–-]\d{4})/);
          if (dateMatch) {
            const parts = dateMatch[0].split(/[–-]/).map((p) => parseInt(p, 10));
            if (parts.length === 3) datePublished = new Date(parts[2], parts[1] - 1, parts[0]);
          }
        }

        if (datePublished && isNaN(datePublished.getTime())) datePublished = null;

        try {
          const record = new BulkRecord({
            no: nextNo,
            courtStation,
            causeNo,
            nameOfDeceased,
            dateReceived: new Date(),
            statusAtGP: "Published",
            volumeNo,
            datePublished,
            sourceFile: file.originalname,
          });

          await record.save();
          uploadedRecords.push(record);
          nextNo++;
        } catch (dbErr) {
          console.error("Failed to save bulk record:", { causeNo, nameOfDeceased }, dbErr.message);
        }
      }

      // Remove temporary PDF
      fs.unlink(file.path, (err) => {
        if (err) console.error("Failed to remove temp file:", file.path, err.message);
      });
    }

    res.status(201).json({
      success: true,
      message: `${uploadedRecords.length} bulk records extracted & saved`,
      count: uploadedRecords.length,
      records: uploadedRecords,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process PDF(s)",
      error: error.message,
    });
  }
};

// ✅ New: Fetch all bulk records
export const fetchAllBulkRecords = async (req, res) => {
  try {
    const records = await BulkRecord.find().sort({ no: 1 });
    res.status(200).json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    console.error("Failed to fetch bulk records:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bulk records",
      error: error.message,
    });
  }
};
