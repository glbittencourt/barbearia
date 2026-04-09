import { createClient, SupabaseClient } from '@supabase/supabase-js'

export type Agendamento = {
  id: string
  servico: string
  barbeiro: string
  data: string
  horario: string
  cliente_nome: string
  cliente_telefone: string
  criado_em: string
}

let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  _client = createClient(url, key)
  return _client
}
