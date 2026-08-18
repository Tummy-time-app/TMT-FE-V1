import Image from "next/image";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { Navigation } from "@/components/nav/Navigation";

/**
 * Ported from the `frontend` branch's app/page.tsx (Hero + categories grid
 * + floating food icon strip), with two deliberate departures — see
 * Navigation.tsx's doc comment for the nav bar, and below for the footer.
 */
export default function Home() {
  return (
    <main>
      <Navigation />
      <Hero />

      {/* ── CATEGORIES ─────────────────────────────── */}
      <section className="categories">
        <div className="categories__grid">
          {/* RESTAURANTS */}
          <div className="card card--restaurants flex flex-col justify-between">
            <div>
              <div className="card__icon-wrap">
                <Image src="/images/restaurant.jpg" width={65} height={65} alt="shopping-basket" />
              </div>
              <h2 className="card__title">RESTAURANTS</h2>
              <p className="card__desc">
                Order food from a wide variety of restaurants, ranging from African to
                continental and intercontinental cuisines
              </p>
            </div>
            <div>
              <div className="card__tags">
                <div className="card__tag">
                  <div className="card__tag-img">
                    <Image src="/images/jollof.png" width={65} height={65} alt="jollof" />
                  </div>
                  <span className="card__tag-label">Jollof Rice</span>
                </div>
                <div className="card__tag">
                  <div className="card__tag-img">
                    <Image src="/images/hamburger.png" width={65} height={65} alt="burger" />
                  </div>
                </div>
                <div className="card__tag">
                  <div className="card__tag-img">
                    <Image src="/images/pizza.png" width={65} height={65} alt="pizza" />
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
              <Image src="/images/food-basket.png" width={65} height={65} alt="food basket" />
            </div>
            <h2 className="card__title">SHOPS</h2>
            <p className="card__desc">
              Groceries, household items, and other daily essentials from your trusted
              stores and super markets nearby.
            </p>
            <div style={{ textAlign: "center" }}>
              <Image
                src="/images/max-food-basket.png"
                width={231}
                height={154}
                className="card__basket-img"
                alt="shopping-basket"
              />
            </div>
            <div className="card__coming-soon">COMING SOON</div>
          </div>

          {/* LOCAL MARKETS */}
          <div className="card card--markets flex flex-col justify-between">
            <div>
              <div className="card__icon-wrap">
                <Image src="/images/fruit-basket.png" width={65} height={65} alt="shopping-basket" />
              </div>
              <h2 className="card__title">Local Markets</h2>
              <p className="card__desc">
                Fresh produce, grains, proteins, fruits, and other groceries directly
                from local markets closest to you.
              </p>
            </div>
            <div>
              <div className="card__produce-grid">
                <div className="card__produce-icon">
                  <Image src="/images/carrot.png" width={40} height={40} alt="carrot" />
                </div>
                <div className="card__produce-icon">
                  <Image src="/images/eggplant.png" width={40} height={40} alt="eggplant" />
                </div>
                <div className="card__produce-icon">
                  <Image src="/images/olive.png" width={40} height={40} alt="olive" />
                </div>
                <div className="card__produce-icon">
                  <Image src="/images/vegetarian-drink.png" width={40} height={40} alt="vegetarian drink" />
                </div>
                <div className="card__produce-icon">
                  <Image src="/images/pineapple.png" width={40} height={40} alt="pineapple" />
                </div>
                <div className="card__produce-icon">
                  <Image src="/images/potato.png" width={40} height={40} alt="potato" />
                </div>
              </div>
            </div>
            <div className="card__coming-soon">COMING SOON</div>
          </div>
        </div>
      </section>

      {/* ── FOOD ICON STRIP ────────────────────────── */}
      <div className="food-strip">
        {["chilli", "spag", "tomato", "chilli", "spag", "tomato"].map((name, i) => (
          <span key={i} className="food-strip__icon">
            <Image
              className="food-strip__img"
              src={`/images/${name}.png`}
              width={70}
              height={70}
              alt={name === "spag" ? "meal" : name}
            />
          </span>
        ))}
      </div>

      {/* Kept as our own richer Footer (App Store/Google Play buttons + company
          links + legal bar) rather than porting frontend's app-store-badges-only
          Footer — that would just duplicate what's already in the top of ours. */}
      <Footer />
    </main>
  );
}
