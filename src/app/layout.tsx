import type { Metadata } from "next";
import { Archivo, Geist, Geist_Mono } from "next/font/google";
import { DlcProvider } from "@/components/features/DlcProvider";
import { SiteFooter } from "@/components/features/SiteFooter";
import { SiteHeader } from "@/components/features/SiteHeader";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const display = Archivo({ variable: "--font-display", subsets: ["latin"], axes: ["wdth"] });

export const metadata: Metadata = {
  title: { default: "P3R Fusion", template: "%s · P3R Fusion" },
  description: "Persona 3 Reload persona compendium and fusion calculator, with DLC persona support.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${geistSans.variable} ${geistMono.variable} ${display.variable}`}>
      <body className="flex min-h-dvh flex-col antialiased">
        <DlcProvider>
          <TooltipProvider>
            <SiteHeader />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
            <SiteFooter />
          </TooltipProvider>
        </DlcProvider>
      </body>
    </html>
  );
}
