import "./globals.css";
import type { Metadata } from "next";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import MainLayout from "../components/layout/MainLayout";
import { NextAuthProvider } from "@/contexts/NextAuthContext";
import { ReactQueryProvider } from "@/contexts/QueryClientContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { EventsProvider } from "@/contexts/EventsContext";

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
        <ReactQueryProvider>
          <NextAuthProvider>
            <EventsProvider>
              <SidebarProvider>
                <Header />
                <MainLayout>{children}</MainLayout>
                <Footer />
              </SidebarProvider>
            </EventsProvider>
          </NextAuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
