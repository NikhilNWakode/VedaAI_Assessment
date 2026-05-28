// db.ts
import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
try {
const uri =
process.env.MONGODB_URI || "mongodb://localhost:27017/vedaai";


await mongoose.connect(uri);

console.log("MongoDB connected");

mongoose.connection.on("error", (err) => {
  console.error("MongoDB error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
});


} catch (error) {
console.error("Failed to connect MongoDB:", error);
process.exit(1);
}
}
