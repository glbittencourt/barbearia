'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, CheckCircle2, Loader2 } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'
import {
  BARBEIROS,
  gerarHorarios,
  gerarProximos7Dias,
  formatarTelefone,
  formatarDataExibicao,
} from '@/lib/constants'
import { AvatarBarbeiro } from './AvatarBarbeiro'

interface ModalAgendamentoProps {
  servico: { nome: string; preco: number }
  onClose: () => void
}

type Etapa = 1 | 2 | 3 | 4

export function ModalAgendamento({ servico, onClose }: ModalAgendamentoProps) {
  const [etapa, setEtapa] = useState<Etapa>(1)
  const [dataSelecionada, setDataSelecionada] = useState('')
  const [barbeiroSelecionado, setBarbeiroSelecionado] = useState('')
  const [horarioSelecionado, setHorarioSelecionado] = useState('')
  const [clienteNome, setClienteNome] = useState('')
  const [clienteTelefone, setClienteTelefone] = useState('')
  const [horariosOcupados, setHorariosOcupados] = useState<string[]>([])
  const [carregandoHorarios, setCarregandoHorarios] = useState(false)
  const [agendando, setAgendando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')

  const dias = gerarProximos7Dias()
  const todosHorarios = gerarHorarios()

  useEffect(() => {
    if (dataSelecionada && barbeiroSelecionado && etapa === 3) {
      buscarHorariosOcupados()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSelecionada, barbeiroSelecionado, etapa])

  async function buscarHorariosOcupados() {
    setCarregandoHorarios(true)
    try {
      const { data, error } = await getSupabase()
        .from('agendamentos')
        .select('horario')
        .eq('data', dataSelecionada)
        .eq('barbeiro', barbeiroSelecionado)

      if (error) {
        console.error('Supabase erro ao buscar horários:', error)
        setHorariosOcupados([])
      } else {
        // Normaliza "HH:MM:SS" → "HH:MM" (formato que o PostgreSQL TIME retorna)
        setHorariosOcupados(
          (data || []).map((r: { horario: string }) => r.horario.slice(0, 5))
        )
      }
    } catch (err) {
      console.error('Erro ao buscar horários:', err)
      setHorariosOcupados([])
    } finally {
      setCarregandoHorarios(false)
    }
  }

  const horariosDisponiveis = todosHorarios.filter(
    (h) => !horariosOcupados.includes(h)
  )

  function avancar() {
    if (etapa < 4) setEtapa((etapa + 1) as Etapa)
  }

  function voltar() {
    if (etapa > 1) setEtapa((etapa - 1) as Etapa)
  }

  function podeAvancar() {
    if (etapa === 1) return !!dataSelecionada
    if (etapa === 2) return !!barbeiroSelecionado
    if (etapa === 3) return !!horarioSelecionado
    return false
  }

  async function handleAgendar() {
    if (!clienteNome.trim() || !clienteTelefone.trim()) {
      setErro('Preencha seu nome e telefone.')
      return
    }
    setErro('')
    setAgendando(true)

    try {
      const { error } = await getSupabase().from('agendamentos').insert({
        servico: servico.nome,
        barbeiro: barbeiroSelecionado,
        data: dataSelecionada,
        horario: horarioSelecionado,
        cliente_nome: clienteNome.trim(),
        cliente_telefone: clienteTelefone,
      })

      if (error) throw error

      const numero = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511999999999'
      const mensagem = encodeURIComponent(
        `Olá! Acabei de agendar na barbearia.\n\n` +
        `📋 Serviço: ${servico.nome}\n` +
        `👤 Profissional: ${barbeiroSelecionado}\n` +
        `📅 Data: ${formatarDataExibicao(dataSelecionada)}\n` +
        `⏰ Horário: ${horarioSelecionado}\n` +
        `👤 Cliente: ${clienteNome.trim()}\n` +
        `📱 Telefone: ${clienteTelefone}`
      )

      setSucesso(true)
      setTimeout(() => {
        window.open(`https://wa.me/${numero}?text=${mensagem}`, '_blank')
      }, 800)
    } catch {
      setErro('Erro ao agendar. Tente novamente.')
    } finally {
      setAgendando(false)
    }
  }

  const titulos: Record<Etapa, string> = {
    1: 'Escolha a data',
    2: 'Escolha o barbeiro',
    3: 'Escolha o horário',
    4: 'Confirmar agendamento',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md bg-[#f0ede6] rounded-t-3xl sm:rounded-2xl shadow-2xl z-10 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#2d3b2d] rounded-t-3xl sm:rounded-t-2xl px-5 py-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {etapa > 1 && !sucesso && (
                <button
                  onClick={voltar}
                  className="text-white/70 hover:text-white transition-colors p-1 -ml-1"
                >
                  <ChevronLeft size={22} />
                </button>
              )}
              <div>
                <p className="text-white/60 text-xs">{servico.nome} · R${servico.preco}</p>
                <h2 className="text-white font-semibold text-base">
                  {sucesso ? 'Agendamento confirmado!' : titulos[etapa]}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors p-1"
            >
              <X size={22} />
            </button>
          </div>

          {/* Progress bar */}
          {!sucesso && (
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    n <= etapa ? 'bg-[#7c1c2e]' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-5">
          {sucesso ? (
            <EtapaSucesso
              servico={servico.nome}
              barbeiro={barbeiroSelecionado}
              data={dataSelecionada}
              horario={horarioSelecionado}
              cliente={clienteNome}
              onClose={onClose}
            />
          ) : (
            <>
              {etapa === 1 && (
                <EtapaData
                  dias={dias}
                  selecionado={dataSelecionada}
                  onSelect={setDataSelecionada}
                />
              )}
              {etapa === 2 && (
                <EtapaBarbeiro
                  selecionado={barbeiroSelecionado}
                  onSelect={setBarbeiroSelecionado}
                />
              )}
              {etapa === 3 && (
                <EtapaHorario
                  horarios={horariosDisponiveis}
                  selecionado={horarioSelecionado}
                  onSelect={setHorarioSelecionado}
                  carregando={carregandoHorarios}
                />
              )}
              {etapa === 4 && (
                <EtapaDados
                  servico={servico.nome}
                  preco={servico.preco}
                  barbeiro={barbeiroSelecionado}
                  data={dataSelecionada}
                  horario={horarioSelecionado}
                  nome={clienteNome}
                  telefone={clienteTelefone}
                  onNomeChange={setClienteNome}
                  onTelefoneChange={setClienteTelefone}
                  erro={erro}
                />
              )}
            </>
          )}
        </div>

        {/* Footer button */}
        {!sucesso && (
          <div className="p-5 pt-2 flex-shrink-0 bg-[#f0ede6] rounded-b-3xl sm:rounded-b-2xl border-t border-[#d5cfc4]">
            {etapa < 4 ? (
              <button
                onClick={avancar}
                disabled={!podeAvancar()}
                className={`w-full py-3.5 rounded-xl font-bold text-white text-base transition-all duration-200 ${
                  podeAvancar()
                    ? 'bg-[#7c1c2e] hover:bg-[#9b2239] active:scale-[0.98]'
                    : 'bg-[#7c1c2e]/30 cursor-not-allowed'
                }`}
              >
                Continuar
              </button>
            ) : (
              <button
                onClick={handleAgendar}
                disabled={agendando}
                className="w-full py-3.5 rounded-xl font-bold text-white text-base bg-[#7c1c2e] hover:bg-[#9b2239] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {agendando ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Agendando...
                  </>
                ) : (
                  'AGENDAR'
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Etapa 1: Data ─────────────────────────────────────────────────────── */
function EtapaData({
  dias,
  selecionado,
  onSelect,
}: {
  dias: { data: string; label: string }[]
  selecionado: string
  onSelect: (d: string) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {dias.map((d) => (
        <button
          key={d.data}
          onClick={() => onSelect(d.data)}
          className={`py-3 px-4 rounded-xl border-2 font-medium text-sm transition-all duration-150 ${
            selecionado === d.data
              ? 'bg-[#7c1c2e] border-[#7c1c2e] text-white shadow-md'
              : 'bg-white border-[#d5cfc4] text-[#2d3b2d] hover:border-[#7c1c2e] hover:bg-[#7c1c2e]/5'
          }`}
        >
          {d.label}
        </button>
      ))}
    </div>
  )
}

/* ─── Etapa 2: Barbeiro ─────────────────────────────────────────────────── */
function EtapaBarbeiro({
  selecionado,
  onSelect,
}: {
  selecionado: string
  onSelect: (b: string) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {BARBEIROS.map((b) => (
        <button
          key={b.nome}
          onClick={() => onSelect(b.nome)}
          className={`flex flex-col items-center gap-2.5 py-4 px-3 rounded-xl border-2 transition-all duration-150 ${
            selecionado === b.nome
              ? 'bg-[#7c1c2e]/10 border-[#7c1c2e] shadow-md'
              : 'bg-white border-[#d5cfc4] hover:border-[#7c1c2e] hover:bg-[#7c1c2e]/5'
          }`}
        >
          <AvatarBarbeiro nome={b.nome} size={64} />
          <span
            className={`font-semibold text-sm ${
              selecionado === b.nome ? 'text-[#7c1c2e]' : 'text-[#2d3b2d]'
            }`}
          >
            {b.nome}
          </span>
        </button>
      ))}
    </div>
  )
}

/* ─── Etapa 3: Horário ──────────────────────────────────────────────────── */
function EtapaHorario({
  horarios,
  selecionado,
  onSelect,
  carregando,
}: {
  horarios: string[]
  selecionado: string
  onSelect: (h: string) => void
  carregando: boolean
}) {
  if (carregando) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-[#7c1c2e]" size={32} />
      </div>
    )
  }

  if (horarios.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-[#2d3b2d]/60 font-medium">
          Não há horários disponíveis para este barbeiro neste dia.
        </p>
        <p className="text-[#2d3b2d]/40 text-sm mt-1">
          Tente outro dia ou barbeiro.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {horarios.map((h) => (
        <button
          key={h}
          onClick={() => onSelect(h)}
          className={`py-2.5 rounded-xl border-2 font-semibold text-sm transition-all duration-150 ${
            selecionado === h
              ? 'bg-[#7c1c2e] border-[#7c1c2e] text-white shadow-md'
              : 'bg-white border-[#d5cfc4] text-[#2d3b2d] hover:border-[#7c1c2e] hover:bg-[#7c1c2e]/5'
          }`}
        >
          {h}
        </button>
      ))}
    </div>
  )
}

/* ─── Etapa 4: Dados do cliente ─────────────────────────────────────────── */
function EtapaDados({
  servico,
  preco,
  barbeiro,
  data,
  horario,
  nome,
  telefone,
  onNomeChange,
  onTelefoneChange,
  erro,
}: {
  servico: string
  preco: number
  barbeiro: string
  data: string
  horario: string
  nome: string
  telefone: string
  onNomeChange: (v: string) => void
  onTelefoneChange: (v: string) => void
  erro: string
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Resumo */}
      <div className="bg-[#2d3b2d] rounded-xl p-4 text-white text-sm space-y-1.5">
        <div className="flex justify-between">
          <span className="text-white/60">Serviço</span>
          <span className="font-semibold">{servico}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Valor</span>
          <span className="font-semibold text-[#e8a87c]">R$ {preco}</span>
        </div>
        <div className="border-t border-white/10 pt-1.5 mt-1.5" />
        <div className="flex justify-between">
          <span className="text-white/60">Barbeiro</span>
          <span className="font-semibold">{barbeiro}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Data</span>
          <span className="font-semibold">{formatarDataExibicao(data)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Horário</span>
          <span className="font-semibold">{horario}</span>
        </div>
      </div>

      {/* Campos */}
      <div className="space-y-3">
        <div>
          <label className="text-[#2d3b2d] font-semibold text-sm block mb-1.5">
            Nome completo
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => onNomeChange(e.target.value)}
            placeholder="Seu nome e sobrenome"
            className="w-full px-4 py-3 rounded-xl border-2 border-[#d5cfc4] bg-white text-[#2d3b2d] placeholder-[#2d3b2d]/30 focus:outline-none focus:border-[#7c1c2e] transition-colors text-sm"
          />
        </div>
        <div>
          <label className="text-[#2d3b2d] font-semibold text-sm block mb-1.5">
            Telefone / WhatsApp
          </label>
          <input
            type="tel"
            value={telefone}
            onChange={(e) => onTelefoneChange(formatarTelefone(e.target.value))}
            placeholder="(11) 99999-9999"
            className="w-full px-4 py-3 rounded-xl border-2 border-[#d5cfc4] bg-white text-[#2d3b2d] placeholder-[#2d3b2d]/30 focus:outline-none focus:border-[#7c1c2e] transition-colors text-sm"
          />
        </div>
        {erro && (
          <p className="text-red-600 text-sm font-medium">{erro}</p>
        )}
      </div>
    </div>
  )
}

/* ─── Tela de Sucesso ───────────────────────────────────────────────────── */
function EtapaSucesso({
  servico,
  barbeiro,
  data,
  horario,
  cliente,
  onClose,
}: {
  servico: string
  barbeiro: string
  data: string
  horario: string
  cliente: string
  onClose: () => void
}) {
  return (
    <div className="flex flex-col items-center text-center py-4 gap-4">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle2 size={36} className="text-green-600" />
      </div>
      <div>
        <h3 className="text-[#2d3b2d] font-bold text-xl mb-1">Agendado!</h3>
        <p className="text-[#2d3b2d]/60 text-sm">
          Você será redirecionado ao WhatsApp para confirmar.
        </p>
      </div>
      <div className="w-full bg-[#2d3b2d] rounded-xl p-4 text-white text-sm space-y-1.5 text-left">
        <div className="flex justify-between">
          <span className="text-white/60">Serviço</span>
          <span className="font-semibold">{servico}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Barbeiro</span>
          <span className="font-semibold">{barbeiro}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Data</span>
          <span className="font-semibold">{formatarDataExibicao(data)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Horário</span>
          <span className="font-semibold">{horario}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Cliente</span>
          <span className="font-semibold">{cliente}</span>
        </div>
      </div>
      <button
        onClick={onClose}
        className="w-full py-3 rounded-xl bg-[#7c1c2e] text-white font-bold hover:bg-[#9b2239] transition-colors"
      >
        Fechar
      </button>
    </div>
  )
}
