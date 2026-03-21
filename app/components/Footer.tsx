import Image from "next/image";
import React from "react";

const Footer = () => {
  return (
    <section className="app-store">
      <div className="app-store__inner">
        <div className="app-store__badge">
          <span className="app-store__badge-icon">
            <Image
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
  );
};

export default Footer;
