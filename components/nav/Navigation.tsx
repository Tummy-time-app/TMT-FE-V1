"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/CartContext";
import { useAuth } from "@/features/auth/hooks";
import { useProfile } from "@/lib/ProfileContext";
import { VENDOR_ROLES } from "@/components/vendor-portal/useVendorGuard";
import { LocationPickerMap } from "@/components/maps/LocationPickerMap";
import hamburgerMenuAnimation from "@/app/assets/lottie/hamburger-menu.json";
import closeXAnimation from "@/app/assets/lottie/close-x.json";
import LottieIcon from "@/components/LottieIcon";

/**
 * Ported from the `frontend` branch's components/Navigation.tsx (structure,
 * markup, and CSS classes kept faithful — see app/landing.css). One
 * deliberate departure from a literal copy: Login/Signup are wired to the
 * real `useAuth()` we integrated against TMT-BE-V1 — the source branch's
 * version is just static links with no auth awareness at all. Showing them
 * to an already-signed-in user would regress work from earlier in this
 * session.
 *
 * Search and "Deliver to" location started as decorative ports (no real
 * search or geolocation backend existed at the time) — both are now real:
 * search submits to /vendors/restaurants?q=..., which RestaurantsList
 * already filters by (see app/vendors/restaurants/page.tsx's Suspense
 * wrapper, required because it reads that query param via
 * useSearchParams). "Deliver to" opens the same LocationPickerMap used by
 * onboarding, reading/writing the same ProfileContext address — so the
 * header, checkout, and tracking map all agree on one location.
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

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [vendorsOpen, setVendorsOpen] = useState(false);
  const [mobileVendorsOpen, setMobileVendorsOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [mobileLocationOpen, setMobileLocationOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const router = useRouter();
  const { user, isAuthenticated, isSessionLoading } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { cartCount } = useCart();

  const vendorRef = useRef<HTMLLIElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (vendorRef.current && !vendorRef.current.contains(e.target as Node)) {
        setVendorsOpen(false);
      }
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setLocationOpen(false);
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
    setLocationOpen(false);
    setMobileLocationOpen(false);
  };

  const submitSearch = (raw: string) => {
    const q = raw.trim();
    router.push(q ? `/vendors/restaurants?q=${encodeURIComponent(q)}` : "/vendors/restaurants");
    closeAll();
  };

  // Re-picking here is a deliberate "change my location" action, unlike
  // onboarding's picker (components/onboarding/steps/DeliveryAddressStep.tsx)
  // which never overwrites text the customer already typed — so a
  // successful resolve wins here, falling back to whatever was there only
  // if reverse geocoding failed.
  const deliveryLabel = profile.address.line1 || profile.address.city || "Current location";
  const handleAddressPick = (pos: { lat: number; lng: number }) =>
    updateProfile({ address: { ...profile.address, lat: pos.lat, lng: pos.lng } });
  const handleAddressResolved = (resolved: { line1: string; city: string }) =>
    updateProfile({
      address: {
        ...profile.address,
        line1: resolved.line1 || profile.address.line1,
        city: resolved.city || profile.address.city,
      },
    });

  const showAuthActions = !isSessionLoading && !isAuthenticated;
  const showProfileChip = !isSessionLoading && isAuthenticated && user;
  // A vendor account's "own account" page is the store dashboard, not the
  // customer profile (onboarding data — address/dietary prefs — doesn't
  // apply to them). Without this, clicking their own name chip always
  // sent a vendor to /profile with no way back to /vendor from the nav.
  const accountHref = user && VENDOR_ROLES.includes(user.role) ? "/vendor" : "/profile";

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
          <div className="nav-location-wrap" ref={locationRef}>
            <div className="nav-search-group">
              <button
                type="button"
                className="nav-location-btn"
                aria-label="Change delivery address"
                aria-haspopup="true"
                aria-expanded={locationOpen}
                onClick={() => setLocationOpen((p) => !p)}
              >
                <span className="nav-location-icon">📍</span>
                <span className="nav-location-text">
                  <span className="nav-location-label">Deliver to</span>
                  <span className="nav-location-value">{deliveryLabel}</span>
                </span>
                <span className={`nav-location-chevron ${locationOpen ? "nav-chevron--up" : ""}`}>▾</span>
              </button>

              <form
                className={`nav-search ${searchFocused ? "nav-search--focused" : ""}`}
                onSubmit={(e) => {
                  e.preventDefault();
                  submitSearch(searchValue);
                }}
              >
                <button type="submit" className="nav-search-icon" aria-label="Search">
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
                </button>
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
                    type="button"
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
              </form>
            </div>

            {locationOpen && (
              <div className="nav-location-popover" role="dialog" aria-label="Set delivery location">
                <LocationPickerMap
                  value={
                    profile.address.lat != null && profile.address.lng != null
                      ? { lat: profile.address.lat, lng: profile.address.lng }
                      : null
                  }
                  onChange={handleAddressPick}
                  onAddressResolved={handleAddressResolved}
                />
                <button type="button" className="nav-location-done-btn" onClick={() => setLocationOpen(false)}>
                  Done
                </button>
              </div>
            )}
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
              <Link href={accountHref} className="navbar__login" style={{ display: "flex", alignItems: "center", gap: 8 }}>
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

        <button
          type="button"
          className="nav-drawer__location"
          aria-expanded={mobileLocationOpen}
          onClick={() => setMobileLocationOpen((p) => !p)}
        >
          <span>📍</span>
          <div>
            <p className="nav-drawer__location-label">Deliver to</p>
            <p className="nav-drawer__location-value">
              {deliveryLabel} <span className={mobileLocationOpen ? "nav-chevron--up" : ""}>▾</span>
            </p>
          </div>
        </button>

        {mobileLocationOpen && (
          <div className="nav-drawer__location-panel">
            <LocationPickerMap
              value={
                profile.address.lat != null && profile.address.lng != null
                  ? { lat: profile.address.lat, lng: profile.address.lng }
                  : null
              }
              onChange={handleAddressPick}
              onAddressResolved={handleAddressResolved}
            />
            <button
              type="button"
              className="nav-location-done-btn"
              onClick={() => setMobileLocationOpen(false)}
            >
              Done
            </button>
          </div>
        )}

        <form
          className="nav-drawer__search-wrap"
          onSubmit={(e) => {
            e.preventDefault();
            submitSearch(searchValue);
          }}
        >
          <button type="submit" className="nav-drawer__search-icon" aria-label="Search">
            <svg
              width="15"
              height="15"
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
          </button>
          <input
            type="text"
            placeholder="Search restaurants, foods…"
            className="nav-drawer__search-input"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </form>

        <nav className="nav-drawer__nav">
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
            <Link href={accountHref} className="navbar__login nav-drawer__btn-full" onClick={closeAll}>
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
