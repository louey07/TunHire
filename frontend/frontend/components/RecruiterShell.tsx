"use client";

import { useState } from "react";
import RecruiterSidebar from "@/components/RecruiterSidebar";
import { RecruiterCompanyProvider } from "@/lib/context/RecruiterCompanyContext";
import { useClientUser } from "@/lib/hooks/useClientUser";

export default function RecruiterShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, ready } = useClientUser();
  const isRecruiter = ready && user?.role === "RECRUITER";

  return (
    <RecruiterCompanyProvider>
      {!isRecruiter ? (
        <>{children}</>
      ) : (
        <div className="min-h-screen bg-[var(--surface)] text-[var(--on-surface)]">
          <button
            type="button"
            aria-label="Ouvrir le menu"
            className="fixed left-4 top-4 z-50 rounded-2xl bg-[var(--surface-container-lowest)] px-4 py-2 text-sm font-semibold text-[var(--primary)] shadow lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            Menu
          </button>
          {mobileOpen ? (
            <button
              type="button"
              aria-label="Fermer le menu"
              className="fixed inset-0 z-40 bg-black/30 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
          ) : null}
          <RecruiterSidebar
            mobileOpen={mobileOpen}
            onNavigate={() => setMobileOpen(false)}
          />
          <div className="min-h-screen lg:ml-64">{children}</div>
        </div>
      )}
    </RecruiterCompanyProvider>
  );
}
