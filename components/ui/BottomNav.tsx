"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, List, Bell, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const tabs: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Map", href: "/", icon: Map },
  { label: "Herd", href: "/herd", icon: List },
  { label: "Alerts", href: "/alerts", icon: Bell },
  { label: "Account", href: "/account", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-lg border-t border-primary/10 flex justify-around pb-[env(safe-area-inset-bottom)] z-40">
      {tabs.map((tab) => {
        const isActive =
          tab.href === "/"
            ? pathname === "/"
            : pathname.startsWith(tab.href);
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center gap-1 p-2 min-w-[44px] min-h-[44px] justify-center transition-colors ${
              isActive ? "text-primary" : "text-secondary"
            }`}
          >
            <Icon size={24} />
            <span className="text-xs font-display">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
