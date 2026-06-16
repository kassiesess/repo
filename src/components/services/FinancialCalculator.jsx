import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Calculator, TrendingUp, Percent, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FinancialCalculator({ onBack }) {
  const [amount, setAmount] = useState(100000);
  const [rate, setRate] = useState(12);
  const [months, setMonths] = useState(12);
  const [monthlyPayments, setMonthlyPayments] = useState(true);

  const formatMoney = (value) => {
    return new Intl.NumberFormat('ru-RU').format(value || 0);
  };

  const calculate = () => {
    const totalInterest = amount * (rate / 100) * (months / 12);
    const tax = totalInterest * 0.1;
    const totalRepayment = amount + totalInterest;
    const monthlyPayment = monthlyPayments ? totalRepayment / months : totalRepayment;
    const netProfit = totalInterest - tax;
    
    // Calculate effective annual rate
    const effectiveRate = monthlyPayments 
      ? ((Math.pow(1 + (rate/100) / 12, 12) - 1) * 100)
      : rate;
    
    // Calculate for borrower
    const monthlyInterestRate = rate / 100 / 12;
    const annuityPayment = monthlyPayments && rate > 0
      ? (amount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, months)) / 
        (Math.pow(1 + monthlyInterestRate, months) - 1)
      : monthlyPayment;
    
    const overpayment = totalRepayment - amount;
    const overpaymentPercent = (overpayment / amount) * 100;

    return {
      totalInterest,
      tax,
      netProfit,
      totalRepayment,
      monthlyPayment: monthlyPayments ? annuityPayment : monthlyPayment,
      effectiveRate,
      overpayment,
      overpaymentPercent
    };
  };

  const results = calculate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-8">
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 text-white">
        <div className="max-w-lg mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="text-white hover:bg-white/10 -ml-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-white/20">
              <Calculator className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold">Финансовый калькулятор</h1>
          </div>
          <p className="text-purple-200">Рассчитайте параметры займа</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-4">
        {/* Input Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-0 shadow-xl shadow-slate-200/50">
            <CardHeader>
              <CardTitle>Параметры займа</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-slate-500" />
                    Сумма займа
                  </Label>
                  <span className="font-bold text-lg text-slate-900">
                    {formatMoney(amount)} сом
                  </span>
                </div>
                <Slider
                  value={[amount]}
                  onValueChange={([value]) => setAmount(value)}
                  min={10000}
                  max={1000000}
                  step={10000}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>10,000</span>
                  <span>1,000,000</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-slate-500" />
                    Процентная ставка
                  </Label>
                  <span className="font-bold text-lg text-emerald-600">
                    {rate}% годовых
                  </span>
                </div>
                <Slider
                  value={[rate]}
                  onValueChange={([value]) => setRate(value)}
                  min={0}
                  max={36}
                  step={1}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>0%</span>
                  <span>36%</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    Срок займа
                  </Label>
                  <span className="font-bold text-lg text-blue-600">
                    {months} мес.
                  </span>
                </div>
                <Slider
                  value={[months]}
                  onValueChange={([value]) => setMonths(value)}
                  min={1}
                  max={36}
                  step={1}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>1 мес.</span>
                  <span>36 мес.</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Ежемесячный платеж</Label>
                  <button
                    type="button"
                    onClick={() => setMonthlyPayments(!monthlyPayments)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      monthlyPayments ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        monthlyPayments ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  {monthlyPayments 
                    ? 'Равными частями каждый месяц' 
                    : 'Полная сумма в конце срока'}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-xl shadow-slate-200/50">
            <CardHeader>
              <CardTitle>Результаты расчета</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="text-xs text-slate-600 mb-1">Проценты</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatMoney(results.totalInterest)} сом
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-xl">
                  <p className="text-xs text-slate-600 mb-1">Налог (10%)</p>
                  <p className="text-lg font-bold text-red-600">
                    {formatMoney(results.tax)} сом
                  </p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl">
                  <p className="text-xs text-slate-600 mb-1">Чистая прибыль</p>
                  <p className="text-lg font-bold text-emerald-600">
                    {formatMoney(results.netProfit)} сом
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl">
                  <p className="text-xs text-slate-600 mb-1">К возврату</p>
                  <p className="text-lg font-bold text-purple-600">
                    {formatMoney(results.totalRepayment)} сом
                  </p>
                </div>
              </div>

              {monthlyPayments && (
                <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl text-white">
                  <p className="text-sm text-slate-300 mb-1">Ежемесячный платеж (аннуитет)</p>
                  <p className="text-2xl font-bold">
                    {formatMoney(results.monthlyPayment)} сом
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-indigo-50 rounded-xl">
                  <p className="text-xs text-slate-600 mb-1">Переплата</p>
                  <p className="text-lg font-bold text-indigo-600">
                    {formatMoney(results.overpayment)} сом
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {results.overpaymentPercent.toFixed(1)}% от суммы
                  </p>
                </div>
                <div className="p-4 bg-cyan-50 rounded-xl">
                  <p className="text-xs text-slate-600 mb-1">Эффективная ставка</p>
                  <p className="text-lg font-bold text-cyan-600">
                    {results.effectiveRate.toFixed(2)}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Годовых
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Schedule Preview */}
        {monthlyPayments && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-xl shadow-slate-200/50">
              <CardHeader>
                <CardTitle>График платежей (первые 3 месяца)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[1, 2, 3].map((month) => (
                  <div key={month} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div>
                      <p className="font-medium text-slate-900">Платеж #{month}</p>
                      <p className="text-xs text-slate-500">
                        Основной долг: {formatMoney(amount / months)} сом
                      </p>
                    </div>
                    <p className="font-bold text-slate-900">
                      {formatMoney(results.monthlyPayment)} сом
                    </p>
                  </div>
                ))}
                {months > 3 && (
                  <p className="text-center text-sm text-slate-500 pt-2">
                    + еще {months - 3} платежей
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}