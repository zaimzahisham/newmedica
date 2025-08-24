import type { Metadata } from "next";
import { Alice } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartProvider from "@/components/CartProvider";

const alice = Alice({ subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "Newmedica",
  description: "Your trusted partner in medical equipment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${alice.className} flex flex-col min-h-screen`}>
        <ThemeProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
