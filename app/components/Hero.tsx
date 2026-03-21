import Image from "next/image";
import React from "react";
import LottieIcon from "./LottieIcon";
import bicycleAnimation from "../assets/lottie/bicicleta delivery.json";

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero__content">
        <h1 className="hero__heading">
          Fastest
          <br />
          <em>Delivery</em> &amp;
          <br />
          Easy <em>Pickup</em>
        </h1>
        {/* <div className="hero__cta">
            <button className="hero__cta-primary">Order Now</button>
            <button className="hero__cta-secondary">See Menu →</button>
          </div> */}
      </div>

      <div className="hero__visual">
        {/* Floating food plates */}
        <div className="hero__plate hero__plate--1">
          <Image
            src="/images/jollof.png"
            width={300}
            height={30}
            alt="Jollof Rice"
          />
        </div>
        <div className="hero__plate hero__plate--2">
          <Image
            src="/images/hamburger.png"
            width={300}
            height={30}
            alt="Burger"
          />
        </div>
        <div className="hero__plate hero__plate--3">
          <Image
            src="/images/friedrice.png"
            width={300}
            height={30}
            alt="Rice"
          />
        </div>

        {/* Speed lines */}
        <div className="hero__speed-lines">
          <div className="hero__speed-line" />
          <div className="hero__speed-line" />
          <div className="hero__speed-line" />
        </div>

        {/* Animated Bicycle + Rider */}
        <div className="hero__bike-wrapper">
          {/* <Image src="/images/rider.png" width={450} height={459} alt="Rider" /> */}
          <LottieIcon animationData={bicycleAnimation} className="flip-horizontal" loop />
        </div>
      </div>
    </section>
  );
};

export default Hero;
