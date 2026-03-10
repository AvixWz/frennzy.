import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { buildMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/constants";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = buildMetadata({
  title: `${SITE_NAME} | Trusted Medical Tourism Platform`,
  description:
    "Explore treatments, doctors, hospitals, and complete international patient support for medical tourism in India.",
  path: "/"
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} bg-bg font-[family-name:var(--font-manrope)] text-foreground`}>
        <div className="min-h-screen">
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
          <WhatsAppFloat />
        </div>
      </body>
    </html>
  );
}
