require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const contactRoutes = require("./routes/contactRoutes");
const clientRoutes = require("./routes/clientRoutes");
const billRoutes = require("./routes/billRoutes");

// Express app
const app = express();

// Security and performance middleware
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // Trust first proxy for secure cookies
}

// Database connection monitoring
mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected!");
});

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected!");
});

// Middleware
app.use(express.json());

// CORS Configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? (process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []) // Production frontend URL
  : ['http://localhost:5173', 'http://localhost:5174']; // Development Vite ports

// Add logging to debug CORS issues
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('Allowed Origins:', allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      console.log('Request from origin:', origin);
      
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      // If no allowed origins configured in production, allow all (temporary fix)
      if (allowedOrigins.length === 0 && process.env.NODE_ENV === 'production') {
        return callback(null, true);
      }
      
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        console.error(msg);
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Routes
app.use("/api/users", userRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/bills", billRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/jje")
  .then(() => {
    console.log("MongoDB Database connected successfully!");
    // Start server
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`Local:   http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.log("\x1b[31m%s\x1b[0m", "✗ Error connecting to MongoDB:");
    console.error("\x1b[31m%s\x1b[0m", error.message);
    process.exit(1); // Exit process with failure
  });
