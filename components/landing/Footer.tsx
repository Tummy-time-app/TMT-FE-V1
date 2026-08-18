import Image from "next/image";
import Link from "next/link";
import {
  AndroidIcon,
  AppleIcon,
  FacebookIcon,
  GlobeIcon,
  InstagramIcon,
  LinkedInIcon,
  XIcon,
} from "@/components/icons";

const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Blog", href: "/blog" },
      { label: "Gift cards", href: "/gift-cards" },
    ],
  },
  {
    title: "Products",
    links: [
      { label: "Order food delivery", href: "/" },
      { label: "Order groceries", href: "/groceries" },
      { label: "TummyTime for Business", href: "/business" },
    ],
  },
  {
    title: "Restaurants & riders",
    links: [
      { label: "Add your restaurant", href: "/vendors/apply" },
      { label: "Become a rider", href: "/riders" },
      { label: "Partner Help Center", href: "/help/partners" },
    ],
  },
  {
    title: "Get help",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Contact us", href: "/contact" },
      { label: "Safety", href: "/safety" },
      { label: "Terms of Service", href: "/legal/terms" },
    ],
  },
];

const socials = [
  { label: "X", href: "https://x.com", icon: XIcon },
  { label: "Instagram", href: "https://instagram.com", icon: InstagramIcon },
  { label: "Facebook", href: "https://facebook.com", icon: FacebookIcon },
  { label: "LinkedIn", href: "https://linkedin.com", icon: LinkedInIcon },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/legal/privacy" },
  { label: "Terms", href: "/legal/terms" },
  { label: "Accessibility", href: "/legal/accessibility" },
  { label: "Cookie Preferences", href: "/legal/cookies" },
];

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-10 lg:px-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xs">
            <Image
              src="/tummytime-logo.png"
              alt="TummyTime"
              width={331}
              height={93}
              className="h-8 w-auto"
            />
            <p className="mt-4 text-sm leading-relaxed text-neutral-600">
              Food delivery, delivered fast. Order from your favorite local
              restaurants in minutes.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                className="flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-200"
              >
                <AppleIcon className="size-4" />
                App Store
              </button>
              <button
                type="button"
                className="flex items-center gap-2 rounded-full bg-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-200"
              >
                <AndroidIcon className="size-4" />
                Google Play
              </button>
            </div>

            <div className="mt-6 flex gap-4">
              {socials.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-neutral-500 transition-colors hover:text-neutral-900"
                >
                  <Icon className="size-5" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 lg:gap-x-12">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-semibold text-neutral-900">
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-neutral-600 transition-colors hover:text-neutral-900 hover:underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-neutral-900">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-xs text-neutral-400 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-16">
          <p>
            © {new Date().getFullYear()} TummyTime Technologies Inc.
          </p>

          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {legalLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="transition-colors hover:text-white hover:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="flex items-center gap-2 text-neutral-400 transition-colors hover:text-white"
          >
            <GlobeIcon className="size-4" />
            English (US)
          </button>
        </div>
      </div>
    </footer>
  );
}
