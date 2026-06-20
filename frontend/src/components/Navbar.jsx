// ============================================================
// components/Navbar.jsx — Sticky top navigation bar
// Shows brand logo, user greeting, dark mode toggle, logout
// ============================================================

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import styles from "./Navbar.module.css";

// ─── Sun icon (light mode) ────────────────────────────────────
const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

// ─── Moon icon (dark mode) ────────────────────────────────────
const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

export default function Navbar() {
  const { user, logout } = useAuth();

  // ─── Dark mode — persisted in localStorage ─────────────────
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("jf_theme") === "dark";
  });

  // Apply theme class to <html> on change
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("jf_theme", dark ? "dark" : "light");
  }, [dark]);

  // Restore theme on mount
  useEffect(() => {
    const saved = localStorage.getItem("jf_theme");
    if (saved === "dark") setDark(true);
  }, []);

  const toggleTheme = () => setDark((d) => !d);

  // ─── Extract first name for greeting ───────────────────────
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        {/* Brand logo */}
        <div className={styles.logo}>
          <div className={styles.logoMark}>JF</div>
          <span className={styles.logoText}>JobFlow</span>
        </div>

        {/* Right-side controls */}
        <div className={styles.right}>
          {/* Greeting */}
          <span className={styles.greeting}>
            Hi, {firstName} 👋
          </span>

          {/* Dark mode toggle */}
          <button
            className={styles.iconBtn}
            onClick={toggleTheme}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle dark mode"
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* Logout button */}
          <button className={styles.logoutBtn} onClick={logout}>
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
