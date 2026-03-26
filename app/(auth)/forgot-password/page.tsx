"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    if (!email) return;
    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    router.push("/forgot-password/verify");
  };

  return (
    <div className="root">
      {/* Background */}
      <div className="bg" />

      {/* Card */}
      <div className="card">
        {/* Logo */}
        <Image
          src="/logo.png"
          alt="TummyTime"
          width={160}
          height={60}
          priority
          className="logo-img"
        />

        {/* Heading */}
        <h1 className="heading">Forgot Password?</h1>
        <p className="subtext-top">No worries</p>
        <p className="subtext-bottom">
          Enter the email address associated with your account
        </p>

        {/* Form */}
        <div className="form">
          {/* Email */}
          <div className="field">
            <label htmlFor="email" className="label">
              Email
            </label>
            <div className="input-wrap">
              <span className="input-icon">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Reset button */}
          <button
            type="button"
            className={`reset-btn${loading ? " loading" : ""}`}
            onClick={handleReset}
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : "Reset password"}
          </button>
        </div>

        {/* Back to login */}
        <Link href="/login" className="back-link">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          Back to login
        </Link>
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
          background: linear-gradient(160deg, #6B0000 0%, #A31200 25%, #CC3000 50%, #E86000 75%, #F5A800 100%);
          z-index: 0;
        }

        .card {
          position: relative;
          z-index: 1;
          background: #ffffff;
          border-radius: 20px;
          padding: 36px 44px 32px;
          width: 100%;
          max-width: 400px;
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
          width: auto;
          height: 48px;
          margin-bottom: 20px;
        }

        .heading {
          font-size: 20px;
          font-weight: 800;
          color: #1a1a1a;
          margin-bottom: 6px;
          letter-spacing: -0.2px;
          text-align: center;
        }

        .subtext-top {
          font-size: 13px;
          color: #999;
          margin-bottom: 2px;
          text-align: center;
        }

        .subtext-bottom {
          font-size: 13px;
          color: #999;
          margin-bottom: 24px;
          text-align: center;
          line-height: 1.5;
        }

        .form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 14px;
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
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          color: #aaa;
          display: flex;
          align-items: center;
          pointer-events: none;
        }

        .input {
          width: 100%;
          padding: 12px 18px 12px 40px;
          border-radius: 10px;
          border: 1.5px solid #e0e0e0;
          background: #fff;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          color: #222;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .input:focus {
          border-color: #C8102E;
          box-shadow: 0 0 0 3px rgba(200,16,46,0.10);
        }

        .input::placeholder { color: #bbb; }

        .reset-btn {
          width: 100%;
          padding: 13px;
          border-radius: 8px;
          border: none;
          background: linear-gradient(90deg, #E86000 0%, #C8102E 100%);
          color: #fff;
          font-family: 'Nunito', sans-serif;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 14px rgba(200,16,46,0.28);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 46px;
          margin-top: 4px;
        }

        .reset-btn:hover:not(:disabled) {
          opacity: 0.93;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(200,16,46,0.35);
        }

        .reset-btn:active:not(:disabled) { transform: translateY(0); }
        .reset-btn:disabled { opacity: 0.75; cursor: not-allowed; }

        .spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 2.5px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .back-link {
          margin-top: 20px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 600;
          color: #555;
          text-decoration: none;
          transition: color 0.2s;
        }

        .back-link:hover { color: #C8102E; }

        @media (max-width: 480px) {
          .card { padding: 28px 20px 24px; margin: 0 16px; }
        }
      `}</style>
    </div>
  );
}
