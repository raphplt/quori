"use client";
import { useEffect, useState } from "react";
import CookieConsent, { ConsentStatus } from "../components/CookieConsent";
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

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [consent, setConsent] = useState<ConsentStatus | null>(null);

  useEffect(() => {
    if (consent === "granted") {
      if (!document.getElementById("gtag-js")) {
        const script = document.createElement("script");
        script.id = "gtag-js";
        script.async = true;
        script.src = "https://www.googletagmanager.com/gtag/js?id=G-NQJRJ1PZ7M";
        document.head.appendChild(script);
      }
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
      window.gtag("consent", "update", {
        ad_user_data: "granted",
        ad_personalization: "granted",
        ad_storage: "granted",
        analytics_storage: "granted",
      });
      window.gtag("js", new Date());
      window.gtag("config", "G-NQJRJ1PZ7M", {
        page_path: window.location.pathname,
      });
    } else if (consent === "denied") {
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
      window.gtag("consent", "update", {
        ad_user_data: "denied",
        ad_personalization: "denied",
        ad_storage: "denied",
        analytics_storage: "denied",
      });
    }
  }, [consent]);

  return (
    <>
      <ReactQueryProvider>
        <NextAuthProvider>
          <NotificationsProvider>
            <EventsProvider>
              <DataProvider>
                <QuotaProvider>
                  <GenerateProvider>
                    <SidebarProvider>
                      <Header />
                      <MainLayout>
                        <CookieConsent onConsent={setConsent} />
                        {children}
                      </MainLayout>
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
    </>
  );
}
