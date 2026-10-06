import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DompetKos — Catat Pengeluaran Anak Kos",
    short_name: "DompetKos",
    description:
      "Aplikasi pencatat pengeluaran buat anak kos & mahasiswa, lengkap dengan budget dan insight AI.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#065F46",
    theme_color: "#047857",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
