import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://aurelis.app"),
  title: "Aurelis · Que el ensayo empiece haciendo música",
  description:
    "Aurelis reúne canciones, programas y materiales para que cada músico llegue preparado antes del primer acorde.",
  applicationName: "Aurelis",
  keywords: ["músicos", "ensayos", "repertorio", "programas musicales", "Aurelis"],
  openGraph: {
    title: "Aurelis · Antes del primer acorde",
    description: "Menos tiempo buscando. Más tiempo haciendo música.",
    type: "website",
    locale: "es_MX",
    siteName: "Aurelis",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#111111",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
