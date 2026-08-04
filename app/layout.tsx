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
    <html lang="en">
      <body className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white antialiased overflow-x-hidden">
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#0f172a",
                color: "#ffffff",
                border: "1px solid #1e293b",
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