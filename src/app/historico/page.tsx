'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Scissors, Calendar, ChevronLeft, Search, Loader2 } from 'lucide-react'
import { getSupabase, Agendamento } from '@/lib/supabase'
import { formatarDataExibicao } from '@/lib/constants'
import Link from 'next/link'

export default function HistoricoPage() {
  const [telefone, setTelefone] = useState('')
  const [telefoneBusca, setTelefoneBusca] = useState('')
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [carregando, setCarregando] = useState(false)
  const [buscou, setBuscou] = useState(false)

  async function buscar() {
    if (!telefone.trim()) return
    setCarregando(true)
    setBuscou(true)
    setTelefoneBusca(telefone.trim())
    try {
      const { data } = await getSupabase()
        .from('agendamentos')
        .select('*')
        .eq('cliente_telefone', telefone.trim())
        .order('data', { ascending: false })
        .order('horario', { ascending: false })
      setAgendamentos(data || [])
    } catch {
      setAgendamentos([])
    } finally {
      setCarregando(false)
    }
  }

  const hoje = new Date().toISOString().split('T')[0]
  const proximos = agendamentos.filter((a) => a.data >= hoje)
  const passados = agendamentos.filter((a) => a.data < hoje)

  function statusAgendamento(data: string, horario: string) {
    const agora = new Date()
    const dataHora = new Date(`${data}T${horario}:00`)
    if (dataHora > agora) return 'futuro'
    return 'passado'
  }

  return (
    <div className="min-h-screen bg-[#1e271e] text-white">
      {/* Header */}
      <header className="bg-[#2d3b2d] border-b border-[#3d5040] sticky top-0 z-30">
        <div className="max-w-md mx-auto px-5 py-4 flex items-center gap-3">
          <Link href="/" className="text-white/60 hover:text-white transition-colors">
            <ChevronLeft size={22} />
          </Link>
          <div>
            <h1 className="font-bold text-lg leading-tight">Meus Agendamentos</h1>
            <p className="text-white/50 text-xs">Consulte pelo seu telefone</p>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pb-28 pt-6">
        {/* Search */}
        <div className="bg-[#2d3b2d] border border-[#3d5040] rounded-2xl p-4 mb-5">
          <label className="text-white/70 text-sm font-semibold block mb-2">
            Seu telefone / WhatsApp
          </label>
          <div className="flex gap-2">
            <input
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && buscar()}
              placeholder="(11) 99999-9999"
              className="flex-1 px-4 py-3 rounded-xl bg-[#1e271e] border border-[#3d5040] text-white placeholder-white/30 focus:outline-none focus:border-[#7c1c2e] text-sm"
            />
            <button
              onClick={buscar}
              className="px-4 py-3 bg-[#7c1c2e] rounded-xl hover:bg-[#9b2239] transition-colors"
            >
              <Search size={18} />
            </button>
          </div>
        </div>

        {carregando && (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-[#7c1c2e]" size={32} />
          </div>
        )}

        {!carregando && buscou && agendamentos.length === 0 && (
          <div className="text-center py-10 text-white/40">
            <Calendar size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum agendamento encontrado</p>
            <p className="text-sm mt-1">para o telefone {telefoneBusca}</p>
          </div>
        )}

        {!carregando && proximos.length > 0 && (
          <div className="mb-5">
            <h2 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-3">
              Próximos
            </h2>
            <div className="space-y-2.5">
              {proximos.map((a) => (
                <CardAgendamento
                  key={a.id}
                  agendamento={a}
                  status={statusAgendamento(a.data, a.horario)}
                />
              ))}
            </div>
          </div>
        )}

        {!carregando && passados.length > 0 && (
          <div>
            <h2 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-3">
              Histórico
            </h2>
            <div className="space-y-2.5">
              {passados.map((a) => (
                <CardAgendamento
                  key={a.id}
                  agendamento={a}
                  status="passado"
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#2d3b2d] border-t border-[#3d5040] z-30">
        <div className="max-w-md mx-auto flex">
          <Link href="/" className="flex-1 flex flex-col items-center gap-1 py-3 text-white/40 hover:text-white/70 transition-colors">
            <Scissors size={20} />
            <span className="text-xs font-semibold">Agendar</span>
          </Link>
          <Link href="/historico" className="flex-1 flex flex-col items-center gap-1 py-3 text-[#7c1c2e]">
            <Calendar size={20} />
            <span className="text-xs font-semibold">Histórico</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}

function CardAgendamento({
  agendamento: a,
  status,
}: {
  agendamento: Agendamento
  status: 'futuro' | 'passado'
}) {
  return (
    <div
      className={`bg-[#2d3b2d] border rounded-xl p-4 ${
        status === 'futuro' ? 'border-[#7c1c2e]/50' : 'border-[#3d5040]'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-bold text-sm">{a.servico}</h3>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
            status === 'futuro'
              ? 'bg-green-900/50 text-green-400'
              : 'bg-white/10 text-white/40'
          }`}
        >
          {status === 'futuro' ? 'Confirmado' : 'Concluído'}
        </span>
      </div>
      <div className="text-white/60 text-xs space-y-1">
        <div className="flex items-center gap-1.5">
          <span>✂️</span>
          <span>{a.barbeiro}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>📅</span>
          <span>
            {formatarDataExibicao(a.data)} · {a.horario}
          </span>
        </div>
      </div>
    </div>
  )
}
