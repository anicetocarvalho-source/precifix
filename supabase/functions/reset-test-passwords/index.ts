import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Test accounts that can have their passwords reset
const TEST_ACCOUNTS = [
  'aniceto@precifix.pt',
  'maria.gestor@precifix.pt',
  'joao.comercial@precifix.pt',
];

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

    const results: { email: string; success: boolean; error?: string }[] = [];

    for (const email of TEST_ACCOUNTS) {
      // Get user by email
      const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (listError) {
        results.push({ email, success: false, error: listError.message });
        continue;
      }

      const user = users.users.find(u => u.email === email);
      
      if (!user) {
        results.push({ email, success: false, error: 'Utilizador não encontrado' });
        continue;
      }

      // Update password
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { password: 'teste123' }
      );

      if (updateError) {
        results.push({ email, success: false, error: updateError.message });
      } else {
        results.push({ email, success: true });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Reset de passwords concluído',
        results 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
