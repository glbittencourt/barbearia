-- =============================================================
-- Barbearia Scheduling System — Supabase Schema
-- Run this in the Supabase SQL Editor
-- =============================================================

-- Create agendamentos table
CREATE TABLE IF NOT EXISTS agendamentos (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  servico        TEXT NOT NULL,
  barbeiro       TEXT NOT NULL,
  data           DATE NOT NULL,
  horario        TIME NOT NULL,
  cliente_nome   TEXT NOT NULL,
  cliente_telefone TEXT NOT NULL,
  criado_em      TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast availability queries
CREATE INDEX IF NOT EXISTS idx_agendamentos_data_barbeiro
  ON agendamentos (data, barbeiro);

-- Index for client history queries
CREATE INDEX IF NOT EXISTS idx_agendamentos_cliente_telefone
  ON agendamentos (cliente_telefone);

-- =============================================================
-- Row Level Security (RLS)
-- =============================================================

ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- Allow anyone to INSERT (create appointments)
CREATE POLICY "allow_insert" ON agendamentos
  FOR INSERT WITH CHECK (true);

-- Allow anyone to SELECT (needed for availability check and client history)
CREATE POLICY "allow_select" ON agendamentos
  FOR SELECT USING (true);

-- Allow anyone to DELETE (admin uses anon key; for production use service_role)
CREATE POLICY "allow_delete" ON agendamentos
  FOR DELETE USING (true);
