'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { getToken } from '@/lib/auth'
import { apiPost } from '@/lib/api'

type Job = {
  id: number
  title: string
  location: string
  contractType: string
  description: string
  companyName?: string
}

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applyMsg, setApplyMsg] = useState('')
  const isLoggedIn = !!getToken()

  useEffect(() => {
    fetch(`http://localhost:8081/jobs/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setJob(data.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  async function applyToJob() {
    setApplying(true)
    setApplyMsg('')
    try {
      const data = await apiPost('/applications', { jobId: Number(id) })
      if (data.success) {
        setApplyMsg('Votre candidature a été envoyée !')
      } else {
        setApplyMsg('Erreur lors de la candidature')
      }
    } catch {
      setApplyMsg('Erreur de connexion')
    } finally {
      setApplying(false)
    }
  }

  return (
    <div style={{ background: '#f7f4ee', minHeight: '100vh' }}>
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-10">
        {loading ? (
          <p className="text-sm text-[#aaa]">Chargement...</p>
        ) : !job ? (
          <p className="text-sm text-red-500">Offre introuvable.</p>
        ) : (
          <div className="bg-white rounded-xl border p-8" style={{ borderColor: '#e2ddd2' }}>
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-2xl font-semibold text-[#15191f]">{job.title}</h1>
              <span
                className="text-sm px-3 py-1 rounded-full font-medium whitespace-nowrap flex-shrink-0"
                style={{ background: '#efeae0', color: '#15191f' }}
              >
                {job.contractType}
              </span>
            </div>

            <p className="text-sm text-[#888] mb-1">📍 {job.location}</p>
            {job.companyName && (
              <p className="text-sm text-[#888] mb-1">🏢 {job.companyName}</p>
            )}

            <hr className="my-5" style={{ borderColor: '#e2ddd2' }} />

            <p className="text-sm text-[#555] whitespace-pre-wrap leading-relaxed">
              {job.description}
            </p>

            {isLoggedIn && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={applyToJob}
                  disabled={applying}
                  className="px-6 py-3 rounded-xl text-sm text-white font-medium disabled:opacity-60 transition-colors"
                  style={{ background: '#15191f' }}
                >
                  {applying ? 'Envoi en cours...' : 'Postuler à cette offre'}
                </button>
                {applyMsg && (
                  <p
                    className={`mt-2 text-sm ${
                      applyMsg.includes('!') ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {applyMsg}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
