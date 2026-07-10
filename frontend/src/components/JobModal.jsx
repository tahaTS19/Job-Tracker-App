// ============================================================
// components/JobModal.jsx — Add / Edit job form modal
// Fields: company, position, status, location, salary,
//         appliedDate, jobUrl, notes
// ============================================================

import { useState, useEffect, useRef } from "react";
import styles from "./JobModal.module.css";
import ScreenshotUploader from "./ScreenshotUploader";

// Default empty form values
const EMPTY_FORM = {
  company: "",
  position: "",
  status: "applied",
  location: "",
  salary: "",
  appliedDate: new Date().toISOString().split("T")[0],
  jobUrl: "",
  notes: "",
};

// Close (X) icon
const CloseIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

// Loading spinner
const Spinner = () => (
  <span
    style={{
      display: "inline-block",
      width: 16,
      height: 16,
      border: "2px solid rgba(255,255,255,.3)",
      borderTopColor: "#fff",
      borderRadius: "50%",
      animation: "spin .65s linear infinite",
    }}
  />
);

export default function JobModal({ mode, job, onSave, onClose, onCancel, saving, draftForm, setDraftForm }) {
  const isEdit = mode === "edit";
  const overlayRef = useRef(null);

  // ─── Form state ──────────────────────────────────────────────
  // For ADD mode: use draftForm from parent (persists across close/reopen)
  // For EDIT mode: use the job's existing data
  const [form, setForm] = useState(() => {
    if (isEdit && job) {
      return {
        company: job.company || "",
        position: job.position || "",
        status: job.status || "applied",
        location: job.location || "",
        salary: job.salary || "",
        appliedDate: job.appliedDate?.split("T")[0] || EMPTY_FORM.appliedDate,
        jobUrl: job.jobUrl || "",
        notes: job.notes || "",
      };
    }
    // Use persisted draft if it exists, otherwise start fresh
    return draftForm || { ...EMPTY_FORM };
  });

  const [errors, setErrors] = useState({});

  // ─── Sync form changes up to parent (for draft persistence) ──
  // Every time the user types, we update the draft in DashboardPage
  // so it survives accidental modal close
  const updateForm = (updater) => {
    setForm((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (!isEdit && setDraftForm) setDraftForm(next); // Keep parent in sync
      return next;
    });
  };

  // ─── Close on Escape key ────────────────────────────────────
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // ─── Prevent body scroll when modal is open ─────────────────
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // ─── Field change handler ────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ─── Validate required fields ────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.company.trim()) errs.company = "Company name is required";
    if (!form.position.trim()) errs.position = "Position is required";
    if (form.jobUrl && !/^https?:\/\/.+/.test(form.jobUrl)) {
      errs.jobUrl = "URL must start with http:// or https://";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ─── Handle autofill from screenshot ────────────────────────
  // Called by ScreenshotUploader with parsed fields
  // Only fills fields that were actually found — doesn't overwrite
  // fields the user already typed in
  const handleExtracted = (parsed) => {
    updateForm((prev) => ({
      ...prev,
      company:  parsed.company  || prev.company,
      position: parsed.position || prev.position,
      salary:   parsed.salary   || prev.salary,
    }));
    setErrors({});
  };

  // ─── Submit ──────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(form);
  };

  // ─── Close on overlay click ──────────────────────────────────
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div className={styles.overlay} ref={overlayRef} onClick={handleOverlayClick}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={isEdit ? "Edit job" : "Add new job"}>
        {/* ─── Header ─────────────────────────────────────── */}
        <div className={styles.head}>
          <h2 className={styles.title}>
            {isEdit ? "Edit Application" : "Add New Job"}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            <CloseIcon />
          </button>
        </div>

        {/* ─── Form body ──────────────────────────────────── */}
        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.body}>
            {/* Screenshot autofill — only shown when adding a new job */}
            {!isEdit && (
              <ScreenshotUploader
                onExtracted={handleExtracted}
                onReset={() => updateForm({ ...EMPTY_FORM })}
              />
            )}

            {/* Row 1: Company + Position */}
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="company">Company *</label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  placeholder="e.g. Google"
                  value={form.company}
                  onChange={handleChange}
                  className={errors.company ? styles.inputErr : ""}
                  autoFocus
                />
                {errors.company && <span className={styles.fieldErr}>{errors.company}</span>}
              </div>
              <div className={styles.field}>
                <label htmlFor="position">Position *</label>
                <input
                  id="position"
                  name="position"
                  type="text"
                  placeholder="e.g. Frontend Engineer"
                  value={form.position}
                  onChange={handleChange}
                  className={errors.position ? styles.inputErr : ""}
                />
                {errors.position && <span className={styles.fieldErr}>{errors.position}</span>}
              </div>
            </div>

            {/* Row 2: Status + Location */}
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="status">Status</label>
                <select id="status" name="status" value={form.status} onChange={handleChange}>
                  <option value="wishlist">Wishlist</option>
                  <option value="applied">Applied</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className={styles.field}>
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="e.g. Remote, New York"
                  value={form.location}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Row 3: Salary + Date */}
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="salary">Salary / Range</label>
                <input
                  id="salary"
                  name="salary"
                  type="text"
                  placeholder="e.g. $120k – $150k"
                  value={form.salary}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="appliedDate">Applied Date</label>
                <input
                  id="appliedDate"
                  name="appliedDate"
                  type="date"
                  value={form.appliedDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Row 4: Job URL (full width) */}
            <div className={`${styles.row} ${styles.full}`}>
              <div className={styles.field}>
                <label htmlFor="jobUrl">Job Posting URL</label>
                <input
                  id="jobUrl"
                  name="jobUrl"
                  type="url"
                  placeholder="https://careers.example.com/job/123"
                  value={form.jobUrl}
                  onChange={handleChange}
                  className={errors.jobUrl ? styles.inputErr : ""}
                />
                {errors.jobUrl && <span className={styles.fieldErr}>{errors.jobUrl}</span>}
              </div>
            </div>

            {/* Row 5: Notes (full width) */}
            <div className={`${styles.row} ${styles.full}`}>
              <div className={styles.field}>
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  placeholder="Interview notes, contacts, follow-up reminders…"
                  value={form.notes}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* ─── Footer with action buttons ─────────────────── */}
          <div className={styles.foot}>
            {/* Cancel clears the draft — intentional discard */}
            <button type="button" className={styles.cancelBtn} onClick={onCancel || onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? <Spinner /> : (isEdit ? "Save Changes" : "Add Job")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
