import jsPDF from 'jspdf';
import { Proposal } from '@/types/proposal';
import { formatCurrency, formatNumber } from '@/lib/pricing';

type DocumentType = 'diagnostic' | 'technical' | 'budget' | 'all';

const serviceLabels: Record<string, string> = {
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

function addHeader(doc: jsPDF, title: string, subtitle: string) {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header background
  doc.setFillColor(37, 99, 235); // Primary blue
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 20, 20);
  
  // Subtitle
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitle, 20, 28);
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
}

function addFooter(doc: jsPDF, pageNumber: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(`Pagina ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
  doc.text(new Date().toLocaleDateString('pt-BR'), pageWidth - 20, pageHeight - 10, { align: 'right' });
  doc.setTextColor(0, 0, 0);
}

function addSectionTitle(doc: jsPDF, title: string, y: number): number {
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text(title, 20, y);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  return y + 8;
}

function addParagraph(doc: jsPDF, text: string, y: number, maxWidth: number = 170): number {
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, 20, y);
  return y + (lines.length * 5) + 5;
}

function addBulletPoint(doc: jsPDF, text: string, y: number): number {
  doc.setFontSize(10);
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

function generateDiagnosticDocument(doc: jsPDF, proposal: Proposal): void {
  const { formData, pricing } = proposal;
  
  addHeader(doc, 'Diagnostico de Necessidades', `${formData.clientName} - ${serviceLabels[formData.serviceType]}`);
  addFooter(doc, 1);
  
  let y = 50;
  
  // Section 1: Context
  y = addSectionTitle(doc, '1. Contexto e Desafios', y);
  
  const contextText = `A ${formData.clientName}, ${clientTypeLabels[formData.clientType]} do sector de ${formData.sector}, procura apoio especializado em gestao de projectos para ${formData.serviceType === 'pmo' ? 'implementar um escritorio de projectos (PMO)' : formData.serviceType === 'restructuring' ? 'reestruturar os seus processos organizacionais' : formData.serviceType === 'monitoring' ? 'estabelecer um sistema de monitorizacao continua' : formData.serviceType === 'training' ? 'capacitar a sua equipa' : formData.serviceType === 'audit' ? 'auditar os seus processos actuais' : 'definir a sua estrategia organizacional'}.`;
  y = addParagraph(doc, contextText, y);
  
  const locationText = `O projecto envolve ${formData.locations.length} localizacao(oes): ${formData.locations.join(', ')}, com uma complexidade classificada como ${complexityLabels[formData.complexity].toLowerCase()} e maturidade do cliente considerada ${complexityLabels[formData.clientMaturity].toLowerCase()} em termos de gestao de projectos.`;
  y = addParagraph(doc, locationText, y);
  
  y = checkPageBreak(doc, y, 60);
  
  // Section 2: Objectives
  y = addSectionTitle(doc, '2. Objectivos do Projecto', y);
  
  const objectives = [
    `Implementar ${serviceLabels[formData.serviceType]} ao longo de ${formData.estimatedDuration} meses`,
    `Garantir entregaveis de alta qualidade: ${formData.deliverables.map(d => deliverableLabels[d] || d).join(', ')}`,
    `Utilizar metodologia ${methodologyLabels[formData.methodology]}`,
    formData.hasExistingTeam ? 'Trabalhar em colaboracao com a equipa existente do cliente' : 'Fornecer equipa completa de consultoria',
  ];
  
  objectives.forEach(obj => {
    y = addBulletPoint(doc, obj, y);
  });
  
  y = checkPageBreak(doc, y, 60);
  
  // Section 3: Support Required
  y = addSectionTitle(doc, '3. Tipo de Apoio Necessario', y);
  
  doc.setFontSize(10);
  doc.setFillColor(240, 240, 240);
  doc.rect(20, y, 80, 20, 'F');
  doc.rect(100, y, 80, 20, 'F');
  
  doc.text('Equipa Alocada', 25, y + 8);
  doc.setFont('helvetica', 'bold');
  doc.text(`${pricing.teamMembers.length} profissionais`, 25, y + 15);
  doc.setFont('helvetica', 'normal');
  
  doc.text('Total de Horas', 105, y + 8);
  doc.setFont('helvetica', 'bold');
  doc.text(`${formatNumber(pricing.totalHours)} horas`, 105, y + 15);
  doc.setFont('helvetica', 'normal');
}

function generateTechnicalDocument(doc: jsPDF, proposal: Proposal): void {
  const { formData, pricing } = proposal;
  
  addHeader(doc, 'Proposta Tecnica', `Referencia: PT-${proposal.id.slice(0, 8).toUpperCase()}`);
  addFooter(doc, doc.getNumberOfPages());
  
  let y = 50;
  
  // Scope
  y = addSectionTitle(doc, 'Escopo Detalhado', y);
  const scopeText = `${serviceLabels[formData.serviceType]} para ${formData.clientName}, abrangendo ${formData.locations.join(', ')}, com duracao de ${formData.estimatedDuration} meses e metodologia ${methodologyLabels[formData.methodology].toLowerCase()}.`;
  y = addParagraph(doc, scopeText, y);
  
  y = checkPageBreak(doc, y, 50);
  
  // Methodology
  y = addSectionTitle(doc, 'Metodologia', y);
  
  const methodologyDesc = formData.methodology === 'traditional' 
    ? 'Abordagem sequencial com fases bem definidas, ideal para projectos com escopo estavel.'
    : formData.methodology === 'agile'
    ? 'Abordagem iterativa com entregas incrementais, ideal para projectos com requisitos evolutivos.'
    : 'Combinacao de metodos tradicionais para planeamento macro e ageis para execucao, oferecendo flexibilidade.';
  
  doc.setFont('helvetica', 'bold');
  doc.text(methodologyLabels[formData.methodology], 20, y);
  doc.setFont('helvetica', 'normal');
  y += 6;
  y = addParagraph(doc, methodologyDesc, y);
  
  y = checkPageBreak(doc, y, 80);
  
  // Deliverables by Phase
  y = addSectionTitle(doc, 'Entregaveis por Fase', y);
  
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
  y = addSectionTitle(doc, 'Equipa Alocada', y);
  
  // Table header
  doc.setFillColor(37, 99, 235);
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
  
  pricing.teamMembers.forEach((member, index) => {
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
}

function generateBudgetDocument(doc: jsPDF, proposal: Proposal): void {
  const { formData, pricing } = proposal;
  
  addHeader(doc, 'Proposta Orcamental', `${formData.clientName}`);
  addFooter(doc, doc.getNumberOfPages());
  
  let y = 50;
  
  // Cost Breakdown
  y = addSectionTitle(doc, 'Decomposicao de Custos por Perfil', y);
  
  // Table header
  doc.setFillColor(37, 99, 235);
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
  
  y += 10;
  y = checkPageBreak(doc, y, 80);
  
  // Financial Summary
  y = addSectionTitle(doc, 'Resumo Financeiro', y);
  
  const financialItems = [
    { label: 'Custo Base', value: formatCurrency(pricing.baseCost) },
    { label: `Multiplicador Complexidade (${pricing.complexityMultiplier}x)`, value: formatCurrency(pricing.baseCost * pricing.complexityMultiplier) },
    { label: 'Overhead Operacional (15%)', value: formatCurrency(pricing.overhead) },
    { label: 'Margem (25%)', value: formatCurrency(pricing.margin) },
  ];
  
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
  doc.setFillColor(37, 99, 235);
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
  y = addSectionTitle(doc, 'Modelo de Pagamento', y);
  
  const payments = [
    { phase: 'Assinatura do Contrato', percent: 20 },
    { phase: 'Conclusao Fase 1-2', percent: 30 },
    { phase: 'Conclusao Fase 3', percent: 30 },
    { phase: 'Encerramento', percent: 20 },
  ];
  
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
}

export function exportProposalToPDF(proposal: Proposal, documentType: DocumentType = 'all'): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  const { formData } = proposal;
  
  if (documentType === 'diagnostic' || documentType === 'all') {
    generateDiagnosticDocument(doc, proposal);
    
    if (documentType === 'all') {
      doc.addPage();
    }
  }
  
  if (documentType === 'technical' || documentType === 'all') {
    if (documentType !== 'all') {
      // Clear and start fresh if only technical
      generateTechnicalDocument(doc, proposal);
    } else {
      generateTechnicalDocument(doc, proposal);
      doc.addPage();
    }
  }
  
  if (documentType === 'budget' || documentType === 'all') {
    generateBudgetDocument(doc, proposal);
  }
  
  // Update page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i);
  }
  
  const filename = documentType === 'all' 
    ? `Proposta_Completa_${formData.clientName.replace(/\s+/g, '_')}.pdf`
    : `${documentType === 'diagnostic' ? 'Diagnostico' : documentType === 'technical' ? 'Proposta_Tecnica' : 'Proposta_Orcamental'}_${formData.clientName.replace(/\s+/g, '_')}.pdf`;
  
  doc.save(filename);
}

export function exportSingleDocument(proposal: Proposal, documentType: 'diagnostic' | 'technical' | 'budget'): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  
  if (documentType === 'diagnostic') {
    generateDiagnosticDocument(doc, proposal);
  } else if (documentType === 'technical') {
    generateTechnicalDocument(doc, proposal);
  } else {
    generateBudgetDocument(doc, proposal);
  }
  
  addFooter(doc, 1);
  
  const { formData } = proposal;
  const docNames = {
    diagnostic: 'Diagnostico',
    technical: 'Proposta_Tecnica',
    budget: 'Proposta_Orcamental',
  };
  
  doc.save(`${docNames[documentType]}_${formData.clientName.replace(/\s+/g, '_')}.pdf`);
}
