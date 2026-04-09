'use client'

import { useState, useEffect, useRef } from 'react'
import { X, ChevronLeft, ChevronRight, CheckCircle2, Loader2, User, Scissors, Calendar, Clock } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'
import { BARBEIROS, gerarHorarios, gerarProximos7Dias, formatarTelefone, formatarDataExibicao } from '@/lib/constants'
import { AvatarBarbeiro } from './AvatarBarbeiro'

interface ModalAgendamentoProps {
  servico: { nome: string; preco: number; duracao: string }
  onClose: () => void
}

export function ModalAgendamento({ servico, onClose }: ModalAgendamentoProps) {
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

  // Carrossel de datas
  const [offsetDatas, setOffsetDatas] = useState(0)
  const DATAS_VISIVEIS = 5
  const dias = gerarProximos7Dias()
  const diasVisiveis = dias.slice(offsetDatas, offsetDatas + DATAS_VISIVEIS)

  const todosHorarios = gerarHorarios()
  const horariosRef = useRef<HTMLDivElement>(null)
  const resumoRef = useRef<HTMLDivElement>(null)

  // Busca horários ocupados quando barbeiro + data estiverem selecionados
  useEffect(() => {
    if (dataSelecionada && barbeiroSelecionado) {
      setHorarioSelecionado('')
      buscarHorariosOcupados()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSelecionada, barbeiroSelecionado])

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
        setHorariosOcupados(
          (data || []).map((r: { horario: string }) => r.horario.slice(0, 5))
        )
      }
    } catch (err) {
      console.error('Erro ao buscar horários:', err)
      setHorariosOcupados([])
    } finally {
      setCarregandoHorarios(false)
      // Scroll suave até a seção de horários
      setTimeout(() => {
        horariosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 100)
    }
  }

  const horariosDisponiveis = todosHorarios.filter(
    (h) => !horariosOcupados.includes(h)
  )

  function handleSelecionarHorario(h: string) {
    setHorarioSelecionado(h)
    setTimeout(() => {
      resumoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 100)
  }

  async function handleAgendar() {
    if (!dataSelecionada || !barbeiroSelecionado || !horarioSelecionado) {
      setErro('Selecione data, profissional e horário.')
      return
    }
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

  const podeAgendar =
    dataSelecionada &&
    barbeiroSelecionado &&
    horarioSelecionado &&
    clienteNome.trim() &&
    clienteTelefone.trim()

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md bg-[#eee8de] rounded-t-3xl sm:rounded-2xl shadow-2xl z-10 max-h-[94vh] flex flex-col">

        {/* Header fixo */}
        <div className="bg-[#2d3b2d] rounded-t-3xl sm:rounded-t-2xl px-5 py-4 flex items-start justify-between flex-shrink-0">
          <div>
            <p className="text-white/50 text-xs uppercase tracking-wider mb-0.5">Agendamento</p>
            <h2 className="text-white font-bold text-lg leading-tight">{servico.nome}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[#e8a87c] font-bold text-sm">
                R$ {servico.preco.toFixed(2).replace('.', ',')}
              </span>
              <span className="text-white/40 text-xs flex items-center gap-1">
                <Clock size={11} /> {servico.duracao}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors p-1 -mr-1">
            <X size={22} />
          </button>
        </div>

        {/* Conteúdo scrollável */}
        <div className="overflow-y-auto flex-1">
          {sucesso ? (
            <TelaSucesso
              servico={servico.nome}
              barbeiro={barbeiroSelecionado}
              data={dataSelecionada}
              horario={horarioSelecionado}
              cliente={clienteNome}
              onClose={onClose}
            />
          ) : (
            <div className="px-5 py-5 space-y-6">

              {/* ── Seção 1: Data ── */}
              <div>
                <p className="text-[#2d3b2d]/60 text-xs font-bold uppercase tracking-wider mb-3">
                  Selecione o dia da semana desejado:
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setOffsetDatas(Math.max(0, offsetDatas - 1))}
                    disabled={offsetDatas === 0}
                    className="p-1.5 rounded-lg border border-[#c8bfb0] bg-white disabled:opacity-30 hover:bg-[#f0ede6] transition-colors flex-shrink-0"
                  >
                    <ChevronLeft size={16} className="text-[#2d3b2d]" />
                  </button>

                  <div className="flex gap-1.5 flex-1 overflow-hidden">
                    {diasVisiveis.map((d) => {
                      const [diaNum, mesNum] = d.label.split(' ')[0].split('/')
                      const diaSemana = d.label.split(' ')[1]
                      return (
                        <button
                          key={d.data}
                          onClick={() => setDataSelecionada(d.data)}
                          className={`flex-1 flex flex-col items-center py-2 px-1 rounded-xl border-2 text-xs font-semibold transition-all duration-150 ${
                            dataSelecionada === d.data
                              ? 'bg-[#7c1c2e] border-[#7c1c2e] text-white shadow-md'
                              : 'bg-white border-[#d5cfc4] text-[#2d3b2d] hover:border-[#7c1c2e]'
                          }`}
                        >
                          <span className="text-[10px] opacity-75">{diaNum}/{mesNum}</span>
                          <span>{diaSemana}</span>
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => setOffsetDatas(Math.min(dias.length - DATAS_VISIVEIS, offsetDatas + 1))}
                    disabled={offsetDatas >= dias.length - DATAS_VISIVEIS}
                    className="p-1.5 rounded-lg border border-[#c8bfb0] bg-white disabled:opacity-30 hover:bg-[#f0ede6] transition-colors flex-shrink-0"
                  >
                    <ChevronRight size={16} className="text-[#2d3b2d]" />
                  </button>
                </div>
              </div>

              {/* ── Seção 2: Barbeiro ── */}
              {dataSelecionada && (
                <div>
                  <p className="text-[#2d3b2d]/60 text-xs font-bold uppercase tracking-wider mb-3">
                    Selecione o profissional:
                  </p>
                  <div className="flex gap-3 justify-around">
                    {BARBEIROS.map((b) => (
                      <button
                        key={b.nome}
                        onClick={() => setBarbeiroSelecionado(b.nome)}
                        className={`flex flex-col items-center gap-1.5 flex-1 py-2 rounded-xl border-2 transition-all duration-150 ${
                          barbeiroSelecionado === b.nome
                            ? 'border-[#7c1c2e] bg-[#7c1c2e]/10'
                            : 'border-transparent hover:border-[#7c1c2e]/40'
                        }`}
                      >
                        <div
                          className={`rounded-full overflow-hidden border-2 transition-all ${
                            barbeiroSelecionado === b.nome
                              ? 'border-[#7c1c2e] shadow-md'
                              : 'border-[#d5cfc4]'
                          }`}
                        >
                          <AvatarBarbeiro nome={b.nome} size={52} />
                        </div>
                        <span
                          className={`text-xs font-semibold ${
                            barbeiroSelecionado === b.nome ? 'text-[#7c1c2e]' : 'text-[#2d3b2d]'
                          }`}
                        >
                          {b.nome}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Seção 3: Horários ── */}
              {dataSelecionada && barbeiroSelecionado && (
                <div ref={horariosRef}>
                  <p className="text-[#2d3b2d]/60 text-xs font-bold uppercase tracking-wider mb-3">
                    Escolha um Horário Disponível:
                  </p>
                  {carregandoHorarios ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="animate-spin text-[#7c1c2e]" size={28} />
                    </div>
                  ) : horariosDisponiveis.length === 0 ? (
                    <div className="text-center py-6 text-[#2d3b2d]/50 text-sm">
                      <p>Sem horários disponíveis neste dia para este profissional.</p>
                      <p className="text-xs mt-1">Tente outra data ou profissional.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {horariosDisponiveis.map((h) => (
                        <button
                          key={h}
                          onClick={() => handleSelecionarHorario(h)}
                          className={`py-2 rounded-xl border-2 font-semibold text-sm transition-all duration-150 ${
                            horarioSelecionado === h
                              ? 'bg-[#7c1c2e] border-[#7c1c2e] text-white shadow-md'
                              : 'bg-white border-[#d5cfc4] text-[#2d3b2d] hover:border-[#7c1c2e]'
                          }`}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Seção 4: Resumo + Dados ── */}
              <div ref={resumoRef}>
                <p className="text-[#2d3b2d]/60 text-xs font-bold uppercase tracking-wider mb-3">
                  Resumo
                </p>
                <div className="bg-[#2d3b2d] rounded-xl p-4 text-white text-sm space-y-1.5 mb-4">
                  <div className="flex items-center gap-2">
                    <Scissors size={14} className="text-white/50 flex-shrink-0" />
                    <span className={dataSelecionada ? 'font-semibold' : 'text-white/30 italic'}>
                      {servico.nome}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-white/50 flex-shrink-0" />
                    <span className={barbeiroSelecionado ? 'font-semibold' : 'text-white/30 italic text-xs'}>
                      {barbeiroSelecionado ? `Profissional ${barbeiroSelecionado}` : 'Selecione o profissional'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-white/50 flex-shrink-0" />
                    <span className={dataSelecionada ? 'font-semibold' : 'text-white/30 italic text-xs'}>
                      {dataSelecionada ? formatarDataExibicao(dataSelecionada) : 'Selecione a data'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-white/50 flex-shrink-0" />
                    <span className={horarioSelecionado ? 'font-semibold' : 'text-white/30 italic text-xs'}>
                      {horarioSelecionado || 'Selecione o horário'}
                    </span>
                  </div>
                </div>

                {/* Campos */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[#2d3b2d]/60 text-xs font-semibold block mb-1.5">
                        Nome e sobrenome:
                      </label>
                      <input
                        type="text"
                        value={clienteNome}
                        onChange={(e) => setClienteNome(e.target.value)}
                        placeholder="Nome e sobrenome"
                        className="w-full px-3 py-2.5 rounded-xl border-2 border-[#d5cfc4] bg-white text-[#2d3b2d] placeholder-[#2d3b2d]/30 focus:outline-none focus:border-[#7c1c2e] text-sm transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[#2d3b2d]/60 text-xs font-semibold block mb-1.5">
                        Telefone:
                      </label>
                      <input
                        type="tel"
                        value={clienteTelefone}
                        onChange={(e) => setClienteTelefone(formatarTelefone(e.target.value))}
                        placeholder="(99) 99999-9999"
                        className="w-full px-3 py-2.5 rounded-xl border-2 border-[#d5cfc4] bg-white text-[#2d3b2d] placeholder-[#2d3b2d]/30 focus:outline-none focus:border-[#7c1c2e] text-sm transition-colors"
                      />
                    </div>
                  </div>

                  {erro && (
                    <p className="text-red-600 text-xs font-medium">{erro}</p>
                  )}

                  <button
                    onClick={handleAgendar}
                    disabled={agendando || !podeAgendar}
                    className={`w-full py-3.5 rounded-xl font-bold text-white text-base transition-all duration-200 flex items-center justify-center gap-2 ${
                      podeAgendar && !agendando
                        ? 'bg-[#7c1c2e] hover:bg-[#9b2239] active:scale-[0.98]'
                        : 'bg-[#7c1c2e]/30 cursor-not-allowed'
                    }`}
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
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Tela de Sucesso ───────────────────────────────────────────────────── */
function TelaSucesso({
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
    <div className="flex flex-col items-center text-center px-5 py-8 gap-4">
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
          <span className="text-white/50">Serviço</span>
          <span className="font-semibold">{servico}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/50">Barbeiro</span>
          <span className="font-semibold">{barbeiro}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/50">Data</span>
          <span className="font-semibold">{formatarDataExibicao(data)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/50">Horário</span>
          <span className="font-semibold">{horario}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/50">Cliente</span>
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
