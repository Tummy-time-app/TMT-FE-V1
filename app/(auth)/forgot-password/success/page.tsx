"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function PasswordChangedPage() {
  const router = useRouter();

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

        {/* Checkmark */}
        <div className="check-wrap">
          <svg
            viewBox="0 0 60 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="check-icon"
          >
            <defs>
              <linearGradient id="checkGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F5A800" />
                <stop offset="100%" stopColor="#C8102E" />
              </linearGradient>
            </defs>
            <polyline
              points="8,32 24,48 52,16"
              stroke="url(#checkGrad)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Text */}
        <h1 className="heading">Password changed</h1>
        <p className="subtext">Your password has been changed successfully.</p>

        {/* Go to login button */}
        <button
          type="button"
          className="login-btn"
          onClick={() => router.push("/login")}
        >
          Go to login
        </button>
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
          margin-bottom: 28px;
        }

        .check-wrap {
          margin-bottom: 24px;
          animation: popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.3s both;
        }

        @keyframes popIn {
          from { opacity: 0; transform: scale(0.4); }
          to   { opacity: 1; transform: scale(1); }
        }

        .check-icon {
          width: 72px;
          height: 72px;
        }

        .heading {
          font-size: 20px;
          font-weight: 800;
          color: #1a1a1a;
          margin-bottom: 8px;
          text-align: center;
        }

        .subtext {
          font-size: 13px;
          color: #999;
          margin-bottom: 32px;
          text-align: center;
          line-height: 1.5;
        }

        .login-btn {
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
          min-height: 46px;
        }

        .login-btn:hover {
          opacity: 0.93;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(200,16,46,0.35);
        }

        .login-btn:active { transform: translateY(0); }

        @media (max-width: 480px) {
          .card { padding: 28px 20px 24px; margin: 0 16px; }
        }
      `}</style>
    </div>
  );
}
