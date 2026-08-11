"use client";
import Image from "next/image";
import { useCart } from "@/lib/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  LogOut,
  PackageSearch,
  Wallet,
  Tag,
  LifeBuoy,
  MapPin,
  X,
  Store,
  ShoppingCart,
  Leaf,
  type IconComponent,
} from "@/components/icons";
import hamburgerMenuAnimation from "../app/assets/lottie/hamburger-menu.json";
import closeXAnimation from "../app/assets/lottie/close-x.json";
import LottieIcon from "./LottieIcon";
import { useAuth } from "@/features/auth/hooks";
import { useToast } from "@/components/feedback/ToastProvider";
import { addRecentSearch } from "@/lib/utils/recentSearches";
import { NotificationBell } from "@/components/notifications/NotificationBell";

const vendorCategories: {
  icon: IconComponent;
  label: string;
  desc: string;
  href: string;
  badge: string | null;
}[] = [
  {
    icon: Store,
    label: "Restaurants",
    desc: "African, continental & intercontinental",
    href: "/vendors/restaurants",
    badge: null,
  },
  {
    icon: ShoppingCart,
    label: "Shops",
    desc: "Groceries & daily household essentials",
    href: "/vendors/shops",
    badge: "Coming soon",
  },
  {
    icon: Leaf,
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
  const [userMenuOpen,      setUserMenuOpen]      = useState(false);
  const [searchFocused,     setSearchFocused]     = useState(false);
  const [searchValue,       setSearchValue]       = useState("");
  const { cartCount } = useCart();
  const { user, isAuthenticated, isSessionLoading, logout } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const vendorRef = useRef<HTMLLIElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  /* close vendor dropdown / user menu on outside click or Escape */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (vendorRef.current && !vendorRef.current.contains(e.target as Node)) {
        setVendorsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setVendorsOpen(false);
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    toast.success("You've been logged out.");
    router.push("/");
  };

  const submitSearch = (value: string) => {
    const q = value.trim();
    if (!q) return;
    addRecentSearch(q);
    closeAll();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitSearch(searchValue);
    }
  };

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
                src="/images/logo/tummytime-logo.png"
                width={120}
                height={35}
                alt="TummyTime"
                priority
              />
            </Link>
          </div>

          {/* CENTER — location + search */}
          <div className="nav-search-group">
            <button className="nav-location-btn" aria-label="Change delivery address">
              <span className="nav-location-icon"><MapPin size={14} aria-hidden /></span>
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
                onKeyDown={handleSearchKeyDown}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                aria-label="Search"
              />
              {searchValue && (
                <button
                  className="nav-search-clear"
                  onClick={() => { setSearchValue(""); searchRef.current?.focus(); }}
                  aria-label="Clear search"
                ><X size={12} aria-hidden /></button>
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

            {isAuthenticated && <NotificationBell />}

            {isSessionLoading ? (
              <span className="nav-user-skeleton" aria-hidden />
            ) : isAuthenticated && user ? (
              <div className="nav-user" ref={userMenuRef}>
                <button
                  className="nav-user-btn"
                  onClick={() => setUserMenuOpen((p) => !p)}
                  aria-haspopup="true"
                  aria-expanded={userMenuOpen}
                >
                  <span className="nav-user-avatar" aria-hidden>
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="nav-user-name">{user.name.split(" ")[0]}</span>
                  <span className={`nav-chevron ${userMenuOpen ? "nav-chevron--up" : ""}`}>▾</span>
                </button>

                {userMenuOpen && (
                  <div className="nav-user-dropdown" role="menu">
                    <Link
                      href="/orders"
                      className="nav-user-dropdown__item"
                      role="menuitem"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <PackageSearch size={15} aria-hidden />
                      My orders
                    </Link>
                    <Link
                      href="/wallet"
                      className="nav-user-dropdown__item"
                      role="menuitem"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Wallet size={15} aria-hidden />
                      Wallet
                    </Link>
                    <Link
                      href="/promotions"
                      className="nav-user-dropdown__item"
                      role="menuitem"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Tag size={15} aria-hidden />
                      Promotions
                    </Link>
                    <Link
                      href="/support"
                      className="nav-user-dropdown__item"
                      role="menuitem"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <LifeBuoy size={15} aria-hidden />
                      Support
                    </Link>
                    <button
                      type="button"
                      className="nav-user-dropdown__item nav-user-dropdown__item--danger"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      <LogOut size={15} aria-hidden />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="navbar__login">Login</Link>
                <Link href="/register" className="nav-signup">Sign up</Link>
              </>
            )}
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
                        <span className="nav-dropdown__emoji"><v.icon size={22} aria-hidden /></span>
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
          <Image src="/images/logo/tummytime-logo.png" width={130} height={40} alt="TummyTime" className="nav-drawer__img" />
          <button onClick={closeAll} className="nav-drawer__close" aria-label="Close"><X size={14} aria-hidden /></button>
        </div>

        {/* Location inside drawer */}
        <button className="nav-drawer__location">
          <span><MapPin size={16} aria-hidden /></span>
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
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            onKeyDown={handleSearchKeyDown}
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
                  <span className="nav-drawer__sub-emoji"><v.icon size={20} aria-hidden /></span>
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
          {isAuthenticated && user ? (
            <>
              <div className="nav-drawer__user">
                <span className="nav-user-avatar" aria-hidden>
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="nav-drawer__user-name">{user.name}</p>
                  <p className="nav-drawer__user-email">{user.email}</p>
                </div>
              </div>
              <Link href="/orders" className="navbar__login nav-drawer__btn-full" onClick={closeAll}>
                <PackageSearch size={15} aria-hidden style={{ marginRight: 6, verticalAlign: -2 }} />
                My orders
              </Link>
              <button
                type="button"
                className="nav-signup nav-drawer__btn-full"
                onClick={() => { closeAll(); handleLogout(); }}
              >
                <LogOut size={15} aria-hidden style={{ marginRight: 6, verticalAlign: -2 }} />
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="navbar__login nav-drawer__btn-full" onClick={closeAll}>Login</Link>
              <Link href="/register" className="nav-signup nav-drawer__btn-full" onClick={closeAll}>Create account</Link>
            </>
          )}
        </div>
      </aside>
    </>
  );
};

export default Navigation;