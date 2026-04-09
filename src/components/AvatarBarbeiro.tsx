'use client'

interface AvatarBarbeiroProps {
  nome: string
  size?: number
}

const CORES: Record<string, string> = {
  Yuri: '#7c1c2e',
  Danrlei: '#2d5c6e',
  Lucas: '#4a6b3a',
  Paucka: '#6b4a2d',
}

export function AvatarBarbeiro({ nome, size = 64 }: AvatarBarbeiroProps) {
  const cor = CORES[nome] || '#555'
  const iniciais = nome.slice(0, 2).toUpperCase()

  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white select-none flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 35% 35%, ${lighten(cor)}, ${cor})`,
        fontSize: size * 0.32,
        boxShadow: `0 2px 8px ${cor}55`,
      }}
    >
      {iniciais}
    </div>
  )
}

function lighten(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const lr = Math.min(255, r + 60)
  const lg = Math.min(255, g + 60)
  const lb = Math.min(255, b + 60)
  return `rgb(${lr},${lg},${lb})`
}
