"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import NavBadgeDot from "@/components/NavBadgeDot";
import { logout } from "@/lib/auth";
import { useSidebarBadges } from "@/lib/hooks/useSidebarBadges";

const NAV_ITEMS = [
  { label: "Tableau de bord", href: "/dashboard/candidate", badge: null },
  { label: "Mon profil", href: "/dashboard/candidate/profile", badge: null },
  {
    label: "Mes candidatures",
    href: "/dashboard/candidate/applications",
    badge: "applications" as const,
  },
  { label: "Chat", href: "/dashboard/candidate/chat", badge: "chat" as const },
  { label: "Trouver un emploi", href: "/jobs", badge: null },
];

function isActive(pathname: string, href: string) {
  if (href === "/jobs") {
    return pathname === "/jobs" || pathname.startsWith("/jobs/");
  }
  if (href === "/dashboard/candidate") {
    return (
      pathname === "/dashboard/candidate" ||
      pathname === "/dashboard/candidate/"
    );
  }
  return pathname.startsWith(href);
}

type CandidateSidebarProps = {
  mobileOpen?: boolean;
  onNavigate?: () => void;
};

export default function CandidateSidebar({
  mobileOpen = false,
  onNavigate,
}: CandidateSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { badges } = useSidebarBadges();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  function showBadge(badge: (typeof NAV_ITEMS)[number]["badge"]) {
    if (badge === "chat") {
      return (
        badges.chatUnread > 0 &&
        !pathname.startsWith("/dashboard/candidate/chat")
      );
    }
    if (badge === "applications") {
      return (
        badges.applicationUpdates > 0 &&
        !pathname.startsWith("/dashboard/candidate/applications")
      );
    }
    return false;
  }

  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-[var(--surface-container-low)] px-4 py-8 transition-transform lg:translate-x-0 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      } lg:flex`}
    >
      <div className="mb-10 px-2">
        <h1 className="font-headline text-xl font-extrabold tracking-tight text-[var(--primary)]">
          TunHire
        </h1>
        <p className="label-uppercase mt-1 text-[10px] font-semibold text-[var(--on-surface-variant)]">
          Espace candidat
        </p>
      </div>
      <nav className="flex flex-1 flex-col gap-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const hasBadge = item.badge ? showBadge(item.badge) : false;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                active
                  ? "bg-[color-mix(in_srgb,var(--surface-container-highest)_70%,transparent)] text-[var(--primary)]"
                  : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-highest)]"
              }`}
            >
              <span>{item.label}</span>
              {hasBadge ? (
                <NavBadgeDot visible />
              ) : active ? (
                <span className="h-2 w-2 rounded-full bg-[var(--secondary)]" />
              ) : null}
            </Link>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={handleLogout}
        className="mt-4 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-[var(--on-surface-variant)] transition hover:bg-[var(--surface-container-highest)] hover:text-[var(--primary)]"
      >
        Déconnexion
      </button>
    </aside>
  );
}
