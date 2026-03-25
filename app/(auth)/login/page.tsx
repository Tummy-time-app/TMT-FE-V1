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
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      router.push('/');
    }, 1200);
  };

  return (
    <div className="root">
      {/* Background */}
      <div className="bg" />    

      {/* Card */}
      <div className="card">
        {/* Logo */}
        
          <Image
            src="/images/tummytime-logo.png"
            alt="TummyTime"
            width={300}
            height={200}
            priority
            className="logo-img"
          />

        {/* Heading */}
        <h1 className="heading">
          <span className="heading-welcome">Welcome</span>{" "}
          <span className="heading-back">back</span>
        </h1>

        <p className="subtext">Sign in to your account to continue</p>

        {/* Form */}
        <div className="form">
          {/* Email */}
          <div className="field">
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="field">
            <label htmlFor="password" className="label">
              Password
            </label>
            <div className="input-wrap">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="eye-btn"
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

          {/* Forgot password */}
          <div className="forgot-wrap">
            <a href="#" className="forgot-link">
              Forgot password ?
            </a>
          </div>

          {/* Login button */}
          <button
            type="button"
            className={`login-btn${loading ? " loading" : ""}`}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : "Login"}
          </button>

          {error && <p className="error-text">{error}</p>}

          {showSuccess && (
            <div className="modal-overlay">
              <div className="success-modal">
                <h2>Login Successful</h2>
                <p>Redirecting to dashboard...</p>
              </div>
            </div>
          )}
        </div>

        {/* Register */}
        <p className="register-text">
          No account yet ?{" "}
          <Link href="/register" className="register-link">
            Register
          </Link>
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');

        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .root {
          font-family: 'Nunito', sans-serif;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .bg {
          position: fixed;
          inset: 0;
          background: linear-gradient(160deg, #8B0000 0%, #C8102E 30%, #D94F00 60%, #F5A800 100%);
          z-index: 0;
        }

        .card {
          position: relative;
          z-index: 1;
          background: #ffffff;
          border-radius: 24px;
          padding: 40px 48px 36px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.10);
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: cardIn 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .logo-img {
          object-fit: contain;
          margin-bottom: -36px;
          margin-top: -36px;    
        }

        .heading {
          font-size: 22px;
          font-weight: 800;
          margin-bottom: 8px;
          letter-spacing: -0.2px;
        }

        .heading-welcome { color: #C8102E; }
        .heading-back    { color: #F5A800; }

        .subtext {
          color: #888;
          font-size: 14px;
          margin-bottom: 28px;
          text-align: center;
        }

        .form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .label {
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .input-wrap {
          position: relative;
        }

        .input {
          width: 100%;
          padding: 13px 18px;
          border-radius: 50px;
          border: 1.5px solid transparent;
          background: #f4f4f4;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          color: #222;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }

        .input-wrap .input {
          padding-right: 46px;
        }

        .input:focus {
          background: #fff;
          border-color: #C8102E;
          box-shadow: 0 0 0 3px rgba(200,16,46,0.10);
        }

        .input::placeholder { color: #bbb; }

        .eye-btn {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #aaa;
          display: flex;
          align-items: center;
          padding: 0;
          transition: color 0.2s;
        }

        .eye-btn:hover { color: #C8102E; }

        .forgot-wrap {
          display: flex;
          justify-content: flex-start;
          margin-top: -4px;
        }

        .forgot-link {
          font-size: 13px;
          color: #888;
          text-decoration: none;
          transition: color 0.2s;
        }

        .forgot-link:hover { color: #C8102E; }

        .login-btn {
          width: 100%;
          padding: 14px;
          border-radius: 50px;
          border: none;
          background: linear-gradient(90deg, #F5A800 0%, #C8102E 100%);
          color: #fff;
          font-family: 'Nunito', sans-serif;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 0.3px;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 16px rgba(200,16,46,0.28);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 50px;
          margin-top: 4px;
        }

        .login-btn:hover:not(:disabled) {
          opacity: 0.93;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(200,16,46,0.35);
        }

        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-btn:disabled { opacity: 0.75; cursor: not-allowed; }

        .spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 2.5px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .register-text {
          margin-top: 24px;
          font-size: 14px;
          color: #888;
        }

        .register-link {
          color: #C8102E;
          font-weight: 700;
          text-decoration: none;
          transition: color 0.2s;
        }

        .register-link:hover { color: #F5A800; }

        .error-text {
          margin-top: 8px;
          color: #c53030;
          font-size: 13px;
          text-align: center;
          font-weight: 600;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
        }

        .success-modal {
          background: #fff;
          padding: 22px 24px;
          border-radius: 14px;
          text-align: center;
          box-shadow: 0 18px 35px rgba(0,0,0,0.22);
          max-width: 300px;
        }

        .success-modal h2 {
          margin-bottom: 8px;
          color: #16a34a;
          font-size: 20px;
        }

        .success-modal p {
          color: #333;
          font-size: 14px;
          margin: 0;
        }

        @media (max-width: 480px) {
          .card { padding: 32px 24px 28px; margin: 0 16px; }
        }
      `}</style>
    </div>
  );
}