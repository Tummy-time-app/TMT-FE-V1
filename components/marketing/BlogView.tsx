import { Navigation } from "@/components/nav/Navigation";
import { Footer } from "@/components/landing/Footer";
import "@/app/marketing.css";

/**
 * No CMS/backend exists for blog content yet — these are illustrative
 * posts about TummyTime's own real features (not fabricated third-party
 * facts), attributed generically to "The TummyTime Team" rather than a
 * specific invented person, with relative rather than exact-dated
 * timestamps. Swap for real posts once there's somewhere to author them.
 */
const POSTS: { title: string; excerpt: string; tag: string; when: string }[] = [
  {
    tag: "Product",
    when: "This month",
    title: "Groceries, Shop, and Personal Shopper are here",
    excerpt:
      "TummyTime is now more than food delivery — order groceries, support a local shop, or send a personal shopper to pick things up for you, all from one app.",
  },
  {
    tag: "Vendors",
    when: "This month",
    title: "Setting up your store now takes minutes, not days",
    excerpt:
      "A new guided setup walks vendors from sign-up to a live storefront — menu, categories, and stock included — without leaving the app.",
  },
  {
    tag: "Company",
    when: "Recently",
    title: "Why we're building block by block, not all at once",
    excerpt:
      "A look at how we're rolling out TummyTime's vendor tools in phases — orders and menus first, promotions and analytics next.",
  },
];

export function BlogView() {
  return (
    <>
      <Navigation />
      <main className="mkt-root">
        <header className="mkt-hero">
          <span className="mkt-hero__eyebrow">Blog</span>
          <h1 className="mkt-hero__title">Notes from TummyTime</h1>
          <p className="mkt-hero__subtitle">Product updates, vendor stories, and what we&apos;re building next.</p>
        </header>

        <div className="mkt-section">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {POSTS.map((post) => (
              <article className="mkt-card" key={post.title}>
                <p className="mkt-card__meta">
                  {post.tag} · {post.when}
                </p>
                <p className="mkt-card__title" style={{ fontSize: "1.1rem" }}>
                  {post.title}
                </p>
                <p className="mkt-card__desc">{post.excerpt}</p>
                <p className="mkt-card__meta" style={{ marginTop: 12, marginBottom: 0, textTransform: "none" }}>
                  The TummyTime Team
                </p>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
