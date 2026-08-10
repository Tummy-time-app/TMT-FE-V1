"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in email and password.");
      return;
    }

    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      router.push('/');
    }, 1200);
  };

  return (
    <div className="auth-root">
      <div className="auth-bg" />

      <div className="auth-card">
        <Image
          src="/images/logo/tummytime-logo.png"
          alt="TummyTime"
          width={200}
          height={50}
          priority
          className="auth-logo-img"
        />

        <h1 className="auth-heading">
          <span className="auth-heading-welcome">Welcome</span>{" "}
          <span className="auth-heading-back">back</span>
        </h1>

        <p className="auth-subtext">Sign in to your account to continue</p>

        <div className="auth-form">
          <div className="auth-field">
            <label htmlFor="email" className="auth-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="auth-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password" className="auth-label">
              Password
            </label>
            <div className="auth-input-wrap">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="auth-forgot-wrap">
            <a href="#" className="auth-forgot-link">
              Forgot password ?
            </a>
          </div>

          <button
            type="button"
            className={`auth-submit-btn${loading ? " auth-submit-btn--loading" : ""}`}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? <span className="auth-spinner" /> : "Login"}
          </button>

          {error && <p className="auth-error-text">{error}</p>}

          {showSuccess && (
            <div className="auth-modal-overlay">
              <div className="auth-success-modal">
                <h2>Login Successful</h2>
                <p>Redirecting to dashboard...</p>
              </div>
            </div>
          )}
        </div>

        <p className="auth-switch-text">
          No account yet ?{" "}
          <Link href="/register" className="auth-switch-link">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
