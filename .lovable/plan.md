
# Plano: Corrigir Acesso Rápido de Utilizadores de Teste

## Problema Identificado

Na página `/auth`, os botões de "Acesso rápido para testes" preenchem o email mas **deixam o campo de palavra-passe vazio** (`password: ''`), o que impede o login imediato. Os utilizadores `maria.gestor@precifix.pt` e `joao.comercial@precifix.pt` podem nem sequer existir na base de dados, ou ter passwords diferentes de `teste123`.

Existe uma edge function `reset-test-passwords` preparada para repor as passwords desses utilizadores para `teste123`, mas não está a ser invocada em lado nenhum no UI.

## Solução

### 1. Pré-preencher a palavra-passe nos botões de acesso rápido
Em `src/pages/Auth.tsx`, alterar os handlers dos 3 botões de teste para preencherem **email + password (`teste123`)** quando estamos em modo login, permitindo submissão imediata.

- Aniceto (admin): preenche email + `teste123`
- Maria (gestor): preenche email + `teste123`
- João (comercial): preenche email + `teste123`

### 2. Adicionar botão "Repor passwords de teste"
Adicionar um pequeno botão discreto por baixo dos cartões de teste que invoca a edge function `reset-test-passwords` via `supabase.functions.invoke('reset-test-passwords')`. Ao concluir, mostra um toast de sucesso/erro.

Isto resolve o caso em que os utilizadores existem mas têm passwords desactualizadas.

### 3. Garantir que os utilizadores de teste existem
A edge function actual apenas faz `update` de utilizadores existentes. Vou estendê-la para:
- Verificar se cada utilizador de teste existe
- Se não existir, criar via `supabaseAdmin.auth.admin.createUser()` com email confirmado e o `full_name` correcto nos metadados
- Se existir, repor a password para `teste123`

Os utilizadores serão criados sem role atribuída — o admin (Aniceto) terá de atribuir os roles em **Configurações → Utilizadores** depois (já mencionado no UI actual).

### 4. Auto-confirm dos emails de teste
Quando criados via edge function com `email_confirm: true`, ficam imediatamente activos sem necessidade de verificação por email — essencial para acesso rápido em testes.

## Ficheiros a Alterar

- `src/pages/Auth.tsx` — pré-preencher password nos handlers + botão "Repor passwords de teste"
- `supabase/functions/reset-test-passwords/index.ts` — criar utilizadores se não existirem + repor password

## Fluxo de Uso Após Correcção

1. Utilizador abre `/auth` (modo login)
2. Clica em "Repor passwords de teste" (uma vez, se ainda não tiver feito)
3. Toast confirma sucesso
4. Clica num dos 3 cartões → email + password ficam preenchidos
5. Clica "Entrar" → entra imediatamente
6. Para Maria/João, admin atribui role em Configurações
