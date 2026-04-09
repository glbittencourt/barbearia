export const SERVICOS = [
  { nome: 'Cabelo', preco: 35, duracao: '60min', icone: '✂️', descricao: 'Corte masculino clássico ou moderno' },
  { nome: 'Barba', preco: 25, duracao: '45min', icone: '🪒', descricao: 'Barba completa com toalha quente' },
  { nome: 'Meia Barba', preco: 20, duracao: '30min', icone: '🧔', descricao: 'Aparar e modelar a barba' },
  { nome: 'Raspagem', preco: 30, duracao: '30min', icone: '⚡', descricao: 'Raspagem total com navalha' },
  { nome: 'Combo Cabelo + Barba', preco: 55, duracao: '90min', icone: '💈', descricao: 'Cabelo e barba completos' },
  { nome: 'Pezinho', preco: 15, duracao: '15min', icone: '✨', descricao: 'Acabamento e alinhamento' },
]

export const BARBEIROS = [
  { nome: 'Yuri', avatar: '/avatars/yuri.png' },
  { nome: 'Danrlei', avatar: '/avatars/danrlei.png' },
  { nome: 'Lucas', avatar: '/avatars/lucas.png' },
  { nome: 'Paucka', avatar: '/avatars/paucka.png' },
]

export const HORARIO_INICIO = 9
export const HORARIO_FIM = 18
export const INTERVALO_MINUTOS = 30

export function gerarHorarios(): string[] {
  const horarios: string[] = []
  for (let h = HORARIO_INICIO; h < HORARIO_FIM; h++) {
    for (let m = 0; m < 60; m += INTERVALO_MINUTOS) {
      horarios.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return horarios
}

export function gerarProximos7Dias(): { data: string; label: string }[] {
  const dias: { data: string; label: string }[] = []
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    const dia = String(d.getDate()).padStart(2, '0')
    const mes = String(d.getMonth() + 1).padStart(2, '0')
    const ano = d.getFullYear()
    const diaSemana = diasSemana[d.getDay()]
    dias.push({
      data: `${ano}-${mes}-${dia}`,
      label: `${dia}/${mes} ${diaSemana}`,
    })
  }
  return dias
}

export function formatarTelefone(valor: string): string {
  const nums = valor.replace(/\D/g, '')
  if (nums.length <= 10) {
    return nums
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }
  return nums
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15)
}

export function formatarDataExibicao(data: string): string {
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}
