import express, { json, urlencoded } from "express";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth_route.js";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import profileRoutes from "./routes/profile_route.js"
import giveawayRoutes from "./routes/giveaway_route.js"
import adminRoutes from "./routes/admin_route.js"

dotenv.config();
const app = express();

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors());

app.use(json()); // for parsing application/json
app.use(cookieParser());

app.use(urlencoded({ extended: false }));

// Routes
app.use("/api/auth", authRoutes);

app.use("/api/profile", profileRoutes);

app.use("/api/giveaways", giveawayRoutes)
// Error Handling Middleware
// app.use(errorHandler);

// Admin Routes
app.use("/api/admin", adminRoutes); 

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
