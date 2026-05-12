'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import JobCard from '@/components/JobCard'

type Job = {
  id: number
  title: string
  location: string
  contractType: string
  description: string
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchJobs(0)
  }, [])

  async function fetchJobs(p: number) {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:8081/jobs?page=${p}&size=10`)
      const data = await res.json()
      if (data.success) {
        setJobs(data.data.content || [])
        setTotalPages(data.data.totalPages || 0)
        setPage(p)
      }
    } catch {}
    setLoading(false)
  }

  const filtered = search
    ? jobs.filter(
        (j) =>
          j.title.toLowerCase().includes(search.toLowerCase()) ||
          j.location.toLowerCase().includes(search.toLowerCase()),
      )
    : jobs

  return (
    <div style={{ background: '#f7f4ee', minHeight: '100vh' }}>
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold text-[#15191f] mb-6">Offres d&apos;emploi</h1>

        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par titre ou localisation..."
            className="w-full px-4 py-3 rounded-xl border text-sm text-[#15191f]"
            style={{ borderColor: '#e2ddd2', background: 'white' }}
          />
        </div>

        {loading ? (
          <p className="text-sm text-[#aaa]">Chargement...</p>
        ) : filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#aaa]">Aucune offre trouvée.</p>
        )}

        {totalPages > 1 && !search && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              type="button"
              onClick={() => fetchJobs(page - 1)}
              disabled={page === 0}
              className="px-4 py-2 rounded-lg text-sm border disabled:opacity-40 transition-colors"
              style={{ borderColor: '#e2ddd2', color: '#15191f' }}
            >
              Précédent
            </button>
            <span className="text-sm text-[#888]">
              Page {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => fetchJobs(page + 1)}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 rounded-lg text-sm border disabled:opacity-40 transition-colors"
              style={{ borderColor: '#e2ddd2', color: '#15191f' }}
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
