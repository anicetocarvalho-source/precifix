import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

interface PdfPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  generatePdf: () => jsPDF;
  title: string;
  onExport: () => void;
}

export function PdfPreviewDialog({
  open,
  onOpenChange,
  generatePdf,
  title,
  onExport,
}: PdfPreviewDialogProps) {
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      setCurrentPage(1);
      
      // Generate PDF in a timeout to allow dialog to render first
      const timer = setTimeout(() => {
        try {
          const doc = generatePdf();
          const pages = doc.internal.pages.length - 1; // jsPDF starts from index 1
          setTotalPages(pages);
          
          // Convert to data URL for preview
          const dataUrl = doc.output('dataurlstring');
          setPdfDataUrl(dataUrl);
        } catch (error) {
          console.error('Error generating PDF preview:', error);
        } finally {
          setIsLoading(false);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      setPdfDataUrl(null);
    }
  }, [open, generatePdf]);

  const handleExport = () => {
    onExport();
    onOpenChange(false);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-primary" />
              <DialogTitle className="text-lg">{title}</DialogTitle>
            </div>
            
            {/* Zoom and page controls */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-background rounded-lg px-2 py-1 border">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleZoomOut}
                  disabled={zoom <= 50}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm font-medium w-12 text-center">{zoom}%</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center gap-2 bg-background rounded-lg px-2 py-1 border">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>
        
        {/* PDF Preview Area */}
        <div className="flex-1 overflow-auto bg-muted/50 p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-muted-foreground">A gerar pré-visualização...</p>
            </div>
          ) : pdfDataUrl ? (
            <div className="flex justify-center">
              <div 
                className="bg-white shadow-lg rounded-sm overflow-hidden transition-transform duration-200"
                style={{ 
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top center',
                }}
              >
                <iframe
                  src={`${pdfDataUrl}#page=${currentPage}&toolbar=0&navpanes=0`}
                  className="w-[210mm] h-[297mm] border-0"
                  title="PDF Preview"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Erro ao gerar pré-visualização</p>
            </div>
          )}
        </div>
        
        <DialogFooter className="px-6 py-4 border-t bg-muted/30">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Exportar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
