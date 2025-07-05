import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className={``}>{children}</body>
    </html>
  );
}
