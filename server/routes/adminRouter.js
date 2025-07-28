import express from "express";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";
import { getAdminDashboard } from "../controller/adminController.js";

const router = express.Router();

router.get("/dashboard", isAuthenticated, isAuthorized("Admin"), getAdminDashboard);

export default router;
