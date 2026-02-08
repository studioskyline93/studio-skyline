import "./globals.css";
import { Inter } from "next/font/google";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";


const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-zinc-950 antialiased`}>
        <SiteHeader />
        <main className="mx-auto w-full max-w-[1200px] px-5 pt-10 pb-20 md:px-10">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
