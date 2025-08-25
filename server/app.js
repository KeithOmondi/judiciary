import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./db/db.js";
import { errorMiddleware } from "./middlewares/errorMiddlewares.js";
import authRouter from "./routes/authRouter.js";
import recordRouter from "./routes/recordRouter.js"
import bulkUploadRouter from "./routes/bulkUploadRouter.js"

//import { notifyUsers } from "./services/notifyUsers.js";
//import { removeUnverifiedAccounts } from "./services/removeUnverifiedAccounts.js";
import path from "path";
import { fileURLToPath } from "url";

export const app = express();
dotenv.config({ path: "./config/.env" });

// ✅ CORS setup (adjust FRONTEND_URL if needed)
app.use(cors({
  origin: [process.env.FRONTEND_URL], 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// ✅ Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
//app.all("*", (req, res) => {
 // res.status(404).json({ message: "Route not found" });
//});



// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Then you can use:
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// ✅ Debug log: remove later in production
app.use((req, res, next) => {
  console.log("📥 Incoming request:");
  console.log("🔗 URL:", req.originalUrl);
  console.log("📦 Body:", req.body);
  next();
});

// ✅ Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/records", recordRouter);
app.use("/api/v1/bulk", bulkUploadRouter);



//notifyUsers service
//notifyUsers();

//removeUnverifiedAccounts();
// ✅ DB connection
connectDB();

// ✅ Global error handler
app.use(errorMiddleware);
