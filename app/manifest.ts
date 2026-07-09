import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Whisper",
    short_name: "Whisper",
    description: "LAN collaboration for text, files, audio, and keyboard-and-mouse input.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f8fa",
    theme_color: "#1768d8",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
