import "dotenv/config";
import menuRoutes from "./routes/menu.routes.js";
import verifyJWT from "./middleware/verifyJWT.js";
import verifyRole from "./middleware/verifyRole.js";
import verifyActiveUser from "./middleware/verifyActiveUser.js";
import express from "express";
import cors from "cors";

import { connectDB } from "./config/db.js";

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/menu-items", menuRoutes);

// Health check route
app.get("/", (req, res) => {
  res.status(200).send("PizzaHub API is running!");
});

app.get("/api/protected", verifyActiveUser, verifyJWT, (req, res) => {
  res.status(200).json({
    success: true,
    message: "JWT verified successfully!",
    user: req.user,
  });
});

// Customer only
app.get("/api/customer-only", verifyJWT, verifyActiveUser, verifyRole("customer"), (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome Customer!",
    user: req.user,
  });
});

// Vendor only
app.get("/api/vendor-only", verifyJWT, verifyActiveUser, verifyRole("vendor"), (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome Vendor!",
    user: req.user,
  });
});

// Admin only
app.get("/api/admin-only", verifyJWT, verifyActiveUser, verifyRole("admin"), (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome Admin!",
    user: req.user,
  });
}); 


const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`PizzaHub server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
