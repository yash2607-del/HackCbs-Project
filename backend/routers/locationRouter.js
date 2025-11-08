// backend/routes/locationRoutes.js
import express from "express";
import { reverseGeocode, detectLocation } from "../controllers/locationController.js";

const router = express.Router();

router.get("/reverse", reverseGeocode);
router.get("/detect", detectLocation);

export default router;
