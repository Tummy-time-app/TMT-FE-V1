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
import { useListRestaurantsQuery } from "@/features/restaurants/restaurantsApi";
import { useRecentSearches } from "@/lib/useRecentSearches";
import {
  MapPinIcon,
  SearchIcon,
  CloseIcon,
  ClockIcon,
  StoreIcon,
  BasketIcon,
  LeafIcon,
  UtensilsIcon,
  ShoppingBagIcon,
  type IconComponent,
} from "@/components/icons";
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
 *
 * The mobile drawer's nav section (below) deliberately does NOT mirror the
 * desktop bottom bar — per the product UX blueprint, the drawer groups
 * every destination under the app's real IA (Marketplace / Rewards /
 * Account, matching the home screen's service tiles) instead of the ad hoc
 * link list it had before. Destinations with no feature behind them yet
 * (Groceries, Personal Shopper, Cashback, Loyalty Points, Free Deliveries,
 * Wallet, Addresses, Favorites) render a shared ComingSoonPage
 * (components/ui/ComingSoon.tsx) rather than 404ing.
 */

const vendorCategories: { icon: IconComponent; label: string; desc: string; href: string; badge: string | null }[] = [
  {
    icon: StoreIcon,
    label: "Restaurants",
    desc: "African, continental & intercontinental",
    href: "/vendors/restaurants",
    badge: null,
  },
  {
    icon: BasketIcon,
    label: "Shops",
    desc: "Groceries & daily household essentials",
    href: "/vendors/shops",
    badge: null,
  },
  {
    icon: LeafIcon,
    label: "Local Markets",
    desc: "Fresh produce directly from local markets",
    href: "/vendors/markets",
    badge: null,
  },
];

// Desktop "Services ▾" dropdown — per the UX blueprint, TummyTime services
// are Groceries, Shop (local businesses), and Personal Shopper. Laundry is
// a documented future expansion, not part of the current blueprint, so
// it's deliberately left out here.
const serviceCategories: { icon: IconComponent; label: string; desc: string; href: string }[] = [
  {
    icon: BasketIcon,
    label: "Groceries",
    desc: "Daily household essentials, delivered",
    href: "/groceries",
  },
  {
    icon: StoreIcon,
    label: "Shop",
    desc: "Support local businesses near you",
    href: "/vendors/shops",
  },
  {
    icon: ShoppingBagIcon,
    label: "Personal Shopper",
    desc: "Have someone shop and deliver for you",
    href: "/personal-shopper",
  },
];

const POPULAR_SEARCHES = ["Jollof rice", "Pizza", "Burgers", "Suya", "Shawarma", "Ice cream"];

// Mobile drawer's grouped menu — mirrors the home screen's real IA
// (Marketplace / Rewards / Account) instead of a flat list of unrelated
// links. Items with no feature built yet route to a shared "coming soon"
// page (see ComingSoonPage) rather than a dead link.
interface DrawerGroup {
  id: string;
  label: string;
  items: { label: string; href: string }[];
}

const drawerGroups: DrawerGroup[] = [
  {
    id: "marketplace",
    label: "Marketplace",
    items: [
      { label: "Foods", href: "/foods" },
      { label: "Groceries", href: "/groceries" },
      { label: "Shop", href: "/vendors/shops" },
      { label: "Personal Shopper", href: "/personal-shopper" },
    ],
  },
  {
    id: "rewards",
    label: "Rewards",
    items: [
      { label: "Offers", href: "/offers" },
      { label: "Cashback", href: "/cashback" },
      { label: "Loyalty Points", href: "/loyalty-points" },
      { label: "Free Deliveries", href: "/free-deliveries" },
      { label: "Wallet", href: "/wallet" },
    ],
  },
  {
    id: "account",
    label: "Account",
    items: [
      { label: "Orders", href: "/orders" },
      { label: "Addresses", href: "/addresses" },
      { label: "Favorites", href: "/favorites" },
      { label: "Notifications", href: "/notifications" },
      { label: "Help Centre", href: "/help" },
    ],
  },
];

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [vendorsOpen, setVendorsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [openDrawerGroup, setOpenDrawerGroup] = useState<string | null>(null);
  const [locationOpen, setLocationOpen] = useState(false);
  const [mobileLocationOpen, setMobileLocationOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchPanelOpen, setSearchPanelOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const router = useRouter();
  const { user, isAuthenticated, isSessionLoading } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { cartCount } = useCart();
  const { recent: recentSearches, add: addRecentSearch, clear: clearRecentSearches } = useRecentSearches();
  // Only fetched once the panel is actually open — not on every page load
  // just because Navigation renders everywhere.
  const { data: searchableRestaurants = [] } = useListRestaurantsQuery(undefined, { skip: !searchPanelOpen });

  const vendorRef = useRef<HTMLLIElement>(null);
  const servicesRef = useRef<HTMLLIElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (vendorRef.current && !vendorRef.current.contains(e.target as Node)) {
        setVendorsOpen(false);
      }
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setLocationOpen(false);
        setSearchPanelOpen(false);
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
    setServicesOpen(false);
    setLocationOpen(false);
    setMobileLocationOpen(false);
    setSearchPanelOpen(false);
  };

  const submitSearch = (raw: string) => {
    const q = raw.trim();
    if (q) addRecentSearch(q);
    router.push(q ? `/vendors/restaurants?q=${encodeURIComponent(q)}` : "/vendors/restaurants");
    closeAll();
  };

  const matchingRestaurants = searchValue.trim()
    ? searchableRestaurants.filter((r) => r.name.toLowerCase().includes(searchValue.trim().toLowerCase())).slice(0, 5)
    : [];

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
                onClick={() => {
                  setLocationOpen((p) => !p);
                  setSearchPanelOpen(false);
                }}
              >
                <MapPinIcon className="nav-location-icon" width={14} height={14} />
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
                  <SearchIcon width={16} height={16} />
                </button>
                <input
                  ref={searchRef}
                  type="text"
                  className="nav-search-input"
                  placeholder="Search restaurants, foods, stores…"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onFocus={() => {
                    setSearchFocused(true);
                    setSearchPanelOpen(true);
                    setLocationOpen(false);
                  }}
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
                    <CloseIcon width={12} height={12} />
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

            {/* Search-suggestions panel — click-outside via locationRef, not
                onBlur, so clicking a suggestion doesn't get raced by the
                input losing focus first. */}
            {searchPanelOpen && (
              <div className="nav-search-panel" role="dialog" aria-label="Search suggestions">
                {searchValue.trim() ? (
                  <div className="nav-search-panel__section">
                    <p className="nav-search-panel__label">Restaurants</p>
                    {matchingRestaurants.length > 0 ? (
                      matchingRestaurants.map((r) => (
                        <Link
                          key={r.id}
                          href={`/vendors/restaurants/${r.id}`}
                          className="nav-search-panel__suggestion"
                          onClick={() => {
                            addRecentSearch(r.name);
                            closeAll();
                          }}
                        >
                          <UtensilsIcon width={14} height={14} />
                          {r.name}
                        </Link>
                      ))
                    ) : (
                      <p className="nav-search-panel__empty">No matches yet — press enter to search anyway.</p>
                    )}
                  </div>
                ) : (
                  <>
                    {recentSearches.length > 0 && (
                      <div className="nav-search-panel__section">
                        <div className="nav-search-panel__section-head">
                          <p className="nav-search-panel__label">Recent</p>
                          <button type="button" className="nav-search-panel__clear" onClick={clearRecentSearches}>
                            Clear
                          </button>
                        </div>
                        {recentSearches.map((term) => (
                          <button
                            key={term}
                            type="button"
                            className="nav-search-panel__suggestion"
                            onClick={() => {
                              setSearchValue(term);
                              submitSearch(term);
                            }}
                          >
                            <ClockIcon width={14} height={14} />
                            {term}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="nav-search-panel__section">
                      <p className="nav-search-panel__label">Popular searches</p>
                      <div className="nav-search-panel__chips">
                        {POPULAR_SEARCHES.map((term) => (
                          <button
                            key={term}
                            type="button"
                            className="nav-search-panel__chip"
                            onClick={() => {
                              setSearchValue(term);
                              submitSearch(term);
                            }}
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
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
                        <span className="nav-dropdown__emoji">
                          <v.icon width={18} height={18} />
                        </span>
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

            <li className="nav-item">
              <Link href="/foods" className="nav-link">
                Foods
              </Link>
            </li>

            <li ref={servicesRef} className="nav-item nav-item--has-dropdown">
              <button
                className={`navbar__dropdown nav-link ${servicesOpen ? "nav-link--active" : ""}`}
                onClick={() => setServicesOpen((p) => !p)}
                aria-haspopup="true"
                aria-expanded={servicesOpen}
              >
                Services
                <span className={`nav-chevron ${servicesOpen ? "nav-chevron--up" : ""}`}>▾</span>
              </button>

              {servicesOpen && (
                <div className="nav-dropdown" role="menu">
                  <div className="nav-dropdown__header">
                    <p className="nav-dropdown__title">TummyTime services</p>
                    <p className="nav-dropdown__subtitle">Everything beyond food, in one place</p>
                  </div>

                  <div className="nav-dropdown__items">
                    {serviceCategories.map((s) => (
                      <Link
                        key={s.label}
                        href={s.href}
                        className="nav-dropdown__item"
                        role="menuitem"
                        onClick={() => setServicesOpen(false)}
                      >
                        <span className="nav-dropdown__emoji">
                          <s.icon width={18} height={18} />
                        </span>
                        <div className="nav-dropdown__item-body">
                          <span className="nav-dropdown__item-label">{s.label}</span>
                          <span className="nav-dropdown__item-desc">{s.desc}</span>
                        </div>
                        <span className="nav-dropdown__arrow">→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </li>

            <li className="nav-item">
              <Link href="/offers" className="nav-link nav-link--highlight">
                <span className="nav-offer-dot" />
                Offers
              </Link>
            </li>

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
            <CloseIcon width={14} height={14} />
          </button>
        </div>

        <button
          type="button"
          className="nav-drawer__location"
          aria-expanded={mobileLocationOpen}
          onClick={() => setMobileLocationOpen((p) => !p)}
        >
          <MapPinIcon width={16} height={16} />
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
            <SearchIcon width={15} height={15} />
          </button>
          <input
            type="text"
            placeholder="Search restaurants, foods…"
            className="nav-drawer__search-input"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </form>

        <div className="nav-drawer__popular">
          {POPULAR_SEARCHES.map((term) => (
            <button
              key={term}
              type="button"
              className="nav-search-panel__chip"
              onClick={() => {
                setSearchValue(term);
                submitSearch(term);
              }}
            >
              {term}
            </button>
          ))}
        </div>

        <nav className="nav-drawer__nav">
          {drawerGroups.map((group) => (
            <div className="nav-drawer__section" key={group.id}>
              <button
                type="button"
                className="nav-drawer__link nav-drawer__link--accordion"
                onClick={() => setOpenDrawerGroup((p) => (p === group.id ? null : group.id))}
                aria-expanded={openDrawerGroup === group.id}
              >
                {group.label}
                <span className={`nav-chevron ${openDrawerGroup === group.id ? "nav-chevron--up" : ""}`}>▾</span>
              </button>

              <div
                className={`nav-drawer__accordion ${openDrawerGroup === group.id ? "nav-drawer__accordion--open" : ""}`}
              >
                {group.items.map((item) => (
                  <Link key={item.label} href={item.href} className="nav-drawer__sub-link" onClick={closeAll}>
                    <div className="nav-drawer__sub-body">
                      <p className="nav-drawer__sub-label">{item.label}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
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
