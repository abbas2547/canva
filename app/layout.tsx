import "./globals.css";
import SiteNavbar from "@/components/SiteNavbar";
import AIChatBoxEnhanced from "@/components/AIChatBox";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import type { Metadata, Viewport } from "next";
import PWARegistration from "@/components/PWARegistration";
import MaintenanceGate from "@/components/MaintenancePage";

export const metadata: Metadata = {
  title: "Mini Canva - AI Design Studio",
  description: "Professional SaaS design platform with AI-powered features",
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/icons/icon-180.png",
  },
  appleWebApp: {
    capable: true,
    title: "Mini Canva AI",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#635bff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="light-theme antialiased overflow-x-hidden">
        <AuthProvider>
          <PWARegistration />
          <MaintenanceGate>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "#ffffff",
                  color: "#172033",
                  border: "1px solid #e2e8f0",
                },
              }}
            />
            <SiteNavbar />
            <main className="min-h-screen">
              {children}
            </main>
            <AIChatBoxEnhanced />
          </MaintenanceGate>
        </AuthProvider>
      </body>
    </html>
  );
}