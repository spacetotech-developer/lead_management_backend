// import mongoose from "mongoose";

// const dbUri = process.env.URL || "mongodb://localhost:27017/invoice"; // Fallback for local testing
// console.log('dbUri',dbUri);
// const databaseConnection = async () => {
//   if (!dbUri) {
//     console.error("MongoDB URI is undefined. Check your .env file!");
//     process.exit(1);
//   }

//   try {
//     console.log("Connecting to MongoDB...");
//     await mongoose.connect(dbUri);
//     console.log("Successfully connected to MongoDB Atlas!");
//   } catch (err) {
//     console.error("MongoDB connection error:", err.message);
//     process.exit(1);
//   }
// };

// export default databaseConnection;

import mongoose from "mongoose";

const atlasUri = process.env.URL || "";
const localUri = "mongodb://localhost:27017/invoice";

// ✅ Pick Atlas if set, else local
const dbUri = atlasUri.startsWith("mongodb+srv://") ? atlasUri : localUri;

console.log("dbUri:", dbUri);

const databaseConnection = async () => {
  if (!dbUri) {
    console.error("MongoDB URI is undefined. Check your .env file!");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("✅ Successfully connected to MongoDB!");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);

    // 🔄 Fallback to local if Atlas fails
    if (dbUri !== localUri) {
      console.log("Retrying with local MongoDB...");
      try {
        await mongoose.connect(localUri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("✅ Connected to local MongoDB!");
      } catch (localErr) {
        console.error("❌ Local MongoDB connection failed:", localErr.message);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

export default databaseConnection;
