require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const studentRoutes = require("./routes/studentRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/students", studentRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

app.use(express.static(path.join(__dirname, "../../client")));

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

async function start() {
  try {
    if (MONGODB_URI) {
      await mongoose.connect(MONGODB_URI);
      console.log("MongoDB connected successfully (remote)");
    } else {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const memoryServer = await MongoMemoryServer.create();
      await mongoose.connect(memoryServer.getUri("student_management"));
      console.log("MongoDB connected successfully (in-memory dev database)");
      console.log("NOTE: set MONGODB_URI in .env for persistent data");
    }
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api/students`);
  });
}

start();

module.exports = app;
