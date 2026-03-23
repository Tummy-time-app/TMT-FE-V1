"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import hamburgerMenuAnimation from "../assets/lottie/hamburger-menu.json";
import closeXAnimation from "../assets/lottie/close-x.json";
import LottieIcon from "./LottieIcon";

const vendorCategories = [
  {
    emoji: "🏪",
    label: "Restaurants",
    desc: "African, continental & intercontinental",
    href: "/vendors/restaurants",
    badge: null,
  },
  {
    emoji: "🛒",
    label: "Shops",
    desc: "Groceries & daily household essentials",
    href: "/vendors/shops",
    badge: "Coming soon",
  },
  {
    emoji: "🌿",
    label: "Local Markets",
    desc: "Fresh produce directly from local markets",
    href: "/vendors/markets",
    badge: "Coming soon",
  },
];

const navLinks = [
  { label: "Foods",    href: "/foods"    },
  { label: "Services", href: "/services" },
  { label: "Offers",   href: "/offers",  highlight: true },
];

const Navigation: React.FC = () => {
  const [mobileMenuOpen,    setMobileMenuOpen]    = useState(false);
  const [vendorsOpen,       setVendorsOpen]       = useState(false);
  const [mobileVendorsOpen, setMobileVendorsOpen] = useState(false);
  const [searchFocused,     setSearchFocused]     = useState(false);
  const [searchValue,       setSearchValue]       = useState("");
  const [cartCount]                               = useState(2); // wire to your cart store

  const vendorRef = useRef<HTMLLIElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  /* close vendor dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (vendorRef.current && !vendorRef.current.contains(e.target as Node)) {
        setVendorsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* lock body scroll when drawer is open */
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const closeAll = () => { setMobileMenuOpen(false); setVendorsOpen(false); };

  return (
    <>
      <header className="nav-root">

        {/* ── TOP ROW: brand · search · actions ── */}
        <div className="nav-top">

          {/* LEFT */}
          <div className="nav-left">
            <button
              className="menu-button"
              onClick={() => setMobileMenuOpen(p => !p)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen
                ? <LottieIcon animationData={closeXAnimation}       className="w-8 h-8" loop />
                : <LottieIcon animationData={hamburgerMenuAnimation} className="w-8 h-8" loop />}
            </button>

            <Link href="/" className="nav-logo-link">
              <Image
                src="/images/tummytime-logo.png"
                width={148}
                height={99}
                alt="TummyTime"
                priority
              />
            </Link>
          </div>

          {/* CENTER — location + search */}
          <div className="nav-search-group">
            <button className="nav-location-btn" aria-label="Change delivery address">
              <span className="nav-location-icon">📍</span>
              <span className="nav-location-text">
                <span className="nav-location-label">Deliver to</span>
                <span className="nav-location-value">Current location</span>
              </span>
              <span className="nav-location-chevron">▾</span>
            </button>

            <div className={`nav-search ${searchFocused ? "nav-search--focused" : ""}`}>
              <span className="nav-search-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </span>
              <input
                ref={searchRef}
                type="text"
                className="nav-search-input"
                placeholder="Search restaurants, foods, stores…"
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                aria-label="Search"
              />
              {searchValue && (
                <button
                  className="nav-search-clear"
                  onClick={() => { setSearchValue(""); searchRef.current?.focus(); }}
                  aria-label="Clear search"
                >✕</button>
              )}
            </div>
          </div>

          {/* RIGHT — cart + auth */}
          <div className="navbar__actions">
            <Link href="/cart" className="navbar__cart" aria-label={`Cart, ${cartCount} items`}>
              <Image src="/images/cart.png" width={20} height={20} alt="" aria-hidden />
              {cartCount > 0 && (
                <span className="nav-cart-badge" aria-hidden>{cartCount}</span>
              )}
            </Link>

            <Link href="/login" className="navbar__login">Login</Link>
            <Link href="/register" className="nav-signup">Sign up</Link>
          </div>
        </div>

        {/* ── BOTTOM ROW: desktop nav ── */}
        <nav className="nav-bottom" aria-label="Main navigation">
          <ul className="navbar__nav">

            {/* VENDORS + dropdown */}
            <li ref={vendorRef} className="nav-item nav-item--has-dropdown">
              <button
                className={`navbar__dropdown nav-link ${vendorsOpen ? "nav-link--active" : ""}`}
                onClick={() => setVendorsOpen(p => !p)}
                aria-haspopup="true"
                aria-expanded={vendorsOpen}
              >
                Vendors
                <span className={`nav-chevron ${vendorsOpen ? "nav-chevron--up" : ""}`}>▾</span>
              </button>

              {vendorsOpen && (
                <div className="nav-dropdown" role="menu">
                  <div className="nav-dropdown__header">
                    <p className="nav-dropdown__title">Order from</p>
                    <p className="nav-dropdown__subtitle">Choose a vendor type to get started</p>
                  </div>

                  <div className="nav-dropdown__items">
                    {vendorCategories.map(v => (
                      <Link
                        key={v.label}
                        href={v.href}
                        className="nav-dropdown__item"
                        role="menuitem"
                        onClick={() => setVendorsOpen(false)}
                      >
                        <span className="nav-dropdown__emoji">{v.emoji}</span>
                        <div className="nav-dropdown__item-body">
                          <span className="nav-dropdown__item-label">
                            {v.label}
                            {v.badge && <span className="nav-dropdown__badge">{v.badge}</span>}
                          </span>
                          <span className="nav-dropdown__item-desc">{v.desc}</span>
                        </div>
                        <span className="nav-dropdown__arrow">→</span>
                      </Link>
                    ))}
                  </div>

                  <div className="nav-dropdown__footer">
                    <Link href="/vendors" onClick={() => setVendorsOpen(false)}
                      className="nav-dropdown__footer-link">
                      Browse all vendors &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </li>

            {navLinks.map(link => (
              <li key={link.label} className="nav-item">
                <Link
                  href={link.href}
                  className={`nav-link ${link.highlight ? "nav-link--highlight" : ""}`}
                >
                  {link.highlight && <span className="nav-offer-dot" />}
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>


      {/* ══════════════════════════════════════════
          MOBILE DRAWER
      ══════════════════════════════════════════ */}
      <div
        className={`nav-backdrop ${mobileMenuOpen ? "nav-backdrop--visible" : ""}`}
        onClick={closeAll}
        aria-hidden
      />

      <aside
        className={`nav-drawer ${mobileMenuOpen ? "nav-drawer--open" : ""}`}
        aria-label="Mobile navigation"
        aria-hidden={!mobileMenuOpen}
      >
        {/* Drawer header */}
        <div className="nav-drawer__header">
          <Image src="/images/tummytime-logo.png" width={120} height={80} alt="TummyTime" />
          <button onClick={closeAll} className="nav-drawer__close" aria-label="Close">✕</button>
        </div>

        {/* Location inside drawer */}
        <button className="nav-drawer__location">
          <span>📍</span>
          <div>
            <p className="nav-drawer__location-label">Deliver to</p>
            <p className="nav-drawer__location-value">Current location ▾</p>
          </div>
        </button>

        {/* Mobile search */}
        <div className="nav-drawer__search-wrap">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className="nav-drawer__search-icon">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search restaurants, foods…"
            className="nav-drawer__search-input"
          />
        </div>

        {/* Drawer nav */}
        <nav className="nav-drawer__nav">
          {/* Vendors accordion */}
          <div className="nav-drawer__section">
            <button
              className="nav-drawer__link nav-drawer__link--accordion"
              onClick={() => setMobileVendorsOpen(p => !p)}
              aria-expanded={mobileVendorsOpen}
            >
              Vendors
              <span className={`nav-chevron ${mobileVendorsOpen ? "nav-chevron--up" : ""}`}>▾</span>
            </button>

            <div className={`nav-drawer__accordion ${mobileVendorsOpen ? "nav-drawer__accordion--open" : ""}`}>
              {vendorCategories.map(v => (
                <Link
                  key={v.label}
                  href={v.href}
                  className="nav-drawer__sub-link"
                  onClick={closeAll}
                >
                  <span className="nav-drawer__sub-emoji">{v.emoji}</span>
                  <div className="nav-drawer__sub-body">
                    <p className="nav-drawer__sub-label">{v.label}</p>
                    <p className="nav-drawer__sub-desc">{v.desc}</p>
                  </div>
                  {v.badge && <span className="nav-dropdown__badge">{v.badge}</span>}
                </Link>
              ))}
            </div>
          </div>

          {navLinks.map(link => (
            <Link
              key={link.label}
              href={link.href}
              className={`nav-drawer__link ${link.highlight ? "nav-drawer__link--highlight" : ""}`}
              onClick={closeAll}
            >
              {link.highlight && <span className="nav-offer-dot" />}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Drawer footer */}
        <div className="nav-drawer__footer">
          <Link href="/login" className="navbar__login nav-drawer__btn-full">Login</Link>
          <Link href="/signup" className="nav-signup nav-drawer__btn-full">Create account</Link>
        </div>
      </aside>
    </>
  );
};

export default Navigation;