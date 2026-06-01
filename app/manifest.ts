import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aegis — BNPL Credit Shield",
    short_name: "Aegis",
    description: "Protect your credit score from BNPL debt. Track Klarna, Afterpay, and more.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      },
    ],
  };
}
