// ============================================================
// components/LoadingScreen.jsx — Full-page loading state
// Shown while checking auth on app startup
// ============================================================

import styles from "./LoadingScreen.module.css";

export default function LoadingScreen() {
  return (
    <div className={styles.screen}>
      {/* Animated logo mark */}
      <div className={styles.logoMark}>
        <span>JF</span>
      </div>
      <div className={styles.dots}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
}
