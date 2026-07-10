// ============================================================
// components/ScreenshotUploader.jsx
// Lets user upload a job posting screenshot → runs Tesseract
// OCR in the browser → calls onExtracted() with parsed fields
// No server involved — everything runs on the user's device
// ============================================================

import { useState, useRef } from "react";
import { parseJobText } from "../utils/parseJobText";
import styles from "./ScreenshotUploader.module.css";

const UploadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

// Lightbulb icon — used instead of the emoji for the hint
const TipIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 18h6M10 22h4M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.74.74 1.21 1.49 1.41 2.5" />
  </svg>
);

export default function ScreenshotUploader({ onExtracted, onReset }) {
  const fileInputRef = useRef(null);

  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) {
      setStatus("error");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setStatus("loading");
    setProgress(0);

    try {
      const Tesseract = await import("tesseract.js");

      const result = await Tesseract.recognize(
        file,
        "eng",
        {
          logger: (m) => {
            if (m.status === "recognizing text") {
              setProgress(Math.round(m.progress * 100));
            }
          },
        }
      );

      const rawText = result.data.text;
      const parsed = parseJobText(rawText);

      onExtracted(parsed);
      setStatus("done");

    } catch (err) {
      console.error("OCR failed:", err);
      setStatus("error");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleClick = () => fileInputRef.current?.click();

  const handleReset = () => {
    setStatus("idle");
    setPreview(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (onReset) onReset();
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.labelRow}>
        <span className={styles.label}>AUTOFILL FROM SCREENSHOT</span>
        <span className={styles.badge}>LinkedIn & Indeed</span>
      </div>

      <div
        className={`${styles.dropZone} ${status === "done" ? styles.done : ""} ${status === "error" ? styles.errZone : ""}`}
        onClick={status === "idle" || status === "error" ? handleClick : undefined}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className={styles.hiddenInput}
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {status === "idle" && (
          <div className={styles.idleContent}>
            <div className={styles.uploadIconWrap}>
              <UploadIcon />
            </div>
            <p className={styles.dropText}>
              Drop screenshot here or <span className={styles.browse}>browse</span>
            </p>
            <p className={styles.hint}>
              <TipIcon /> Crop to just the job card for best results
            </p>
          </div>
        )}

        {status === "loading" && (
          <div className={styles.loadingContent}>
            {preview && (
              <img src={preview} alt="preview" className={styles.previewThumb} />
            )}
            <div className={styles.progressWrap}>
              <p className={styles.readingText}>Reading screenshot...</p>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className={styles.progressPct}>{progress}%</p>
            </div>
          </div>
        )}

        {status === "done" && (
          <div className={styles.doneContent}>
            <div className={styles.doneIcon}>
              <SparkleIcon />
            </div>
            <p className={styles.doneText}>Fields autofilled</p>
            <button
              type="button"
              className={styles.resetBtn}
              onClick={(e) => { e.stopPropagation(); handleReset(); }}
            >
              Try another
            </button>
          </div>
        )}

        {status === "error" && (
          <div className={styles.errorContent}>
            <p className={styles.errorText}>
              Couldn't read that image. Try a clearer screenshot.
            </p>
            <button
              type="button"
              className={styles.resetBtn}
              onClick={(e) => { e.stopPropagation(); handleReset(); }}
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
