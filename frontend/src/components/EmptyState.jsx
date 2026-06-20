import styles from "./EmptyState.module.css";

export default function EmptyState({ hasSearch, onAdd }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.icon}>
        {hasSearch ? "🔍" : "🚀"}
      </div>
      <h3 className={styles.title}>
        {hasSearch
          ? "No jobs match your search"
          : "No jobs yet. Start applying!"}
      </h3>
      <p className={styles.sub}>
        {hasSearch
          ? "Try a different keyword or clear your filters"
          : "Track your first application and stay on top of your job hunt"}
      </p>
      {!hasSearch && (
        <button className={styles.btn} onClick={onAdd}>
          + Add your first job
        </button>
      )}
    </div>
  );
}
