import "./globals.css";
import type { Metadata } from "next";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { NextAuthProvider } from "@/contexts/NextAuthContext";

export const metadata: Metadata = {
  title: "Quori",
  description: "Transforme tes commits en publications LinkedIn",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col">
        <NextAuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextAuthProvider>
      </body>
    </html>
  );
}
