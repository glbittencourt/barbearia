'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { getSupabase, Agendamento } from '@/lib/supabase'
import { formatarDataExibicao, BARBEIROS } from '@/lib/constants'
import { LogOut, Trash2, Loader2, RefreshCw, Calendar, Clock, User } from 'lucide-react'

const SENHA_ADMIN = 'barbearia2024'

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false)
  const [senhaInput, setSenhaInput] = useState('')
  const [erroSenha, setErroSenha] = useState(false)

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [carregando, setCarregando] = useState(false)
  const [aba, setAba] = useState<'hoje' | 'historico'>('hoje')
  const [filtroData, setFiltroData] = useState('')
  const [filtroBarbeiro, setFiltroBarbeiro] = useState('')
  const [cancelando, setCancelando] = useState<string | null>(null)

  const hoje = new Date().toISOString().split('T')[0]

  const buscarAgendamentos = useCallback(async () => {
    setCarregando(true)
    try {
      let query = getSupabase()
        .from('agendamentos')
        .select('*')
        .order('data', { ascending: aba === 'historico' ? false : true })
        .order('horario', { ascending: true })

      if (aba === 'hoje') {
        const dataRef = filtroData || hoje
        query = query.eq('data', dataRef)
      } else {
        query = query.lt('data', hoje)
        if (filtroData) query = query.eq('data', filtroData)
      }

      if (filtroBarbeiro) query = query.eq('barbeiro', filtroBarbeiro)

      const { data } = await query
      setAgendamentos(data || [])
    } catch {
      setAgendamentos([])
    } finally {
      setCarregando(false)
    }
  }, [aba, filtroData, filtroBarbeiro, hoje])

  useEffect(() => {
    if (autenticado) buscarAgendamentos()
  }, [autenticado, buscarAgendamentos])

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (senhaInput === SENHA_ADMIN) {
      setAutenticado(true)
      setErroSenha(false)
    } else {
      setErroSenha(true)
    }
  }

  async function cancelarAgendamento(id: string) {
    if (!confirm('Confirmar cancelamento deste agendamento?')) return
    setCancelando(id)
    try {
      await getSupabase().from('agendamentos').delete().eq('id', id)
      setAgendamentos((prev) => prev.filter((a) => a.id !== id))
    } catch {
      alert('Erro ao cancelar.')
    } finally {
      setCancelando(null)
    }
  }

  /* ─── Login Screen ─────────────────────────────────────────────────────── */
  if (!autenticado) {
    return (
      <div className="min-h-screen bg-[#1e271e] flex items-center justify-center px-5">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#7c1c2e] rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
              💈
            </div>
            <h1 className="text-white text-2xl font-bold">Painel Admin</h1>
            <p className="text-white/40 text-sm mt-1">Barbearia</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={senhaInput}
                onChange={(e) => setSenhaInput(e.target.value)}
                placeholder="Senha de acesso"
                className={`w-full px-4 py-3.5 rounded-xl bg-[#2d3b2d] border text-white placeholder-white/30 focus:outline-none transition-colors text-sm ${
                  erroSenha ? 'border-red-500' : 'border-[#3d5040] focus:border-[#7c1c2e]'
                }`}
              />
              {erroSenha && (
                <p className="text-red-400 text-xs mt-1.5">Senha incorreta.</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-[#7c1c2e] text-white rounded-xl font-bold hover:bg-[#9b2239] transition-colors"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    )
  }

  /* ─── Dashboard ────────────────────────────────────────────────────────── */
  const dataExibicao = filtroData
    ? formatarDataExibicao(filtroData)
    : aba === 'hoje'
    ? `Hoje — ${formatarDataExibicao(hoje)}`
    : 'Histórico'

  return (
    <div className="min-h-screen bg-[#1e271e] text-white">
      {/* Header */}
      <header className="bg-[#2d3b2d] border-b border-[#3d5040] sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">💈</span>
            <div>
              <h1 className="font-bold leading-tight">Painel Admin</h1>
              <p className="text-white/40 text-xs">{dataExibicao}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={buscarAgendamentos}
              className="p-2 text-white/50 hover:text-white transition-colors"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={() => setAutenticado(false)}
              className="p-2 text-white/50 hover:text-red-400 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-10 pt-5">
        {/* Abas */}
        <div className="flex bg-[#2d3b2d] border border-[#3d5040] rounded-xl p-1 mb-5">
          {(['hoje', 'historico'] as const).map((a) => (
            <button
              key={a}
              onClick={() => {
                setAba(a)
                setFiltroData('')
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                aba === a
                  ? 'bg-[#7c1c2e] text-white shadow'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {a === 'hoje' ? 'Agendamentos' : 'Histórico'}
            </button>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex gap-2.5 mb-5">
          <div className="flex-1">
            <input
              type="date"
              value={filtroData}
              onChange={(e) => setFiltroData(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#2d3b2d] border border-[#3d5040] text-white text-sm focus:outline-none focus:border-[#7c1c2e]"
            />
          </div>
          <div className="flex-1">
            <select
              value={filtroBarbeiro}
              onChange={(e) => setFiltroBarbeiro(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#2d3b2d] border border-[#3d5040] text-white text-sm focus:outline-none focus:border-[#7c1c2e]"
            >
              <option value="">Todos barbeiros</option>
              {BARBEIROS.map((b) => (
                <option key={b.nome} value={b.nome}>
                  {b.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <div className="bg-[#2d3b2d] border border-[#3d5040] rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-[#7c1c2e]">{agendamentos.length}</p>
            <p className="text-white/50 text-xs mt-0.5">Total</p>
          </div>
          <div className="bg-[#2d3b2d] border border-[#3d5040] rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-[#e8a87c]">
              {new Set(agendamentos.map((a) => a.barbeiro)).size}
            </p>
            <p className="text-white/50 text-xs mt-0.5">Barbeiros</p>
          </div>
          <div className="bg-[#2d3b2d] border border-[#3d5040] rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-400">
              R${agendamentos.reduce((acc, a) => {
                const precos: Record<string, number> = {
                  Cabelo: 35, Barba: 25, 'Meia Barba': 20,
                  Raspagem: 30, 'Combo Cabelo + Barba': 55, Pezinho: 15,
                }
                return acc + (precos[a.servico] || 0)
              }, 0)}
            </p>
            <p className="text-white/50 text-xs mt-0.5">Receita</p>
          </div>
        </div>

        {/* Agendamentos */}
        {carregando ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-[#7c1c2e]" size={32} />
          </div>
        ) : agendamentos.length === 0 ? (
          <div className="text-center py-12 text-white/30">
            <Calendar size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum agendamento</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {agendamentos.map((a) => (
              <div
                key={a.id}
                className="bg-[#2d3b2d] border border-[#3d5040] rounded-xl p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="bg-[#7c1c2e]/20 text-[#e8a87c] text-xs font-bold px-2 py-0.5 rounded-lg">
                        {a.servico}
                      </span>
                      <span className="text-white/40 text-xs">•</span>
                      <span className="text-white/60 text-xs font-semibold">{a.barbeiro}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-white/50">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        <span>{formatarDataExibicao(a.data)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} />
                        <span>{a.horario}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User size={12} />
                        <span className="truncate">{a.cliente_nome}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span>📱</span>
                        <span>{a.cliente_telefone}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => cancelarAgendamento(a.id)}
                    disabled={cancelando === a.id}
                    className="flex-shrink-0 p-2 text-white/30 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all"
                  >
                    {cancelando === a.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
