import "./globals.css";
import type { Metadata } from "next";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import MainLayout from "../components/layout/MainLayout";
import { NextAuthProvider } from "@/contexts/NextAuthContext";
import { ReactQueryProvider } from "@/contexts/QueryClientContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { EventsProvider } from "@/contexts/EventsContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { Toaster } from "react-hot-toast";
import { DataProvider } from "@/contexts/DataContext";
import { QuotaProvider } from "@/contexts/QuotaContext";
import { GenerateProvider } from "@/contexts/GenerateContext";
import Script from "next/script";
import Analytics from "../components/Analytics";

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
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-NQJRJ1PZ7M"
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-NQJRJ1PZ7M', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </head>
      <body className="min-h-screen flex flex-col">
        <Analytics />
        <ReactQueryProvider>
          <NextAuthProvider>
            <NotificationsProvider>
              <EventsProvider>
                <DataProvider>
                  <QuotaProvider>
                    <GenerateProvider>
                      <SidebarProvider>
                        <Header />
                        <MainLayout>{children}</MainLayout>
                        <Footer />
                        <Toaster position="top-right" />
                      </SidebarProvider>
                    </GenerateProvider>
                  </QuotaProvider>
                </DataProvider>
              </EventsProvider>
            </NotificationsProvider>
          </NextAuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
