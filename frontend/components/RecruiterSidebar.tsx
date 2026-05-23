"use client";

import Link from "next/link";
import { logout } from "@/lib/auth";

type RecruiterSidebarItem = "overview" | "jobs" | "candidates" | "team";

type RecruiterSidebarProps = {
  activeItem: RecruiterSidebarItem;
};

const navItems: Array<{
  key: RecruiterSidebarItem;
  label: string;
  href: string;
}> = [
  { key: "overview", label: "Aperçu", href: "/dashboard/recruiter" },
  { key: "jobs", label: "Offres", href: "/dashboard/recruiter/jobs" },
  { key: "candidates", label: "Candidats", href: "/dashboard/recruiter/candidates" },
  { key: "team", label: "Équipe", href: "/dashboard/recruiter/team" },
];

export default function RecruiterSidebar({ activeItem }: RecruiterSidebarProps) {
  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[260px] flex-col gap-8 bg-white border-r border-[#c3c6d1]/30 px-5 py-8 shadow-sm z-40">
      <div className="px-2">
        <div className="font-headline text-[20px] font-extrabold tracking-tight text-[#001e40]">
          TunHire Nexus
        </div>
        <p className="uppercase tracking-widest text-[10px] font-bold text-[#43474f] mt-1.5">
          Recruiter Portal
        </p>
      </div>

      <nav className="grid gap-2">
        {navItems.map((item) => {
          const isActive = item.key === activeItem;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-[16px] text-[13px] font-semibold transition w-full text-left ${
                isActive
                  ? "text-[#001e40] bg-[#f2f4f6]/70 hover:bg-[#e0e3e5]"
                  : "text-[#43474f] hover:bg-[#f2f4f6]"
              }`}
            >
              <span>{item.label}</span>
              {isActive && (
                <span
                  className="h-2 w-2 rounded-full bg-[#006875]"
                  aria-hidden="true"
                />
              )}
            </Link>
          );
        })}

        <div className="pt-2 mt-2">
          <button
            type="button"
            onClick={() => logout()}
            className="flex items-center justify-between px-4 py-3 rounded-[16px] text-[13px] font-semibold text-[#43474f] hover:text-[#93000a] hover:bg-[#ffdad6]/50 transition w-full text-left"
          >
            Déconnecter
          </button>
        </div>
      </nav>
    </aside>
  );
}
