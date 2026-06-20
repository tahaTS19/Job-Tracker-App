import styles from "./EmptyState.module.css";

const BriefcaseIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    <path d="M2 13h20" />
  </svg>
);

const SearchOffIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
    <line x1="8" y1="8" x2="14" y2="14" />
  </svg>
);

export default function EmptyState({ hasSearch, onAdd }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.icon}>
        {hasSearch ? <SearchOffIcon /> : <BriefcaseIcon />}
      </div>
      <h3 className={styles.title}>
        {hasSearch
          ? "No jobs match your search"
          : "No jobs yet. Start applying"}
      </h3>
      <p className={styles.sub}>
        {hasSearch
          ? "Try a different keyword or clear your filters"
          : "Track your first application and stay on top of your job hunt"}
      </p>
      {!hasSearch && (
        <button className={styles.btn} onClick={onAdd}>
          Add your first job
        </button>
      )}
    </div>
  );
}
