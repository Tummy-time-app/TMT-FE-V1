"use client";

import Image from "next/image";
import { useState, useRef, KeyboardEvent, ClipboardEvent } from "react";
import { useRouter } from "next/navigation";

const OTP_LENGTH = 6;

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const focusNext = (index: number) => {
    if (index < OTP_LENGTH - 1) inputs.current[index + 1]?.focus();
  };

  const focusPrev = (index: number) => {
    if (index > 0) inputs.current[index - 1]?.focus();
  };

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return; 
    const next = [...otp];
    next[index] = value.slice(-1); 
    setOtp(next);
    if (value) focusNext(index);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const next = [...otp];
        next[index] = "";
        setOtp(next);
      } else {
        focusPrev(index);
      }
    } else if (e.key === "ArrowLeft") {
      focusPrev(index);
    } else if (e.key === "ArrowRight") {
      focusNext(index);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = [...otp];
    pasted.split("").forEach((char, i) => { next[i] = char; });
    setOtp(next);
    // focus last filled or last box
    const lastIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputs.current[lastIndex]?.focus();
  };

  const handleConfirm = async () => {
    if (otp.some((d) => !d)) {
      setError("Please enter all 6 digits.");
      return;
    }

    const code = otp.join("");
    setError("");
    setLoading(true);

    await new Promise((r) => setTimeout(r, 1200));

    // Replace with your real API verification result in production
    const isCodeValid = code === "123456";

    setLoading(false);

    if (!isCodeValid) {
      setError("Invalid code. Please try again.");
      return;
    }

    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      router.push('/login');
    }, 1200);
  };

  const isFilled = otp.every((d) => d !== "");

  return (
    <div className="root">
      <div className="bg" />

      <div className="card">
        {/* Logo */}
        <Image
          src="/images/logo/tummytime-logo.png"
          alt="TummyTime"
          width={200}
          height={150}
          priority
          className="logo-img"
        />

        {/* Heading */}
        <h1 className="heading">Verify Email Address</h1>
        <p className="subtext">Enter the six digit code sent to your email address</p>

        {/* OTP Inputs */}
        <div className="otp-row">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              className={`otp-box${digit ? " otp-box--filled" : ""}`}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </div>

        {/* Confirm button */}
        <button
          type="button"
          className="confirm-btn"
          onClick={handleConfirm}
          disabled={!isFilled || loading}
        >
          {loading ? <span className="spinner" /> : "Confirm code"}
        </button>

        {error && (
          <p className="error-text">{error}</p>
        )}

        {showSuccess && (
          <div className="modal-overlay">
            <div className="success-modal">
              <h2>Success!</h2>
              <p>Your email has been verified. Redirecting to login...</p>
            </div>
          </div>
        )}

          
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

        /* ── Card ── */
        .card {
          position: relative;
          z-index: 1;
          background: #ffffff;
          border-radius: 24px;
          padding: 40px 48px 36px;
          width: 100%;
          max-width: 420px;
          margin: 0 16px;
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

        /* ── Logo ── */
        .logo-img {
          object-fit: contain;
          margin-bottom: 8px;
        }

        /* ── Heading ── */
        .heading {
          font-size: 20px;
          font-weight: 800;
          color: #1A1A1A;
          margin-bottom: 10px;
          text-align: center;
          letter-spacing: -0.2px;
        }

        .subtext {
          font-size: 13.5px;
          color: #888;
          text-align: center;
          line-height: 1.6;
          margin-bottom: 28px;
          max-width: 280px;
        }

        /* ── OTP row ── */
        .otp-row {
          display: flex;
          gap: 10px;
          margin-bottom: 28px;
        }

        .otp-box {
          width: 50px;
          height: 54px;
          border-radius: 12px;
          border: 1.5px solid transparent;
          background: #f4f4f4;
          font-family: 'Nunito', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #C8102E;
          text-align: center;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s, transform 0.15s;
          caret-color: #C8102E;
        }

        .otp-box:focus {
          background: #fff;
          border-color: #C8102E;
          box-shadow: 0 0 0 3px rgba(200,16,46,0.12);
          transform: scale(1.06);
        }

        .otp-box--filled {
          background: #fff;
          border-color: rgba(200,16,46,0.3);
        }

        /* ── Confirm button ── */
        .confirm-btn {
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
          margin-bottom: 20px;
        }

        .confirm-btn:hover:not(:disabled) {
          opacity: 0.93;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(200,16,46,0.35);
        }

        .confirm-btn:active:not(:disabled) { transform: translateY(0); }

        .confirm-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
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

        .error-text {
          margin-top: 8px;
          color: #c53030;
          font-size: 13px;
          text-align: center;
          font-weight: 600;
        }

        /* ── Spinner ── */
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

        /* ── Back to login ── */
        .back-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Nunito', sans-serif;
          font-size: 13.5px;
          font-weight: 600;
          color: #888;
          transition: color 0.2s;
          padding: 0;
        }

        .back-btn:hover { color: #C8102E; }

        /* ── Mobile ── */
        @media (max-width: 480px) {
          .card { padding: 32px 20px 28px; }

          .otp-box {
            width: 42px;
            height: 48px;
            font-size: 20px;
            border-radius: 10px;
          }

          .otp-row { gap: 8px; }
        }
      `}</style>
    </div>
  );
}