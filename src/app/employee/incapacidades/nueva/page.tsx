'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NuevaIncapacidadPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    type: 'SICK',
    startDate: '',
    endDate: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function calcDays() {
    if (!form.startDate || !form.endDate) return 0
    const diff = new Date(form.endDate).getTime() - new Date(form.startDate).getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/leave-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, days: calcDays() }),
    })

    if (res.ok) {
      router.push('/employee/incapacidades')
    } else {
      const data = await res.json()
      setError(data.error || 'Error al enviar la solicitud')
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-navy">Nueva Incapacidad</h1>
        <p className="text-gray-500 mt-1">Registra tu solicitud de incapacidad</p>
      </div>

      <div className="max-w-xl">
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de incapacidad</label>
              <select
                value={form.type}
                onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-brand-purple focus:outline-none text-sm"
              >
                <option value="SICK">Enfermedad General</option>
                <option value="DISABILITY">Incapacidad Laboral</option>
                <option value="MATERNITY">Licencia de Maternidad</option>
                <option value="OTHER">Otro</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha inicio</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-brand-purple focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha fin</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm(f => ({ ...f, endDate: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-brand-purple focus:outline-none text-sm"
                />
              </div>
            </div>

            {form.startDate && form.endDate && (
              <div className="bg-brand-purple/10 rounded-xl px-4 py-3">
                <p className="text-sm text-brand-purple font-semibold">
                  Duración: {calcDays()} días calendario
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción / motivo</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                placeholder="Describe brevemente el motivo..."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-brand-purple focus:outline-none text-sm resize-none"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 disabled:opacity-60"
              >
                {loading ? 'Enviando...' : 'Enviar solicitud'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
