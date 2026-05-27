type SkillsSectionProps = {
  skills: { id: number; skillName: string }[];
  newSkill: string;
  setNewSkill: (value: string) => void;
  addingSkill: boolean;
  skillMsg: string;
  onAdd: () => void;
  onDelete: (id: number) => void;
};

export default function SkillsSection({
  skills,
  newSkill,
  setNewSkill,
  addingSkill,
  skillMsg,
  onAdd,
  onDelete,
}: SkillsSectionProps) {
  return (
    <div className="surface-section p-8 editorial-shadow">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-headline text-2xl font-bold text-[var(--primary)]">
          Compétences
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--on-surface-variant)]">
          {skills.length} ajoutées
        </span>
      </div>
      <div className="mb-8 flex flex-wrap gap-3">
        {skills.length === 0 ? (
          <span className="text-sm text-[var(--on-surface-variant)]">
            Aucune compétence ajoutée.
          </span>
        ) : (
          skills.map((skill) => (
            <div
              key={skill.id}
              className="group flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--primary)_8%,transparent)] px-4 py-2 text-sm font-semibold text-[var(--primary)]"
            >
              {skill.skillName}
              <button
                type="button"
                onClick={() => onDelete(skill.id)}
                className="opacity-60 transition hover:opacity-100"
                aria-label="Retirer"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onAdd();
        }}
        className="relative max-w-md"
      >
        <input
          className="input-soft w-full rounded-2xl py-4 pl-4 pr-32 text-sm"
          placeholder="Ajouter une compétence…"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
        />
        <button
          type="submit"
          disabled={addingSkill || !newSkill.trim()}
          className="btn-primary absolute right-2 top-2 bottom-2 rounded-xl px-6 text-sm disabled:opacity-60"
        >
          {addingSkill ? "Ajout…" : "Ajouter"}
        </button>
      </form>
      {skillMsg ? (
        <p className="mt-3 text-sm text-[var(--on-surface-variant)]">
          {skillMsg}
        </p>
      ) : null}
    </div>
  );
}
