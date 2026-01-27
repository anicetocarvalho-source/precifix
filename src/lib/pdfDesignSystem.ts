import jsPDF from 'jspdf';
import { SERVICE_CATEGORIES, ServiceCategory } from '@/types/proposal';

// ============= COLOR SYSTEM =============

export interface ColorPalette {
  primary: [number, number, number];
  secondary: [number, number, number];
  accent: [number, number, number];
  light: [number, number, number];
}

export const sectorPalettes: Record<ServiceCategory, ColorPalette> = {
  consulting: {
    primary: [30, 64, 175],      // Blue 700
    secondary: [59, 130, 246],   // Blue 500
    accent: [147, 197, 253],     // Blue 300
    light: [239, 246, 255],      // Blue 50
  },
  events: {
    primary: [185, 28, 28],      // Red 700
    secondary: [239, 68, 68],    // Red 500
    accent: [252, 165, 165],     // Red 300
    light: [254, 242, 242],      // Red 50
  },
  creative: {
    primary: [126, 34, 206],     // Purple 700
    secondary: [168, 85, 247],   // Purple 500
    accent: [216, 180, 254],     // Purple 300
    light: [250, 245, 255],      // Purple 50
  },
  technology: {
    primary: [4, 120, 87],       // Emerald 700
    secondary: [16, 185, 129],   // Emerald 500
    accent: [110, 231, 183],     // Emerald 300
    light: [236, 253, 245],      // Emerald 50
  },
};

// Neutral colors for consistent UI
export const neutralColors = {
  white: [255, 255, 255] as [number, number, number],
  gray50: [249, 250, 251] as [number, number, number],
  gray100: [243, 244, 246] as [number, number, number],
  gray200: [229, 231, 235] as [number, number, number],
  gray300: [209, 213, 219] as [number, number, number],
  gray400: [156, 163, 175] as [number, number, number],
  gray500: [107, 114, 128] as [number, number, number],
  gray600: [75, 85, 99] as [number, number, number],
  gray700: [55, 65, 81] as [number, number, number],
  gray800: [31, 41, 55] as [number, number, number],
  gray900: [17, 24, 39] as [number, number, number],
};

export function getServiceCategory(serviceType: string): ServiceCategory {
  return SERVICE_CATEGORIES[serviceType as keyof typeof SERVICE_CATEGORIES] || 'consulting';
}

export function getPalette(serviceType: string): ColorPalette {
  const category = getServiceCategory(serviceType);
  return sectorPalettes[category];
}

export function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [30, 64, 175];
}

// ============= PAGE UTILITIES =============

export function checkPageBreak(doc: jsPDF, currentY: number, requiredSpace: number = 40): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (currentY + requiredSpace > pageHeight - 30) {
    doc.addPage();
    return 50;
  }
  return currentY;
}

export function getPageDimensions(doc: jsPDF) {
  return {
    width: doc.internal.pageSize.getWidth(),
    height: doc.internal.pageSize.getHeight(),
    margin: 20,
    contentWidth: doc.internal.pageSize.getWidth() - 40,
  };
}

// ============= MODERN HEADER COMPONENT =============

export interface HeaderOptions {
  title: string;
  subtitle?: string;
  reference?: string;
  date?: string;
  palette: ColorPalette;
  brandColor?: [number, number, number];
}

export function addModernHeader(doc: jsPDF, options: HeaderOptions): void {
  const { width } = getPageDimensions(doc);
  const color = options.brandColor || options.palette.primary;
  const accentColor = options.brandColor 
    ? [Math.min(255, color[0] + 40), Math.min(255, color[1] + 40), Math.min(255, color[2] + 40)] as [number, number, number]
    : options.palette.secondary;

  // Main header background with slight gradient effect
  doc.setFillColor(...color);
  doc.rect(0, 0, width, 42, 'F');
  
  // Accent stripe
  doc.setFillColor(...accentColor);
  doc.rect(0, 42, width, 3, 'F');
  
  // Geometric accent (subtle triangle)
  doc.setFillColor(255, 255, 255);
  doc.setGState(doc.GState({ opacity: 0.1 }));
  doc.triangle(width - 80, 0, width, 0, width, 80, 'F');
  doc.setGState(doc.GState({ opacity: 1 }));
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(options.title, 20, 22);
  
  // Subtitle
  if (options.subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(options.subtitle, 20, 34);
  }
  
  // Reference on the right
  if (options.reference) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(options.reference, width - 20, 22, { align: 'right' });
  }
  
  if (options.date) {
    doc.setFontSize(9);
    doc.text(options.date, width - 20, 34, { align: 'right' });
  }
  
  // Reset
  doc.setTextColor(0, 0, 0);
}

// ============= MODERN FOOTER COMPONENT =============

export interface FooterOptions {
  pageNumber: number;
  totalPages?: number;
  companyName?: string;
  website?: string;
  palette: ColorPalette;
}

export function addModernFooter(doc: jsPDF, options: FooterOptions): void {
  const { width, height } = getPageDimensions(doc);
  
  // Footer line
  doc.setDrawColor(...options.palette.secondary);
  doc.setLineWidth(0.5);
  doc.line(20, height - 18, width - 20, height - 18);
  
  // Page number
  doc.setFontSize(9);
  doc.setTextColor(...neutralColors.gray500);
  const pageText = options.totalPages 
    ? `Página ${options.pageNumber} de ${options.totalPages}`
    : `Página ${options.pageNumber}`;
  doc.text(pageText, width / 2, height - 10, { align: 'center' });
  
  // Company name on left
  if (options.companyName) {
    doc.setFont('helvetica', 'bold');
    doc.text(options.companyName, 20, height - 10);
  }
  
  // Website on right
  if (options.website) {
    doc.setFont('helvetica', 'normal');
    doc.text(options.website, width - 20, height - 10, { align: 'right' });
  }
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
}

// ============= SECTION TITLE COMPONENT =============

export interface SectionTitleOptions {
  number?: number;
  title: string;
  palette: ColorPalette;
}

export function addSectionTitle(doc: jsPDF, y: number, options: SectionTitleOptions): number {
  const { margin } = getPageDimensions(doc);
  
  if (options.number !== undefined) {
    // Circular number badge
    doc.setFillColor(...options.palette.primary);
    doc.circle(margin + 6, y - 2, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(String(options.number), margin + 6, y, { align: 'center' });
    
    // Title text
    doc.setTextColor(...options.palette.primary);
    doc.setFontSize(14);
    doc.text(options.title, margin + 18, y);
  } else {
    doc.setTextColor(...options.palette.primary);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(options.title, margin, y);
  }
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  
  return y + 10;
}

// ============= INFO CARD COMPONENT =============

export interface InfoCardOptions {
  items: { label: string; value: string }[];
  palette: ColorPalette;
  columns?: number;
}

export function addInfoCard(doc: jsPDF, y: number, options: InfoCardOptions): number {
  const { margin, contentWidth } = getPageDimensions(doc);
  const columns = options.columns || 2;
  const itemWidth = contentWidth / columns;
  const rows = Math.ceil(options.items.length / columns);
  const rowHeight = 22;
  const cardHeight = rows * rowHeight + 16;
  
  // Card background
  doc.setFillColor(...options.palette.light);
  doc.roundedRect(margin, y, contentWidth, cardHeight, 4, 4, 'F');
  
  // Left accent bar
  doc.setFillColor(...options.palette.primary);
  doc.roundedRect(margin, y, 4, cardHeight, 2, 2, 'F');
  
  // Items
  options.items.forEach((item, index) => {
    const row = Math.floor(index / columns);
    const col = index % columns;
    const itemX = margin + 12 + col * itemWidth;
    const itemY = y + 12 + row * rowHeight;
    
    // Label
    doc.setFontSize(9);
    doc.setTextColor(...neutralColors.gray500);
    doc.setFont('helvetica', 'normal');
    doc.text(item.label.toUpperCase(), itemX, itemY);
    
    // Value
    doc.setFontSize(12);
    doc.setTextColor(...neutralColors.gray800);
    doc.setFont('helvetica', 'bold');
    doc.text(item.value, itemX, itemY + 10);
  });
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  return y + cardHeight + 12;
}

// ============= BULLET LIST COMPONENT =============

export interface BulletListOptions {
  items: string[];
  palette: ColorPalette;
  icon?: 'dot' | 'check' | 'arrow';
}

export function addBulletList(doc: jsPDF, y: number, options: BulletListOptions): number {
  const { margin } = getPageDimensions(doc);
  let currentY = y;
  
  options.items.forEach((item) => {
    currentY = checkPageBreak(doc, currentY, 10);
    
    // Bullet
    doc.setFillColor(...options.palette.primary);
    if (options.icon === 'check') {
      // Checkmark style
      doc.circle(margin + 4, currentY - 1.5, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.text('✓', margin + 4, currentY, { align: 'center' });
    } else {
      // Simple dot
      doc.circle(margin + 4, currentY - 1.5, 2, 'F');
    }
    
    // Text
    doc.setFontSize(10);
    doc.setTextColor(...neutralColors.gray700);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(item, 155);
    doc.text(lines, margin + 12, currentY);
    currentY += lines.length * 5 + 4;
  });
  
  doc.setTextColor(0, 0, 0);
  return currentY;
}

// ============= PARAGRAPH COMPONENT =============

export function addParagraph(doc: jsPDF, y: number, text: string, maxWidth?: number): number {
  const { margin, contentWidth } = getPageDimensions(doc);
  const width = maxWidth || contentWidth;
  
  doc.setFontSize(10);
  doc.setTextColor(...neutralColors.gray700);
  doc.setFont('helvetica', 'normal');
  
  const lines = doc.splitTextToSize(text, width);
  doc.text(lines, margin, y);
  
  doc.setTextColor(0, 0, 0);
  return y + lines.length * 5 + 6;
}

// ============= PHASE/TIMELINE COMPONENT =============

export interface PhaseItem {
  phase: string;
  items: string[];
}

export function addPhaseTimeline(doc: jsPDF, y: number, phases: PhaseItem[], palette: ColorPalette): number {
  const { margin } = getPageDimensions(doc);
  let currentY = y;
  
  phases.forEach((phase, index) => {
    currentY = checkPageBreak(doc, currentY, 40);
    
    // Phase header with background
    doc.setFillColor(...palette.light);
    doc.roundedRect(margin, currentY - 4, 170, 14, 2, 2, 'F');
    
    // Phase number circle
    doc.setFillColor(...palette.primary);
    doc.circle(margin + 8, currentY + 3, 5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(String(index + 1), margin + 8, currentY + 4.5, { align: 'center' });
    
    // Phase name
    doc.setTextColor(...palette.primary);
    doc.setFontSize(11);
    doc.text(phase.phase, margin + 18, currentY + 5);
    
    currentY += 16;
    
    // Phase items
    doc.setFont('helvetica', 'normal');
    phase.items.forEach((item) => {
      doc.setFillColor(...palette.accent);
      doc.circle(margin + 8, currentY - 1, 1.5, 'F');
      
      doc.setFontSize(9);
      doc.setTextColor(...neutralColors.gray600);
      const lines = doc.splitTextToSize(item, 150);
      doc.text(lines, margin + 14, currentY);
      currentY += lines.length * 4 + 3;
    });
    
    currentY += 6;
  });
  
  doc.setTextColor(0, 0, 0);
  return currentY;
}

// ============= MODERN TABLE COMPONENT =============

export interface TableColumn {
  header: string;
  key: string;
  width: number;
  align?: 'left' | 'center' | 'right';
}

export interface TableOptions {
  columns: TableColumn[];
  data: Record<string, string | number>[];
  palette: ColorPalette;
  showTotal?: { label: string; value: string };
}

export function addModernTable(doc: jsPDF, y: number, options: TableOptions): number {
  const { margin } = getPageDimensions(doc);
  let currentY = y;
  const rowHeight = 10;
  
  // Calculate total width
  const totalWidth = options.columns.reduce((sum, col) => sum + col.width, 0);
  
  // Header row
  doc.setFillColor(...options.palette.primary);
  doc.roundedRect(margin, currentY, totalWidth, rowHeight + 2, 2, 2, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  
  let headerX = margin + 4;
  options.columns.forEach((col) => {
    const align = col.align || 'left';
    const textX = align === 'right' ? headerX + col.width - 8 : align === 'center' ? headerX + col.width / 2 : headerX;
    doc.text(col.header, textX, currentY + 7, { align: align === 'center' ? 'center' : align === 'right' ? 'right' : undefined });
    headerX += col.width;
  });
  
  currentY += rowHeight + 4;
  
  // Data rows
  doc.setFont('helvetica', 'normal');
  options.data.forEach((row, rowIndex) => {
    currentY = checkPageBreak(doc, currentY, rowHeight + 2);
    
    // Alternating row background
    if (rowIndex % 2 === 0) {
      doc.setFillColor(...neutralColors.gray50);
      doc.rect(margin, currentY - 2, totalWidth, rowHeight, 'F');
    }
    
    let cellX = margin + 4;
    options.columns.forEach((col) => {
      const value = String(row[col.key] ?? '');
      const align = col.align || 'left';
      const textX = align === 'right' ? cellX + col.width - 8 : align === 'center' ? cellX + col.width / 2 : cellX;
      
      doc.setTextColor(...neutralColors.gray700);
      doc.setFontSize(9);
      doc.text(value, textX, currentY + 4, { align: align === 'center' ? 'center' : align === 'right' ? 'right' : undefined });
      cellX += col.width;
    });
    
    currentY += rowHeight;
  });
  
  // Total row if provided
  if (options.showTotal) {
    currentY += 2;
    doc.setFillColor(...options.palette.primary);
    doc.roundedRect(margin, currentY, totalWidth, rowHeight + 2, 2, 2, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(options.showTotal.label, margin + 4, currentY + 7);
    doc.text(options.showTotal.value, margin + totalWidth - 8, currentY + 7, { align: 'right' });
    currentY += rowHeight + 4;
  }
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  
  return currentY + 8;
}

// ============= HIGHLIGHT BOX COMPONENT =============

export interface HighlightBoxOptions {
  title: string;
  content: string;
  palette: ColorPalette;
  icon?: string;
}

export function addHighlightBox(doc: jsPDF, y: number, options: HighlightBoxOptions): number {
  const { margin, contentWidth } = getPageDimensions(doc);
  
  const lines = doc.splitTextToSize(options.content, contentWidth - 20);
  const boxHeight = 20 + lines.length * 5;
  
  // Box with left accent
  doc.setFillColor(...options.palette.light);
  doc.roundedRect(margin, y, contentWidth, boxHeight, 3, 3, 'F');
  
  doc.setFillColor(...options.palette.primary);
  doc.roundedRect(margin, y, 4, boxHeight, 2, 2, 'F');
  
  // Title
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...options.palette.primary);
  doc.text(options.title, margin + 12, y + 12);
  
  // Content
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...neutralColors.gray600);
  doc.text(lines, margin + 12, y + 22);
  
  doc.setTextColor(0, 0, 0);
  return y + boxHeight + 10;
}

// ============= VALUE HIGHLIGHT COMPONENT =============

export function addValueHighlight(doc: jsPDF, y: number, label: string, value: string, palette: ColorPalette): number {
  const { margin, contentWidth } = getPageDimensions(doc);
  
  // Full-width colored box
  doc.setFillColor(...palette.primary);
  doc.roundedRect(margin, y, contentWidth, 35, 4, 4, 'F');
  
  // Label
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(label.toUpperCase(), margin + 12, y + 14);
  
  // Value
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(value, margin + 12, y + 28);
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  
  return y + 45;
}

// ============= CONTACT INFO COMPONENT =============

export interface ContactInfo {
  email?: string;
  phone?: string;
}

export function addContactInfo(doc: jsPDF, y: number, contact: ContactInfo): number {
  const { margin } = getPageDimensions(doc);
  
  if (!contact.email && !contact.phone) return y;
  
  doc.setFontSize(9);
  doc.setTextColor(...neutralColors.gray500);
  
  const parts = [];
  if (contact.email) parts.push(`Email: ${contact.email}`);
  if (contact.phone) parts.push(`Tel: ${contact.phone}`);
  
  doc.text(parts.join('  |  '), margin, y);
  doc.setTextColor(0, 0, 0);
  
  return y + 8;
}
