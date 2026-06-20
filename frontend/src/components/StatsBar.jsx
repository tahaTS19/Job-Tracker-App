// ============================================================
// components/StatsBar.jsx — Dashboard insight cards row
// Shows total, wishlist, interview, offer, rejected counts
// ============================================================

import styles from "./StatsBar.module.css";

// Stats configuration — label, key in stats object, accent CSS var
const STAT_CARDS = [
  { label: "Total",      key: "total",     accent: "var(--brand-primary)" },
  { label: "Wishlist",   key: "wishlist",  accent: "var(--status-wishlist)" },
  { label: "Interviews", key: "interview", accent: "var(--status-interview)" },
  { label: "Offers",     key: "offer",     accent: "var(--status-offer)" },
  { label: "Rejected",   key: "rejected",  accent: "var(--status-rejected)" },
];

export default function StatsBar({ stats }) {
  return (
    <div className={styles.row}>
      {STAT_CARDS.map(({ label, key, accent }) => (
        <div className={styles.card} key={key}>
          <span className={styles.label}>{label}</span>
          {/* Animated count — color-coded per status */}
          <span className={styles.value} style={{ color: accent }}>
            {stats[key] ?? 0}
          </span>
        </div>
      ))}
    </div>
  );
}
