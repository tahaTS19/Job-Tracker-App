// ============================================================
// components/SkeletonCard.jsx — Animated loading placeholder
// Shown while jobs are being fetched from the API
// ============================================================

import styles from "./SkeletonCard.module.css";

export default function SkeletonCard({ delay = 0 }) {
  return (
    <div className={styles.card} style={{ animationDelay: `${delay}ms` }}>
      {/* Avatar placeholder */}
      <div className={`${styles.skel} ${styles.avatar}`} />

      {/* Text lines placeholder */}
      <div className={styles.lines}>
        <div className={`${styles.skel} ${styles.line1}`} />
        <div className={`${styles.skel} ${styles.line2}`} />
      </div>

      {/* Badge placeholder */}
      <div className={`${styles.skel} ${styles.badge}`} />
    </div>
  );
}
