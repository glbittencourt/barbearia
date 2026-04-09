'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Scissors, Calendar, Clock, ChevronRight } from 'lucide-react'
import { SERVICOS } from '@/lib/constants'
import { ModalAgendamento } from '@/components/ModalAgendamento'

type Servico = { nome: string; preco: number; duracao: string }

export default function Home() {
  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(null)

  return (
    <div className="min-h-screen bg-[#2d3b2d] text-white">
      {/* Header */}
      <header className="bg-[#243024] border-b border-[#3d5040] sticky top-0 z-30">
        <div className="max-w-md mx-auto px-5 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#7c1c2e] flex items-center justify-center flex-shrink-0 text-xl">
            💈
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-wide">Barbearia</h1>
            <p className="text-white/50 text-xs">Agende seu horário agora</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-xs font-medium">Aberto</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-md mx-auto px-4 pb-28 pt-5">
        {/* Title */}
        <div className="mb-4">
          <h2 className="text-white text-lg font-bold">Serviços disponíveis</h2>
          <p className="text-white/40 text-sm">Selecione para agendar</p>
        </div>

        {/* Service List */}
        <div className="space-y-2.5">
          {SERVICOS.map((s) => (
            <button
              key={s.nome}
              onClick={() =>
                setServicoSelecionado({ nome: s.nome, preco: s.preco, duracao: s.duracao })
              }
              className="w-full bg-[#f5f0e8] border border-[#e0d8cc] rounded-xl p-4 text-left
                         hover:border-[#7c1c2e] hover:shadow-lg active:scale-[0.99]
                         transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#2d3b2d] text-sm uppercase tracking-wide mb-1">
                    {s.nome}
                  </h3>
                  <p className="text-[#2d3b2d]/50 text-xs mb-2 leading-relaxed line-clamp-2">
                    {s.descricao}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-[#7c1c2e] font-bold text-sm">
                      R$ {s.preco.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="flex items-center gap-1 text-[#2d3b2d]/40 text-xs">
                      <Clock size={11} />
                      {s.duracao}
                    </span>
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  className="text-[#7c1c2e]/40 group-hover:text-[#7c1c2e] transition-colors flex-shrink-0 ml-3"
                />
              </div>
            </button>
          ))}
        </div>

        {/* Info strip */}
        <div className="mt-5 bg-[#243024] border border-[#3d5040] rounded-xl p-4">
          <div className="space-y-2 text-sm text-white/50">
            <div className="flex items-center gap-2">
              <span>🕘</span>
              <span>Segunda a Sábado · 09h às 18h</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📍</span>
              <span>Rua da Barbearia, 123</span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#243024] border-t border-[#3d5040] z-30">
        <div className="max-w-md mx-auto flex">
          <a href="/" className="flex-1 flex flex-col items-center gap-1 py-3 text-[#7c1c2e]">
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
