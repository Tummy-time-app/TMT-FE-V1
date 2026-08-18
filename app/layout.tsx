import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins, Plus_Jakarta_Sans } from "next/font/google";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { CartProvider } from "@/lib/CartContext";
import { ProfileProvider } from "@/lib/ProfileContext";
import { StoreProvider } from "@/store/provider";
import "./globals.css";
import "./landing.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Landing page only (see app/landing.css) — ported from the frontend
// branch's --font-display/--font-body, which relied on a <link> tag that
// never actually loaded Plus Jakarta Sans. next/font avoids that FOUC risk.
const poppins = Poppins({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TummyTime — Everything You Need",
  description: "Everything You Need, Right On Time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${plusJakartaSans.variable} antialiased`}
      >
        <StoreProvider>
          <AuthProvider>
            <ProfileProvider>
              <CartProvider>{children}</CartProvider>
            </ProfileProvider>
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
