import type { Metadata } from "next";
import { MotionConfig } from "framer-motion";
import "./globals.css";
import ClientWrapper from "../components/ClientWrapper";
import ConditionalNavbar from "../components/conditionalNavbar";
import { StoreProvider } from "@/store/provider";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { ToastProvider } from "@/components/feedback/ToastProvider";

export const metadata: Metadata = {
  title: "TummyTime - Fastest Delivery & Easy Pickup",
  description:
    "Order food from restaurants, shops, and local markets near you.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <MotionConfig reducedMotion="user">
          <StoreProvider>
            <AuthProvider>
              <ToastProvider>
                <ClientWrapper>
                  <ConditionalNavbar />
                  <div id="main-content">{children}</div>
                </ClientWrapper>
              </ToastProvider>
            </AuthProvider>
          </StoreProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
