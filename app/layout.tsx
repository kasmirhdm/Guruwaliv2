import "./globals.css";
import type { Metadata, Viewport } from "next";
import PwaRegister from "./pwa-register";

export const metadata: Metadata = {
  title: "GuruWali V2",
  description: "Platform administrasi dan perangkat pembelajaran guru",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "GuruWali", statusBarStyle: "default" },
};

export const viewport: Viewport = { themeColor: "#15916c" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
