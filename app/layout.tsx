import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GuruWali V2",
  description: "Platform administrasi dan perangkat pembelajaran guru"
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="id"><body>{children}</body></html>;
}