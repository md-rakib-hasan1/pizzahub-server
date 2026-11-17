
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);

let database;

const connectDB = async () => {
  try {
    await client.connect();

    database = client.db(process.env.DB_NAME);

    console.log("MongoDB connected successfully!");

    return database;
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
};

const getDB = () => {
  if (!database) {
    throw new Error("Database is not connected yet.");
  }

  return database;
};

export { connectDB, getDB };
