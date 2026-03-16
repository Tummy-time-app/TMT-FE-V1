"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import hamburgerMenuAnimation from "../assets/lottie/hamburger-menu.json";
import closeXAnimation from "../assets/lottie/close-x.json";
import LottieIcon from "./LottieIcon";

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  return (
    <header className="navbar flex items-center justify-between px-6 py-4">
      {/* LEFT */}
      <div className="flex items-center gap-4">
        <button
          className="p-2 flex items-center justify-center menu-button"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <LottieIcon
              animationData={closeXAnimation}
              className="w-8 h-8 loop"
              loop
            />
          ) : (
            <LottieIcon
              animationData={hamburgerMenuAnimation}
              className="w-8 h-8"
              loop
            />
          )}
        </button>

        <Link href="/" >
          <Image
            src="/images/tummytime-logo.png"
            width={232}
            height={155}
            alt="TummyTime Logo"
            priority
          />
        </Link>
      </div>

      {/* CENTER */}
      <nav>
        <ul className="navbar__nav flex gap-16">
          <li>
            <Link href="#" className="navbar__dropdown">
              VENDORS <span className="text-xs ml-1">▾</span>
            </Link>
          </li>
          <li>
            <Link href="#">FOODS</Link>
          </li>
          <li>
            <Link href="#">SERVICES</Link>
          </li>
          <li>
            <Link href="#">OFFERS</Link>
          </li>
        </ul>
      </nav>

      {/* RIGHT */}
      <div className="navbar__actions flex items-center gap-4">
        <button className="navbar__cart text-xl">
          <Image src='/images/cart.png' width={20} height={20} alt='cart icon' />
        </button>
        <button className="navbar__login px-4 py-2 rounded-lg bg-black text-white">
          Login
        </button>
      </div>
    </header>
  );
};

export default Navigation;
