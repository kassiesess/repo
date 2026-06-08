import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { base44 } from '@/api/base44Client';
import { Calculator, Send, CheckCircle2, Loader2, ArrowRight, Banknote, Percent, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { addMonths, format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function LoanCreationWizard({ user, onComplete, onCancel }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    borrower_email: '',
    amount: 50000,
    interest_rate: 0,
    term_months: 6,
    notes: '',
    monthly_payments: false
  });

  const calculateLoan = () => {
    const principal = formData.amount;
    const rate = formData.interest_rate / 100;
    const months = formData.term_months;
    
    const totalInterest = principal * rate * (months / 12);
    const taxAmount = totalInterest * 0.1;
    const totalRepayment = principal + totalInterest;
    const monthlyPayment = formData.monthly_payments ? (totalRepayment / months) : totalRepayment;
    
    const startDate = new Date();
    const endDate = addMonths(startDate, months);
    
    return {
      totalInterest: Math.round(totalInterest),
      taxAmount: Math.round(taxAmount),
      totalRepayment: Math.round(totalRepayment),
      monthlyPayment: Math.round(monthlyPayment),
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd')
    };
  };

  const calculations = calculateLoan();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const newLoan = await base44.entities.Loan.create({
        lender_id: user.id,
        lender_name: user.full_name,
        lender_passport: `${user.passport_series} ${user.passport_number}`,
        borrower_email: formData.borrower_email,
        amount: formData.amount,
        interest_rate: formData.interest_rate,
        term_months: formData.term_months,
        start_date: calculations.startDate,
        end_date: calculations.endDate,
        total_interest: calculations.totalInterest,
        tax_amount: calculations.taxAmount,
        total_repayment: calculations.totalRepayment,
        monthly_payment: calculations.monthlyPayment,
        monthly_payments: formData.monthly_payments,
        status: 'pending',
        notes: formData.notes
      });

      try {
        await base44.functions.invoke('detectFraud', {
          userId: user.id,
          loanId: newLoan.id,
          type: 'loan'
        });
      } catch (e) {
        console.log('Fraud check:', e);
      }

      try {
        await base44.functions.invoke('notifyLoanCreated', {
          loanId: newLoan.id
        });
      } catch (e) {
        console.log('Notification error:', e);
      }

      onComplete();
    } catch (error) {
      console.error('Failed to create loan:', error);
    }
    setLoading(false);
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('ru-RU').format(amount);
  };

  return (
    <div className="max-w-lg mx-auto">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="glass-strong rounded-3xl p-6 border border-white/10 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-violet-500 shadow-lg shadow-violet-500/50">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Параметры займа</h2>
                  <p className="text-sm text-white/70">Укажите условия займа</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="text-white font-medium flex items-center gap-2 mb-3">
                    <Banknote className="w-4 h-4" />
                    Сумма займа
                  </Label>
                  <div className="glass rounded-2xl p-5 border border-white/10 bg-white/5 mb-4">
                    <div className="text-center mb-1">
                      <span className="text-4xl font-bold text-white">{formatMoney(formData.amount)}</span>
                      <span className="text-2xl font-bold text-white/70 ml-2">сом</span>
                    </div>
                  </div>
                  <Slider
                    value={[formData.amount]}
                    onValueChange={([value]) => setFormData(prev => ({ ...prev, amount: value }))}
                    min={5000}
                    max={1000000}
                    step={5000}
                    className="py-4"
                  />
                  <div className="flex justify-between text-sm text-white/70 mt-2">
                    <span>5 000</span>
                    <span>1 000 000</span>
                  </div>
                </div>

                <div>
                  <Label className="text-white font-medium flex items-center gap-2 mb-3">
                    <Percent className="w-4 h-4" />
                    Процентная ставка
                  </Label>
                  <div className="glass rounded-2xl p-5 border border-white/10 bg-white/5 mb-4">
                    <div className="text-center mb-1">
                      <span className="text-4xl font-bold text-white">{formData.interest_rate}</span>
                      <span className="text-2xl font-bold text-white/70 ml-2">% годовых</span>
                    </div>
                  </div>
                  <Slider
                    value={[formData.interest_rate]}
                    onValueChange={([value]) => setFormData(prev => ({ ...prev, interest_rate: value }))}
                    min={0}
                    max={36}
                    step={1}
                    className="py-4"
                  />
                  <div className="flex justify-between text-sm text-white/70 mt-2">
                    <span>0%</span>
                    <span>36%</span>
                  </div>
                </div>

                <div>
                  <Label className="text-white font-medium flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4" />
                    Срок займа
                  </Label>
                  <div className="glass rounded-2xl p-5 border border-white/10 bg-white/5 mb-4">
                    <div className="text-center mb-1">
                      <span className="text-4xl font-bold text-white">{formData.term_months}</span>
                      <span className="text-2xl font-bold text-white/70 ml-2">{formData.term_months === 1 ? 'месяц' : formData.term_months < 5 ? 'месяца' : 'месяцев'}</span>
                    </div>
                  </div>
                  <Slider
                    value={[formData.term_months]}
                    onValueChange={([value]) => setFormData(prev => ({ ...prev, term_months: value }))}
                    min={1}
                    max={36}
                    step={1}
                    className="py-4"
                  />
                  <div className="flex justify-between text-sm text-white/70 mt-2">
                    <span>1</span>
                    <span>36</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 glass rounded-2xl border border-white/10">
                  <div>
                    <Label className="text-white font-medium">Ежемесячный платеж</Label>
                    <p className="text-sm text-white/60 mt-1">
                      {formData.monthly_payments 
                        ? 'Равными частями каждый месяц' 
                        : 'Полная сумма в конце срока'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, monthly_payments: !prev.monthly_payments }))}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      formData.monthly_payments ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        formData.monthly_payments ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="glass rounded-2xl p-5 border border-white/10 bg-white/5">
                  <h4 className="font-bold text-white mb-4 text-lg">Расчет займа</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/70">Сумма займа</span>
                      <span className="font-bold text-white text-lg">{formatMoney(formData.amount)} сом</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Проценты за период</span>
                      <span className="font-bold text-white text-lg">{formatMoney(calculations.totalInterest)} сом</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Налог на доход (10%)</span>
                      <span className="font-bold text-amber-400 text-lg">{formatMoney(calculations.taxAmount)} сом</span>
                    </div>
                    <div className="border-t border-white/20 pt-3 mt-3">
                      <div className="flex justify-between">
                        <span className="font-bold text-white">К возврату</span>
                        <span className="font-bold text-2xl text-white">{formatMoney(calculations.totalRepayment)} сом</span>
                      </div>
                      {formData.monthly_payments && (
                        <div className="flex justify-between mt-2">
                          <span className="text-white/70">Ежемесячный платеж</span>
                          <span className="font-bold text-emerald-400 text-lg">{formatMoney(calculations.monthlyPayment)} сом</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={onCancel}
                    className="flex-1 h-14 glass-strong border-white/30 text-white hover:bg-white/10 text-base"
                  >
                    Отмена
                  </Button>
                  <Button 
                    onClick={() => setStep(2)} 
                    className="flex-1 h-14 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 hover:from-violet-600 hover:via-fuchsia-600 hover:to-pink-600 text-white shadow-lg shadow-fuchsia-500/50 text-base font-semibold"
                  >
                    Далее
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="glass-strong rounded-3xl p-6 border border-white/10 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-fuchsia-500 shadow-lg shadow-fuchsia-500/50">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Заемщик</h2>
                  <p className="text-sm text-white/70">Укажите email заемщика</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <Label className="text-white font-medium mb-2 block">Email заемщика</Label>
                  <Input
                    type="email"
                    placeholder="zaemschik@email.com"
                    value={formData.borrower_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, borrower_email: e.target.value }))}
                    className="h-14 text-base text-white bg-white/10 border-white/30 placeholder:text-white/40"
                  />
                  <p className="text-sm text-white/60 mt-2">
                    Заемщик получит уведомление и должен будет принять займ
                  </p>
                </div>
                
                <div>
                  <Label className="text-white font-medium mb-2 block">Примечания (необязательно)</Label>
                  <Input
                    placeholder="Цель займа, особые условия..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="h-14 text-base text-white bg-white/10 border-white/30 placeholder:text-white/40"
                  />
                </div>

                <div className="glass rounded-2xl p-4 border border-amber-400/30 bg-amber-500/10">
                  <p className="text-sm text-white leading-relaxed">
                    <strong className="text-amber-300">Важно:</strong> После создания займа будет сформирован официальный договор согласно законодательству КР. Обе стороны должны подписать договор.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(1)}
                    className="flex-1 h-14 glass-strong border-white/30 text-white hover:bg-white/10 text-base"
                  >
                    Назад
                  </Button>
                  <Button 
                    onClick={() => setStep(3)} 
                    className="flex-1 h-14 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 hover:from-violet-600 hover:via-fuchsia-600 hover:to-pink-600 text-white shadow-lg shadow-fuchsia-500/50 text-base font-semibold"
                    disabled={!formData.borrower_email}
                  >
                    Просмотр
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="glass-strong rounded-3xl p-6 border border-white/10 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-pink-500 shadow-lg shadow-pink-500/50">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Подтверждение</h2>
                  <p className="text-sm text-white/70">Проверьте данные и создайте займ</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="glass rounded-2xl p-5 border border-white/10 bg-white/5">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-white/60 mb-1">Кредитор</p>
                      <p className="font-bold text-white">{user.full_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60 mb-1">Заемщик</p>
                      <p className="font-bold text-white">{formData.borrower_email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60 mb-1">Сумма займа</p>
                      <p className="font-bold text-white text-lg">{formatMoney(formData.amount)} сом</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60 mb-1">Ставка</p>
                      <p className="font-bold text-white text-lg">{formData.interest_rate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60 mb-1">Срок</p>
                      <p className="font-bold text-white">{formData.term_months} мес.</p>
                    </div>
                    <div>
                      <p className="text-sm text-white/60 mb-1">Дата возврата</p>
                      <p className="font-bold text-white">{format(new Date(calculations.endDate), 'd MMM yyyy', { locale: ru })}</p>
                    </div>
                  </div>

                  <div className="border-t border-white/20 pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/70">К возврату:</span>
                      <span className="font-bold text-2xl text-white">{formatMoney(calculations.totalRepayment)} сом</span>
                    </div>
                    {formData.monthly_payments && (
                      <div className="flex justify-between">
                        <span className="text-white/70">Ежемесячно:</span>
                        <span className="font-bold text-emerald-400 text-lg">{formatMoney(calculations.monthlyPayment)} сом</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(2)}
                    className="flex-1 h-14 glass-strong border-white/30 text-white hover:bg-white/10 text-base"
                  >
                    Назад
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    className="flex-1 h-14 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 hover:from-violet-600 hover:via-fuchsia-600 hover:to-pink-600 text-white shadow-lg shadow-fuchsia-500/50 text-base font-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Создать займ
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}