interface SkillBadgeProps {
  skillName: string
  onDelete?: () => void
}

export default function SkillBadge({ skillName, onDelete }: SkillBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium"
      style={{ background: '#1FA39F', color: 'white' }}
    >
      {skillName}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="leading-none opacity-80 hover:opacity-100 ml-0.5"
          aria-label={`Supprimer ${skillName}`}
        >
          ×
        </button>
      )}
    </span>
  )
}
