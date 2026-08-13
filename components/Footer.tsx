import Image from "next/image";
import Link from "next/link";
import React from "react";

const FOOTER_LINKS = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

const Footer = () => {
  return (
    <>
      <section className="app-store">
        <div className="app-store__inner">
          <div className="app-store__badge">
            <span className="app-store__badge-icon">
              <Image
                className="app-store__logo"
                src="/images/playstore-logo.png"
                width={112}
                height={112}
                alt="Play Store Logo"
              />
            </span>
            <div className="app-store__badge-text">
              <span className="app-store__coming">COMING SOON</span>
              <span className="app-store__platform">to playstore</span>
            </div>
          </div>
          <div className="app-store__badge">
            <span className="app-store__badge-icon">
              <Image
                className="app-store__logo"
                src="/images/apple-logo.png"
                width={112}
                height={112}
                alt="Apple Logo"
              />
            </span>
            <div className="app-store__badge-text">
              <span className="app-store__coming">COMING SOON</span>
              <span className="app-store__platform">to Apple store</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-[5vw] py-8 text-caption text-text-subtle">
        <span>© {new Date().getFullYear()} TummyTime. All rights reserved.</span>
        <nav className="flex flex-wrap gap-5">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="font-medium transition-colors hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>
      </footer>
    </>
  );
};

export default Footer;
