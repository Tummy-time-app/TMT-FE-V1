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
    <div className="auth-root">
      <div className="auth-bg" />

      <div className="auth-card">
        <Image
          src="/images/logo/tummytime-logo.png"
          alt="TummyTime"
          width={200}
          height={150}
          priority
          className="auth-logo-img"
        />

        <h1 className="auth-heading" style={{ color: "#1A1A1A" }}>Verify Email Address</h1>
        <p className="auth-subtext" style={{ maxWidth: 280 }}>Enter the six digit code sent to your email address</p>

        <div className="auth-otp-row">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              className={`auth-otp-box${digit ? " auth-otp-box--filled" : ""}`}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          className="auth-submit-btn"
          onClick={handleConfirm}
          disabled={!isFilled || loading}
          style={{ marginBottom: 20 }}
        >
          {loading ? <span className="auth-spinner" /> : "Confirm code"}
        </button>

        {error && (
          <p className="auth-error-text">{error}</p>
        )}

        {showSuccess && (
          <div className="auth-modal-overlay">
            <div className="auth-success-modal">
              <h2>Success!</h2>
              <p>Your email has been verified. Redirecting to login...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
