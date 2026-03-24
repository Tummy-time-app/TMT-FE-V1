"use client";

import Image from "next/image";
import Hero from "../components/Hero";

export default function Home() {
  return (
    <main>
      <Hero />
      {/* ── CATEGORIES ─────────────────────────────── */}
      <section className="categories">
        <div className="categories__grid">
          {/* RESTAURANTS */}
          <div className="card card--restaurants flex flex-col justify-between">
            <div>
              <div className="card__icon-wrap">
                <Image
                  src="/images/restaurant.jpg"
                  width={65}
                  height={65}
                  alt="shopping-basket"
                />
              </div>
              <h2 className="card__title">RESTAURANTS</h2>
              <p className="card__desc">
                Order food from a wide variety of restaurants, ranging from
                African to continental and intercontinental cuisines
              </p>
            </div>
            <div>
              <div className="card__tags">
                <div className="card__tag">
                  <div className="card__tag-img" style={{}}>
                    <Image
                      src="/images/jollof.png"
                      width={65}
                      height={65}
                      alt="jollof"
                    />
                  </div>
                  <span className="card__tag-label">Jollof Rice</span>
                </div>
                <div className="card__tag">
                  <div className="card__tag-img" style={{}}>
                    <Image
                      src="/images/hamburger.png"
                      width={65}
                      height={65}
                      alt="burger"
                    />
                  </div>
                </div>
                <div className="card__tag">
                  <div className="card__tag-img" style={{}}>
                    <Image
                      src="/images/pizza.png"
                      width={65}
                      height={65}
                      alt="pizza"
                    />
                  </div>
                  <span className="card__tag-label">Pizza</span>
                </div>
              </div>
              <div className="card__tags">
                <div className="card__tag">
                  <span className="card__tag-label">Egusi</span>
                </div>
                <div className="card__tag">
                  <span className="card__tag-label">Burgers</span>
                </div>
                <div className="card__tag">
                  <span className="card__tag-label">Pasta</span>
                </div>
              </div>
            </div>
          </div>

          {/* SHOPS */}
          <div className="card card--shops">
            <div className="card__icon-wrap">
              <Image
                src="/images/food-basket.png"
                width={65}
                height={65}
                alt="food basket"
              />
            </div>
            <h2 className="card__title">SHOPS</h2>
            <p className="card__desc">
              Groceries, household items, and other daily essentials from your
              trusted stores and super markets nearby.
            </p>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "5rem",
                  filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.15))",
                  margin: "16px 0",
                }}
              >
                <Image
                  src="/images/max-food-basket.png"
                  width={231}
                  height={154}
                  className="card__basket-img"
                  alt="shopping-basket"
                />
              </div>
            </div>
            <div className="card__coming-soon">COMING SOON</div>
          </div>

          {/* LOCAL MARKETS */}
          <div className="card card--markets flex flex-col  justify-between">
            <div>
              <div className="card__icon-wrap">
                <Image
                  src="/images/fruit-basket.png"
                  width={65}
                  height={65}
                  alt="shopping-basket"
                />
              </div>
              <h2 className="card__title">Local Markets</h2>
              <p className="card__desc">
                Fresh produce, grains, proteins, fruits, and other groceries
                directly from local markets closest to you.
              </p>
            </div>
            <div>
              <div className="card__produce-grid">
                <div className="card__produce-icon">
                  <Image
                    src="/images/carrot.png"
                    width={40}
                    height={40}
                    alt="carrot"
                  />
                </div>
                <div className="card__produce-icon">
                  <Image
                    src="/images/eggplant.png"
                    width={40}
                    height={40}
                    alt="eggplant"
                  />
                </div>
                <div className="card__produce-icon">
                  <Image
                    src="/images/olive.png"
                    width={40}
                    height={40}
                    alt="olive"
                  />
                </div>
                <div className="card__produce-icon">
                  <Image
                    src="/images/vegetarian-drink.png"
                    width={40}
                    height={40}
                    alt="vegetarian drink"
                  />
                </div>
                <div className="card__produce-icon">
                  <Image
                    src="/images/pineapple.png"
                    width={40}
                    height={40}
                    alt="pineapple"
                  />
                </div>
                <div className="card__produce-icon">
                  <Image
                    src="/images/potato.png"
                    width={40}
                    height={40}
                    alt="potato"
                  />
                </div>
              </div>
            </div>
            <div className="card__coming-soon">COMING SOON</div>
          </div>
        </div>
      </section>

      {/* ── FOOD ICON STRIP ────────────────────────── */}
      <div className="food-strip">
        <span className="food-strip__icon">
          <Image
            className="food-strip__img"
            src="/images/chilli.png"
            width={70}
            height={70}
            alt="chili"
          />
        </span>
        <span className="food-strip__icon">
          <Image
            className="food-strip__img"
            src="/images/spag.png"
            width={70}
            height={70}
            alt="meal"
          />
        </span>
        <span className="food-strip__icon">
          <Image
            className="food-strip__img"
            src="/images/tomato.png"
            width={70}
            height={70}
            alt="tomato"
          />
        </span>
        <span className="food-strip__icon">
          <Image
            className="food-strip__img"
            src="/images/chilli.png"
            width={70}
            height={70}
            alt="chili"
          />
        </span>
        <span className="food-strip__icon">
          <Image
            className="food-strip__img"
            src="/images/spag.png"
            width={70}
            height={70}
            alt="meal"
          />
        </span>
        <span className="food-strip__icon">
          <Image
            className="food-strip__img"
            src="/images/tomato.png"
            width={70}
            height={70}
            alt="tomato"
          />
        </span>
      </div>
    </main>
  );
}
