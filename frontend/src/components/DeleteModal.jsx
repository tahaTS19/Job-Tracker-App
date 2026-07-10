// ============================================================
// components/DeleteModal.jsx — Delete confirmation dialog
// Shows job name, asks user to confirm before deleting
// ============================================================

import { useEffect, useRef } from "react";
import styles from "./DeleteModal.module.css";

// Trash icon for the warning circle
const TrashIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

// Spinner for loading state
const Spinner = () => (
  <span style={{
    display: "inline-block",
    width: 15,
    height: 15,
    border: "2px solid rgba(255,255,255,.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin .65s linear infinite",
    margin: "0 auto",
  }} />
);

export default function DeleteModal({ job, onConfirm, onClose, loading }) {
  const overlayRef = useRef(null);

  // ─── ESC to close ────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // ─── Lock body scroll ────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div className={styles.overlay} ref={overlayRef} onClick={handleOverlayClick}>
      <div className={styles.modal} role="alertdialog" aria-modal="true">
        {/* Warning icon */}
        <div className={styles.iconWrap}>
          <TrashIcon />
        </div>

        <h2 className={styles.title}>Remove this job?</h2>

        <p className={styles.description}>
          <strong>{job?.position}</strong> at <strong>{job?.company}</strong> will be
          permanently deleted. This action cannot be undone.
        </p>

        {/* Action buttons */}
        <div className={styles.buttons}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className={styles.deleteBtn} onClick={onConfirm} disabled={loading}>
            {loading ? <Spinner /> : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
