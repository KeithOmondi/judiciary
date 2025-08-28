import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "application/pdf" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.mimetype === "application/vnd.ms-excel"
  ) {
    cb(null, true);
  } else {
    cb(new Error("❌ Only PDF and Excel files are allowed"), false);
  }
};

// ✅ Expect *both* files
export const uploadVerify = multer({ storage, fileFilter }).fields([
  { name: "excel", maxCount: 1 },
  { name: "pdf", maxCount: 1 },
]);
