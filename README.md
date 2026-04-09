# 💈 Barbearia — Sistema de Agendamento

Site de agendamento mobile-first para barbearia, ideal para usar como **link na bio do Instagram**.

## Stack

- **Next.js 14** (App Router)
- **Tailwind CSS** — tema escuro verde musgo / vinho
- **shadcn/ui** — componentes
- **Supabase** — banco de dados

---

## Funcionalidades

### Área do Cliente (página pública `/`)
- Cards de serviços com preços
- Modal de 4 etapas:
  1. Selecionar data (próximos 7 dias)
  2. Selecionar barbeiro (Yuri, Danrlei, Lucas, Paucka)
  3. Selecionar horário disponível (09h–18h, intervalos de 30 min)
  4. Dados do cliente + resumo
- Salva no Supabase e abre WhatsApp com mensagem pré-preenchida

### Histórico do Cliente (`/historico`)
- Consulta agendamentos pelo número de telefone

### Painel Admin (`/admin`)
- Login com senha simples (hardcoded)
- Visualiza agendamentos do dia atual
- Filtros por data e barbeiro
- Cards de resumo (total, barbeiros, receita estimada)
- Botão para cancelar agendamento
- Aba "Histórico" com agendamentos passados

---

## Configuração do Supabase

### 1. Criar projeto no Supabase
Acesse [supabase.com](https://supabase.com) e crie um novo projeto.

### 2. Criar tabela
No **SQL Editor** do Supabase, execute o conteúdo do arquivo `supabase-schema.sql`:

```sql
-- (veja o arquivo supabase-schema.sql na raiz do projeto)
```

### 3. Pegar as credenciais
Em **Project Settings > API**:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz (já existe como exemplo):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxxx
NEXT_PUBLIC_WHATSAPP_NUMBER=5511999999999
```

> **Atenção:** O número do WhatsApp deve ser no formato internacional **sem** `+` e **sem** espaços.  
> Exemplo: Brasil, DDD 11, número 99999-9999 → `5511999999999`

---

## Executar localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`

---

## Deploy na Vercel

### Opção 1 — Via GitHub (recomendado)

1. Crie um repositório no GitHub e faça push do projeto
2. Acesse [vercel.com](https://vercel.com) e clique em **"Add New Project"**
3. Importe o repositório
4. Na seção **Environment Variables**, adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_WHATSAPP_NUMBER`
5. Clique em **Deploy**

### Opção 2 — Via Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

Quando solicitado, configure as variáveis de ambiente.

---

## Personalização

### Trocar nome da barbearia
Edite `src/app/layout.tsx` (metadata) e `src/app/page.tsx` (header).

### Trocar barbeiros
Edite `src/lib/constants.ts`:
```ts
export const BARBEIROS = [
  { nome: 'Yuri', avatar: '/avatars/yuri.png' },
  // adicione ou remova...
]
```

### Trocar horários de funcionamento
Edite `src/lib/constants.ts`:
```ts
export const HORARIO_INICIO = 9   // 9h
export const HORARIO_FIM = 18     // 18h
export const INTERVALO_MINUTOS = 30
```

### Trocar serviços e preços
Edite o array `SERVICOS` em `src/lib/constants.ts`.

### Trocar senha do admin
Edite `src/app/admin/page.tsx`:
```ts
const SENHA_ADMIN = 'sua_nova_senha'
```

### Cores do tema
As cores principais estão no `tailwind.config.ts` e usadas diretamente nos componentes:
- Fundo escuro: `#1e271e`
- Cards: `#2d3b2d`
- Acento vinho: `#7c1c2e`

---

## Estrutura do Projeto

```
src/
├── app/
│   ├── page.tsx          # Página principal (serviços)
│   ├── historico/
│   │   └── page.tsx      # Histórico do cliente
│   ├── admin/
│   │   └── page.tsx      # Painel admin
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ModalAgendamento.tsx  # Modal com 4 etapas
│   └── AvatarBarbeiro.tsx    # Avatar gerado por iniciais
└── lib/
    ├── supabase.ts        # Cliente Supabase
    ├── constants.ts       # Configurações e helpers
    └── utils.ts           # Utils shadcn
```
