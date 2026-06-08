import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import MobileSelectDrawer from '@/components/ui/mobile-select-drawer';
import { FileText, Loader2, Download } from 'lucide-react';

export default function TaxReportButton() {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= currentYear - 5; y--) {
    years.push(y);
  }

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('generateTaxReport', {
        year: parseInt(year)
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tax-report-${year}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      setOpen(false);
    } catch (error) {
      console.error('Error generating tax report:', error);
      alert('Ошибка при генерации отчёта');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full glass-strong border-white/20 text-white hover:bg-white/10">
          <FileText className="w-4 h-4 mr-2" />
          Налоговый отчёт
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-strong border-white/20">
        <DialogHeader>
          <DialogTitle className="text-white">Скачать налоговый отчёт</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Выберите год</label>
            <MobileSelectDrawer
              title="Выберите год"
              value={year}
              onValueChange={setYear}
              options={years.map(y => ({ value: y.toString(), label: y.toString() }))}
              trigger={
                <button className="w-full h-10 flex items-center justify-between px-4 rounded-xl glass border border-white/20 text-white text-sm hover:bg-white/10 transition-colors">
                  <span>{year}</span>
                  <span className="text-white/50">▾</span>
                </button>
              }
            />
          </div>
          <Button
            onClick={handleDownload}
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Скачать PDF
              </>
            )}
          </Button>
          <p className="text-xs text-slate-400 text-center">
            Отчёт включает информацию о процентных доходах и уплаченном НДФЛ
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}