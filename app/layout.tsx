import "./globals.css";
import Navbar from "@/components/Navbar";
import AIChatBoxEnhanced from "@/components/AIChatBox";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Mini Canva - AI Design Studio",
  description: "Professional SaaS design platform with AI-powered features",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="light-theme antialiased overflow-x-hidden">
        <AuthProvider>
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
          <Navbar />
          {/* Wrap main with error boundary - optional but safe */}
          <main className="min-h-screen">
            {children}
          </main>
          <AIChatBoxEnhanced />
        </AuthProvider>
      </body>
    </html>
  );
}