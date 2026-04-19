
The user wants comprehensive technical documentation of the PRECIFIX system to hand off to a dev team. This is a documentation generation task — best delivered as a downloadable file rather than UI.

Format decision: Given it's a handoff document for developers, a **DOCX** file is most appropriate (editable, professional, easy to share, supports TOC, code blocks, tables). I'll generate it via the docx skill.

Content I have from exploration:
- Stack: React 18 + Vite + TS + Tailwind + shadcn-ui + React Query + Zustand + React Router + Framer Motion + jsPDF
- Backend: Lovable Cloud (Supabase) — 7 tables, RLS, edge functions
- Roles: admin, gestor, comercial (separate user_roles table + has_role function)
- Modules: Dashboard, Proposals (single + multi-service), Quick Quote, History, Settings, Auth
- Core engine: Multi-sector pricing (Consulting, Events, Creative, Technology) with duration normalization (days/22, weeks/4.33)
- Service templates system (system + user templates)
- PDF export (single + multi-service, sector-aware design system)
- Email sending via edge function
- Auto-save, version history, draft persistence

# Plano: Documentação Técnica do Sistema PRECIFIX

Vou gerar um documento Word (.docx) profissional e completo para entregar à equipa de DEVs, contendo toda a informação necessária para entender, manter e evoluir o sistema.

## Formato de Entrega
- **Ficheiro:** `PRECIFIX_Documentacao_Tecnica.docx`
- **Localização:** `/mnt/documents/`
- **Idioma:** Português (pt-PT)
- **Estilo:** Profissional, com índice automático, secções numeradas, tabelas e diagramas

## Estrutura do Documento

### 1. Apresentação do Sistema
- Visão geral e propósito (plataforma de precificação multi-sector para Angola)
- Sectores suportados: Consultoria, Eventos, Criativo, Tecnologia
- Público-alvo e casos de uso
- Diferenciais (motor de pricing, multi-serviço, templates, PDFs sector-aware)

### 2. Stack Tecnológica
- Frontend: React 18, Vite 5, TypeScript 5, Tailwind v3, shadcn-ui
- Estado: React Query (server) + Zustand (client) + React Hook Form
- Routing: React Router v6
- Animações: Framer Motion
- PDFs: jsPDF
- Backend: Lovable Cloud (Supabase) — Auth, Postgres, Edge Functions, Storage
- Bibliotecas auxiliares (date-fns, lucide-react, sonner, dnd-kit)

### 3. Arquitectura
- Diagrama em texto (camadas: UI → Hooks → Supabase Client → DB/Edge Functions)
- Fluxo de dados típico (criação de proposta multi-serviço)
- Estrutura de pastas (`src/pages`, `src/components`, `src/hooks`, `src/lib`, `src/types`, `src/contexts`, `src/stores`)

### 4. Módulos e Funcionalidades
Para cada módulo: rota, ficheiros principais, funcionalidades, permissões
- **Auth** (`/auth`) — login, signup, recuperação
- **Dashboard** (`/`) — KPIs, gráficos, tabela recente
- **Nova Proposta** (`/nova-proposta`) — fluxo step-by-step single-service
- **Nova Proposta Multi-Serviço** (`/nova-proposta-multi`) — multi-step com drag-and-drop
- **Orçamento Rápido** (`/orcamento-rapido`)
- **Visualização** (`/proposta/:id`) — diagnóstico, técnico, orçamento + PDF/email
- **Edição** (single + multi)
- **Histórico** (`/historico`)
- **Definições** (`/configuracoes`) — perfil, empresa, branding, utilizadores, templates, pricing, simulador

### 5. Sistema de Permissões (RBAC)
- Tabela `user_roles` separada (segurança)
- Função `has_role()` SECURITY DEFINER
- Roles: `admin`, `gestor`, `comercial`
- Matriz de permissões por funcionalidade
- Hook `useUserRole`

### 6. Motor de Precificação
- Fórmula geral: `(baseCost × complexity) × (1 + overhead) × (1 + margin)`
- Normalização de duração: dias÷22, semanas÷4.33, meses×1
- Cálculos por categoria (consulting, events, creative, technology)
- Parâmetros configuráveis por utilizador (`pricing_parameters`)
- Extras de eventos (drone, slider, streaming, etc.)

### 7. Base de Dados
Tabela por tabela com colunas, defaults, RLS policies e relações:
- `profiles`, `user_roles`, `proposals`, `proposal_services`, `proposal_versions`, `service_templates`, `pricing_parameters`
- Diagrama ER simplificado em texto
- Funções RPC: `has_role`, `get_user_role`

### 8. Edge Functions
- `send-proposal-email` — envio de propostas por email
- `reset-test-passwords` — utilitário de testes
- Configuração em `supabase/config.toml`

### 9. Geração de PDFs
- Sistema de design (`pdfDesignSystem.ts`) com paletas por sector
- 3 documentos: Diagnóstico, Técnico, Orçamento
- Single-service (`pdfExport.ts`) vs Multi-service (`pdfExportMultiService.ts`)
- Branding dinâmico (logo, cores)

### 10. Convenções e Boas Práticas
- TypeScript strict, types em `src/types/`
- Componentes shadcn-ui em `src/components/ui` (não editar)
- Cliente e types Supabase auto-gerados (não editar)
- Centralização: `serviceCategoryConfig.ts`, `statusLabels.ts`, `serviceLabels.ts`
- Auto-save com debounce 3s, drafts em localStorage
- Validações (email, telefone angolano)

### 11. Setup Local
- Pré-requisitos (Node 18+, npm)
- Variáveis de ambiente (auto-geridas via .env)
- Comandos: `npm i`, `npm run dev`, `npm run build`
- Preview e Published URLs

### 12. Roadmap Sugerido / Pontos de Atenção
- Permissões nos botões de acção (ProposalView)
- Optimização de queries (limite 1000 rows)
- Testes automatizados (em falta)
- Internacionalização (pt-AO actual)

## Processo de Execução
1. Criar script Node.js que usa `docx` para gerar o ficheiro
2. Aplicar estilos profissionais (Heading 1/2/3, tabelas, code-style)
3. Incluir índice (TOC) automático
4. Validar o .docx gerado
5. Fazer QA visual: converter para PDF e inspeccionar páginas
6. Entregar via `<lov-artifact>`

Tempo estimado: ~2 minutos de execução.
