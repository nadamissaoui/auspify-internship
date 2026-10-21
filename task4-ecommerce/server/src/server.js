require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const { seedIfEmpty } = require("./seed/seed");
const { JWT_SECRET } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5002;
const MONGODB_URI = process.env.MONGODB_URI;

if (!process.env.JWT_SECRET) process.env.JWT_SECRET = JWT_SECRET;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/shop", orderRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

app.use(express.static(path.join(__dirname, "../../client")));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(__dirname, "../../client/index.html"));
});

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

async function start() {
  try {
    if (MONGODB_URI) {
      await mongoose.connect(MONGODB_URI);
      console.log("MongoDB connected (remote)");
    } else {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const memoryServer = await MongoMemoryServer.create();
      await mongoose.connect(memoryServer.getUri("ecommerce"));
      console.log("MongoDB connected (in-memory dev database)");
    }

    const seedResult = await seedIfEmpty();
    if (seedResult.inserted) {
      console.log(`Seeded ${seedResult.inserted} products + admin account`);
    }
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Store: http://localhost:${PORT}`);
    console.log("Admin login: admin@auspify.com / admin123");
  });
}

start();

module.exports = app;
