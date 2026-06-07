import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LoadingScreen } from "@/components/layout/LoadingScreen";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,        // permite zoom de acessibilidade
  viewportFit: "cover",  // suporte a notch/safe-area no iOS
};

export const metadata: Metadata = {
  title: {
    default: "Fedullo Motorsport Wiring | Chicotes e Peças para Carros Preparados",
    template: "%s | Fedullo Motorsport Wiring",
  },
  description:
    "Fedullo Motorsport Wiring — chicotes elétricos, caixas de relé, medidores e peças de alta performance para carros preparados.",
  keywords: [
    "chicotes elétricos", "motorsport wiring", "caixa de relé", "medidores automotivos",
    "carros preparados", "tuning", "preparação automotiva", "fedullo",
  ],
  openGraph: {
    siteName: "Fedullo Motorsport Wiring",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#000] text-white antialiased" suppressHydrationWarning>
        <LoadingScreen />
        {children}
      </body>
    </html>
  );
}
