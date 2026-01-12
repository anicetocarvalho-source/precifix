import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ProposalEmailRequest {
  clientEmail: string;
  clientName: string;
  proposalId: string;
  serviceType: string;
  sector: string;
  totalValue: number;
  duration: number;
  deliverables: string[];
  methodology: string;
  senderName?: string;
  customMessage?: string;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 0,
  }).format(value);
};

const getServiceTypeName = (type: string): string => {
  const names: Record<string, string> = {
    pmo: 'PMO & Gestão de Projetos',
    restructuring: 'Reestruturação Organizacional',
    monitoring: 'Monitoria & Avaliação',
    training: 'Formação & Capacitação',
    audit: 'Auditoria Organizacional',
    strategy: 'Planeamento Estratégico',
  };
  return names[type] || type;
};

const getMethodologyName = (methodology: string): string => {
  const names: Record<string, string> = {
    traditional: 'Tradicional (Waterfall)',
    agile: 'Ágil (Scrum/Kanban)',
    hybrid: 'Híbrida',
  };
  return names[methodology] || methodology;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      clientEmail,
      clientName,
      proposalId,
      serviceType,
      sector,
      totalValue,
      duration,
      deliverables,
      methodology,
      senderName = "Equipa Nodix",
      customMessage,
    }: ProposalEmailRequest = await req.json();

    console.log("Sending proposal email to:", clientEmail);

    const deliverablesHtml = deliverables
      .map((d) => `<li style="margin-bottom: 8px;">${d}</li>`)
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #F37021 0%, #e55d0f 100%); padding: 32px; border-radius: 8px 8px 0 0;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                        PRECIFIX
                      </h1>
                      <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                        Sistema de Precificação de Consultoria
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 32px;">
                      <h2 style="margin: 0 0 16px 0; color: #2d3748; font-size: 20px;">
                        Prezado(a) ${clientName},
                      </h2>
                      
                      ${customMessage ? `
                      <p style="margin: 0 0 24px 0; color: #4a5568; line-height: 1.6;">
                        ${customMessage}
                      </p>
                      ` : `
                      <p style="margin: 0 0 24px 0; color: #4a5568; line-height: 1.6;">
                        Temos o prazer de apresentar a nossa proposta de serviços de consultoria para a sua organização.
                      </p>
                      `}
                      
                      <!-- Proposal Summary Box -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f7fafc; border-radius: 8px; margin-bottom: 24px;">
                        <tr>
                          <td style="padding: 24px;">
                            <h3 style="margin: 0 0 16px 0; color: #F37021; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">
                              Resumo da Proposta
                            </h3>
                            
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                              <tr>
                                <td style="padding: 8px 0; color: #718096; font-size: 14px;">Serviço:</td>
                                <td style="padding: 8px 0; color: #2d3748; font-size: 14px; font-weight: 600; text-align: right;">
                                  ${getServiceTypeName(serviceType)}
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; color: #718096; font-size: 14px;">Setor:</td>
                                <td style="padding: 8px 0; color: #2d3748; font-size: 14px; text-align: right;">
                                  ${sector}
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; color: #718096; font-size: 14px;">Metodologia:</td>
                                <td style="padding: 8px 0; color: #2d3748; font-size: 14px; text-align: right;">
                                  ${getMethodologyName(methodology)}
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; color: #718096; font-size: 14px;">Duração:</td>
                                <td style="padding: 8px 0; color: #2d3748; font-size: 14px; text-align: right;">
                                  ${duration} ${duration === 1 ? 'mês' : 'meses'}
                                </td>
                              </tr>
                              <tr>
                                <td colspan="2" style="padding-top: 16px; border-top: 1px solid #e2e8f0;"></td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; color: #2d3748; font-size: 16px; font-weight: 600;">Valor Total:</td>
                                <td style="padding: 8px 0; color: #F37021; font-size: 20px; font-weight: 700; text-align: right;">
                                  ${formatCurrency(totalValue)}
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Deliverables -->
                      <h3 style="margin: 0 0 12px 0; color: #2d3748; font-size: 16px;">
                        Entregáveis Incluídos:
                      </h3>
                      <ul style="margin: 0 0 24px 0; padding-left: 20px; color: #4a5568; line-height: 1.8;">
                        ${deliverablesHtml}
                      </ul>
                      
                      <p style="margin: 0 0 24px 0; color: #4a5568; line-height: 1.6;">
                        Para mais detalhes sobre a proposta completa, incluindo metodologia detalhada, cronograma e equipa proposta, entre em contacto connosco.
                      </p>
                      
                      <!-- CTA Button -->
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td align="center">
                            <a href="mailto:info@nodix.ao?subject=Re: Proposta ${proposalId}" 
                               style="display: inline-block; padding: 14px 32px; background-color: #F37021; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                              Responder a Esta Proposta
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #2d3748; padding: 24px; border-radius: 0 0 8px 8px;">
                      <p style="margin: 0 0 8px 0; color: #ffffff; font-size: 14px; font-weight: 600;">
                        ${senderName}
                      </p>
                      <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                        Nodix Consultoria • Luanda, Angola
                      </p>
                      <p style="margin: 8px 0 0 0; color: #718096; font-size: 11px;">
                        Referência da Proposta: ${proposalId}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "PRECIFIX <onboarding@resend.dev>",
        to: [clientEmail],
        subject: `Proposta de Consultoria - ${getServiceTypeName(serviceType)} | ${clientName}`,
        html: emailHtml,
      }),
    });

    const emailResponse = await res.json();
    
    if (!res.ok) {
      console.error("Resend API error:", emailResponse);
      throw new Error(emailResponse.message || "Failed to send email");
    }

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-proposal-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
