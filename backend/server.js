import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/authRoutes.js"
import jobRoutes from "./routes/jobRoutes.js"

dotenv.config()

const app = express()

// middleware
app.use(express.json({ limit: "10mb" })) // increased for base64 images
app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true,
}))

// routes
app.use("/api/auth", authRoutes)
app.use("/api/jobs", jobRoutes)

app.get("/", (req, res) => {
  res.json({ message: "server is running" })
})

// ─── Connect to MongoDB ───────────────────────────────────────
// In serverless, we reuse existing connection if available
// instead of creating a new one on every request
let isConnected = false

const connectDB = async () => {
  if (isConnected) return
  await mongoose.connect(process.env.MONGO_URI)
  isConnected = true
  console.log("db connected")
}

// For local development — start the server normally
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`running on port ${PORT}`))
  })
}

// For Vercel — connect on each cold start then export
connectDB()

export default app
