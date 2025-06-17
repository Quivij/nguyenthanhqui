const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controllers/dashboardController");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");

router.get("/", authMiddleware, isAdmin, getDashboardStats);

module.exports = router;
