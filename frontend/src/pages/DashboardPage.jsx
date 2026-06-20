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

  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ total: 0, wishlist: 0, applied: 0, interview: 0, offer: 0, rejected: 0 });
  const [loadingJobs, setLoadingJobs] = useState(true);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [modal, setModal] = useState(null);
  const [activeJob, setActiveJob] = useState(null);
  const [saving, setSaving] = useState(false);

  const [draftForm, setDraftForm] = useState(null);

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

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get("/jobs/stats");
      setStats({ ...data.stats, total: data.total });
    } catch (err) {
      console.error("Stats fetch failed:", err.message);
    }
  }, [api]);

  useEffect(() => {
    const load = async () => {
      setLoadingJobs(true);
      await Promise.all([fetchJobs(), fetchStats()]);
      setLoadingJobs(false);
    };
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchJobs();
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const timer = setTimeout(() => fetchJobs(), 320);
    return () => clearTimeout(timer);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAddModal = () => {
    setActiveJob(null);
    setModal("add");
    if (!draftForm) {
      setDraftForm({
        company: "", position: "", status: "applied",
        location: "", salary: "", jobUrl: "", notes: "",
        appliedDate: new Date().toISOString().split("T")[0],
      });
    }
  };

  const openEditModal = (job) => {
    setActiveJob(job);
    setModal("edit");
  };

  const openDeleteModal = (job) => {
    setActiveJob(job);
    setModal("delete");
  };

  const closeModal = () => {
    setModal(null);
    setActiveJob(null);
  };

  const clearDraft = () => setDraftForm(null);

  const handleSave = async (formData) => {
    setSaving(true);
    try {
      if (modal === "edit" && activeJob) {
        await api.put(`/jobs/${activeJob._id}`, formData);
        toast.success("Job updated");
      } else {
        await api.post("/jobs", formData);
        toast.success("Job added");
      }
      clearDraft();
      closeModal();
      await Promise.all([fetchJobs(), fetchStats()]);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save job";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

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
      <Navbar />

      <main className={styles.main}>
        <StatsBar stats={stats} />

        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <svg className={styles.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search company or position..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className={styles.clearSearch} onClick={() => setSearch("")}>×</button>
            )}
          </div>

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

          <button className={styles.addBtn} onClick={openAddModal}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Job
          </button>
        </div>

        <div className={styles.listWrap}>
          {loadingJobs ? (
            <>
              {[...Array(4)].map((_, i) => (
                <SkeletonCard key={i} delay={i * 80} />
              ))}
            </>
          ) : jobs.length === 0 ? (
            <EmptyState
              hasSearch={!!search || filter !== "all"}
              onAdd={openAddModal}
            />
          ) : (
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
