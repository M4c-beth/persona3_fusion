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
    <header className="sticky top-0 z-40 border-b border-p3r-cyan/20 bg-p3r-deep/75 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:gap-8">
        <Link href="/" className="flex items-baseline gap-2 max-[379px]:hidden">
          <span className="display text-2xl text-p3r-white">P3R</span>
          <span className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-p3r-cyan sm:inline">Fusion</span>
        </Link>
        <nav className="flex min-w-0 flex-1 items-center sm:gap-1" aria-label="Main">
          {NAV.map(({ href, label }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "clip-slant px-2 py-1.5 font-heading text-xs font-bold uppercase tracking-wider transition-colors sm:px-3 sm:text-sm",
                  active ? "bg-p3r-white text-p3r-navy" : "text-muted-foreground hover:text-p3r-white",
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
