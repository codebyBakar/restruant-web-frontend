import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Envelope, Eye, EyeSlash, Lock, ShieldCheck, WarningCircle } from "phosphor-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../api/axios.js";

const EMAIL_RX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const SANITIZE_RX = /<[^>]*>/g;

function sanitize(str) {
  return String(str).replace(SANITIZE_RX, "").trim();
}

function validateEmail(email) {
  if (!email) return "Email is required";
  if (email.length > 254) return "Email address is too long";
  if (!EMAIL_RX.test(email)) return "Please enter a valid email address";
  return "";
}

function validatePassword(password) {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (password.length > 128) return "Password is too long";
  return "";
}

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 15;
  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 15;
  if (/[^a-zA-Z0-9]/.test(password)) score += 20;
  return Math.min(score, 100);
}

function getStrengthLabel(score) {
  if (score < 30) return { label: "Weak", color: "#c2410c" };
  if (score < 60) return { label: "Fair", color: "#e3a008" };
  if (score < 80) return { label: "Good", color: "#4b7b5b" };
  return { label: "Strong", color: "#267349" };
}

export default function AdminLogin() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const lockoutIntervalRef = useRef(null);
  const lockoutRemainingRef = useRef(0);
  const [siteName, setSiteName] = useState("Pratha");

  useEffect(() => {
    api.get("/settings").then(({ data }) => setSiteName(data.data?.siteName || "Pratha")).catch(() => {});
    return () => {
      if (lockoutIntervalRef.current) {
        clearInterval(lockoutIntervalRef.current);
        lockoutIntervalRef.current = null;
      }
    };
  }, []);

  const handleChange = useCallback(
    (field, value) => {
      const cleaned = sanitize(value);
      setForm((prev) => ({ ...prev, [field]: cleaned }));
      if (touched[field]) {
        const err = field === "email" ? validateEmail(cleaned) : validatePassword(cleaned);
        setErrors((prev) => ({ ...prev, [field]: err }));
      }
    },
    [touched]
  );

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const err = field === "email" ? validateEmail(form[field]) : validatePassword(form[field]);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const isFormValid = () => {
    const emailErr = validateEmail(form.email);
    const passErr = validatePassword(form.password);
    setErrors({ email: emailErr, password: passErr });
    setTouched({ email: true, password: true });
    return !emailErr && !passErr;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (lockoutTimer > 0) return;
    if (!isFormValid()) return;

    setSubmitting(true);
    try {
      await login(form.email, form.password);
      setFailedAttempts(0);
      toast.success("Welcome back!");
      navigate("/admin");
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid email or password";
      setServerError(msg);
      toast.error(msg);

      const newCount = failedAttempts + 1;
      setFailedAttempts(newCount);

      if (newCount >= 3) {
        if (lockoutIntervalRef.current) {
          clearInterval(lockoutIntervalRef.current);
          lockoutIntervalRef.current = null;
        }
        lockoutRemainingRef.current = 30;
        setLockoutTimer(30);
        lockoutIntervalRef.current = setInterval(() => {
          lockoutRemainingRef.current -= 1;
          if (lockoutRemainingRef.current <= 0) {
            if (lockoutIntervalRef.current) {
              clearInterval(lockoutIntervalRef.current);
              lockoutIntervalRef.current = null;
            }
            setLockoutTimer(0);
            setFailedAttempts(0);
          } else {
            setLockoutTimer(lockoutRemainingRef.current);
          }
        }, 1000);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!loading && user) return <Navigate to="/admin" replace />;

  const passwordScore = form.password ? getPasswordStrength(form.password) : 0;
  const strength = form.password ? getStrengthLabel(passwordScore) : null;

  const inputStyle = (field) => ({
    borderColor: touched[field] && errors[field] ? "#d04a32" : undefined,
  });

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--charcoal)", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 700, color: "var(--cream)" }}>{siteName}</div>
          <div style={{ fontSize: 13, color: "rgba(251,243,230,0.55)", marginTop: 4 }}>Admin Dashboard</div>
        </div>

        <div style={{ background: "var(--cream)", borderRadius: 22, padding: "30px 32px" }}>
          <h2 style={{ fontSize: 20, fontFamily: "var(--font-display)", fontWeight: 700, margin: "0 0 22px", color: "var(--ink)" }}>Sign In</h2>

          {serverError && (
            <div role="alert" style={{ background: "#fbe8e3", border: "1px solid #e8b4a8", color: "#a33416", borderRadius: 12, padding: "11px 14px", marginBottom: 18, fontSize: 13, display: "flex", alignItems: "flex-start", gap: 8 }}>
              <WarningCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{serverError}</span>
            </div>
          )}

          {lockoutTimer > 0 && !serverError && (
            <div role="alert" style={{ background: "#fbe8e3", border: "1px solid #e8b4a8", color: "#a33416", borderRadius: 12, padding: "11px 14px", marginBottom: 18, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
              <WarningCircle size={16} style={{ flexShrink: 0 }} />
              <span>Too many attempts. Retry in <strong>{lockoutTimer}s</strong></span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <div style={{ position: "relative" }}>
                <Envelope size={16} weight="duotone" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--ink-soft)", opacity: 0.75, pointerEvents: "none" }} />
                <input
                  id="login-email"
                  className="form-input"
                  type="email"
                  placeholder="admin@example.com"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  required
                  autoComplete="email"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  aria-invalid={touched.email && errors.email ? "true" : "false"}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  style={{ paddingLeft: 40, ...inputStyle("email") }}
                />
              </div>
              {touched.email && errors.email && (
                <div id="email-error" role="alert" style={{ fontSize: 11.5, color: "#a33416", marginTop: 5, display: "flex", alignItems: "center", gap: 4 }}>
                  <WarningCircle size={11} /> {errors.email}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} weight="duotone" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--ink-soft)", opacity: 0.75, pointerEvents: "none" }} />
                <input
                  id="login-password"
                  className="form-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  onBlur={() => handleBlur("password")}
                  required
                  autoComplete="current-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  aria-invalid={touched.password && errors.password ? "true" : "false"}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  maxLength={128}
                  style={{ paddingLeft: 40, paddingRight: 44, ...inputStyle("password") }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  title={showPassword ? "Hide password" : "Show password"}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", padding: 0, cursor: "pointer", color: "var(--ink-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {touched.password && errors.password && (
                <div id="password-error" role="alert" style={{ fontSize: 11.5, color: "#a33416", marginTop: 5, display: "flex", alignItems: "center", gap: 4 }}>
                  <WarningCircle size={11} /> {errors.password}
                </div>
              )}
              {form.password && !errors.password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ height: 4, borderRadius: 2, background: "var(--line)", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 2, background: strength?.color || "var(--line)", transform: `scaleX(${passwordScore / 100})`, transformOrigin: "left", transition: "transform 0.3s ease, background 0.3s ease" }} />
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: strength?.color || "var(--ink-soft)", marginTop: 4 }}>
                    Password strength: {strength?.label || ""}
                  </div>
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting || lockoutTimer > 0} style={{ height: 48, fontSize: 14, fontWeight: 700, marginTop: 4 }}>
              {submitting ? "Signing in..." : lockoutTimer > 0 ? `Wait ${lockoutTimer}s` : "Sign In"}
            </button>
          </form>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "center", alignItems: "center", gap: 6 }}>
            <ShieldCheck size={14} weight="fill" color="var(--ink-soft)" />
            <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--ink-soft)", letterSpacing: "0.04em", textTransform: "uppercase" }}>Secured with end-to-end encryption</span>
          </div>
        </div>
      </div>
      <style>{`
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-size: 12.5px; font-weight: 700; color: var(--ink); letter-spacing: 0.02em; }
        .form-input { width: 100%; padding: 13px 16px; border-radius: 12px; border: 1.5px solid var(--line); font-family: inherit; font-size: 14px; background: #fff; color: var(--ink); outline: none; transition: border-color 0.15s ease, box-shadow 0.15s ease; box-sizing: border-box; }
        .form-input:focus { border-color: var(--paprika); box-shadow: 0 0 0 3px rgba(194, 65, 12, 0.12); }
        .form-input::placeholder { color: #b3a496; }
      `}</style>
    </div>
  );
}
