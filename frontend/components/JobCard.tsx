import Link from 'next/link'

interface Job {
  id: number | string
  title: string
  location: string
  contractType: string
  description: string
}

interface JobCardProps {
  job: Job
  onApply?: () => void
  isApplying?: boolean
}

export default function JobCard({ job, onApply, isApplying }: JobCardProps) {
  return (
    <div
      className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow"
      style={{ borderColor: '#e2ddd2' }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-[#15191f] text-base">{job.title}</h3>
        <span
          className="text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap flex-shrink-0"
          style={{ background: '#efeae0', color: '#15191f' }}
        >
          {job.contractType}
        </span>
      </div>

      <p className="text-sm text-[#888] mb-2">📍 {job.location}</p>
      <p className="text-sm text-[#555] mb-4">
        {job.description.slice(0, 100)}
        {job.description.length > 100 ? '…' : ''}
      </p>

      <div className="flex items-center gap-3">
        <Link
          href={`/jobs/${job.id}`}
          className="text-sm font-medium hover:underline"
          style={{ color: '#1FA39F' }}
        >
          Voir l'offre
        </Link>
        {onApply && (
          <button
            type="button"
            onClick={onApply}
            disabled={isApplying}
            className="ml-auto text-sm px-4 py-2 rounded-lg text-white disabled:opacity-60 transition-colors"
            style={{ background: '#15191f' }}
          >
            {isApplying ? 'Postulation...' : 'Postuler'}
          </button>
        )}
      </div>
    </div>
  )
}
