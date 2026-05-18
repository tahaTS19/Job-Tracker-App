import mongoose from "mongoose";

const JOB_STATUSES = ["wishlist", "applied", "interview", "offer", "rejected"];

const JobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: [100, "Company name too long"],
    },
    position: {
      type: String,
      required: [true, "Position is required"],
      trim: true,
      maxlength: [100, "Position title too long"],
    },
    status: {
      type: String,
      enum: { values: JOB_STATUSES, message: "Invalid status value" },
      default: "applied",
    },
    jobUrl: {
      type: String,
      trim: true,
      default: "",
    },
    salary: {
      type: String,
      trim: true,
      default: "",
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, "Notes cannot exceed 2000 characters"],
      default: "",
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Job", JobSchema);