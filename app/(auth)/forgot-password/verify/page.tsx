"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    // Auto-advance to next input
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCode = Array(6).fill("");
    pasted.split("").forEach((char, i) => { newCode[i] = char; });
    setCode(newCode);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleConfirm = async () => {
    const fullCode = code.join("");
    if (fullCode.length < 6) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    router.push("/forgot-password/reset");
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
        <h1 className="heading">Verify Email Address</h1>
        <p className="subtext">
          Enter the six digit code sent to your email address
        </p>

        {/* OTP Inputs */}
        <div className="otp-row">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className="otp-input"
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              autoFocus={i === 0}
            />
          ))}
        </div>

        {/* Confirm button */}
        <button
          type="button"
          className={`confirm-btn${loading ? " loading" : ""}`}
          onClick={handleConfirm}
          disabled={loading || code.join("").length < 6}
        >
          {loading ? <span className="spinner" /> : "Confirm code"}
        </button>

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
          margin-bottom: 8px;
          letter-spacing: -0.2px;
          text-align: center;
        }

        .subtext {
          font-size: 13px;
          color: #999;
          margin-bottom: 28px;
          text-align: center;
          line-height: 1.5;
        }

        .otp-row {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-bottom: 24px;
          width: 100%;
        }

        .otp-input {
          width: 44px;
          height: 52px;
          border-radius: 10px;
          border: none;
          background: #f0f0f0;
          text-align: center;
          font-family: 'Nunito', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #222;
          outline: none;
          transition: background 0.2s, box-shadow 0.2s;
          caret-color: #C8102E;
        }

        .otp-input:focus {
          background: #fff;
          box-shadow: 0 0 0 2px #C8102E;
        }

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
          .otp-input { width: 38px; height: 46px; font-size: 18px; }
        }
      `}</style>
    </div>
  );
}
