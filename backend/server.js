import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/authRoutes.js"
import jobRoutes from "./routes/jobRoutes.js"

dotenv.config()

const app = express()

// middleware
app.use(express.json())
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}))

// routes
app.use("/api/auth", authRoutes)
app.use("/api/jobs", jobRoutes)

app.get("/", (req, res) => {
  res.json({ message: "server is running" })
})

const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("db connected successfully")
    app.listen(PORT, () => console.log(`Server started on PORT: ${PORT}`))
  })
  .catch((err) => {
    console.log("db connection failed", err.message)
    process.exit(1)
  })