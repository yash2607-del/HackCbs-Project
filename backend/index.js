import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import inventoryRouter from "./routers/inventoryRouter.js";
import billingRouter from "./routers/billingRouter.js";
import pharmacyRouter from "./routers/pharmacyRouter.js";

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

app.use("/api/inventory", inventoryRouter);
app.use("/api/billing", billingRouter);
app.use("/api/pharmacy", pharmacyRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
