import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "../contexts/AuthContext";

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
      <body className={` `}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
