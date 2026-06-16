import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import MobileSelectDrawer from '@/components/ui/mobile-select-drawer';
import { FileText, Loader2, Download } from 'lucide-react';

export default function TaxReportButton({ userId }) {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= currentYear - 5; y--) {
    years.push(y);
  }

  const generateTaxReportHTML = (data) => {
    return `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Налоговый отчёт за ${data.year} год</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
    h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
    .info { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .info p { margin: 8px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #f0f0f0; }
    .total { font-weight: bold; font-size: 1.2em; }
    .footer { margin-top: 40px; font-size: 0.9em; color: #666; }
    @media print { body { margin: 0; padding: 20px; } }
  </style>
</head>
<body>
  <h1>📋 Налоговый отчёт</h1>
  <p><strong>Период:</strong> ${data.year} год</p>
  <p><strong>Дата формирования:</strong> ${new Date(data.report_date).toLocaleDateString('ru-RU')}</p>
  
  <div class="info">
    <p><strong>Пользователь:</strong> ${data.user_id?.substring(0, 12)}...</p>
    <p><strong>Всего платежей:</strong> ${data.total_payments}</p>
    <p><strong>Общая сумма процентов:</strong> ${data.total_interest?.toLocaleString('ru-RU')} сом</p>
  </div>
  
  <table>
    <tr>
      <th>Показатель</th>
      <th>Значение</th>
    </tr>
    <tr>
      <td>Количество платежей</td>
      <td>${data.total_payments}</td>
    </tr>
    <tr>
      <td>Сумма процентов</td>
      <td>${data.total_interest?.toLocaleString('ru-RU')} сом</td>
    </tr>
    <tr>
      <td>НДФЛ (10%)</td>
      <td>${(data.total_interest * 0.1)?.toLocaleString('ru-RU')} сом</td>
    </tr>
    <tr class="total">
      <td>Чистый доход</td>
      <td>${(data.total_interest * 0.9)?.toLocaleString('ru-RU')} сом</td>
    </tr>
  </table>
  
  <div class="footer">
    <p><strong>Примечание:</strong></p>
    <p>Данный отчёт сформирован автоматически и содержит информацию о процентных доходах по договорам займа.</p>
    <p>Согласно Налоговому кодексу КР, доход в виде процентов по договорам займа облагается НДФЛ по ставке 10%.</p>
    <p>Налогоплательщик обязан самостоятельно исчислить и уплатить налог.</p>
  </div>
</body>
</html>`;
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('generateTaxReport', {
        userId,
        year: parseInt(year)
      });
      
      if (response?.data) {
        const htmlContent = generateTaxReportHTML(response.data);
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tax-report-${year}.html`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        
        setOpen(false);
      }
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
                Скачать отчёт
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