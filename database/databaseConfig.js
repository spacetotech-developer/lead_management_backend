import mongoose from "mongoose";

const dbUri = process.env.URL; // Fallback for local testing
console.log('dbUri',dbUri);
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