import fs from "fs";
import pdf from "pdf-parse";
import XLSX from "xlsx";
import stringSimilarity from "string-similarity";

// 🔹 Normalize headers (Excel)
const normalizeHeader = (header) => {
  return header
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_"); // e.g. "Cause No" -> "cause_no"
};

// 🔹 Clean names for comparison
const cleanName = (name) =>
  name?.replace(/[^a-zA-Z\s]/g, "").trim().toLowerCase() || "";

// 🔹 Fuzzy string match
const fuzzyMatch = (a, b, threshold = 0.85) => {
  if (!a || !b) return false;
  return (
    stringSimilarity.compareTwoStrings(cleanName(a), cleanName(b)) >= threshold
  );
};

// 🔹 Extract records from Gazette PDF text
const extractPdfData = (pdfText) => {
  const lines = pdfText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // ✅ Try to capture Gazette date from header
  const headerLine = lines.find((l) =>
    l.match(/DATED\s+THIS\s+\d{1,2}(st|nd|rd|th)?\s+[A-Za-z]+\s+\d{4}/i)
  );
  const datePublished = headerLine || "";

  const records = [];
  let currentRecord = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // ✅ Capture Cause No
    const causeMatch = line.match(/CAUSE\s*NO\.?\s*([A-Za-z0-9/.\-\s]+)/i);
    if (causeMatch) {
      // Save previous record if complete
      if (currentRecord.causeNo && currentRecord.nameOfDeceased) {
        records.push({ ...currentRecord, datePublished });
      }
      currentRecord = {
        causeNo: causeMatch[1].trim(),
        courtStation: "", // Gazette often omits this
        nameOfDeceased: "",
        datePublished,
      };
    }

    // ✅ Capture Estate of (often on next line)
    const estateMatch = line.match(/ESTATE\s+OF\s+([A-Za-z\s.'-]+)/i);
    if (estateMatch && currentRecord.causeNo) {
      currentRecord.nameOfDeceased = estateMatch[1].trim();
    }

    // ✅ If record has both fields, push
    if (currentRecord.causeNo && currentRecord.nameOfDeceased) {
      records.push({ ...currentRecord });
      currentRecord = {};
    }
  }

  // Push last record if valid
  if (currentRecord.causeNo && currentRecord.nameOfDeceased) {
    records.push({ ...currentRecord });
  }

  return { records, datePublished };
};

// 🔹 Verify Records Controller
export const verifyRecords = async (req, res) => {
  try {
    if (!req.files || !req.files.excel || !req.files.pdf) {
      return res.status(400).json({
        success: false,
        message: "❌ Both Excel and PDF files are required",
      });
    }

    const excelPath = req.files.excel[0].path;
    const pdfPath = req.files.pdf[0].path;

    // ✅ Parse Excel
    const workbook = XLSX.readFile(excelPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    let excelRaw = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (!excelRaw || excelRaw.length < 2) {
      return res.status(400).json({
        success: false,
        message: "❌ Excel file is empty or invalid",
      });
    }

    // Normalize headers
    const headers = excelRaw[0].map(normalizeHeader);
    const excelData = excelRaw.slice(1).map((row) => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = row[i];
      });
      return obj;
    });

    const formattedExcel = excelData.map((row) => ({
      courtStation: row.court_station || "",
      causeNo: row.cause_no || "",
      nameOfDeceased: row.name_of_deceased || "",
      statusAtGP: "Pending",
    }));

    // ✅ Parse PDF
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfExtracted = await pdf(pdfBuffer);
    const { records: pdfRecords, datePublished } = extractPdfData(
      pdfExtracted.text
    );

    // ✅ Compare Excel vs PDF
    const matched = [];
    const onlyExcel = [];
    const onlyPdf = [];

    formattedExcel.forEach((excelRow) => {
      const found = pdfRecords.find((pdfRow) =>
        fuzzyMatch(excelRow.nameOfDeceased, pdfRow.nameOfDeceased)
      );
      if (found) {
        matched.push({
          ...excelRow,
          statusAtGP: "Published",
          datePublished,
        });
      } else {
        onlyExcel.push({ ...excelRow, statusAtGP: "Pending" });
      }
    });

    pdfRecords.forEach((pdfRow) => {
      const found = formattedExcel.find((excelRow) =>
        fuzzyMatch(pdfRow.nameOfDeceased, excelRow.nameOfDeceased)
      );
      if (!found) onlyPdf.push(pdfRow);
    });

    // ✅ Return result
    res.json({
      success: true,
      datePublished,
      stats: {
        matched: matched.length,
        onlyExcel: onlyExcel.length,
        onlyPdf: onlyPdf.length,
      },
      matched,
      onlyExcel,
      onlyPdf,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "❌ Verification failed",
      error: err.message,
    });
  }
};
