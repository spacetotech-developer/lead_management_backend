import mongoose from "mongoose";

const dbUri = process.env.URL || "mongodb://localhost:27017/invoice"; // Fallback for local testing

const databaseConnection = async () => {
  if (!dbUri) {
    console.error("MongoDB URI is undefined. Check your .env file!");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(dbUri);
    console.log("Successfully connected to MongoDB Atlas!");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

export default databaseConnection;