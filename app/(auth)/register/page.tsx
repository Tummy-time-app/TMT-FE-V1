"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateAccount = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    router.push('/verify');
  };

  return (
    <div className="root">
      {/* Background */}
      <div className="bg" />

      {/* Card */}
      <div className="card">
        {/* Logo */}
        
          <Image
            src="/images/logo/tummytime-logo.png"
            alt="TummyTime"
            width={200}
            height={100}
            priority
            className="logo-img"
          />

        {/* Heading */}
        <h1 className="heading">
          <span className="heading-welcome">Welcome</span>{" "}
        </h1>

        <p className="subtext">Create an account to get started</p>

        {/* Form */}
        <div className="form">
          {/* Username */}
          <div className="field">
            <label htmlFor="username" className="label">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="input"
              placeholder="johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

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

          {/* Phone Number */}
          <div className="field">
            <label htmlFor="phoneNumber" className="label">
              Phone Number
            </label>
            <input
              id="phoneNumber"
              type="tel"
              className="input"
              placeholder="+1 (555) 000-0000"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              autoComplete="tel"
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
                autoComplete="new-password"
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

          {/* Confirm Password */}
          <div className="field">
            <label htmlFor="confirmPassword" className="label">
              Confirm Password
            </label>
            <div className="input-wrap">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                className="input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
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

          {/* Create Account button */}
          <button
            type="button"
            className={`login-btn${loading ? " loading" : ""}`}
            onClick={handleCreateAccount}
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : "Create Account"}
          </button>
        </div>

        {/* Login Link */}
        <p className="register-text">
          Already have an account ?{" "}
          <Link href="/login" className="register-link">
            Login
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
          margin-bottom: 8px;
          margin-top: 16px;    
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

        @media (max-width: 480px) {
          .card { padding: 32px 24px 28px; margin: 0 16px; }
        }
      `}</style>
    </div>
  );
}