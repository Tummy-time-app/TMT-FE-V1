"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleConfirm = async () => {
    if (!password || password !== confirmPassword) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    router.push("/forgot-password/success");
  };

  return (
    <div className="root">
      <div className="bg" />

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
        <h1 className="heading">New password</h1>
        <p className="subtext">Please input your new password</p>

        {/* Form */}
        <div className="form">
          <input
            type="password"
            className="input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <input
            type="password"
            className="input"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />

          <button
            type="button"
            className={`confirm-btn${loading ? " loading" : ""}`}
            onClick={handleConfirm}
            disabled={loading || !password || password !== confirmPassword}
          >
            {loading ? <span className="spinner" /> : "Confirm password"}
          </button>
        </div>
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
          padding: 36px 44px 36px;
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

        .subtext {
          font-size: 13px;
          color: #999;
          margin-bottom: 24px;
          text-align: center;
        }

        .form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .input {
          width: 100%;
          padding: 13px 18px;
          border-radius: 10px;
          border: 1.5px solid #e8e8e8;
          background: #f5f5f5;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          color: #222;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }

        .input:focus {
          background: #fff;
          border-color: #C8102E;
          box-shadow: 0 0 0 3px rgba(200,16,46,0.10);
        }

        .input::placeholder { color: #bbb; }

        .confirm-btn {
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

        .confirm-btn:hover:not(:disabled) {
          opacity: 0.93;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(200,16,46,0.35);
        }

        .confirm-btn:active:not(:disabled) { transform: translateY(0); }
        .confirm-btn:disabled { opacity: 0.65; cursor: not-allowed; }

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

        @media (max-width: 480px) {
          .card { padding: 28px 20px 24px; margin: 0 16px; }
        }
      `}</style>
    </div>
  );
}
