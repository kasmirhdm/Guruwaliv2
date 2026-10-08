import type { NextConfig } from "next";
// pdfkit harus dimuat dari node_modules saat runtime: ia membaca file
// metrik font (data/Helvetica.afm) dari disk, yang gagal bila dibundel.
const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["pdfkit"],
};
export default nextConfig;
