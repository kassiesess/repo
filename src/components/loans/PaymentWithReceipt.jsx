import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, CheckCircle2, Banknote, Copy } from 'lucide-react';
import { toast } from 'sonner';

const banks = [
  { id: 'bakai', name: 'БайКай Банк', logo: '🏦' },
  { id: 'optima', name: 'Оптима Банк', logo: '🏦' },
  { id: 'dos', name: 'ДОС-Кредобанк', logo: '🏦' },
  { id: 'kyrgyz', name: 'Кыргызкоммерцбанк', logo: '🏦' },
  { id: 'rsk', name: 'РСК Банк', logo: '🏦' },
  { id: 'mbank', name: 'MBank', logo: '📱' },
  { id: 'other', name: 'Другой банк', logo: '🏦' }
];

export default function PaymentWithReceipt({ loan, onSuccess }) {
  const [step, setStep] = useState(1); // 1: bank, 2: upload receipt
  const [selectedBank, setSelectedBank] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const copyLoanId = () => {
    navigator.clipboard.writeText(`LOAN-${loan.id.substring(0, 8).toUpperCase()}`);
    toast.success('ID займа скопирован');
  };

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
    if (!receiptFile || !paymentAmount || !selectedBank) {
      toast.error('Заполните все поля и загрузите квитанцию');
      return;
    }

    setProcessing(true);
    try {
      // Upload receipt
      setUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ 
        file: receiptFile 
      });
      setUploading(false);

      const user = await base44.auth.me();
      const amount = parseFloat(paymentAmount);

      // Update loan with new receipt
      const newReceipt = {
        receipt_url: file_url,
        amount: amount,
        payment_date: new Date().toISOString().split('T')[0],
        bank_name: banks.find(b => b.id === selectedBank)?.name,
        uploaded_by: user.id
      };

      const currentReceipts = loan.payment_receipts || [];
      const newAmountPaid = (loan.amount_paid || 0) + amount;
      const isCompleted = newAmountPaid >= loan.total_repayment;

      await base44.entities.Loan.update(loan.id, {
        payment_receipts: [...currentReceipts, newReceipt],
        amount_paid: newAmountPaid,
        status: isCompleted ? 'completed' : 'active'
      });

      toast.success('Платеж успешно зарегистрирован');
      onSuccess();
    } catch (error) {
      console.error('Payment submission failed:', error);
      toast.error('Ошибка при отправке платежа');
    } finally {
      setProcessing(false);
      setUploading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Banknote className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-blue-900 mb-1">Инструкция по оплате:</p>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Выберите ваш банк</li>
                <li>Откройте банковское приложение</li>
                <li>Переведите деньги займодавцу</li>
                <li>Укажите ID займа в назначении платежа</li>
                <li>Загрузите квитанцию в приложении</li>
              </ol>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-slate-700 font-medium mb-3 block">Выберите ваш банк</Label>
          <div className="grid grid-cols-2 gap-3">
            {banks.map((bank) => (
              <button
                key={bank.id}
                onClick={() => {
                  setSelectedBank(bank.id);
                  setStep(2);
                }}
                className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                  selectedBank === bank.id
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-3xl mb-2">{bank.logo}</div>
                <p className="text-sm font-medium text-slate-700">{bank.name}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-slate-600 font-medium">ID займа (для назначения платежа)</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyLoanId}
            className="h-8"
          >
            <Copy className="w-4 h-4 mr-1" />
            Копировать
          </Button>
        </div>
        <p className="font-mono font-bold text-lg text-emerald-600">
          LOAN-{loan.id.substring(0, 8).toUpperCase()}
        </p>
      </div>

      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
        <p className="text-sm text-amber-900">
          <strong>Важно:</strong> Укажите этот ID в назначении платежа при переводе через банк. 
          Это необходимо для автоматической идентификации платежа.
        </p>
      </div>

      <div>
        <Label className="text-slate-700 mb-1.5 block">Сумма платежа (сом)</Label>
        <Input
          type="number"
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(e.target.value)}
          placeholder={`Рекомендуем: ${loan.monthly_payment}`}
          className="h-12"
        />
        <p className="text-sm text-slate-500 mt-1">
          Ежемесячный платеж: {new Intl.NumberFormat('ru-RU').format(loan.monthly_payment)} сом
        </p>
      </div>

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
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <span className="text-sm text-slate-500 hover:text-slate-700">
                  Изменить файл
                </span>
              </label>
            </div>
          ) : (
            <label className="cursor-pointer block">
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Upload className="w-12 h-12 mx-auto text-slate-400 mb-2" />
              <p className="text-slate-600 font-medium">Нажмите для загрузки</p>
              <p className="text-sm text-slate-400 mt-1">
                Фото или PDF квитанции (до 10МБ)
              </p>
            </label>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={() => setStep(1)}
          className="flex-1 h-12"
        >
          Назад
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!receiptFile || !paymentAmount || processing}
          className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700"
        >
          {processing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              {uploading ? 'Загрузка...' : 'Обработка...'}
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Подтвердить платеж
            </>
          )}
        </Button>
      </div>
    </div>
  );
}