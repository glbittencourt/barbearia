'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Scissors, Calendar } from 'lucide-react'
import { SERVICOS } from '@/lib/constants'
import { ModalAgendamento } from '@/components/ModalAgendamento'

type Servico = { nome: string; preco: number }

export default function Home() {
  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(null)

  return (
    <div className="min-h-screen bg-[#1e271e] text-white">
      {/* Header */}
      <header className="bg-[#2d3b2d] border-b border-[#3d5040] sticky top-0 z-30">
        <div className="max-w-md mx-auto px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#7c1c2e] flex items-center justify-center flex-shrink-0">
            <span className="text-xl">💈</span>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Barbearia</h1>
            <p className="text-white/50 text-xs">Agende seu horário agora</p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-md mx-auto px-4 pb-28 pt-6">
        {/* Hero */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 bg-[#7c1c2e]/20 border border-[#7c1c2e]/40 rounded-full px-4 py-1.5 mb-3">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-xs font-semibold">Aceitando agendamentos</span>
          </div>
          <h2 className="text-2xl font-bold mb-1">Escolha seu serviço</h2>
          <p className="text-white/50 text-sm">
            Selecione abaixo e agende em menos de 1 minuto
          </p>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-2 gap-3">
          {SERVICOS.map((s) => (
            <button
              key={s.nome}
              onClick={() => setServicoSelecionado({ nome: s.nome, preco: s.preco })}
              className="group relative bg-[#2d3b2d] border border-[#3d5040] rounded-2xl p-4 text-left
                         hover:border-[#7c1c2e] hover:bg-[#35463a] active:scale-[0.97]
                         transition-all duration-200 overflow-hidden"
            >
              {/* Accent glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#7c1c2e]/0 to-[#7c1c2e]/0 group-hover:from-[#7c1c2e]/5 group-hover:to-transparent transition-all duration-300 rounded-2xl" />

              <div className="relative">
                <span className="text-2xl mb-2 block">{s.icone}</span>
                <h3 className="font-bold text-sm leading-tight mb-0.5">{s.nome}</h3>
                <p className="text-white/50 text-xs mb-2">{s.descricao}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[#e8a87c] font-bold text-base">
                    R$ {s.preco}
                  </span>
                  <span className="text-[#7c1c2e] bg-[#7c1c2e]/15 rounded-lg px-2 py-0.5 text-xs font-semibold group-hover:bg-[#7c1c2e] group-hover:text-white transition-all duration-200">
                    Agendar
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Info strip */}
        <div className="mt-6 bg-[#2d3b2d] border border-[#3d5040] rounded-2xl p-4">
          <h3 className="font-semibold text-sm mb-3 text-white/80">Informações</h3>
          <div className="space-y-2 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <span>🕘</span>
              <span>Segunda a Sábado · 09h às 18h</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📍</span>
              <span>Rua da Barbearia, 123</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📱</span>
              <span>Agendamento 100% online</span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#2d3b2d] border-t border-[#3d5040] z-30">
        <div className="max-w-md mx-auto flex">
          <a
            href="/"
            className="flex-1 flex flex-col items-center gap-1 py-3 text-[#7c1c2e]"
          >
            <Scissors size={20} />
            <span className="text-xs font-semibold">Agendar</span>
          </a>
          <a
            href="/historico"
            className="flex-1 flex flex-col items-center gap-1 py-3 text-white/40 hover:text-white/70 transition-colors"
          >
            <Calendar size={20} />
            <span className="text-xs font-semibold">Histórico</span>
          </a>
        </div>
      </nav>

      {/* Modal */}
      {servicoSelecionado && (
        <ModalAgendamento
          servico={servicoSelecionado}
          onClose={() => setServicoSelecionado(null)}
        />
      )}
    </div>
  )
}
