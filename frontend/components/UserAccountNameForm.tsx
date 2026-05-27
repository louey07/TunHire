"use client";

import { useEffect, useState } from "react";
import { useUserAccount } from "@/lib/hooks/useUserAccount";

type UserAccountNameFormProps = {
  compact?: boolean;
  className?: string;
};

export default function UserAccountNameForm({
  compact = false,
  className = "",
}: UserAccountNameFormProps) {
  const {
    firstName,
    lastName,
    email,
    loading,
    saving,
    message,
    error,
    setError,
    saveName,
  } = useUserAccount();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "" });

  useEffect(() => {
    if (!editMode) {
      setForm({ firstName, lastName });
    }
  }, [firstName, lastName, editMode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await saveName(form.firstName, form.lastName);
    if (ok) setEditMode(false);
  }

  if (loading) {
    return (
      <div
        className={`surface-section animate-pulse rounded-3xl editorial-shadow ${
          compact ? "h-28 p-5" : "h-36 p-8"
        } ${className}`}
      />
    );
  }

  return (
    <div
      className={`surface-section editorial-shadow ${compact ? "p-5" : "p-8"} ${className}`}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-headline text-xl font-bold text-[var(--primary)]">
            Mon compte
          </h3>
          <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
            {email}
          </p>
        </div>
        {!editMode ? (
          <button
            type="button"
            onClick={() => {
              setEditMode(true);
              setError("");
              setForm({ firstName, lastName });
            }}
            className="btn-secondary rounded-2xl px-4 py-2 text-sm"
          >
            Modifier
          </button>
        ) : null}
      </div>

      {editMode ? (
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-bold text-[var(--on-surface-variant)]">
                Prénom
              </label>
              <input
                className="input-soft mt-2 w-full rounded-2xl px-4 py-3 text-sm"
                value={form.firstName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, firstName: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="text-sm font-bold text-[var(--on-surface-variant)]">
                Nom
              </label>
              <input
                className="input-soft mt-2 w-full rounded-2xl px-4 py-3 text-sm"
                value={form.lastName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, lastName: e.target.value }))
                }
                required
              />
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="btn-secondary rounded-2xl px-5 py-2.5 text-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary rounded-2xl px-6 py-2.5 text-sm disabled:opacity-60"
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      ) : (
        <p className="font-headline text-2xl font-bold text-[var(--primary)]">
          {firstName} {lastName}
        </p>
      )}

      {error ? (
        <p className="mt-3 text-sm text-[#93000a]">{error}</p>
      ) : null}
      {message ? (
        <p className="mt-3 text-sm text-[var(--secondary)]">{message}</p>
      ) : null}
    </div>
  );
}
