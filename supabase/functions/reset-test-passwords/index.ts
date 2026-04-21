import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Test accounts that can be created/reset
const TEST_ACCOUNTS: { email: string; full_name: string }[] = [
  { email: 'aniceto@precifix.pt', full_name: 'Aniceto de Carvalho' },
  { email: 'maria.gestor@precifix.pt', full_name: 'Maria Santos' },
  { email: 'joao.comercial@precifix.pt', full_name: 'João Comercial' },
];

const TEST_PASSWORD = 'teste123';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const results: { email: string; success: boolean; action?: string; error?: string }[] = [];

    // Fetch all users once
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      throw new Error(`Erro ao listar utilizadores: ${listError.message}`);
    }

    for (const account of TEST_ACCOUNTS) {
      const existing = usersData.users.find((u) => u.email === account.email);

      if (!existing) {
        // Create the user with email auto-confirmed
        const { error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: account.email,
          password: TEST_PASSWORD,
          email_confirm: true,
          user_metadata: { full_name: account.full_name },
        });

        if (createError) {
          results.push({ email: account.email, success: false, error: createError.message });
        } else {
          results.push({ email: account.email, success: true, action: 'created' });
        }
      } else {
        // Reset password and ensure email is confirmed
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          existing.id,
          { password: TEST_PASSWORD, email_confirm: true }
        );

        if (updateError) {
          results.push({ email: account.email, success: false, error: updateError.message });
        } else {
          results.push({ email: account.email, success: true, action: 'reset' });
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Utilizadores de teste prontos',
        password: TEST_PASSWORD,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
