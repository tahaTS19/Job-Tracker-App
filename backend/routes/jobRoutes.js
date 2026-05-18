import express from "express";
import Job from "../models/Job.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

// stats
router.get("/stats", async (req, res) => {
  try {
    const stats = await Job.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const statsMap = {
      wishlist: 0,
      applied: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
    };
    stats.forEach(({ _id, count }) => {
      statsMap[_id] = count;
    });
    const total = Object.values(statsMap).reduce((a, b) => a + b, 0);

    res.json({ success: true, stats: statsMap, total });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
});

// get all jobs
router.get("/", async (req, res) => {
  try {
    const { status, search, sort } = req.query;
    const query = { userId: req.user._id };

    if (status && status !== "all") query.status = status;
    if (search) {
      query.$or = [
        { company: { $regex: search, $options: "i" } },
        { position: { $regex: search, $options: "i" } },
      ];
    }

    const sortOption =
      sort === "oldest"
        ? { createdAt: 1 }
        : sort === "company"
          ? { company: 1 }
          : { createdAt: -1 };
    const jobs = await Job.find(query).sort(sortOption);

    res.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch jobs" });
  }
});

// add job
router.post("/", async (req, res) => {
  try {
    const job = await Job.create({ userId: req.user._id, ...req.body });
    res.status(201).json({ success: true, job });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res
        .status(400)
        .json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({ success: false, message: "Failed to create job" });
  }
});

// get single job
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, userId: req.user._id });
    if (!job)
      return res.status(404).json({ success: false, message: "Job not found" });
    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch job" });
  }
});

// update job
router.put("/:id", async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true },
    );
    if (!job)
      return res.status(404).json({ success: false, message: "Job not found" });
    res.json({ success: true, job });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res
        .status(400)
        .json({ success: false, message: messages.join(", ") });
    }
    res.status(500).json({ success: false, message: "Failed to update job" });
  }
});

// delete job
router.delete("/:id", async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!job)
      return res.status(404).json({ success: false, message: "Job not found" });
    res.json({ success: true, message: "Job deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete job" });
  }
});

export default router;