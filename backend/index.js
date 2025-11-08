import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

// Routers
import inventoryRouter from "./routers/inventoryRouter.js";
import billingRouter from "./routers/billingRouter.js";
import pharmacyRouter from "./routers/pharmacyRouter.js";
import prescriptionRouter from "./routers/prescriptionRouter.js";
import authRouter from "./routers/authRouter.js";
import placesRouter from "./routers/locationRouter.js"; 

// Initialize app
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ Missing MONGO_URI in .env file");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routers
app.use("/api/inventory", inventoryRouter);
app.use("/api/billing", billingRouter);
app.use("/api/pharmacy", pharmacyRouter);
app.use("/api/prescriptions", prescriptionRouter);
app.use("/api/auth", authRouter);
app.use("/api/places", placesRouter);
// Root endpoint
app.get("/", (req, res) => {
  res.send(" MediChain backend running successfully!");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
