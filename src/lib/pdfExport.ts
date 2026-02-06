import jsPDF from 'jspdf';
import { 
  Proposal, 
  SERVICE_CATEGORIES,
  ServiceCategory,
  EventType,
  CoverageDuration,
  ProjectType,
} from '@/types/proposal';
import { getAllServiceLabels } from '@/lib/serviceLabels';
import { ProposalService } from '@/types/proposalService';
import { formatCurrency, formatNumber } from '@/lib/pricing';
import { DEFAULT_BRANDING } from '@/lib/pdfBranding';

export type DocumentType = 'diagnostic' | 'technical' | 'budget' | 'all';

// Extended labels for all service types
const serviceLabels: Record<string, string> = {
  ...getAllServiceLabels(),
  pmo: 'PMO - Gestao de Portfolio de Projectos',
  restructuring: 'Reestruturacao Organizacional',
  monitoring: 'Acompanhamento e Monitorizacao',
  training: 'Formacao e Capacitacao',
  audit: 'Auditoria de Processos',
  strategy: 'Planeamento Estrategico',
};

const complexityLabels: Record<string, string> = {
  low: 'Baixa',
  medium: 'Media',
  high: 'Alta',
};

const methodologyLabels: Record<string, string> = {
  traditional: 'Tradicional (Waterfall)',
  agile: 'Agil (Scrum/Kanban)',
  hybrid: 'Hibrida',
};

const clientTypeLabels: Record<string, string> = {
  public: 'Instituicao Publica',
  private: 'Empresa Privada',
  ngo: 'Organizacao Nao-Governamental',
  startup: 'Startup',
};

const deliverableLabels: Record<string, string> = {
  reports: 'Relatorios de progresso',
  dashboards: 'Dashboards de acompanhamento',
  kpis: 'Sistema de KPIs',
  schedules: 'Cronogramas actualizados',
  training: 'Sessoes de formacao',
  documentation: 'Documentacao de processos',
};

const eventTypeLabels: Record<EventType, string> = {
  corporate: 'Evento Corporativo',
  wedding: 'Casamento',
  conference: 'Conferencia',
  outdoor: 'Evento ao Ar Livre',
  concert: 'Concerto/Show',
  other: 'Outro',
};

const coverageDurationLabels: Record<CoverageDuration, string> = {
  half_day: 'Meio Dia (4h)',
  full_day: 'Dia Completo (8h)',
  multi_day: 'Multi-Dias',
};

const projectTypeLabels: Record<ProjectType, string> = {
  landing_page: 'Landing Page',
  ecommerce: 'E-Commerce',
  erp: 'Sistema ERP',
  mobile_app: 'Aplicacao Mobile',
  webapp: 'Aplicacao Web',
  api: 'API/Backend',
  other: 'Outro',
};

// Color schemes per sector
const sectorColors: Record<ServiceCategory, { primary: [number, number, number]; secondary: [number, number, number] }> = {
  consulting: { primary: [37, 99, 235], secondary: [59, 130, 246] },
  events: { primary: [220, 38, 38], secondary: [239, 68, 68] },
  creative: { primary: [147, 51, 234], secondary: [168, 85, 247] },
  technology: { primary: [5, 150, 105], secondary: [16, 185, 129] },
};

function getServiceCategory(serviceType: string): ServiceCategory {
  return SERVICE_CATEGORIES[serviceType as keyof typeof SERVICE_CATEGORIES] || 'consulting';
}

function getSectorColor(serviceType: string): { primary: [number, number, number]; secondary: [number, number, number] } {
  const category = getServiceCategory(serviceType);
  return sectorColors[category];
}

function addHeader(doc: jsPDF, title: string, subtitle: string, serviceType?: string) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const colors = serviceType ? getSectorColor(serviceType) : sectorColors.consulting;
  
  // Modern header with gradient effect simulation
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, 42, 'F');
  
  // Accent stripe for modern look
  doc.setFillColor(...colors.secondary);
  doc.rect(0, 42, pageWidth, 3, 'F');
  
  // Decorative geometric element (simple version without opacity)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(255, 255, 255);
  // Small decorative lines instead of transparent triangle
  for (let i = 0; i < 4; i++) {
    doc.setLineWidth(0.5);
    doc.line(pageWidth - 60 + i * 12, 8, pageWidth - 50 + i * 12, 18);
  }
  
  // Title with better typography
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 20, 22);
  
  // Subtitle
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitle, 20, 34);
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
}

function addFooter(doc: jsPDF, pageNumber: number, totalPages?: number, companyName?: string) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Footer line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(20, pageHeight - 18, pageWidth - 20, pageHeight - 18);
  
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  
  const pageText = totalPages ? `Pagina ${pageNumber} de ${totalPages}` : `Pagina ${pageNumber}`;
  doc.text(pageText, pageWidth / 2, pageHeight - 10, { align: 'center' });
  doc.text(new Date().toLocaleDateString('pt-BR'), pageWidth - 20, pageHeight - 10, { align: 'right' });
  
  // Use provided company name or default Precifix branding
  doc.text(companyName || DEFAULT_BRANDING.companyName, 20, pageHeight - 10);
  doc.setTextColor(0, 0, 0);
}

function addSectionTitle(doc: jsPDF, title: string, y: number, serviceType?: string, sectionNumber?: number): number {
  const colors = serviceType ? getSectorColor(serviceType) : sectorColors.consulting;
  
  if (sectionNumber !== undefined) {
    // Circle with number
    doc.setFillColor(...colors.primary);
    doc.circle(26, y - 2, 5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(String(sectionNumber), 26, y, { align: 'center' });
    
    // Title text
    doc.setTextColor(...colors.primary);
    doc.setFontSize(14);
    doc.text(title, 35, y);
  } else {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.primary);
    doc.text(title, 20, y);
  }
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  return y + 10;
}

function addParagraph(doc: jsPDF, text: string, y: number, maxWidth: number = 170): number {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, 20, y);
  return y + (lines.length * 5) + 5;
}

function addBulletPoint(doc: jsPDF, text: string, y: number, serviceType?: string): number {
  const colors = serviceType ? getSectorColor(serviceType) : sectorColors.consulting;
  
  doc.setFontSize(10);
  doc.setFillColor(...colors.primary);
  doc.circle(23, y - 1.5, 1.5, 'F');
  const lines = doc.splitTextToSize(text, 160);
  doc.text(lines, 28, y);
  return y + (lines.length * 5) + 2;
}

function checkPageBreak(doc: jsPDF, currentY: number, requiredSpace: number = 40): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (currentY + requiredSpace > pageHeight - 20) {
    doc.addPage();
    return 50;
  }
  return currentY;
}

function addInfoBox(doc: jsPDF, items: { label: string; value: string }[], y: number, serviceType?: string): number {
  const colors = serviceType ? getSectorColor(serviceType) : sectorColors.consulting;
  const boxWidth = 170;
  const itemHeight = 18;
  const itemsPerRow = 2;
  const itemWidth = boxWidth / itemsPerRow;
  const rows = Math.ceil(items.length / itemsPerRow);
  const boxHeight = rows * itemHeight + 16;
  
  // Box background with subtle color
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, y, boxWidth, boxHeight, 4, 4, 'F');
  
  // Left accent bar
  doc.setFillColor(...colors.primary);
  doc.roundedRect(20, y, 4, boxHeight, 2, 2, 'F');
  
  items.forEach((item, index) => {
    const row = Math.floor(index / itemsPerRow);
    const col = index % itemsPerRow;
    const x = 32 + col * itemWidth;
    const itemY = y + 12 + row * itemHeight;
    
    // Label (uppercase, smaller)
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.setFont('helvetica', 'normal');
    doc.text(item.label.toUpperCase(), x, itemY);
    
    // Value (larger, bold)
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.text(item.value, x, itemY + 8);
    doc.setFont('helvetica', 'normal');
  });
  
  doc.setTextColor(0, 0, 0);
  return y + boxHeight + 12;
}

// ========== DIAGNOSTIC DOCUMENTS ==========

function generateConsultingDiagnostic(doc: jsPDF, proposal: Proposal): void {
  const { formData, pricing } = proposal;
  
  addHeader(doc, 'Diagnostico de Necessidades', `${formData.clientName} - ${serviceLabels[formData.serviceType] || formData.serviceType}`, formData.serviceType);
  
  let y = 50;
  
  // Client Contact Info
  if (formData.clientEmail || formData.clientPhone) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    let contactInfo = 'Contacto: ';
    if (formData.clientEmail && formData.clientPhone) {
      contactInfo += `${formData.clientEmail} | Tel: ${formData.clientPhone}`;
    } else if (formData.clientEmail) {
      contactInfo += formData.clientEmail;
    } else if (formData.clientPhone) {
      contactInfo += `Tel: ${formData.clientPhone}`;
    }
    doc.text(contactInfo, 20, y);
    doc.setTextColor(0, 0, 0);
    y += 10;
  }
  
  // Section 1: Context
  y = addSectionTitle(doc, '1. Contexto e Desafios', y, formData.serviceType);
  
  const contextText = `A ${formData.clientName}, ${clientTypeLabels[formData.clientType] || formData.clientType} do sector de ${formData.sector}, procura apoio especializado para ${serviceLabels[formData.serviceType] || formData.serviceType}.`;
  y = addParagraph(doc, contextText, y);
  
  const locationText = `O projecto envolve ${formData.locations.length} localizacao(oes): ${formData.locations.join(', ')}, com uma complexidade classificada como ${complexityLabels[formData.complexity]?.toLowerCase() || formData.complexity} e maturidade do cliente considerada ${complexityLabels[formData.clientMaturity]?.toLowerCase() || formData.clientMaturity} em termos de gestao de projectos.`;
  y = addParagraph(doc, locationText, y);
  
  y = checkPageBreak(doc, y, 60);
  
  // Section 2: Objectives
  y = addSectionTitle(doc, '2. Objectivos do Projecto', y, formData.serviceType);
  
  const objectives = [
    `Implementar ${serviceLabels[formData.serviceType] || formData.serviceType} ao longo de ${formData.estimatedDuration} meses`,
    `Garantir entregaveis de alta qualidade: ${formData.deliverables.map(d => deliverableLabels[d] || d).join(', ')}`,
    `Utilizar metodologia ${methodologyLabels[formData.methodology] || formData.methodology}`,
    formData.hasExistingTeam ? 'Trabalhar em colaboracao com a equipa existente do cliente' : 'Fornecer equipa completa de consultoria',
  ];
  
  objectives.forEach(obj => {
    y = addBulletPoint(doc, obj, y, formData.serviceType);
  });
  
  y = checkPageBreak(doc, y, 60);
  
  // Section 3: Support Required
  y = addSectionTitle(doc, '3. Tipo de Apoio Necessario', y, formData.serviceType);
  
  y = addInfoBox(doc, [
    { label: 'Equipa Alocada', value: `${pricing.teamMembers.length} profissionais` },
    { label: 'Total de Horas', value: `${formatNumber(pricing.totalHours)} horas` },
    { label: 'Duracao', value: `${formData.estimatedDuration} meses` },
    { label: 'Metodologia', value: methodologyLabels[formData.methodology] || formData.methodology },
  ], y, formData.serviceType);
}

function generateEventsDiagnostic(doc: jsPDF, proposal: Proposal): void {
  const { formData, pricing } = proposal;
  
  addHeader(doc, 'Diagnostico de Necessidades', `${formData.clientName} - ${serviceLabels[formData.serviceType] || 'Cobertura de Evento'}`, formData.serviceType);
  
  let y = 50;
  
  // Client Contact Info
  if (formData.clientEmail || formData.clientPhone) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    let contactInfo = 'Contacto: ';
    if (formData.clientEmail && formData.clientPhone) {
      contactInfo += `${formData.clientEmail} | Tel: ${formData.clientPhone}`;
    } else if (formData.clientEmail) {
      contactInfo += formData.clientEmail;
    } else if (formData.clientPhone) {
      contactInfo += `Tel: ${formData.clientPhone}`;
    }
    doc.text(contactInfo, 20, y);
    doc.setTextColor(0, 0, 0);
    y += 10;
  }
  
  // Section 1: Event Context
  y = addSectionTitle(doc, '1. Contexto do Evento', y, formData.serviceType);
  
  const eventType = formData.eventType ? eventTypeLabels[formData.eventType] : 'Evento';
  const coverageDuration = formData.coverageDuration ? coverageDurationLabels[formData.coverageDuration] : 'A definir';
  
  const contextText = `O cliente ${formData.clientName} necessita de cobertura profissional para um ${eventType.toLowerCase()}, com duracao de ${coverageDuration.toLowerCase()}.`;
  y = addParagraph(doc, contextText, y);
  
  if (formData.eventDate) {
    const dateText = `Data do Evento: ${new Date(formData.eventDate).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
    y = addParagraph(doc, dateText, y);
  }
  
  if (formData.locations.length > 0) {
    const locationText = `Localizacao: ${formData.locations.join(', ')}`;
    y = addParagraph(doc, locationText, y);
  }
  
  y = checkPageBreak(doc, y, 60);
  
  // Section 2: Event Details
  y = addSectionTitle(doc, '2. Detalhes do Evento', y, formData.serviceType);
  
  const eventDetails = [
    { label: 'Tipo de Evento', value: eventType },
    { label: 'Duracao', value: coverageDuration },
    { label: 'Numero de Dias', value: formData.eventDays ? `${formData.eventDays} dia(s)` : '1 dia' },
    { label: 'Complexidade', value: complexityLabels[formData.complexity] || formData.complexity },
  ];
  
  y = addInfoBox(doc, eventDetails, y, formData.serviceType);
  
  y = checkPageBreak(doc, y, 60);
  
  // Section 3: Staffing Requirements
  y = addSectionTitle(doc, '3. Equipa Necessaria', y, formData.serviceType);
  
  if (formData.eventStaffing) {
    const staffing = formData.eventStaffing;
    const staffList = [];
    if (staffing.photographers) staffList.push(`${staffing.photographers} Fotografo(s)`);
    if (staffing.videographers) staffList.push(`${staffing.videographers} Videografo(s)`);
    if (staffing.operators) staffList.push(`${staffing.operators} Operador(es) de Camera`);
    if (staffing.soundTechnicians) staffList.push(`${staffing.soundTechnicians} Tecnico(s) de Som`);
    if (staffing.lightingTechnicians) staffList.push(`${staffing.lightingTechnicians} Tecnico(s) de Iluminacao`);
    if (staffing.editors) staffList.push(`${staffing.editors} Editor(es)`);
    
    staffList.forEach(staff => {
      y = addBulletPoint(doc, staff, y, formData.serviceType);
    });
  } else {
    y = addParagraph(doc, 'Equipa a definir conforme necessidades do evento.', y);
  }
  
  y = checkPageBreak(doc, y, 60);
  
  // Section 4: Equipment/Extras
  if (formData.eventExtras) {
    y = addSectionTitle(doc, '4. Equipamentos Especiais', y, formData.serviceType);
    
    const extras = formData.eventExtras;
    const extrasList = [];
    if (extras.drone) extrasList.push('Drone para captacao aerea');
    if (extras.slider) extrasList.push('Slider para movimentos cinematicos');
    if (extras.crane) extrasList.push('Grua de video');
    if (extras.aerialCrane) extrasList.push('Grua aerea profissional');
    if (extras.specialLighting) extrasList.push('Iluminacao especial');
    if (extras.multicamStreaming) extrasList.push('Streaming multi-camara');
    if (extras.advancedLedLighting) extrasList.push('Iluminacao LED avancada');
    
    if (extrasList.length > 0) {
      extrasList.forEach(extra => {
        y = addBulletPoint(doc, extra, y, formData.serviceType);
      });
    } else {
      y = addParagraph(doc, 'Sem equipamentos especiais adicionais.', y);
    }
  }
  
  // Post-production
  if (formData.includesPostProduction !== undefined) {
    y = checkPageBreak(doc, y, 30);
    y = addSectionTitle(doc, '5. Pos-Producao', y, formData.serviceType);
    y = addParagraph(doc, formData.includesPostProduction ? 'Inclui servicos de edicao e pos-producao de video.' : 'Nao inclui pos-producao - apenas captacao bruta.', y);
  }
}

function generateCreativeDiagnostic(doc: jsPDF, proposal: Proposal): void {
  const { formData, pricing } = proposal;
  
  addHeader(doc, 'Diagnostico de Necessidades', `${formData.clientName} - ${serviceLabels[formData.serviceType] || 'Servico Criativo'}`, formData.serviceType);
  
  let y = 50;
  
  // Client Contact Info
  if (formData.clientEmail || formData.clientPhone) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    let contactInfo = 'Contacto: ';
    if (formData.clientEmail && formData.clientPhone) {
      contactInfo += `${formData.clientEmail} | Tel: ${formData.clientPhone}`;
    } else if (formData.clientEmail) {
      contactInfo += formData.clientEmail;
    } else if (formData.clientPhone) {
      contactInfo += `Tel: ${formData.clientPhone}`;
    }
    doc.text(contactInfo, 20, y);
    doc.setTextColor(0, 0, 0);
    y += 10;
  }
  
  // Section 1: Creative Context
  y = addSectionTitle(doc, '1. Contexto Criativo', y, formData.serviceType);
  
  const contextText = `O cliente ${formData.clientName}, do sector ${formData.sector}, necessita de servicos de ${serviceLabels[formData.serviceType] || formData.serviceType} para fortalecer a sua presenca visual e comunicacao.`;
  y = addParagraph(doc, contextText, y);
  
  y = checkPageBreak(doc, y, 60);
  
  // Section 2: Design Requirements
  if (formData.designData) {
    y = addSectionTitle(doc, '2. Requisitos do Projecto', y, formData.serviceType);
    
    const designData = formData.designData;
    const requirements = [
      { label: 'Conceitos Iniciais', value: `${designData.numberOfConcepts || 3} conceitos` },
      { label: 'Rondas de Revisao', value: `${designData.numberOfRevisions || 2} revisoes` },
      { label: 'Manual de Marca', value: designData.includesBrandGuidelines ? 'Sim' : 'Nao' },
      { label: 'Complexidade', value: complexityLabels[formData.complexity] || formData.complexity },
    ];
    
    y = addInfoBox(doc, requirements, y, formData.serviceType);
    
    if (designData.deliverableFormats && designData.deliverableFormats.length > 0) {
      y = checkPageBreak(doc, y, 40);
      y = addSectionTitle(doc, '3. Formatos de Entrega', y, formData.serviceType);
      designData.deliverableFormats.forEach(format => {
        y = addBulletPoint(doc, format, y, formData.serviceType);
      });
    }
  } else {
    y = addSectionTitle(doc, '2. Escopo do Projecto', y, formData.serviceType);
    
    const scopeDetails = [
      { label: 'Duracao Estimada', value: `${formData.estimatedDuration} meses` },
      { label: 'Complexidade', value: complexityLabels[formData.complexity] || formData.complexity },
      { label: 'Equipa Cliente', value: formData.hasExistingTeam ? 'Existente' : 'Nova' },
      { label: 'Metodologia', value: methodologyLabels[formData.methodology] || formData.methodology },
    ];
    
    y = addInfoBox(doc, scopeDetails, y, formData.serviceType);
  }
  
  y = checkPageBreak(doc, y, 40);
  
  // Section 3/4: Deliverables
  y = addSectionTitle(doc, formData.designData ? '4. Entregaveis' : '3. Entregaveis', y, formData.serviceType);
  
  if (formData.deliverables.length > 0) {
    formData.deliverables.forEach(d => {
      y = addBulletPoint(doc, deliverableLabels[d] || d, y, formData.serviceType);
    });
  } else {
    y = addParagraph(doc, 'Entregaveis a definir em fase de planeamento.', y);
  }
}

function generateTechnologyDiagnostic(doc: jsPDF, proposal: Proposal): void {
  const { formData, pricing } = proposal;
  
  addHeader(doc, 'Diagnostico de Necessidades', `${formData.clientName} - ${serviceLabels[formData.serviceType] || 'Desenvolvimento'}`, formData.serviceType);
  
  let y = 50;
  
  // Client Contact Info
  if (formData.clientEmail || formData.clientPhone) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    let contactInfo = 'Contacto: ';
    if (formData.clientEmail && formData.clientPhone) {
      contactInfo += `${formData.clientEmail} | Tel: ${formData.clientPhone}`;
    } else if (formData.clientEmail) {
      contactInfo += formData.clientEmail;
    } else if (formData.clientPhone) {
      contactInfo += `Tel: ${formData.clientPhone}`;
    }
    doc.text(contactInfo, 20, y);
    doc.setTextColor(0, 0, 0);
    y += 10;
  }
  
  // Section 1: Technology Context
  y = addSectionTitle(doc, '1. Contexto Tecnologico', y, formData.serviceType);
  
  const projectType = formData.webSystemsData?.projectType ? projectTypeLabels[formData.webSystemsData.projectType] : 'Sistema';
  const contextText = `O cliente ${formData.clientName} necessita do desenvolvimento de ${projectType} para optimizar os seus processos e operacoes.`;
  y = addParagraph(doc, contextText, y);
  
  y = checkPageBreak(doc, y, 60);
  
  // Section 2: Project Specifications
  if (formData.webSystemsData) {
    y = addSectionTitle(doc, '2. Especificacoes do Projecto', y, formData.serviceType);
    
    const webData = formData.webSystemsData;
    const specs = [
      { label: 'Tipo de Projecto', value: projectType },
      { label: 'Numero de Paginas', value: webData.numberOfPages ? `${webData.numberOfPages} paginas` : 'A definir' },
      { label: 'Numero de Modulos', value: webData.numberOfModules ? `${webData.numberOfModules} modulos` : 'A definir' },
      { label: 'Complexidade', value: complexityLabels[formData.complexity] || formData.complexity },
    ];
    
    y = addInfoBox(doc, specs, y, formData.serviceType);
    
    // Integrations
    y = checkPageBreak(doc, y, 60);
    y = addSectionTitle(doc, '3. Integracoes', y, formData.serviceType);
    
    const integrations = [];
    if (webData.hasPaymentIntegration) integrations.push('Integracao de Pagamentos (gateway)');
    if (webData.hasCrmIntegration) integrations.push('Integracao com CRM');
    if (webData.hasErpIntegration) integrations.push('Integracao com ERP');
    
    if (integrations.length > 0) {
      integrations.forEach(integration => {
        y = addBulletPoint(doc, integration, y, formData.serviceType);
      });
    } else {
      y = addParagraph(doc, 'Sem integracoes externas previstas.', y);
    }
    
    // Maintenance
    if (webData.hasMaintenanceSupport) {
      y = checkPageBreak(doc, y, 40);
      y = addSectionTitle(doc, '4. Suporte e Manutencao', y, formData.serviceType);
      y = addParagraph(doc, `Inclui ${webData.maintenanceMonths || 6} meses de suporte tecnico e manutencao apos entrega.`, y);
    }
  } else {
    y = addSectionTitle(doc, '2. Escopo do Projecto', y, formData.serviceType);
    
    const scopeDetails = [
      { label: 'Duracao Estimada', value: `${formData.estimatedDuration} meses` },
      { label: 'Complexidade', value: complexityLabels[formData.complexity] || formData.complexity },
      { label: 'Metodologia', value: methodologyLabels[formData.methodology] || formData.methodology },
      { label: 'Equipa Cliente', value: formData.hasExistingTeam ? 'Existente' : 'Nova' },
    ];
    
    y = addInfoBox(doc, scopeDetails, y, formData.serviceType);
  }
}

function generateDiagnosticDocument(doc: jsPDF, proposal: Proposal): void {
  const category = getServiceCategory(proposal.formData.serviceType);
  
  switch (category) {
    case 'events':
      generateEventsDiagnostic(doc, proposal);
      break;
    case 'creative':
      generateCreativeDiagnostic(doc, proposal);
      break;
    case 'technology':
      generateTechnologyDiagnostic(doc, proposal);
      break;
    default:
      generateConsultingDiagnostic(doc, proposal);
  }
}

// ========== TECHNICAL DOCUMENTS ==========

function generateConsultingTechnical(doc: jsPDF, proposal: Proposal): void {
  const { formData, pricing } = proposal;
  
  addHeader(doc, 'Proposta Tecnica', `Referencia: PT-${proposal.id.slice(0, 8).toUpperCase()}`, formData.serviceType);
  
  let y = 50;
  
  // Scope
  y = addSectionTitle(doc, 'Escopo Detalhado', y, formData.serviceType);
  const scopeText = `${serviceLabels[formData.serviceType] || formData.serviceType} para ${formData.clientName}, abrangendo ${formData.locations.join(', ')}, com duracao de ${formData.estimatedDuration} meses e metodologia ${methodologyLabels[formData.methodology]?.toLowerCase() || formData.methodology}.`;
  y = addParagraph(doc, scopeText, y);
  
  y = checkPageBreak(doc, y, 50);
  
  // Methodology
  y = addSectionTitle(doc, 'Metodologia', y, formData.serviceType);
  
  const methodologyDesc = formData.methodology === 'traditional' 
    ? 'Abordagem sequencial com fases bem definidas, ideal para projectos com escopo estavel.'
    : formData.methodology === 'agile'
    ? 'Abordagem iterativa com entregas incrementais, ideal para projectos com requisitos evolutivos.'
    : 'Combinacao de metodos tradicionais para planeamento macro e ageis para execucao, oferecendo flexibilidade.';
  
  doc.setFont('helvetica', 'bold');
  doc.text(methodologyLabels[formData.methodology] || formData.methodology, 20, y);
  doc.setFont('helvetica', 'normal');
  y += 6;
  y = addParagraph(doc, methodologyDesc, y);
  
  y = checkPageBreak(doc, y, 80);
  
  // Deliverables by Phase
  y = addSectionTitle(doc, 'Entregaveis por Fase', y, formData.serviceType);
  
  const phases = [
    { phase: 'Fase 1 - Diagnostico', items: ['Analise de situacao actual', 'Identificacao de gaps', 'Relatorio de diagnostico'] },
    { phase: 'Fase 2 - Planeamento', items: ['Plano de projecto detalhado', 'Cronograma', 'Matriz RACI'] },
    { phase: 'Fase 3 - Implementacao', items: formData.deliverables.map(d => deliverableLabels[d] || d) },
    { phase: 'Fase 4 - Encerramento', items: ['Relatorio final', 'Licoes aprendidas', 'Transferencia de conhecimento'] },
  ];
  
  phases.forEach(phase => {
    y = checkPageBreak(doc, y, 30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(phase.phase, 20, y);
    doc.setFont('helvetica', 'normal');
    y += 6;
    
    phase.items.forEach(item => {
      doc.setFontSize(10);
      doc.text(`• ${item}`, 25, y);
      y += 5;
    });
    y += 3;
  });
  
  y = checkPageBreak(doc, y, 60);
  
  // Team
  y = addSectionTitle(doc, 'Equipa Alocada', y, formData.serviceType);
  y = addTeamTable(doc, pricing.teamMembers, y, formData.serviceType);
}

function generateEventsTechnical(doc: jsPDF, proposal: Proposal): void {
  const { formData, pricing } = proposal;
  
  addHeader(doc, 'Proposta Tecnica', `Referencia: PT-${proposal.id.slice(0, 8).toUpperCase()}`, formData.serviceType);
  
  let y = 50;
  
  const eventType = formData.eventType ? eventTypeLabels[formData.eventType] : 'Evento';
  
  // Event Summary
  y = addSectionTitle(doc, 'Resumo do Servico', y, formData.serviceType);
  const summaryText = `Cobertura profissional de ${eventType.toLowerCase()} para ${formData.clientName}, incluindo ${serviceLabels[formData.serviceType] || formData.serviceType}.`;
  y = addParagraph(doc, summaryText, y);
  
  y = checkPageBreak(doc, y, 80);
  
  // Phases
  y = addSectionTitle(doc, 'Fases do Servico', y, formData.serviceType);
  
  const eventPhases = [
    { 
      phase: 'Pre-Producao', 
      items: [
        'Reuniao de briefing com cliente',
        'Visita tecnica ao local',
        'Planeamento de angulos e cenarios',
        'Preparacao de equipamento',
      ] 
    },
    { 
      phase: 'Execucao (Dia do Evento)', 
      items: [
        'Montagem de equipamento',
        `Cobertura durante ${formData.coverageDuration ? coverageDurationLabels[formData.coverageDuration] : 'evento completo'}`,
        'Captacao multi-angulo',
        'Backup em tempo real',
      ] 
    },
  ];
  
  if (formData.includesPostProduction) {
    eventPhases.push({
      phase: 'Pos-Producao',
      items: [
        'Seleccao de melhores takes',
        'Edicao profissional',
        'Correcao de cor',
        'Entrega em formatos acordados',
      ]
    });
  }
  
  eventPhases.forEach(phase => {
    y = checkPageBreak(doc, y, 35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(phase.phase, 20, y);
    doc.setFont('helvetica', 'normal');
    y += 6;
    
    phase.items.forEach(item => {
      y = addBulletPoint(doc, item, y, formData.serviceType);
    });
    y += 3;
  });
  
  y = checkPageBreak(doc, y, 60);
  
  // Equipment
  if (formData.eventExtras) {
    y = addSectionTitle(doc, 'Equipamentos', y, formData.serviceType);
    
    const equipmentList = ['Cameras profissionais', 'Objectivas variadas', 'Iluminacao portatil'];
    const extras = formData.eventExtras;
    
    if (extras.drone) equipmentList.push('Drone DJI com camera 4K');
    if (extras.slider) equipmentList.push('Slider motorizado');
    if (extras.crane) equipmentList.push('Grua de video');
    if (extras.aerialCrane) equipmentList.push('Grua aerea profissional');
    if (extras.multicamStreaming) equipmentList.push('Kit de streaming multi-camara');
    if (extras.advancedLedLighting) equipmentList.push('Sistema de iluminacao LED RGB');
    
    equipmentList.forEach(equip => {
      y = addBulletPoint(doc, equip, y, formData.serviceType);
    });
  }
  
  y = checkPageBreak(doc, y, 60);
  
  // Team
  y = addSectionTitle(doc, 'Equipa Alocada', y, formData.serviceType);
  y = addTeamTable(doc, pricing.teamMembers, y, formData.serviceType);
}

function generateCreativeTechnical(doc: jsPDF, proposal: Proposal): void {
  const { formData, pricing } = proposal;
  
  addHeader(doc, 'Proposta Tecnica', `Referencia: PT-${proposal.id.slice(0, 8).toUpperCase()}`, formData.serviceType);
  
  let y = 50;
  
  // Creative Summary
  y = addSectionTitle(doc, 'Resumo do Projecto', y, formData.serviceType);
  const summaryText = `Desenvolvimento de ${serviceLabels[formData.serviceType] || formData.serviceType} para ${formData.clientName}, com foco em qualidade visual e alinhamento com a identidade da marca.`;
  y = addParagraph(doc, summaryText, y);
  
  y = checkPageBreak(doc, y, 80);
  
  // Creative Process
  y = addSectionTitle(doc, 'Processo Criativo', y, formData.serviceType);
  
  const creativePhases = [
    { 
      phase: 'Imersao e Pesquisa', 
      items: [
        'Analise da marca e mercado',
        'Pesquisa de tendencias',
        'Definicao de direcao criativa',
      ] 
    },
    { 
      phase: 'Concepcao', 
      items: [
        `Desenvolvimento de ${formData.designData?.numberOfConcepts || 3} conceitos iniciais`,
        'Apresentacao e discussao',
        'Seleccao de conceito final',
      ] 
    },
    { 
      phase: 'Refinamento', 
      items: [
        `${formData.designData?.numberOfRevisions || 2} rondas de revisao`,
        'Ajustes finos',
        'Aprovacao final',
      ] 
    },
    { 
      phase: 'Entrega', 
      items: [
        'Preparacao de ficheiros finais',
        formData.designData?.includesBrandGuidelines ? 'Manual de aplicacao de marca' : 'Guia de utilizacao basico',
        'Entrega em multiplos formatos',
      ] 
    },
  ];
  
  creativePhases.forEach(phase => {
    y = checkPageBreak(doc, y, 35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(phase.phase, 20, y);
    doc.setFont('helvetica', 'normal');
    y += 6;
    
    phase.items.forEach(item => {
      y = addBulletPoint(doc, item, y, formData.serviceType);
    });
    y += 3;
  });
  
  y = checkPageBreak(doc, y, 60);
  
  // Deliverable Formats
  if (formData.designData?.deliverableFormats && formData.designData.deliverableFormats.length > 0) {
    y = addSectionTitle(doc, 'Formatos de Entrega', y, formData.serviceType);
    formData.designData.deliverableFormats.forEach(format => {
      y = addBulletPoint(doc, format, y, formData.serviceType);
    });
  }
  
  y = checkPageBreak(doc, y, 60);
  
  // Team
  y = addSectionTitle(doc, 'Equipa Criativa', y, formData.serviceType);
  y = addTeamTable(doc, pricing.teamMembers, y, formData.serviceType);
}

function generateTechnologyTechnical(doc: jsPDF, proposal: Proposal): void {
  const { formData, pricing } = proposal;
  
  addHeader(doc, 'Proposta Tecnica', `Referencia: PT-${proposal.id.slice(0, 8).toUpperCase()}`, formData.serviceType);
  
  let y = 50;
  
  const projectType = formData.webSystemsData?.projectType ? projectTypeLabels[formData.webSystemsData.projectType] : 'Sistema';
  
  // Technology Summary
  y = addSectionTitle(doc, 'Resumo do Projecto', y, formData.serviceType);
  const summaryText = `Desenvolvimento de ${projectType} para ${formData.clientName}, utilizando tecnologias modernas e melhores praticas de desenvolvimento.`;
  y = addParagraph(doc, summaryText, y);
  
  y = checkPageBreak(doc, y, 80);
  
  // Development Phases
  y = addSectionTitle(doc, 'Fases de Desenvolvimento', y, formData.serviceType);
  
  const devPhases = [
    { 
      phase: 'Analise e Planeamento', 
      items: [
        'Levantamento de requisitos',
        'Definicao de arquitectura',
        'Wireframes e prototipos',
        'Planeamento de sprints',
      ] 
    },
    { 
      phase: 'Desenvolvimento', 
      items: [
        `Desenvolvimento de ${formData.webSystemsData?.numberOfPages || 'N'} paginas/ecras`,
        `Implementacao de ${formData.webSystemsData?.numberOfModules || 'N'} modulos`,
        'Integracao de APIs',
        'Testes unitarios',
      ] 
    },
    { 
      phase: 'Testes e QA', 
      items: [
        'Testes de integracao',
        'Testes de usabilidade',
        'Correcao de bugs',
        'Optimizacao de performance',
      ] 
    },
    { 
      phase: 'Deploy e Formacao', 
      items: [
        'Configuracao de ambiente',
        'Deploy em producao',
        'Formacao de utilizadores',
        'Documentacao tecnica',
      ] 
    },
  ];
  
  devPhases.forEach(phase => {
    y = checkPageBreak(doc, y, 35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(phase.phase, 20, y);
    doc.setFont('helvetica', 'normal');
    y += 6;
    
    phase.items.forEach(item => {
      y = addBulletPoint(doc, item, y, formData.serviceType);
    });
    y += 3;
  });
  
  y = checkPageBreak(doc, y, 60);
  
  // Integrations
  if (formData.webSystemsData) {
    const webData = formData.webSystemsData;
    const hasIntegrations = webData.hasPaymentIntegration || webData.hasCrmIntegration || webData.hasErpIntegration;
    
    if (hasIntegrations) {
      y = addSectionTitle(doc, 'Integracoes', y, formData.serviceType);
      if (webData.hasPaymentIntegration) y = addBulletPoint(doc, 'Gateway de Pagamentos (Stripe, PayPal, etc.)', y, formData.serviceType);
      if (webData.hasCrmIntegration) y = addBulletPoint(doc, 'Sistema CRM (Salesforce, HubSpot, etc.)', y, formData.serviceType);
      if (webData.hasErpIntegration) y = addBulletPoint(doc, 'Sistema ERP', y, formData.serviceType);
    }
  }
  
  y = checkPageBreak(doc, y, 60);
  
  // Team
  y = addSectionTitle(doc, 'Equipa Tecnica', y, formData.serviceType);
  y = addTeamTable(doc, pricing.teamMembers, y, formData.serviceType);
  
  // Maintenance
  if (formData.webSystemsData?.hasMaintenanceSupport) {
    y = checkPageBreak(doc, y, 50);
    y = addSectionTitle(doc, 'Suporte Pos-Entrega', y, formData.serviceType);
    y = addParagraph(doc, `Este projecto inclui ${formData.webSystemsData.maintenanceMonths || 6} meses de suporte tecnico e manutencao, incluindo:`, y);
    y = addBulletPoint(doc, 'Correcao de bugs', y, formData.serviceType);
    y = addBulletPoint(doc, 'Actualizacoes de seguranca', y, formData.serviceType);
    y = addBulletPoint(doc, 'Suporte tecnico via email/chat', y, formData.serviceType);
    y = addBulletPoint(doc, 'Pequenas melhorias (ate 2h/mes)', y, formData.serviceType);
  }
}

function addTeamTable(doc: jsPDF, teamMembers: { role: string; dedication: number; hoursPerMonth: number }[], y: number, serviceType?: string): number {
  const colors = serviceType ? getSectorColor(serviceType) : sectorColors.consulting;
  
  // Table header
  doc.setFillColor(...colors.primary);
  doc.rect(20, y, 170, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Perfil', 25, y + 5.5);
  doc.text('Dedicacao', 100, y + 5.5);
  doc.text('Horas/Mes', 140, y + 5.5);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  y += 8;
  
  teamMembers.forEach((member, index) => {
    y = checkPageBreak(doc, y, 10);
    
    if (index % 2 === 0) {
      doc.setFillColor(248, 248, 248);
      doc.rect(20, y, 170, 7, 'F');
    }
    
    doc.setFontSize(9);
    doc.text(member.role, 25, y + 5);
    doc.text(`${member.dedication}%`, 100, y + 5);
    doc.text(`${member.hoursPerMonth}h`, 140, y + 5);
    y += 7;
  });
  
  return y + 5;
}

function generateTechnicalDocument(doc: jsPDF, proposal: Proposal): void {
  const category = getServiceCategory(proposal.formData.serviceType);
  
  switch (category) {
    case 'events':
      generateEventsTechnical(doc, proposal);
      break;
    case 'creative':
      generateCreativeTechnical(doc, proposal);
      break;
    case 'technology':
      generateTechnologyTechnical(doc, proposal);
      break;
    default:
      generateConsultingTechnical(doc, proposal);
  }
}

// ========== BUDGET DOCUMENTS ==========

function generateBudgetDocument(doc: jsPDF, proposal: Proposal): void {
  const { formData, pricing } = proposal;
  const colors = getSectorColor(formData.serviceType);
  
  addHeader(doc, 'Proposta Orcamental', `${formData.clientName}`, formData.serviceType);
  
  let y = 50;
  
  // Client Contact Info
  if (formData.clientEmail || formData.clientPhone) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    let contactInfo = 'Contacto: ';
    if (formData.clientEmail && formData.clientPhone) {
      contactInfo += `${formData.clientEmail} | Tel: ${formData.clientPhone}`;
    } else if (formData.clientEmail) {
      contactInfo += formData.clientEmail;
    } else if (formData.clientPhone) {
      contactInfo += `Tel: ${formData.clientPhone}`;
    }
    doc.text(contactInfo, 20, y);
    doc.setTextColor(0, 0, 0);
    y += 10;
  }
  
  // Cost Breakdown
  y = addSectionTitle(doc, 'Decomposicao de Custos por Perfil', y, formData.serviceType);
  
  // Table header
  doc.setFillColor(...colors.primary);
  doc.rect(20, y, 170, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Perfil', 25, y + 5.5);
  doc.text('Horas', 90, y + 5.5);
  doc.text('Taxa/Hora', 120, y + 5.5);
  doc.text('Subtotal', 155, y + 5.5);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  y += 8;
  
  pricing.teamMembers.forEach((member, index) => {
    y = checkPageBreak(doc, y, 10);
    
    if (index % 2 === 0) {
      doc.setFillColor(248, 248, 248);
      doc.rect(20, y, 170, 7, 'F');
    }
    
    const totalHours = member.hoursPerMonth * formData.estimatedDuration;
    const subtotal = member.hourlyRate * member.hoursPerMonth * formData.estimatedDuration;
    
    doc.setFontSize(9);
    doc.text(member.role.substring(0, 30), 25, y + 5);
    doc.text(`${formatNumber(totalHours)}h`, 90, y + 5);
    doc.text(formatCurrency(member.hourlyRate), 120, y + 5);
    doc.text(formatCurrency(subtotal), 155, y + 5);
    y += 7;
  });
  
  // Extras (for events)
  if (pricing.extras && pricing.extras.length > 0) {
    y += 10;
    y = checkPageBreak(doc, y, 60);
    y = addSectionTitle(doc, 'Equipamentos e Extras', y, formData.serviceType);
    
    // Extras table header
    doc.setFillColor(...colors.primary);
    doc.rect(20, y, 170, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Item', 25, y + 5.5);
    doc.text('Qtd', 110, y + 5.5);
    doc.text('Preco Unit.', 130, y + 5.5);
    doc.text('Subtotal', 155, y + 5.5);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    y += 8;
    
    pricing.extras.forEach((extra, index) => {
      y = checkPageBreak(doc, y, 10);
      
      if (index % 2 === 0) {
        doc.setFillColor(248, 248, 248);
        doc.rect(20, y, 170, 7, 'F');
      }
      
      doc.setFontSize(9);
      doc.text(extra.name.substring(0, 35), 25, y + 5);
      doc.text(`${extra.quantity}`, 110, y + 5);
      doc.text(formatCurrency(extra.unitPrice), 130, y + 5);
      doc.text(formatCurrency(extra.total), 155, y + 5);
      y += 7;
    });
    
    // Extras subtotal
    y += 3;
    doc.setFont('helvetica', 'bold');
    doc.text('Subtotal Extras:', 100, y + 5);
    doc.text(formatCurrency(pricing.extrasTotal || 0), 155, y + 5);
    doc.setFont('helvetica', 'normal');
    y += 10;
  }
  
  y += 10;
  y = checkPageBreak(doc, y, 80);
  
  // Financial Summary
  y = addSectionTitle(doc, 'Resumo Financeiro', y, formData.serviceType);
  
  const financialItems = [
    { label: 'Custo Base (Equipa)', value: formatCurrency(pricing.baseCost) },
  ];
  
  if (pricing.extrasTotal && pricing.extrasTotal > 0) {
    financialItems.push({ label: 'Custo Extras', value: formatCurrency(pricing.extrasTotal) });
  }
  
  financialItems.push(
    { label: `Multiplicador Complexidade (${pricing.complexityMultiplier}x)`, value: formatCurrency((pricing.baseCost + (pricing.extrasTotal || 0)) * pricing.complexityMultiplier) },
    { label: 'Overhead Operacional (15%)', value: formatCurrency(pricing.overhead) },
    { label: 'Margem (25%)', value: formatCurrency(pricing.margin) },
  );
  
  financialItems.forEach((item, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(248, 248, 248);
      doc.rect(20, y, 170, 7, 'F');
    }
    doc.setFontSize(10);
    doc.text(item.label, 25, y + 5);
    doc.text(item.value, 160, y + 5, { align: 'right' });
    y += 7;
  });
  
  // Total
  y += 3;
  doc.setFillColor(...colors.primary);
  doc.rect(20, y, 170, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('VALOR TOTAL DO PROJECTO', 25, y + 8);
  doc.text(formatCurrency(pricing.finalPrice), 160, y + 8, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  
  y += 25;
  y = checkPageBreak(doc, y, 60);
  
  // Payment Model
  y = addSectionTitle(doc, 'Modelo de Pagamento', y, formData.serviceType);
  
  const category = getServiceCategory(formData.serviceType);
  
  let payments;
  if (category === 'events') {
    payments = [
      { phase: 'Reserva/Confirmacao', percent: 50 },
      { phase: 'Dia do Evento', percent: 30 },
      { phase: 'Entrega Final', percent: 20 },
    ];
  } else if (category === 'creative') {
    payments = [
      { phase: 'Inicio do Projecto', percent: 40 },
      { phase: 'Aprovacao de Conceito', percent: 30 },
      { phase: 'Entrega Final', percent: 30 },
    ];
  } else if (category === 'technology') {
    payments = [
      { phase: 'Kickoff', percent: 30 },
      { phase: 'Milestone 1 (50% funcionalidades)', percent: 30 },
      { phase: 'Milestone 2 (Beta)', percent: 25 },
      { phase: 'Entrega Final', percent: 15 },
    ];
  } else {
    payments = [
      { phase: 'Assinatura do Contrato', percent: 20 },
      { phase: 'Conclusao Fase 1-2', percent: 30 },
      { phase: 'Conclusao Fase 3', percent: 30 },
      { phase: 'Encerramento', percent: 20 },
    ];
  }
  
  payments.forEach((payment, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(248, 248, 248);
      doc.rect(20, y, 170, 7, 'F');
    }
    doc.setFontSize(10);
    doc.text(payment.phase, 25, y + 5);
    doc.text(`${payment.percent}%`, 120, y + 5);
    doc.text(formatCurrency(pricing.finalPrice * (payment.percent / 100)), 160, y + 5, { align: 'right' });
    y += 7;
  });
  
  // Validity
  y += 15;
  y = checkPageBreak(doc, y, 30);
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Esta proposta e valida por 30 dias a partir da data de emissao.', 20, y);
  doc.text('Valores em Kwanzas (Kz). Impostos nao incluidos.', 20, y + 5);
  doc.setTextColor(0, 0, 0);
}

// ========== MULTI-SERVICE BUDGET ==========

function generateMultiServiceBudgetDocument(doc: jsPDF, proposal: Proposal, services: ProposalService[]): void {
  const { formData } = proposal;
  const colors = getSectorColor(formData.serviceType);
  
  addHeader(doc, 'Proposta Orcamental', `${formData.clientName} - Multi-Servicos`, formData.serviceType);
  
  let y = 50;
  
  // Client Contact Info
  if (formData.clientEmail || formData.clientPhone) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    let contactInfo = 'Contacto: ';
    if (formData.clientEmail && formData.clientPhone) {
      contactInfo += `${formData.clientEmail} | Tel: ${formData.clientPhone}`;
    } else if (formData.clientEmail) {
      contactInfo += formData.clientEmail;
    } else if (formData.clientPhone) {
      contactInfo += `Tel: ${formData.clientPhone}`;
    }
    doc.text(contactInfo, 20, y);
    doc.setTextColor(0, 0, 0);
    y += 10;
  }
  
  // Services Summary
  y = addSectionTitle(doc, `Servicos Incluidos (${services.length})`, y, formData.serviceType);
  
  // Services table header
  doc.setFillColor(...colors.primary);
  doc.rect(20, y, 170, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Servico', 25, y + 5.5);
  doc.text('Complexidade', 90, y + 5.5);
  doc.text('Duracao', 125, y + 5.5);
  doc.text('Valor', 155, y + 5.5);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  y += 8;
  
  services.forEach((service, index) => {
    y = checkPageBreak(doc, y, 10);
    
    if (index % 2 === 0) {
      doc.setFillColor(248, 248, 248);
      doc.rect(20, y, 170, 7, 'F');
    }
    
    const serviceName = serviceLabels[service.serviceType] || service.serviceType;
    const complexity = complexityLabels[service.complexity] || service.complexity;
    const duration = `${service.estimatedDuration} ${service.durationUnit === 'months' ? 'meses' : service.durationUnit === 'weeks' ? 'sem.' : 'dias'}`;
    
    doc.setFontSize(9);
    doc.text(serviceName.substring(0, 35), 25, y + 5);
    doc.text(complexity, 90, y + 5);
    doc.text(duration, 125, y + 5);
    doc.text(formatCurrency(service.serviceValue || 0), 155, y + 5);
    y += 7;
  });
  
  // Services total
  const servicesTotal = services.reduce((sum, s) => sum + (s.serviceValue || 0), 0);
  y += 3;
  doc.setFont('helvetica', 'bold');
  doc.text('Subtotal Servicos:', 100, y + 5);
  doc.text(formatCurrency(servicesTotal), 155, y + 5);
  doc.setFont('helvetica', 'normal');
  y += 15;
  
  // Individual Service Details
  services.forEach((service, index) => {
    y = checkPageBreak(doc, y, 80);
    
    const serviceName = serviceLabels[service.serviceType] || service.serviceType;
    const serviceColors = getSectorColor(service.serviceType);
    
    // Service header
    doc.setFillColor(...serviceColors.secondary);
    doc.rect(20, y, 170, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${serviceName}`, 25, y + 5.5);
    doc.text(formatCurrency(service.serviceValue || 0), 160, y + 5.5, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    y += 12;
    
    // Service details
    const category = getServiceCategory(service.serviceType);
    
    if (category === 'events') {
      const eventType = service.eventType ? eventTypeLabels[service.eventType] : 'Evento';
      const coverageDuration = service.coverageDuration ? coverageDurationLabels[service.coverageDuration] : 'A definir';
      y = addBulletPoint(doc, `Tipo: ${eventType}`, y, service.serviceType);
      y = addBulletPoint(doc, `Cobertura: ${coverageDuration}`, y, service.serviceType);
      if (service.eventDays) {
        y = addBulletPoint(doc, `Dias: ${service.eventDays} dia(s)`, y, service.serviceType);
      }
      if (service.eventStaffing) {
        const staff = service.eventStaffing;
        const staffList = [];
        if (staff.photographers) staffList.push(`${staff.photographers} fotografo(s)`);
        if (staff.videographers) staffList.push(`${staff.videographers} videografo(s)`);
        if (staffList.length > 0) {
          y = addBulletPoint(doc, `Equipa: ${staffList.join(', ')}`, y, service.serviceType);
        }
      }
    } else if (category === 'technology') {
      const projectType = service.webProjectType ? projectTypeLabels[service.webProjectType] : 'Sistema';
      y = addBulletPoint(doc, `Tipo: ${projectType}`, y, service.serviceType);
      if (service.numberOfPages) {
        y = addBulletPoint(doc, `Paginas: ${service.numberOfPages}`, y, service.serviceType);
      }
      if (service.numberOfModules) {
        y = addBulletPoint(doc, `Modulos: ${service.numberOfModules}`, y, service.serviceType);
      }
      const integrations = [];
      if (service.hasPaymentIntegration) integrations.push('Pagamentos');
      if (service.hasCrmIntegration) integrations.push('CRM');
      if (service.hasErpIntegration) integrations.push('ERP');
      if (integrations.length > 0) {
        y = addBulletPoint(doc, `Integracoes: ${integrations.join(', ')}`, y, service.serviceType);
      }
      if (service.hasMaintenance) {
        y = addBulletPoint(doc, `Manutencao: ${service.maintenanceMonths || 6} meses`, y, service.serviceType);
      }
    } else if (category === 'creative') {
      if (service.numberOfConcepts) {
        y = addBulletPoint(doc, `Conceitos: ${service.numberOfConcepts}`, y, service.serviceType);
      }
      if (service.numberOfRevisions) {
        y = addBulletPoint(doc, `Revisoes: ${service.numberOfRevisions}`, y, service.serviceType);
      }
      if (service.includesBrandGuidelines) {
        y = addBulletPoint(doc, 'Inclui Manual de Marca', y, service.serviceType);
      }
      if (service.deliverableFormats && service.deliverableFormats.length > 0) {
        y = addBulletPoint(doc, `Formatos: ${service.deliverableFormats.join(', ')}`, y, service.serviceType);
      }
    } else {
      // Consulting
      y = addBulletPoint(doc, `Complexidade: ${complexityLabels[service.complexity] || service.complexity}`, y, service.serviceType);
      y = addBulletPoint(doc, `Duracao: ${service.estimatedDuration} ${service.durationUnit === 'months' ? 'meses' : service.durationUnit === 'weeks' ? 'semanas' : 'dias'}`, y, service.serviceType);
    }
    
    // Deliverables
    if (service.deliverables && service.deliverables.length > 0) {
      y = checkPageBreak(doc, y, 20);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Entregaveis:', 25, y);
      doc.setFont('helvetica', 'normal');
      y += 5;
      service.deliverables.slice(0, 3).forEach(d => {
        const label = deliverableLabels[d] || d;
        y = addBulletPoint(doc, label, y, service.serviceType);
      });
      if (service.deliverables.length > 3) {
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`+ ${service.deliverables.length - 3} mais...`, 28, y);
        doc.setTextColor(0, 0, 0);
        y += 5;
      }
    }
    
    y += 5;
  });
  
  y = checkPageBreak(doc, y, 80);
  
  // Financial Summary
  y = addSectionTitle(doc, 'Resumo Financeiro', y, formData.serviceType);
  
  const financialItems = [
    { label: 'Total dos Servicos', value: formatCurrency(servicesTotal) },
  ];
  
  // Use proposal pricing if available for additional costs
  if (proposal.pricing) {
    if (proposal.pricing.overhead > 0) {
      financialItems.push({ label: 'Overhead Operacional', value: formatCurrency(proposal.pricing.overhead) });
    }
    if (proposal.pricing.margin > 0) {
      financialItems.push({ label: 'Margem', value: formatCurrency(proposal.pricing.margin) });
    }
  }
  
  financialItems.forEach((item, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(248, 248, 248);
      doc.rect(20, y, 170, 7, 'F');
    }
    doc.setFontSize(10);
    doc.text(item.label, 25, y + 5);
    doc.text(item.value, 160, y + 5, { align: 'right' });
    y += 7;
  });
  
  // Total
  y += 3;
  doc.setFillColor(...colors.primary);
  doc.rect(20, y, 170, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('VALOR TOTAL DO PROJECTO', 25, y + 8);
  const finalTotal = proposal.pricing?.finalPrice || servicesTotal;
  doc.text(formatCurrency(finalTotal), 160, y + 8, { align: 'right' });
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  
  y += 25;
  y = checkPageBreak(doc, y, 60);
  
  // Payment Model
  y = addSectionTitle(doc, 'Modelo de Pagamento', y, formData.serviceType);
  
  const payments = [
    { phase: 'Assinatura do Contrato', percent: 30 },
    { phase: 'Entrega Parcial (50% dos servicos)', percent: 40 },
    { phase: 'Entrega Final', percent: 30 },
  ];
  
  payments.forEach((payment, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(248, 248, 248);
      doc.rect(20, y, 170, 7, 'F');
    }
    doc.setFontSize(10);
    doc.text(payment.phase, 25, y + 5);
    doc.text(`${payment.percent}%`, 120, y + 5);
    doc.text(formatCurrency(finalTotal * (payment.percent / 100)), 160, y + 5, { align: 'right' });
    y += 7;
  });
  
  // Validity
  y += 15;
  y = checkPageBreak(doc, y, 30);
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Esta proposta e valida por 30 dias a partir da data de emissao.', 20, y);
  doc.text('Valores em Kwanzas (Kz). Impostos nao incluidos.', 20, y + 5);
  doc.setTextColor(0, 0, 0);
}

// ========== MULTI-SERVICE DIAGNOSTIC ==========

function generateMultiServiceDiagnosticDocument(doc: jsPDF, proposal: Proposal, services: ProposalService[]): void {
  const { formData } = proposal;
  
  addHeader(doc, 'Diagnostico de Necessidades', `${formData.clientName} - Multi-Servicos`, formData.serviceType);
  
  let y = 50;
  
  // Client Contact Info
  if (formData.clientEmail || formData.clientPhone) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    let contactInfo = 'Contacto: ';
    if (formData.clientEmail && formData.clientPhone) {
      contactInfo += `${formData.clientEmail} | Tel: ${formData.clientPhone}`;
    } else if (formData.clientEmail) {
      contactInfo += formData.clientEmail;
    } else if (formData.clientPhone) {
      contactInfo += `Tel: ${formData.clientPhone}`;
    }
    doc.text(contactInfo, 20, y);
    doc.setTextColor(0, 0, 0);
    y += 10;
  }
  
  // Section 1: Context
  y = addSectionTitle(doc, '1. Contexto e Visao Geral', y, formData.serviceType);
  
  const contextText = `A ${formData.clientName}, ${clientTypeLabels[formData.clientType] || formData.clientType} do sector de ${formData.sector}, procura um pacote integrado de ${services.length} servicos para atender as suas necessidades de negocio.`;
  y = addParagraph(doc, contextText, y);
  
  // Services Overview
  y = checkPageBreak(doc, y, 60);
  y = addSectionTitle(doc, '2. Servicos Identificados', y, formData.serviceType);
  
  const serviceCategories = {
    consulting: services.filter(s => getServiceCategory(s.serviceType) === 'consulting'),
    events: services.filter(s => getServiceCategory(s.serviceType) === 'events'),
    creative: services.filter(s => getServiceCategory(s.serviceType) === 'creative'),
    technology: services.filter(s => getServiceCategory(s.serviceType) === 'technology'),
  };
  
  const categoryNames: Record<string, string> = {
    consulting: 'Consultoria',
    events: 'Eventos',
    creative: 'Criativos',
    technology: 'Tecnologia',
  };
  
  Object.entries(serviceCategories).forEach(([category, categoryServices]) => {
    if (categoryServices.length > 0) {
      y = checkPageBreak(doc, y, 30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(`${categoryNames[category]} (${categoryServices.length})`, 20, y);
      doc.setFont('helvetica', 'normal');
      y += 6;
      
      categoryServices.forEach(service => {
        const serviceName = serviceLabels[service.serviceType] || service.serviceType;
        y = addBulletPoint(doc, serviceName, y, service.serviceType);
      });
      y += 3;
    }
  });
  
  // Section 3: Individual Service Details
  y = checkPageBreak(doc, y, 60);
  y = addSectionTitle(doc, '3. Detalhes por Servico', y, formData.serviceType);
  
  services.forEach((service, index) => {
    y = checkPageBreak(doc, y, 60);
    
    const serviceName = serviceLabels[service.serviceType] || service.serviceType;
    const serviceColors = getSectorColor(service.serviceType);
    
    // Service header
    doc.setFillColor(...serviceColors.secondary);
    doc.rect(20, y, 170, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${serviceName}`, 25, y + 5.5);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    y += 12;
    
    // Service info box
    const infoItems = [
      { label: 'Complexidade', value: complexityLabels[service.complexity] || service.complexity },
      { label: 'Duracao', value: `${service.estimatedDuration} ${service.durationUnit === 'months' ? 'meses' : service.durationUnit === 'weeks' ? 'semanas' : 'dias'}` },
    ];
    
    y = addInfoBox(doc, infoItems, y, service.serviceType);
    
    // Deliverables
    if (service.deliverables && service.deliverables.length > 0) {
      y = checkPageBreak(doc, y, 30);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Entregaveis:', 25, y);
      doc.setFont('helvetica', 'normal');
      y += 5;
      service.deliverables.slice(0, 4).forEach(d => {
        const label = deliverableLabels[d] || d;
        y = addBulletPoint(doc, label, y, service.serviceType);
      });
    }
    
    y += 5;
  });
}

// ========== MULTI-SERVICE TECHNICAL ==========

function generateMultiServiceTechnicalDocument(doc: jsPDF, proposal: Proposal, services: ProposalService[]): void {
  const { formData } = proposal;
  
  addHeader(doc, 'Proposta Tecnica', `Referencia: PT-${proposal.id.slice(0, 8).toUpperCase()} (Multi-Servicos)`, formData.serviceType);
  
  let y = 50;
  
  // Overview
  y = addSectionTitle(doc, 'Visao Geral do Projecto', y, formData.serviceType);
  const overviewText = `Este projecto integrado para ${formData.clientName} contempla ${services.length} servicos complementares, abrangendo diferentes areas de actuacao para atender as necessidades identificadas.`;
  y = addParagraph(doc, overviewText, y);
  
  // Services Summary Table
  y = checkPageBreak(doc, y, 60);
  y = addSectionTitle(doc, 'Servicos Contratados', y, formData.serviceType);
  
  const colors = getSectorColor(formData.serviceType);
  
  doc.setFillColor(...colors.primary);
  doc.rect(20, y, 170, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('#', 25, y + 5.5);
  doc.text('Servico', 35, y + 5.5);
  doc.text('Categoria', 110, y + 5.5);
  doc.text('Duracao', 150, y + 5.5);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  y += 8;
  
  const categoryNames: Record<string, string> = {
    consulting: 'Consultoria',
    events: 'Eventos',
    creative: 'Criativos',
    technology: 'Tecnologia',
  };
  
  services.forEach((service, index) => {
    y = checkPageBreak(doc, y, 10);
    
    if (index % 2 === 0) {
      doc.setFillColor(248, 248, 248);
      doc.rect(20, y, 170, 7, 'F');
    }
    
    const category = getServiceCategory(service.serviceType);
    const serviceName = serviceLabels[service.serviceType] || service.serviceType;
    const duration = `${service.estimatedDuration} ${service.durationUnit === 'months' ? 'meses' : service.durationUnit === 'weeks' ? 'sem.' : 'dias'}`;
    
    doc.setFontSize(9);
    doc.text(`${index + 1}`, 25, y + 5);
    doc.text(serviceName.substring(0, 35), 35, y + 5);
    doc.text(categoryNames[category], 110, y + 5);
    doc.text(duration, 150, y + 5);
    y += 7;
  });
  
  y += 10;
  
  // Detailed sections for each service
  services.forEach((service, index) => {
    y = checkPageBreak(doc, y, 80);
    
    const serviceName = serviceLabels[service.serviceType] || service.serviceType;
    const serviceColors = getSectorColor(service.serviceType);
    const category = getServiceCategory(service.serviceType);
    
    // Service header
    doc.setFillColor(...serviceColors.primary);
    doc.rect(20, y, 170, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Servico ${index + 1}: ${serviceName}`, 25, y + 7);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    y += 15;
    
    // Category-specific details
    if (category === 'events') {
      const eventType = service.eventType ? eventTypeLabels[service.eventType] : 'Evento';
      y = addBulletPoint(doc, `Tipo de Evento: ${eventType}`, y, service.serviceType);
      if (service.coverageDuration) {
        y = addBulletPoint(doc, `Cobertura: ${coverageDurationLabels[service.coverageDuration]}`, y, service.serviceType);
      }
      if (service.eventDays) {
        y = addBulletPoint(doc, `Duracao: ${service.eventDays} dia(s)`, y, service.serviceType);
      }
      if (service.eventStaffing) {
        const staff = service.eventStaffing;
        if (staff.photographers) y = addBulletPoint(doc, `${staff.photographers} Fotografo(s)`, y, service.serviceType);
        if (staff.videographers) y = addBulletPoint(doc, `${staff.videographers} Videografo(s)`, y, service.serviceType);
      }
    } else if (category === 'technology') {
      const projectType = service.webProjectType ? projectTypeLabels[service.webProjectType] : 'Sistema';
      y = addBulletPoint(doc, `Tipo de Projecto: ${projectType}`, y, service.serviceType);
      if (service.numberOfPages) y = addBulletPoint(doc, `${service.numberOfPages} Paginas/Ecras`, y, service.serviceType);
      if (service.numberOfModules) y = addBulletPoint(doc, `${service.numberOfModules} Modulos`, y, service.serviceType);
      if (service.hasPaymentIntegration) y = addBulletPoint(doc, 'Integracao de Pagamentos', y, service.serviceType);
      if (service.hasCrmIntegration) y = addBulletPoint(doc, 'Integracao com CRM', y, service.serviceType);
      if (service.hasErpIntegration) y = addBulletPoint(doc, 'Integracao com ERP', y, service.serviceType);
    } else if (category === 'creative') {
      if (service.numberOfConcepts) y = addBulletPoint(doc, `${service.numberOfConcepts} Conceitos Iniciais`, y, service.serviceType);
      if (service.numberOfRevisions) y = addBulletPoint(doc, `${service.numberOfRevisions} Rondas de Revisao`, y, service.serviceType);
      if (service.includesBrandGuidelines) y = addBulletPoint(doc, 'Inclui Manual de Marca', y, service.serviceType);
    } else {
      y = addBulletPoint(doc, `Complexidade: ${complexityLabels[service.complexity]}`, y, service.serviceType);
      y = addBulletPoint(doc, `Metodologia: ${methodologyLabels[formData.methodology] || formData.methodology}`, y, service.serviceType);
    }
    
    // Deliverables
    if (service.deliverables && service.deliverables.length > 0) {
      y = checkPageBreak(doc, y, 30);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Entregaveis:', 25, y);
      doc.setFont('helvetica', 'normal');
      y += 6;
      service.deliverables.forEach(d => {
        const label = deliverableLabels[d] || d;
        y = addBulletPoint(doc, label, y, service.serviceType);
      });
    }
    
    y += 10;
  });
}

// ========== GENERATE PDF FUNCTIONS (for preview) ==========

export function generateProposalPDF(proposal: Proposal, documentType: DocumentType = 'all', services?: ProposalService[]): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  const isMultiService = services && services.length > 1;
  
  if (documentType === 'diagnostic' || documentType === 'all') {
    if (isMultiService) {
      generateMultiServiceDiagnosticDocument(doc, proposal, services);
    } else {
      generateDiagnosticDocument(doc, proposal);
    }
    
    if (documentType === 'all') {
      doc.addPage();
    }
  }
  
  if (documentType === 'technical' || documentType === 'all') {
    if (isMultiService) {
      generateMultiServiceTechnicalDocument(doc, proposal, services);
    } else {
      generateTechnicalDocument(doc, proposal);
    }
    
    if (documentType === 'all') {
      doc.addPage();
    }
  }
  
  if (documentType === 'budget' || documentType === 'all') {
    if (isMultiService) {
      generateMultiServiceBudgetDocument(doc, proposal, services);
    } else {
      generateBudgetDocument(doc, proposal);
    }
  }
  
  // Update page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }
  
  return doc;
}

export function generateSingleDocumentPDF(proposal: Proposal, documentType: 'diagnostic' | 'technical' | 'budget', services?: ProposalService[]): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  const isMultiService = services && services.length > 1;
  
  if (documentType === 'diagnostic') {
    if (isMultiService) {
      generateMultiServiceDiagnosticDocument(doc, proposal, services);
    } else {
      generateDiagnosticDocument(doc, proposal);
    }
  } else if (documentType === 'technical') {
    if (isMultiService) {
      generateMultiServiceTechnicalDocument(doc, proposal, services);
    } else {
      generateTechnicalDocument(doc, proposal);
    }
  } else {
    if (isMultiService) {
      generateMultiServiceBudgetDocument(doc, proposal, services);
    } else {
      generateBudgetDocument(doc, proposal);
    }
  }
  
  addFooter(doc, 1, 1);
  
  return doc;
}

// ========== EXPORT FUNCTIONS ==========

export function exportProposalToPDF(proposal: Proposal, documentType: DocumentType = 'all', services?: ProposalService[]): void {
  const doc = generateProposalPDF(proposal, documentType, services);
  
  const { formData } = proposal;
  const isMultiService = services && services.length > 1;
  const suffix = isMultiService ? '_Multi-Servicos' : '';
  const filename = documentType === 'all' 
    ? `Proposta_Completa${suffix}_${formData.clientName.replace(/\s+/g, '_')}.pdf`
    : `${documentType === 'diagnostic' ? 'Diagnostico' : documentType === 'technical' ? 'Proposta_Tecnica' : 'Proposta_Orcamental'}${suffix}_${formData.clientName.replace(/\s+/g, '_')}.pdf`;
  
  doc.save(filename);
}

export function exportSingleDocument(proposal: Proposal, documentType: 'diagnostic' | 'technical' | 'budget', services?: ProposalService[]): void {
  const doc = generateSingleDocumentPDF(proposal, documentType, services);
  
  const { formData } = proposal;
  const isMultiService = services && services.length > 1;
  const suffix = isMultiService ? '_Multi-Servicos' : '';
  const docNames = {
    diagnostic: 'Diagnostico',
    technical: 'Proposta_Tecnica',
    budget: 'Proposta_Orcamental',
  };
  
  doc.save(`${docNames[documentType]}${suffix}_${formData.clientName.replace(/\s+/g, '_')}.pdf`);
}
