import type { CandidateProfile } from "@/lib/types";

function formatAvailability(value?: string | null) {
  if (!value) return "Non définie";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Non définie";
  const today = new Date();
  const normalizedToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const normalizedDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  if (normalizedDate <= normalizedToday) return "Immédiatement";
  return new Intl.DateTimeFormat("fr-TN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(normalizedDate);
}

type ProfileFormProps = {
  profile: CandidateProfile | null;
  firstName: string;
  lastName: string;
  editMode: boolean;
  setEditMode: (value: boolean) => void;
  editForm: {
    firstName: string;
    lastName: string;
    bio: string;
    location: string;
    availableFrom: string;
    yearsOfExperience: number;
  };
  setEditForm: React.Dispatch<
    React.SetStateAction<{
      firstName: string;
      lastName: string;
      bio: string;
      location: string;
      availableFrom: string;
      yearsOfExperience: number;
    }>
  >;
  savingProfile: boolean;
  profileMsg: string;
  setProfileMsg: (msg: string) => void;
  onSave: () => void;
};

export default function ProfileForm({
  profile,
  firstName,
  lastName,
  editMode,
  setEditMode,
  editForm,
  setEditForm,
  savingProfile,
  profileMsg,
  setProfileMsg,
  onSave,
}: ProfileFormProps) {
  const experienceLabel = profile?.yearsOfExperience
    ? `${profile.yearsOfExperience} ans`
    : "—";
  const availabilityLabel = formatAvailability(profile?.availableFrom);
  const bio = profile?.bio || "";
  const dotIdx = bio.indexOf(".");
  const bioQuote = dotIdx > 0 ? bio.slice(0, dotIdx + 1) : bio;
  const bioRest = dotIdx > 0 ? bio.slice(dotIdx + 1).trim() : "";

  if (editMode) {
    return (
      <form
        className="surface-section p-8 editorial-shadow"
        onSubmit={(e) => {
          e.preventDefault();
          onSave();
        }}
      >
        <div className="mb-8 flex items-start justify-between">
          <h3 className="font-headline text-2xl font-bold text-[var(--primary)]">
            Modifier le profil
          </h3>
          <button
            type="button"
            onClick={() => {
              setEditMode(false);
              setProfileMsg("");
            }}
            className="rounded-full px-3 py-1 text-sm text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)]"
          >
            Fermer
          </button>
        </div>
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-sm font-bold text-[var(--on-surface-variant)]">
                Prénom
              </label>
              <input
                className="input-soft mt-2 w-full rounded-2xl px-4 py-3 text-sm"
                value={editForm.firstName}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, firstName: e.target.value }))
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
                value={editForm.lastName}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, lastName: e.target.value }))
                }
                required
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-bold text-[var(--on-surface-variant)]">
              Bio
            </label>
            <textarea
              className="input-soft mt-2 w-full rounded-2xl px-4 py-3 text-sm"
              rows={4}
              value={editForm.bio}
              onChange={(e) =>
                setEditForm((p) => ({ ...p, bio: e.target.value }))
              }
            />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-sm font-bold text-[var(--on-surface-variant)]">
                Localisation
              </label>
              <input
                className="input-soft mt-2 w-full rounded-2xl px-4 py-3 text-sm"
                value={editForm.location}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, location: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-bold text-[var(--on-surface-variant)]">
                Disponibilité
              </label>
              <input
                type="date"
                className="input-soft mt-2 w-full rounded-2xl px-4 py-3 text-sm"
                value={editForm.availableFrom}
                onChange={(e) =>
                  setEditForm((p) => ({
                    ...p,
                    availableFrom: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-bold text-[var(--on-surface-variant)]">
              Années d&apos;expérience
            </label>
            <input
              type="number"
              min="0"
              className="input-soft mt-2 w-full max-w-xs rounded-2xl px-4 py-3 text-sm"
              value={editForm.yearsOfExperience}
              onChange={(e) =>
                setEditForm((p) => ({
                  ...p,
                  yearsOfExperience: Number(e.target.value),
                }))
              }
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setEditMode(false);
                setProfileMsg("");
              }}
              className="btn-secondary rounded-2xl px-6 py-3 text-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={savingProfile}
              className="btn-primary rounded-2xl px-8 py-3 text-sm disabled:opacity-60"
            >
              {savingProfile ? "Enregistrement…" : "Sauvegarder"}
            </button>
          </div>
          {profileMsg ? (
            <p className="text-sm text-[var(--secondary)]">{profileMsg}</p>
          ) : null}
        </div>
      </form>
    );
  }

  return (
    <div className="surface-section p-8 editorial-shadow">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="font-headline text-2xl font-bold text-[var(--primary)]">
            Informations générales
          </h3>
          <p className="text-sm text-[var(--on-surface-variant)]">
            Gérez votre identité professionnelle et votre disponibilité.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditForm((p) => ({
              ...p,
              firstName,
              lastName,
            }));
            setEditMode(true);
            setProfileMsg("");
          }}
          className="btn-secondary rounded-2xl px-4 py-2 text-sm"
        >
          Éditer
        </button>
      </div>
      <div className="mb-8 border-b border-[color-mix(in_srgb,var(--outline-variant)_12%,transparent)] pb-6">
        <p className="label-uppercase text-[10px] font-bold text-[var(--on-surface-variant)]">
          Nom complet
        </p>
        <p className="mt-2 font-headline text-2xl font-bold text-[var(--primary)]">
          {firstName} {lastName}
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <p className="label-uppercase text-[10px] font-bold text-[var(--on-surface-variant)]">
            Biographie
          </p>
          {bio ? (
            <p className="mt-2 text-[var(--on-surface)]">
              &ldquo;{bioQuote}&rdquo;{bioRest ? ` ${bioRest}` : ""}
            </p>
          ) : (
            <p className="mt-2 text-sm text-[var(--on-surface-variant)]">
              Aucune information renseignée.
            </p>
          )}
        </div>
        <div className="space-y-4">
          <div>
            <p className="label-uppercase text-[10px] font-bold text-[var(--on-surface-variant)]">
              Localisation
            </p>
            <p className="mt-1 font-bold text-[var(--primary)]">
              {profile?.location || "—"}
            </p>
          </div>
          <div>
            <p className="label-uppercase text-[10px] font-bold text-[var(--on-surface-variant)]">
              Expérience
            </p>
            <p className="mt-1 font-bold text-[var(--primary)]">
              {experienceLabel}
            </p>
          </div>
          <div>
            <p className="label-uppercase text-[10px] font-bold text-[var(--on-surface-variant)]">
              Disponibilité
            </p>
            <p className="mt-1 font-bold text-[var(--primary)]">
              {availabilityLabel}
            </p>
          </div>
        </div>
      </div>
      {profileMsg ? (
        <p className="mt-4 text-sm text-[var(--secondary)]">{profileMsg}</p>
      ) : null}
    </div>
  );
}
