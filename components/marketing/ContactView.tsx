"use client";

import { useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/nav/Navigation";
import { Footer } from "@/components/landing/Footer";
import "@/app/marketing.css";

export function ContactView() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No contact/support backend exists yet in TMT-BE-V1 — this is a
    // client-side-only acknowledgement, not a real submission. Wire this
    // to a real endpoint (or a mailto:) once one exists, rather than
    // implying a message actually reached a team.
    setSent(true);
  };

  return (
    <>
      <Navigation />
      <main className="mkt-root">
        <header className="mkt-hero">
          <span className="mkt-hero__eyebrow">Contact</span>
          <h1 className="mkt-hero__title">Get in touch</h1>
          <p className="mkt-hero__subtitle">Most questions have a faster answer below than a message would.</p>
        </header>

        <div className="mkt-section">
          <div className="mkt-grid">
            <div className="mkt-card">
              <p className="mkt-card__title">Ordering or delivery help</p>
              <p className="mkt-card__desc" style={{ marginBottom: 14 }}>
                Order status, cancellations, and common questions.
              </p>
              <Link href="/help" className="mkt-btn mkt-btn--outline" style={{ padding: "8px 16px", fontSize: "0.8rem" }}>
                Visit Help Centre
              </Link>
            </div>
            <div className="mkt-card">
              <p className="mkt-card__title">Want to partner with us</p>
              <p className="mkt-card__desc" style={{ marginBottom: 14 }}>
                Register a store or sign up to ride for TummyTime.
              </p>
              <Link href="/business" className="mkt-btn mkt-btn--outline" style={{ padding: "8px 16px", fontSize: "0.8rem" }}>
                TummyTime for Business
              </Link>
            </div>
          </div>
        </div>

        <div className="mkt-section">
          <h2 className="mkt-section-title">Send us a message</h2>
          <p className="mkt-section-sub">For anything else — feedback, press, or general questions.</p>

          <form className="mkt-form" onSubmit={handleSubmit}>
            <div className="mkt-field">
              <label htmlFor="contact-name">Name</label>
              <input
                id="contact-name"
                className="mkt-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="mkt-field">
              <label htmlFor="contact-email">Email</label>
              <input
                id="contact-email"
                type="email"
                className="mkt-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mkt-field">
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                className="mkt-textarea"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="mkt-btn mkt-btn--primary" disabled={sent}>
              {sent ? "Thanks — got it!" : "Send message"}
            </button>
            {sent && (
              <p className="mkt-success">
                Thanks, {name.split(" ")[0] || "there"} — we&apos;ve got your message. There&apos;s no live
                inbox connected yet in this build, so nothing was actually sent anywhere.
              </p>
            )}
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
