import jsPDF from 'jspdf';
import { 
  Proposal, 
  SERVICE_LABELS, 
  SERVICE_CATEGORIES,
  ServiceCategory,
} from '@/types/proposal';
import { ProposalService } from '@/types/proposalService';
import { formatCurrency, formatNumber } from '@/lib/pricing';

// Extended labels
const serviceLabels: Record<string, string> = {
  ...SERVICE_LABELS,
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

const clientTypeLabels: Record<string, string> = {
  public: 'Instituicao Publica',
  private: 'Empresa Privada',
  ngo: 'Organizacao Nao-Governamental',
  startup: 'Startup',
};

const eventTypeLabels: Record<string, string> = {
  corporate: 'Evento Corporativo',
  wedding: 'Casamento',
  conference: 'Conferencia',
  outdoor: 'Evento ao Ar Livre',
  concert: 'Concerto/Show',
  other: 'Outro',
};

const coverageDurationLabels: Record<string, string> = {
  half_day: 'Meio Dia (4h)',
  full_day: 'Dia Completo (8h)',
  multi_day: 'Multi-Dias',
};

const projectTypeLabels: Record<string, string> = {
  landing_page: 'Landing Page',
  ecommerce: 'E-Commerce',
  erp: 'Sistema ERP',
  mobile_app: 'Aplicacao Mobile',
  webapp: 'Aplicacao Web',
  api: 'API/Backend',
  other: 'Outro',
};

const deliverableLabels: Record<string, string> = {
  reports: 'Relatorios de progresso',
  dashboards: 'Dashboards de acompanhamento',
  kpis: 'Sistema de KPIs',
  schedules: 'Cronogramas actualizados',
  training: 'Sessoes de formacao',
  documentation: 'Documentacao de processos',
};

// Color schemes per sector
const sectorColors: Record<ServiceCategory, { primary: [number, number, number]; secondary: [number, number, number]; accent: [number, number, number] }> = {
  consulting: { primary: [37, 99, 235], secondary: [59, 130, 246], accent: [96, 165, 250] },
  events: { primary: [220, 38, 38], secondary: [239, 68, 68], accent: [248, 113, 113] },
  creative: { primary: [147, 51, 234], secondary: [168, 85, 247], accent: [192, 132, 252] },
  technology: { primary: [5, 150, 105], secondary: [16, 185, 129], accent: [52, 211, 153] },
};

export interface BrandingConfig {
  companyName?: string;
  companyLogo?: string; // Base64 or URL
  primaryColor?: [number, number, number];
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  address?: string;
}

function getServiceCategory(serviceType: string): ServiceCategory {
  return SERVICE_CATEGORIES[serviceType as keyof typeof SERVICE_CATEGORIES] || 'consulting';
}

function getSectorColor(serviceType: string) {
  const category = getServiceCategory(serviceType);
  return sectorColors[category];
}

// Determine primary color for multi-service (use most frequent category)
function getMultiServiceColor(services: ProposalService[]) {
  const categoryCounts: Record<ServiceCategory, number> = {
    consulting: 0,
    events: 0,
    creative: 0,
    technology: 0,
  };
  
  services.forEach(s => {
    const cat = getServiceCategory(s.serviceType);
    categoryCounts[cat]++;
  });
  
  const dominant = Object.entries(categoryCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0] as ServiceCategory;
  return sectorColors[dominant];
}

function checkPageBreak(doc: jsPDF, currentY: number, requiredSpace: number = 40): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (currentY + requiredSpace > pageHeight - 25) {
    doc.addPage();
    return 45;
  }
  return currentY;
}

// ========== PROFESSIONAL COVER PAGE ==========
function addCoverPage(
  doc: jsPDF, 
  proposal: Proposal, 
  services: ProposalService[], 
  branding: BrandingConfig
): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const { formData } = proposal;
  
  // Use branding color if available, otherwise use service category colors
  const defaultColors = getMultiServiceColor(services);
  const brandPrimary = branding.primaryColor || defaultColors.primary;
  const brandSecondary = branding.primaryColor 
    ? [
        Math.min(255, brandPrimary[0] + 20),
        Math.min(255, brandPrimary[1] + 20),
        Math.min(255, brandPrimary[2] + 20),
      ] as [number, number, number]
    : defaultColors.secondary;
  const brandAccent = branding.primaryColor
    ? [
        Math.min(255, brandPrimary[0] + 50),
        Math.min(255, brandPrimary[1] + 50),
        Math.min(255, brandPrimary[2] + 50),
      ] as [number, number, number]
    : defaultColors.accent;
  
  // Background gradient effect
  doc.setFillColor(...brandPrimary);
  doc.rect(0, 0, pageWidth, 100, 'F');
  
  // Decorative accent
  doc.setFillColor(...brandSecondary);
  doc.rect(0, 95, pageWidth, 8, 'F');
  
  // Geometric accent shape
  doc.setFillColor(...brandAccent);
  doc.triangle(pageWidth - 60, 0, pageWidth, 0, pageWidth, 60, 'F');
  
  // Company name / Branding
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const companyName = branding.companyName || 'PRECIFIX';
  doc.text(companyName.toUpperCase(), 20, 35);
  
  // Document type badge
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('PROPOSTA COMERCIAL', 20, 48);
  
  // Reference code
  doc.setFontSize(9);
  doc.text(`REF: PC-${proposal.id.slice(0, 8).toUpperCase()}`, 20, 60);
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`, 20, 70);
  
  // Main title area
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  
  const titleY = 145;
  doc.text('Proposta de Servicos', 20, titleY);
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Integrando Multiplas Solucoes', 20, titleY + 15);
  
  // Client info box
  const clientBoxY = titleY + 45;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, clientBoxY, pageWidth - 40, 60, 4, 4, 'F');
  
  // Left accent
  doc.setFillColor(...brandPrimary);
  doc.rect(20, clientBoxY, 4, 60, 'F');
  
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.text('CLIENTE', 32, clientBoxY + 15);
  
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(formData.clientName, 32, clientBoxY + 30);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`${clientTypeLabels[formData.clientType] || formData.clientType} | Sector: ${formData.sector}`, 32, clientBoxY + 42);
  
  if (formData.clientEmail || formData.clientPhone) {
    const contactParts = [];
    if (formData.clientEmail) contactParts.push(formData.clientEmail);
    if (formData.clientPhone) contactParts.push(`Tel: ${formData.clientPhone}`);
    doc.setFontSize(9);
    doc.text(contactParts.join(' | '), 32, clientBoxY + 52);
  }
  
  // Services summary
  const servicesY = clientBoxY + 80;
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`${services.length} Servicos Incluidos`, 20, servicesY);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  
  let iconY = servicesY + 12;
  services.slice(0, 5).forEach((service, index) => {
    const serviceName = serviceLabels[service.serviceType] || service.serviceType;
    const cat = getServiceCategory(service.serviceType);
    const catColors = sectorColors[cat];
    
    // Bullet point with category color
    doc.setFillColor(...catColors.primary);
    doc.circle(25, iconY - 1.5, 2, 'F');
    doc.text(serviceName, 32, iconY);
    iconY += 8;
  });
  
  if (services.length > 5) {
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.text(`+ ${services.length - 5} servicos adicionais`, 32, iconY);
  }
  
  // Total value highlight
  const totalValue = services.reduce((sum, s) => sum + (s.serviceValue || 0), 0);
  const valueBoxY = pageHeight - 100;
  
  doc.setFillColor(...brandPrimary);
  doc.roundedRect(20, valueBoxY, pageWidth - 40, 45, 4, 4, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('VALOR TOTAL DO PROJECTO', 30, valueBoxY + 18);
  
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(totalValue), 30, valueBoxY + 35);
  
  // Validity note
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Valida por 30 dias', pageWidth - 50, valueBoxY + 35);
  
  // Footer branding
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  
  // Address line (if present)
  if (branding.address) {
    doc.text(branding.address, pageWidth / 2, pageHeight - 28, { align: 'center' });
  }
  
  // Contact info line
  if (branding.website) {
    doc.text(branding.website, 20, pageHeight - 20);
  }
  if (branding.contactEmail) {
    doc.text(branding.contactEmail, pageWidth / 2, pageHeight - 20, { align: 'center' });
  }
  if (branding.contactPhone) {
    doc.text(branding.contactPhone, pageWidth - 20, pageHeight - 20, { align: 'right' });
  }
}

// ========== TABLE OF CONTENTS ==========
function addTableOfContents(
  doc: jsPDF, 
  services: ProposalService[],
  colors: { primary: [number, number, number]; secondary: [number, number, number] }
): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Modern header
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, 42, 'F');
  doc.setFillColor(...colors.secondary);
  doc.rect(0, 42, pageWidth, 3, 'F');
  
  // Decorative lines
  doc.setDrawColor(255, 255, 255);
  for (let i = 0; i < 4; i++) {
    doc.setLineWidth(0.5);
    doc.line(pageWidth - 60 + i * 12, 8, pageWidth - 50 + i * 12, 18);
  }
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Indice', 20, 24);
  
  doc.setTextColor(0, 0, 0);
  
  let y = 60;
  
  const sections = [
    { title: '1. Capa', page: 1 },
    { title: '2. Indice', page: 2 },
    { title: '3. Sumario Executivo', page: 3 },
    { title: '4. Detalhes dos Servicos', page: 4 },
    { title: '5. Cronograma', page: '-' },
    { title: '6. Proposta Financeira', page: '-' },
    { title: '7. Termos e Condicoes', page: '-' },
  ];
  
  sections.forEach((section, index) => {
    doc.setFontSize(11);
    doc.setFont('helvetica', index === 0 || index === sections.length - 1 ? 'bold' : 'normal');
    doc.text(section.title, 25, y);
    
    // Dotted line
    doc.setDrawColor(200, 200, 200);
    const textWidth = doc.getTextWidth(section.title);
    for (let x = 30 + textWidth; x < pageWidth - 40; x += 3) {
      doc.circle(x, y - 1, 0.3, 'F');
    }
    
    doc.text(String(section.page), pageWidth - 25, y, { align: 'right' });
    y += 12;
  });
  
  // Services sub-index
  y += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.primary);
  doc.text('Servicos Detalhados:', 25, y);
  doc.setTextColor(0, 0, 0);
  y += 10;
  
  services.forEach((service, index) => {
    const serviceName = serviceLabels[service.serviceType] || service.serviceType;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`   ${index + 1}. ${serviceName}`, 30, y);
    y += 8;
  });
}

// ========== EXECUTIVE SUMMARY ==========
function addExecutiveSummary(
  doc: jsPDF, 
  proposal: Proposal, 
  services: ProposalService[],
  colors: { primary: [number, number, number]; secondary: [number, number, number] }
): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const { formData } = proposal;
  
  // Modern header
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, 42, 'F');
  doc.setFillColor(...colors.secondary);
  doc.rect(0, 42, pageWidth, 3, 'F');
  
  // Decorative lines
  doc.setDrawColor(255, 255, 255);
  for (let i = 0; i < 4; i++) {
    doc.setLineWidth(0.5);
    doc.line(pageWidth - 60 + i * 12, 8, pageWidth - 50 + i * 12, 18);
  }
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Sumario Executivo', 20, 24);
  
  doc.setTextColor(0, 0, 0);
  let y = 60;
  
  // Introduction
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const introText = `Apresentamos a ${formData.clientName} uma proposta integrada de servicos, desenvolvida para atender as necessidades identificadas no sector de ${formData.sector}. Esta proposta abrange ${services.length} servicos complementares, oferecendo uma solucao completa e personalizada.`;
  const introLines = doc.splitTextToSize(introText, 170);
  doc.text(introLines, 20, y);
  y += introLines.length * 6 + 10;
  
  // Key metrics
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.primary);
  doc.text('Metricas Principais', 20, y);
  doc.setTextColor(0, 0, 0);
  y += 10;
  
  const totalValue = services.reduce((sum, s) => sum + (s.serviceValue || 0), 0);
  
  // Calculate total duration - get the longest service
  const longestDuration = Math.max(...services.map(s => {
    const multiplier = s.durationUnit === 'months' ? 30 : s.durationUnit === 'weeks' ? 7 : 1;
    return s.estimatedDuration * multiplier;
  }));
  const durationText = longestDuration >= 30 ? `${Math.ceil(longestDuration / 30)} mes(es)` : `${longestDuration} dia(s)`;
  
  // Categories count
  const categories = new Set(services.map(s => getServiceCategory(s.serviceType)));
  
  // Metrics boxes
  const metrics = [
    { label: 'Servicos', value: String(services.length) },
    { label: 'Categorias', value: String(categories.size) },
    { label: 'Duracao Est.', value: durationText },
    { label: 'Investimento', value: formatCurrency(totalValue) },
  ];
  
  const boxWidth = (pageWidth - 50) / 4;
  metrics.forEach((metric, index) => {
    const boxX = 20 + index * (boxWidth + 3);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(boxX, y, boxWidth, 30, 2, 2, 'F');
    
    // Top accent
    doc.setFillColor(...colors.primary);
    doc.rect(boxX, y, boxWidth, 3, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(metric.label, boxX + 5, y + 12);
    
    doc.setFontSize(12);
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.text(metric.value, boxX + 5, y + 23);
    doc.setFont('helvetica', 'normal');
  });
  
  y += 45;
  
  // Services overview
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.primary);
  doc.text('Servicos Propostos', 20, y);
  doc.setTextColor(0, 0, 0);
  y += 8;
  
  services.forEach((service, index) => {
    y = checkPageBreak(doc, y, 25);
    
    const serviceName = serviceLabels[service.serviceType] || service.serviceType;
    const cat = getServiceCategory(service.serviceType);
    const catColors = sectorColors[cat];
    
    // Service row
    doc.setFillColor(index % 2 === 0 ? 252 : 248, 250, 252);
    doc.rect(20, y - 3, pageWidth - 40, 18, 'F');
    
    // Category indicator
    doc.setFillColor(...catColors.primary);
    doc.rect(20, y - 3, 3, 18, 'F');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${serviceName}`, 28, y + 4);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    const duration = `${service.estimatedDuration} ${service.durationUnit === 'months' ? 'meses' : service.durationUnit === 'weeks' ? 'sem.' : 'dias'}`;
    doc.text(`${complexityLabels[service.complexity]} | ${duration}`, 28, y + 11);
    
    doc.setTextColor(30, 30, 30);
    doc.text(formatCurrency(service.serviceValue || 0), pageWidth - 25, y + 7, { align: 'right' });
    
    y += 20;
  });
  
  // Total line
  y += 5;
  doc.setFillColor(...colors.primary);
  doc.rect(20, y, pageWidth - 40, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('VALOR TOTAL', 28, y + 8);
  doc.text(formatCurrency(totalValue), pageWidth - 25, y + 8, { align: 'right' });
}

// ========== SERVICES DETAIL PAGE ==========
function addServicesDetails(
  doc: jsPDF, 
  services: ProposalService[],
  colors: { primary: [number, number, number]; secondary: [number, number, number] }
): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Modern header
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, 42, 'F');
  doc.setFillColor(...colors.secondary);
  doc.rect(0, 42, pageWidth, 3, 'F');
  
  // Decorative lines
  doc.setDrawColor(255, 255, 255);
  for (let i = 0; i < 4; i++) {
    doc.setLineWidth(0.5);
    doc.line(pageWidth - 60 + i * 12, 8, pageWidth - 50 + i * 12, 18);
  }
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalhes dos Servicos', 20, 24);
  
  doc.setTextColor(0, 0, 0);
  let y = 55;
  
  services.forEach((service, index) => {
    y = checkPageBreak(doc, y, 80);
    
    const serviceName = serviceLabels[service.serviceType] || service.serviceType;
    const cat = getServiceCategory(service.serviceType);
    const catColors = sectorColors[cat];
    
    // Service card
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, y, pageWidth - 40, 70, 3, 3, 'F');
    
    // Left accent
    doc.setFillColor(...catColors.primary);
    doc.rect(20, y, 4, 70, 'F');
    
    // Service number badge
    doc.setFillColor(...catColors.primary);
    doc.circle(35, y + 15, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(String(index + 1), 35, y + 18, { align: 'center' });
    
    // Service name
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(13);
    doc.text(serviceName, 48, y + 18);
    
    // Value on the right
    doc.setFontSize(12);
    doc.setTextColor(...catColors.primary);
    doc.text(formatCurrency(service.serviceValue || 0), pageWidth - 28, y + 18, { align: 'right' });
    
    // Details grid
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    const detailsY = y + 32;
    const colWidth = (pageWidth - 60) / 3;
    
    // Column 1 - Basic info
    doc.text('Complexidade:', 30, detailsY);
    doc.setFont('helvetica', 'bold');
    doc.text(complexityLabels[service.complexity] || service.complexity, 30, detailsY + 6);
    doc.setFont('helvetica', 'normal');
    
    // Column 2 - Duration
    doc.text('Duracao:', 30 + colWidth, detailsY);
    doc.setFont('helvetica', 'bold');
    const duration = `${service.estimatedDuration} ${service.durationUnit === 'months' ? 'meses' : service.durationUnit === 'weeks' ? 'semanas' : 'dias'}`;
    doc.text(duration, 30 + colWidth, detailsY + 6);
    doc.setFont('helvetica', 'normal');
    
    // Column 3 - Category specific
    const category = getServiceCategory(service.serviceType);
    if (category === 'events' && service.eventType) {
      doc.text('Tipo de Evento:', 30 + colWidth * 2, detailsY);
      doc.setFont('helvetica', 'bold');
      doc.text(eventTypeLabels[service.eventType] || service.eventType, 30 + colWidth * 2, detailsY + 6);
    } else if (category === 'technology' && service.webProjectType) {
      doc.text('Tipo de Projecto:', 30 + colWidth * 2, detailsY);
      doc.setFont('helvetica', 'bold');
      doc.text(projectTypeLabels[service.webProjectType] || service.webProjectType, 30 + colWidth * 2, detailsY + 6);
    } else if (category === 'creative' && service.numberOfConcepts) {
      doc.text('Conceitos:', 30 + colWidth * 2, detailsY);
      doc.setFont('helvetica', 'bold');
      doc.text(`${service.numberOfConcepts} conceitos`, 30 + colWidth * 2, detailsY + 6);
    }
    
    // Deliverables
    if (service.deliverables && service.deliverables.length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(8);
      const delivText = service.deliverables.slice(0, 3).map(d => deliverableLabels[d] || d).join(' • ');
      doc.text(`Entregaveis: ${delivText}${service.deliverables.length > 3 ? ` +${service.deliverables.length - 3} mais` : ''}`, 30, y + 60);
    }
    
    y += 80;
  });
}

// ========== FINANCIAL PROPOSAL ==========
function addFinancialProposal(
  doc: jsPDF, 
  proposal: Proposal,
  services: ProposalService[],
  colors: { primary: [number, number, number]; secondary: [number, number, number] }
): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const { formData } = proposal;
  
  // Modern header
  doc.setFillColor(...colors.primary);
  doc.rect(0, 0, pageWidth, 42, 'F');
  doc.setFillColor(...colors.secondary);
  doc.rect(0, 42, pageWidth, 3, 'F');
  
  // Decorative lines
  doc.setDrawColor(255, 255, 255);
  for (let i = 0; i < 4; i++) {
    doc.setLineWidth(0.5);
    doc.line(pageWidth - 60 + i * 12, 8, pageWidth - 50 + i * 12, 18);
  }
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Proposta Financeira', 20, 24);
  
  doc.setTextColor(0, 0, 0);
  let y = 55;
  
  // Client info
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Cliente: ${formData.clientName} | ${formData.sector}`, 20, y);
  y += 15;
  
  // Services table
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.primary);
  doc.text('Discriminacao de Servicos', 20, y);
  doc.setTextColor(0, 0, 0);
  y += 10;
  
  // Table header
  doc.setFillColor(...colors.primary);
  doc.rect(20, y, pageWidth - 40, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('#', 25, y + 7);
  doc.text('Servico', 35, y + 7);
  doc.text('Complexidade', 100, y + 7);
  doc.text('Duracao', 135, y + 7);
  doc.text('Valor', 165, y + 7);
  doc.setTextColor(0, 0, 0);
  y += 10;
  
  // Table rows
  services.forEach((service, index) => {
    y = checkPageBreak(doc, y, 12);
    
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(20, y, pageWidth - 40, 10, 'F');
    }
    
    const serviceName = (serviceLabels[service.serviceType] || service.serviceType).substring(0, 28);
    const complexity = complexityLabels[service.complexity] || service.complexity;
    const duration = `${service.estimatedDuration} ${service.durationUnit === 'months' ? 'm' : service.durationUnit === 'weeks' ? 's' : 'd'}`;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(String(index + 1), 25, y + 7);
    doc.text(serviceName, 35, y + 7);
    doc.text(complexity, 100, y + 7);
    doc.text(duration, 135, y + 7);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(service.serviceValue || 0), 165, y + 7);
    doc.setFont('helvetica', 'normal');
    y += 10;
  });
  
  // Subtotal
  y += 5;
  const servicesTotal = services.reduce((sum, s) => sum + (s.serviceValue || 0), 0);
  doc.setDrawColor(200, 200, 200);
  doc.line(20, y, pageWidth - 20, y);
  y += 8;
  
  doc.setFontSize(10);
  doc.text('Subtotal Servicos:', 100, y);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(servicesTotal), 165, y);
  doc.setFont('helvetica', 'normal');
  y += 20;
  
  // Total highlight
  doc.setFillColor(...colors.primary);
  doc.roundedRect(20, y, pageWidth - 40, 25, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('VALOR TOTAL DO PROJECTO', 30, y + 16);
  doc.setFontSize(16);
  const finalTotal = proposal.pricing?.finalPrice || servicesTotal;
  doc.text(formatCurrency(finalTotal), pageWidth - 30, y + 16, { align: 'right' });
  
  y += 40;
  y = checkPageBreak(doc, y, 60);
  
  // Payment terms
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.primary);
  doc.text('Condicoes de Pagamento', 20, y);
  doc.setTextColor(0, 0, 0);
  y += 10;
  
  const payments = [
    { phase: 'Assinatura do Contrato', percent: 30, desc: 'Inicio do projecto' },
    { phase: 'Entrega Parcial', percent: 40, desc: 'Apos 50% dos servicos concluidos' },
    { phase: 'Entrega Final', percent: 30, desc: 'Conclusao e aprovacao final' },
  ];
  
  payments.forEach((payment, index) => {
    doc.setFillColor(index % 2 === 0 ? 248 : 252, 250, 252);
    doc.rect(20, y, pageWidth - 40, 15, 'F');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(payment.phase, 25, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(payment.desc, 25, y + 12);
    doc.setTextColor(0, 0, 0);
    
    doc.setFontSize(10);
    doc.text(`${payment.percent}%`, 130, y + 9);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(finalTotal * (payment.percent / 100)), pageWidth - 25, y + 9, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    y += 15;
  });
  
  y += 15;
  
  // Notes
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Notas:', 20, y);
  y += 6;
  doc.text('• Esta proposta e valida por 30 dias a partir da data de emissao.', 20, y);
  y += 5;
  doc.text('• Valores expressos em Kwanzas (Kz). Impostos nao incluidos.', 20, y);
  y += 5;
  doc.text('• Pagamentos podem ser efectuados via transferencia bancaria.', 20, y);
}

// ========== FOOTER ==========
function addProfessionalFooter(doc: jsPDF, pageNumber: number, totalPages: number, branding: BrandingConfig): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Footer line
  doc.setDrawColor(220, 220, 220);
  doc.line(20, pageHeight - 18, pageWidth - 20, pageHeight - 18);
  
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  
  const companyName = branding.companyName || 'PRECIFIX';
  doc.text(companyName, 20, pageHeight - 10);
  
  const pageText = `Pagina ${pageNumber} de ${totalPages}`;
  doc.text(pageText, pageWidth / 2, pageHeight - 10, { align: 'center' });
  
  doc.text(new Date().toLocaleDateString('pt-BR'), pageWidth - 20, pageHeight - 10, { align: 'right' });
}

// ========== MAIN EXPORT FUNCTION ==========
export function exportMultiServiceProposalToPDF(
  proposal: Proposal, 
  services: ProposalService[],
  branding: BrandingConfig = {}
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  const colors = getMultiServiceColor(services);
  
  // Page 1: Cover
  addCoverPage(doc, proposal, services, branding);
  
  // Page 2: Table of Contents
  doc.addPage();
  addTableOfContents(doc, services, colors);
  
  // Page 3: Executive Summary
  doc.addPage();
  addExecutiveSummary(doc, proposal, services, colors);
  
  // Page 4+: Services Details
  doc.addPage();
  addServicesDetails(doc, services, colors);
  
  // Financial Proposal
  doc.addPage();
  addFinancialProposal(doc, proposal, services, colors);
  
  // Add footers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    if (i > 1) { // Skip cover page footer
      addProfessionalFooter(doc, i, totalPages, branding);
    }
  }
  
  const { formData } = proposal;
  const filename = `Proposta_MultiServico_${formData.clientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  
  doc.save(filename);
}
