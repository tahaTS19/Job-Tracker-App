// ============================================================
// components/JobCard.jsx — Single job application row card
// Shows company avatar, position, status badge, actions
// ============================================================

import styles from "./JobCard.module.css";

// ─── Status badge configuration ───────────────────────────────
const STATUS_META = {
  wishlist:  { label: "Wishlist",  colorVar: "var(--status-wishlist)",  bgVar: "var(--status-wishlist-bg)"  },
  applied:   { label: "Applied",   colorVar: "var(--status-applied)",   bgVar: "var(--status-applied-bg)"   },
  interview: { label: "Interview", colorVar: "var(--status-interview)", bgVar: "var(--status-interview-bg)" },
  offer:     { label: "Offer",     colorVar: "var(--status-offer)",     bgVar: "var(--status-offer-bg)"     },
  rejected:  { label: "Rejected",  colorVar: "var(--status-rejected)",  bgVar: "var(--status-rejected-bg)"  },
};

// ─── Generate consistent avatar color from company name ───────
const AVATAR_COLORS = [
  "#3d7a5f", "#7c5cbf", "#c96f2a", "#1d6fb5",
  "#c0392b", "#2d8a7a", "#9b4f96", "#d4813a",
];

function avatarColor(company) {
  let hash = 0;
  for (let i = 0; i < company.length; i++) {
    hash = (hash * 31 + company.charCodeAt(i)) % AVATAR_COLORS.length;
  }
  return AVATAR_COLORS[hash];
}

// ─── Format date to "Jan 15, 2025" ───────────────────────────
function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Edit icon ────────────────────────────────────────────────
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

// ─── Trash icon ───────────────────────────────────────────────
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

// ─── External link icon ───────────────────────────────────────
const LinkIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

export default function JobCard({ job, index, onEdit, onDelete }) {
  const sm = STATUS_META[job.status] || STATUS_META.applied;
  const initial = job.company?.[0]?.toUpperCase() || "?";
  const color = avatarColor(job.company || "");

  return (
    <div
      className={`${styles.card} fade-in`}
      style={{ animationDelay: `${index * 45}ms` }}
    >
      {/* Company avatar — colored initial */}
      <div className={styles.avatar} style={{ background: color }}>
        {initial}
      </div>

      {/* Job info */}
      <div className={styles.info}>
        <div className={styles.position}>{job.position}</div>
        <div className={styles.meta}>
          <span className={styles.company}>{job.company}</span>
          {job.location && (
            <span className={styles.location}>· {job.location}</span>
          )}
          {/* Status badge */}
          <span
            className={styles.badge}
            style={{
              background: sm.bgVar,
              color: sm.colorVar,
            }}
          >
            {sm.label}
          </span>
          <span className={styles.date}>{formatDate(job.appliedDate)}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className={styles.actions}>
        {/* External link — shown only when jobUrl is set */}
        {job.jobUrl && (
          <a
            href={job.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.btn} ${styles.linkBtn}`}
            title="Open job posting"
          >
            <LinkIcon />
          </a>
        )}

        {/* Edit button */}
        <button
          className={`${styles.btn} ${styles.editBtn}`}
          onClick={onEdit}
          title="Edit job"
        >
          <EditIcon />
        </button>

        {/* Delete button */}
        <button
          className={`${styles.btn} ${styles.deleteBtn}`}
          onClick={onDelete}
          title="Delete job"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}
