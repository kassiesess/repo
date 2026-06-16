import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function InsurancePaymentForm({ amount, onComplete, onCancel }) {
  const [receiptFile, setReceiptFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Размер файла не должен превышать 10МБ');
        return;
      }
      setReceiptFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!receiptFile) {
      toast.error('Загрузите квитанцию об оплате');
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: receiptFile });
      await onComplete({ receipt_url: file_url });
    } catch (error) {
      toast.error('Ошибка при загрузке квитанции');
      console.error(error);
    }
    setUploading(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-slate-700 mb-1.5 block">Загрузите квитанцию об оплате</Label>
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-emerald-400 transition-colors">
          {receiptFile ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
                <span className="font-medium">{receiptFile.name}</span>
              </div>
              <label className="cursor-pointer">
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileSelect} />
                <span className="text-sm text-slate-500 hover:text-slate-700">Изменить файл</span>
              </label>
            </div>
          ) : (
            <label className="cursor-pointer block">
              <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileSelect} />
              <Upload className="w-12 h-12 mx-auto text-slate-400 mb-2" />
              <p className="text-slate-600 font-medium">Нажмите для загрузки</p>
              <p className="text-sm text-slate-400 mt-1">Фото или PDF квитанции (до 10МБ)</p>
            </label>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1 h-12">
          Отмена
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={!receiptFile || uploading}
          className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700"
        >
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Подтвердить оплату'}
        </Button>
      </div>
    </div>
  );
}