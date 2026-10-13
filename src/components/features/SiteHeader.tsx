"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { DlcToggle } from "./DlcToggle";

const NAV = [
  { href: "/", label: "Personas" },
  { href: "/fusion/", label: "Fusion" },
  { href: "/skills/", label: "Skills" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/" || pathname.startsWith("/persona/");
  return pathname.startsWith(href.replace(/\/$/, ""));
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:gap-8">
        <Link href="/" className="flex items-baseline gap-1.5 font-heading text-xl font-extrabold italic tracking-tight">
          <span className="text-p3r-yellow">P3R</span>
          <span className="hidden sm:inline">Fusion</span>
        </Link>
        <nav className="flex flex-1 items-center gap-1" aria-label="Main">
          {NAV.map(({ href, label }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "clip-slant px-3 py-1.5 font-heading text-sm font-bold uppercase tracking-wider transition-colors",
                  active ? "bg-p3r-blue text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <DlcToggle />
      </div>
    </header>
  );
}
