import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import styles from "./AuthPage.module.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setGeneralError("");
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    else if (form.name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";
    if (!form.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Invalid email format";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setGeneralError("");
    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      toast.success(`Welcome aboard, ${form.name.split(" ")[0]}`);
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Registration failed. Please try again.";
      setGeneralError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />

      <div className={`${styles.card} scale-in`}>
        <div className={styles.logo}>
          <div className={styles.logoMark}>JF</div>
          <span>JobFlow</span>
        </div>

        <h1 className={styles.title}>Create account</h1>
        <p className={styles.subtitle}>
          Start tracking your job hunt — organized and stress-free
        </p>

        {generalError && (
          <div className={styles.errorBanner}>{generalError}</div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className="field">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Jane Smith"
              value={form.name}
              onChange={handleChange}
              className={errors.name ? styles.inputError : ""}
              autoComplete="name"
              autoFocus
            />
            {errors.name && <span className={styles.errorMsg}>{errors.name}</span>}
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className={errors.email ? styles.inputError : ""}
              autoComplete="email"
            />
            {errors.email && <span className={styles.errorMsg}>{errors.email}</span>}
          </div>

          <div className="field">
            <label htmlFor="password">
              Password{" "}
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                (min. 6 characters)
              </span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className={errors.password ? styles.inputError : ""}
              autoComplete="new-password"
            />
            {errors.password && <span className={styles.errorMsg}>{errors.password}</span>}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.btnSpinner} /> : "Create Account"}
          </button>
        </form>

        <p className={styles.switchLink}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
