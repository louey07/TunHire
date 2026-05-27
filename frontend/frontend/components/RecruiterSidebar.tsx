"use client";



import Link from "next/link";

import { usePathname } from "next/navigation";

import { logout } from "@/lib/auth";

import CompanySwitcher from "@/components/recruiter/CompanySwitcher";

import { useRecruiterCompany } from "@/lib/context/RecruiterCompanyContext";



const navItems = [

  { label: "Aperçu", href: "/dashboard/recruiter", adminOnly: false },

  { label: "Offres", href: "/dashboard/recruiter/jobs", adminOnly: false },

  { label: "Candidats", href: "/dashboard/recruiter/candidates", adminOnly: false },

  { label: "Chat", href: "/dashboard/recruiter/chat", adminOnly: false },

  { label: "Entreprise", href: "/dashboard/recruiter/company", adminOnly: true },

  { label: "Équipe", href: "/dashboard/recruiter/team", adminOnly: false },

];



type RecruiterSidebarProps = {

  mobileOpen?: boolean;

  onNavigate?: () => void;

};



export default function RecruiterSidebar({

  mobileOpen = false,

  onNavigate,

}: RecruiterSidebarProps) {

  const pathname = usePathname();

  const { isAdmin } = useRecruiterCompany();

  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin);



  return (

    <aside

      className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-[var(--surface-container-low)] px-4 py-8 transition-transform lg:translate-x-0 ${

        mobileOpen ? "translate-x-0" : "-translate-x-full"

      } lg:flex`}

    >

      <div className="mb-10 px-2">

        <div className="font-headline text-xl font-extrabold tracking-tight text-[var(--primary)]">

          TunHire

        </div>

        <p className="label-uppercase mt-1 text-[10px] font-semibold text-[var(--on-surface-variant)]">

          Espace recruteur

        </p>

      </div>



      <CompanySwitcher />



      <nav className="flex flex-1 flex-col gap-2">

        {visibleItems.map((item) => {

          const active =

            item.href === "/dashboard/recruiter"

              ? pathname === item.href

              : pathname.startsWith(item.href);

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

              {active ? (

                <span className="h-2 w-2 rounded-full bg-[var(--secondary)]" />

              ) : null}

            </Link>

          );

        })}

      </nav>



      <button

        type="button"

        onClick={() => logout()}

        className="mt-4 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-[var(--on-surface-variant)] transition hover:bg-[var(--surface-container-highest)] hover:text-[#93000a]"

      >

        Déconnexion

      </button>

    </aside>

  );

}

