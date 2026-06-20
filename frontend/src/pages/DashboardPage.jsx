// ============================================================
// pages/DashboardPage.jsx — Main dashboard
// Shows stats bar, toolbar (search + filters), job list
// Manages modal state for add/edit/delete
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import StatsBar from "../components/StatsBar";
import JobCard from "../components/JobCard";
import JobModal from "../components/JobModal";
import DeleteModal from "../components/DeleteModal";
import EmptyState from "../components/EmptyState";
import SkeletonCard from "../components/SkeletonCard";
import styles from "./DashboardPage.module.css";

// ─── Status filter options ────────────────────────────────────
const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "wishlist", label: "Wishlist" },
  { value: "applied", label: "Applied" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
];

export default function DashboardPage() {
  const { api } = useAuth();

  // ─── Data state ─────────────────────────────────────────────
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ total: 0, wishlist: 0, applied: 0, interview: 0, offer: 0, rejected: 0 });
  const [loadingJobs, setLoadingJobs] = useState(true);

  // ─── Filter / search state ───────────────────────────────────
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // ─── Modal state ─────────────────────────────────────────────
  const [modal, setModal] = useState(null); // null | "add" | "edit" | "delete"
  const [activeJob, setActiveJob] = useState(null); // job being edited or deleted
  const [saving, setSaving] = useState(false);

  // ─── Fetch jobs (with filter & search) ──────────────────────
  const fetchJobs = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("status", filter);
      if (search.trim()) params.set("search", search.trim());

      const { data } = await api.get(`/jobs?${params.toString()}`);
      setJobs(data.jobs);
    } catch (err) {
      toast.error("Failed to load jobs");
    }
  }, [filter, search, api]);

  // ─── Fetch stats for the stats bar ──────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get("/jobs/stats");
      setStats({ ...data.stats, total: data.total });
    } catch (err) {
      // Non-critical — stats still show 0
      console.error("Stats fetch failed:", err.message);
    }
  }, [api]);

  // ─── Load everything on mount ────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoadingJobs(true);
      await Promise.all([fetchJobs(), fetchStats()]);
      setLoadingJobs(false);
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Re-fetch jobs when filter changes ──────────────────────
  useEffect(() => {
    fetchJobs();
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Debounced search re-fetch ───────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => fetchJobs(), 320);
    return () => clearTimeout(timer);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Draft form state — persists across modal close/reopen ──
  // This is the key fix: form lives in DashboardPage, not JobModal
  // So accidental modal close doesn't wipe what the user typed
  const [draftForm, setDraftForm] = useState(null);

  // ─── Open "add job" modal ────────────────────────────────────
  const openAddModal = () => {
    setActiveJob(null);
    setModal("add");
    // Only reset draft if there's no existing draft
    // This way accidental close doesn't lose filled fields
    if (!draftForm) {
      setDraftForm({
        company: "", position: "", status: "applied",
        location: "", salary: "", jobUrl: "", notes: "",
        appliedDate: new Date().toISOString().split("T")[0],
      });
    }
  };

  // ─── Open "edit job" modal ───────────────────────────────────
  const openEditModal = (job) => {
    setActiveJob(job);
    setModal("edit");
  };

  // ─── Open delete confirmation modal ─────────────────────────
  const openDeleteModal = (job) => {
    setActiveJob(job);
    setModal("delete");
  };

  const closeModal = () => {
    setModal(null);
    setActiveJob(null);
    // NOTE: intentionally do NOT clear draftForm here
    // so accidental close preserves filled fields
  };

  // ─── Clear draft completely (used when user clicks Cancel or saves) ──
  const clearDraft = () => setDraftForm(null);

  // ─── Save (create or update) job ─────────────────────────────
  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (modal === "edit" && activeJob) {
        await api.put(`/jobs/${activeJob._id}`, formData);
        toast.success("Job updated ✓");
      } else {
        await api.post("/jobs", formData);
        toast.success("Job added! Keep going 🚀");
      }
      clearDraft(); // Wipe draft only after successful save
      closeModal();
      await Promise.all([fetchJobs(), fetchStats()]);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save job";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ─── Delete job ──────────────────────────────────────────────
  const handleDelete = async () => {
    if (!activeJob) return;
    setSaving(true);
    try {
      await api.delete(`/jobs/${activeJob._id}`);
      toast.success("Job removed");
      closeModal();
      await Promise.all([fetchJobs(), fetchStats()]);
    } catch (err) {
      toast.error("Failed to delete job");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Sticky top navigation bar */}
      <Navbar />

      <main className={styles.main}>
        {/* Stats overview row */}
        <StatsBar stats={stats} />

        {/* ─── Toolbar: search + status filters + add button ─── */}
        <div className={styles.toolbar}>
          {/* Search input */}
          <div className={styles.searchWrap}>
            <svg className={styles.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search company or position…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {/* Clear search button */}
            {search && (
              <button className={styles.clearSearch} onClick={() => setSearch("")}>×</button>
            )}
          </div>

          {/* Status filter tabs */}
          <div className={styles.filterTabs}>
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`${styles.filterTab} ${filter === opt.value ? styles.activeTab : ""}`}
                onClick={() => setFilter(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Add job button */}
          <button className={styles.addBtn} onClick={openAddModal}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Job
          </button>
        </div>

        {/* ─── Job list ────────────────────────────────────────── */}
        <div className={styles.listWrap}>
          {loadingJobs ? (
            // Skeleton loading state — 4 placeholder cards
            <>
              {[...Array(4)].map((_, i) => (
                <SkeletonCard key={i} delay={i * 80} />
              ))}
            </>
          ) : jobs.length === 0 ? (
            // Empty state
            <EmptyState
              hasSearch={!!search || filter !== "all"}
              onAdd={openAddModal}
            />
          ) : (
            // Actual job cards
            <div className={styles.jobsList}>
              {jobs.map((job, index) => (
                <JobCard
                  key={job._id}
                  job={job}
                  index={index}
                  onEdit={() => openEditModal(job)}
                  onDelete={() => openDeleteModal(job)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ─── Add / Edit modal ──────────────────────────────── */}
      {(modal === "add" || modal === "edit") && (
        <JobModal
          mode={modal}
          job={activeJob}
          onSave={handleSave}
          onClose={closeModal}
          onCancel={() => { clearDraft(); closeModal(); }}
          saving={saving}
          draftForm={draftForm}
          setDraftForm={setDraftForm}
        />
      )}

      {/* ─── Delete confirmation modal ──────────────────────── */}
      {modal === "delete" && (
        <DeleteModal
          job={activeJob}
          onConfirm={handleDelete}
          onClose={closeModal}
          loading={saving}
        />
      )}
    </div>
  );
}
