import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Easy HomeSource | Manufactured Homes in Brooksville, FL",
  description: "Public marketing website for Easy HomeSource manufactured homes in Brooksville, Florida."
};

const nav = [
  ["Homes", "/homes"],
  ["Financing", "/financing"],
  ["About", "/about"],
  ["Contact", "/contact"]
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-20 border-b border-forest/10 bg-white/90 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-black text-forest">Easy HomeSource</Link>
            <div className="flex gap-3 text-sm font-bold text-forest sm:gap-6">
              {nav.map(([label, href]) => <Link key={href} href={href} className="hover:text-clay">{label}</Link>)}
            </div>
          </nav>
        </header>
        {children}
        <footer className="bg-forest px-4 py-10 text-white">
          <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-3">
            <div><h2 className="text-xl font-black">Easy HomeSource</h2><p className="mt-2 text-white/75">Manufactured home dealership serving Brooksville and Florida buyers.</p></div>
            <div><p className="font-bold">Visit</p><p className="mt-2 text-white/75">Brooksville, Florida</p></div>
            <div><p className="font-bold">Start</p><Link className="mt-2 inline-flex text-white/75 hover:text-white" href="/contact">Request information →</Link></div>
          </div>
        </footer>
      </body>
    </html>
  );
}
