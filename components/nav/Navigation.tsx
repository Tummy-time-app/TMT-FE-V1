"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/features/auth/hooks";
import { useProfile } from "@/lib/ProfileContext";
import {
  ReceiptIcon,
  ShoppingBagIcon,
  StoreIcon,
  UtensilsIcon,
  type IconComponent,
} from "@/components/icons";
import hamburgerMenuAnimation from "@/app/assets/lottie/hamburger-menu.json";
import closeXAnimation from "@/app/assets/lottie/close-x.json";
import LottieIcon from "@/components/LottieIcon";

/**
 * Ported from the `frontend` branch's components/Navigation.tsx (structure,
 * markup, and CSS classes kept faithful — see app/landing.css). Two
 * deliberate departures from a literal copy:
 *
 * 1. Login/Signup are wired to the real `useAuth()` we integrated against
 *    TMT-BE-V1 — the source branch's version is just static links with no
 *    auth awareness at all. Showing them to an already-signed-in user
 *    would regress work from earlier in this session.
 * 2. A "quick links" section (Orders/Shop/Food/Restaurants) is folded into
 *    the mobile drawer, shown only when signed in — carried over from the
 *    SideNav this component replaces, rather than dropped.
 *
 * Search and "Deliver to" location are ported as decorative/non-functional,
 * same as the source — no real search or geolocation backend exists yet.
 */

const vendorCategories = [
  {
    emoji: "🏪",
    label: "Restaurants",
    desc: "African, continental & intercontinental",
    href: "/vendors/restaurants",
    badge: null as string | null,
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
  { label: "Foods", href: "/foods" },
  { label: "Services", href: "/services" },
  { label: "Offers", href: "/offers", highlight: true },
];

/** Only shown once signed in — carried over from the SideNav this component replaces. */
const customerLinks: { href: string; label: string; icon: IconComponent }[] = [
  { href: "/orders", label: "Orders", icon: ReceiptIcon },
  { href: "/shop", label: "Shop", icon: ShoppingBagIcon },
  { href: "/food", label: "Food", icon: UtensilsIcon },
  { href: "/restaurants", label: "Restaurants", icon: StoreIcon },
];

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [vendorsOpen, setVendorsOpen] = useState(false);
  const [mobileVendorsOpen, setMobileVendorsOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const { user, isAuthenticated, isSessionLoading } = useAuth();
  const { profile } = useProfile();
  const { cartCount } = useCart();

  const vendorRef = useRef<HTMLLIElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (vendorRef.current && !vendorRef.current.contains(e.target as Node)) {
        setVendorsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const closeAll = () => {
    setMobileMenuOpen(false);
    setVendorsOpen(false);
  };

  const showAuthActions = !isSessionLoading && !isAuthenticated;
  const showProfileChip = !isSessionLoading && isAuthenticated && user;

  return (
    <>
      <header className="nav-root">
        {/* ── TOP ROW: brand · search · actions ── */}
        <div className="nav-top">
          {/* LEFT */}
          <div className="nav-left">
            <button
              className="menu-button"
              onClick={() => setMobileMenuOpen((p) => !p)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <LottieIcon animationData={closeXAnimation} className="w-8 h-8" loop />
              ) : (
                <LottieIcon animationData={hamburgerMenuAnimation} className="w-16 h-16" loop />
              )}
            </button>

            <Link href="/" className="nav-logo-link">
              <Image src="/tummytime-logo.png" width={120} height={35} alt="TummyTime" priority />
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
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </span>
              <input
                ref={searchRef}
                type="text"
                className="nav-search-input"
                placeholder="Search restaurants, foods, stores…"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                aria-label="Search"
              />
              {searchValue && (
                <button
                  className="nav-search-clear"
                  onClick={() => {
                    setSearchValue("");
                    searchRef.current?.focus();
                  }}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* RIGHT — cart + auth */}
          <div className="navbar__actions">
            <Link href="/cart" className="navbar__cart" aria-label={`Cart, ${cartCount} items`}>
              <Image src="/images/cart.png" width={20} height={20} alt="" aria-hidden />
              {cartCount > 0 && (
                <span className="nav-cart-badge" aria-hidden>
                  {cartCount}
                </span>
              )}
            </Link>

            {showProfileChip && (
              <Link href="/profile" className="navbar__login" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {profile.avatarDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- local data-URL preview, not a served asset
                  <img
                    src={profile.avatarDataUrl}
                    alt=""
                    style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : null}
                {user.name.split(" ")[0] || "Profile"}
              </Link>
            )}
            {showAuthActions && (
              <>
                <Link href="/login" className="navbar__login">
                  Login
                </Link>
                <Link href="/signup" className="nav-signup">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>

        {/* ── BOTTOM ROW: desktop nav ── */}
        <nav className="nav-bottom" aria-label="Main navigation">
          <ul className="navbar__nav">
            <li ref={vendorRef} className="nav-item nav-item--has-dropdown">
              <button
                className={`navbar__dropdown nav-link ${vendorsOpen ? "nav-link--active" : ""}`}
                onClick={() => setVendorsOpen((p) => !p)}
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
                    {vendorCategories.map((v) => (
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
                    <Link href="/vendors" onClick={() => setVendorsOpen(false)} className="nav-dropdown__footer-link">
                      Browse all vendors &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </li>

            {navLinks.map((link) => (
              <li key={link.label} className="nav-item">
                <Link href={link.href} className={`nav-link ${link.highlight ? "nav-link--highlight" : ""}`}>
                  {link.highlight && <span className="nav-offer-dot" />}
                  {link.label}
                </Link>
              </li>
            ))}

            {isAuthenticated && (
              <li className="nav-item">
                <Link href="/orders" className="nav-link">
                  Orders
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </header>

      {/* ══════════════════════════════════════════
          MOBILE DRAWER
      ══════════════════════════════════════════ */}
      <div className={`nav-backdrop ${mobileMenuOpen ? "nav-backdrop--visible" : ""}`} onClick={closeAll} aria-hidden />

      <aside
        className={`nav-drawer ${mobileMenuOpen ? "nav-drawer--open" : ""}`}
        aria-label="Mobile navigation"
        aria-hidden={!mobileMenuOpen}
      >
        <div className="nav-drawer__header">
          <Image src="/tummytime-logo.png" width={130} height={40} alt="TummyTime" className="nav-drawer__img" />
          <button onClick={closeAll} className="nav-drawer__close" aria-label="Close">
            ✕
          </button>
        </div>

        <button className="nav-drawer__location">
          <span>📍</span>
          <div>
            <p className="nav-drawer__location-label">Deliver to</p>
            <p className="nav-drawer__location-value">Current location ▾</p>
          </div>
        </button>

        <div className="nav-drawer__search-wrap">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="nav-drawer__search-icon"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input type="text" placeholder="Search restaurants, foods…" className="nav-drawer__search-input" />
        </div>

        <nav className="nav-drawer__nav">
          {isAuthenticated && (
            <div className="nav-drawer__section" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 8 }}>
              {customerLinks.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} onClick={closeAll} className="nav-drawer__link">
                  <Icon className="size-4 shrink-0" />
                  {label}
                </Link>
              ))}
            </div>
          )}

          <div className="nav-drawer__section">
            <button
              className="nav-drawer__link nav-drawer__link--accordion"
              onClick={() => setMobileVendorsOpen((p) => !p)}
              aria-expanded={mobileVendorsOpen}
            >
              Vendors
              <span className={`nav-chevron ${mobileVendorsOpen ? "nav-chevron--up" : ""}`}>▾</span>
            </button>

            <div className={`nav-drawer__accordion ${mobileVendorsOpen ? "nav-drawer__accordion--open" : ""}`}>
              {vendorCategories.map((v) => (
                <Link key={v.label} href={v.href} className="nav-drawer__sub-link" onClick={closeAll}>
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

          {navLinks.map((link) => (
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

        <div className="nav-drawer__footer">
          {showProfileChip ? (
            <Link href="/profile" className="navbar__login nav-drawer__btn-full" onClick={closeAll}>
              {user.name || "Your profile"}
            </Link>
          ) : (
            <>
              <Link href="/login" className="navbar__login nav-drawer__btn-full" onClick={closeAll}>
                Login
              </Link>
              <Link href="/signup" className="nav-signup nav-drawer__btn-full" onClick={closeAll}>
                Create account
              </Link>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
