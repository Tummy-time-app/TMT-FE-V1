import Image from "next/image";
import Link from "next/link";
import {
  ChevronDownIcon,
  ClockIcon,
  ExternalLinkIcon,
  MapPinIcon,
} from "@/components/icons";
import { SideNavTrigger } from "@/components/nav/SideNavTrigger";

export function HeroSection() {
  return (
    <section className="relative isolate flex min-h-screen flex-col overflow-hidden">
      {/* background photo */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/hero-food.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[25%_40%] sm:object-center"
        />
      </div>
      {/* scrim for text legibility over the photo */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-white/55 via-white/10 to-transparent" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_85%_100%,rgba(0,0,0,0.15),transparent_55%)]" />

      {/* header */}
      <header className="relative z-10 flex items-center justify-between gap-2 px-4 py-5 sm:gap-4 sm:px-10 sm:py-6 lg:px-16">
        <div className="flex items-center gap-3 sm:gap-6">
          <SideNavTrigger className="text-neutral-900 transition-opacity hover:opacity-70" />
          <Link href="/" className="flex items-center">
            <Image
              src="/tummytime-logo.png"
              alt="TummyTime"
              width={331}
              height={93}
              className="h-7 w-auto sm:h-8"
            />
          </Link>
        </div>

        <nav className="flex items-center gap-2 sm:gap-5">
          <Link
            href="/riders"
            className="hidden items-center gap-1.5 text-sm font-medium text-neutral-900 hover:underline sm:flex"
          >
            Become a rider
            <ExternalLinkIcon className="size-3.5" />
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold whitespace-nowrap text-neutral-900 shadow-sm shadow-black/5 transition-colors hover:bg-neutral-100 sm:px-5 sm:py-2.5"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold whitespace-nowrap text-white transition-colors hover:bg-neutral-800 sm:px-5 sm:py-2.5"
          >
            Sign up
          </Link>
        </nav>
      </header>

      {/* hero content */}
      <div className="relative z-10 flex flex-1 flex-col justify-center px-4 pb-24 sm:px-10 lg:px-16">
        <div className="max-w-2xl">
          <h1 className="text-4xl leading-tight font-extrabold tracking-tight text-neutral-900 sm:text-5xl xl:text-6xl">
            Order delivery near you
          </h1>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex flex-1 items-center gap-3 rounded-full bg-white px-5 py-4 shadow-lg shadow-black/10">
              <MapPinIcon className="size-5 shrink-0 text-neutral-500" />
              <input
                type="text"
                placeholder="Enter delivery address"
                className="w-full bg-transparent text-neutral-900 placeholder:text-neutral-500 focus:outline-none"
              />
            </label>

            <div className="flex items-stretch overflow-hidden rounded-full shadow-lg shadow-black/10">
              <button
                type="button"
                className="flex items-center gap-2 whitespace-nowrap bg-white px-5 py-4 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50"
              >
                <ClockIcon className="size-5 text-neutral-500" />
                Deliver now
                <ChevronDownIcon className="size-4 text-neutral-500" />
              </button>
              <button
                type="button"
                className="whitespace-nowrap bg-neutral-900 px-7 py-4 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
              >
                Search here
              </button>
            </div>
          </div>

          <p className="mt-5 text-sm text-neutral-800">
            Or{" "}
            <Link
              href="/login"
              className="font-semibold underline underline-offset-2"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
