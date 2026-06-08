import React, { useState } from 'react';
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { 
  Calculator, 
  TrendingUp, 
  Shield, 
  ChevronRight,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import LoanInsurance from '../components/services/LoanInsurance';
import AIAssistant from '../components/services/AIAssistant';

const services = [
  {
    id: 'insurance',
    title: 'Страхование займа',
    description: 'Защитите свои средства',
    icon: Shield,
    color: 'text-red-600',
    bg: 'bg-red-50'
  },
  {
    id: 'ai',
    title: 'AI Помощник',
    description: 'Ответы на вопросы о займах',
    icon: Sparkles,
    color: 'text-violet-600',
    bg: 'bg-violet-50'
  }
];

const currencies = [
  { code: 'USD', name: 'Доллар США', flag: '🇺🇸', rate: 87.5 },
  { code: 'EUR', name: 'Евро', flag: '🇪🇺', rate: 95.2 },
  { code: 'RUB', name: 'Рубль', flag: '🇷🇺', rate: 0.95 },
  { code: 'KZT', name: 'Тенге', flag: '🇰🇿', rate: 0.19 }
];

export default function Services() {
  const [activeService, setActiveService] = useState(null);
  
  // Calculator state
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

    return { totalInterest, tax, netProfit, totalRepayment, monthlyPayment };
  };

  const results = calculate();

  if (activeService === 'insurance') {
    return <LoanInsurance onBack={() => setActiveService(null)} />;
  }
  if (activeService === 'ai') {
    return <AIAssistant onBack={() => setActiveService(null)} />;
  }

  return (
    <div className="min-h-screen page-bg pb-20">
      {/* Header */}
      <div className="page-header">
        <div className="max-w-lg mx-auto px-4 pt-8 pb-12">
          <h1 className="text-2xl font-bold mb-2">Услуги</h1>
          <p className="text-slate-400">Финансовый центр</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-6">
        {/* Services Grid */}
        <div className="grid grid-cols-2 gap-3">
          {services.map((service, index) => {
            const Icon = service.icon;
            
            const cardContent = (
              <div className="glass-strong rounded-2xl p-4 border border-white/10 cursor-pointer hover:opacity-90 transition-all shadow-lg">
                  <div className={`p-3 ${service.bg} rounded-xl w-fit mb-3 opacity-90`}>
                    <Icon className={`w-6 h-6 ${service.color}`} />
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-1">
                    {service.title}
                  </h3>
                  <p className="text-xs text-white/60 leading-relaxed mb-2">
                    {service.description}
                  </p>
                  <div className="flex items-center text-xs text-white/40">
                    <span>Открыть</span>
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </div>
              </div>
            );
            
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setActiveService(service.id)}
              >
                {cardContent}
              </motion.div>
            );
          })}
        </div>

        {/* Financial Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="glass-strong rounded-2xl border border-white/10 shadow-xl">
            <div className="p-5 pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Финансовый калькулятор</h2>
              </div>
            </div>
            <div className="px-5 pb-5 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm text-white/70">Сумма</Label>
                  <span className="font-bold text-white">{formatMoney(amount)} сом</span>
                </div>
                <Slider
                  value={[amount]}
                  onValueChange={([value]) => setAmount(value)}
                  min={10000}
                  max={1000000}
                  step={10000}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm text-white/70">Ставка</Label>
                  <span className="font-bold text-emerald-600">{rate}%</span>
                </div>
                <Slider
                  value={[rate]}
                  onValueChange={([value]) => setRate(value)}
                  min={0}
                  max={36}
                  step={1}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm text-white/70">Срок</Label>
                  <span className="font-bold text-blue-600">{months} мес.</span>
                </div>
                <Slider
                  value={[months]}
                  onValueChange={([value]) => setMonths(value)}
                  min={1}
                  max={36}
                  step={1}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm text-white/70">Ежемесячный платеж</Label>
                <button
                  onClick={() => setMonthlyPayments(!monthlyPayments)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                    monthlyPayments ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    monthlyPayments ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <p className="text-xs text-white/60 mb-1">Проценты</p>
                  <p className="font-bold text-blue-300 text-sm">{formatMoney(results.totalInterest)}</p>
                </div>
                <div className="p-3 bg-red-500/20 rounded-xl">
                  <p className="text-xs text-white/60 mb-1">Налог 10%</p>
                  <p className="font-bold text-red-300 text-sm">{formatMoney(results.tax)}</p>
                </div>
                <div className="p-3 bg-emerald-500/20 rounded-xl">
                  <p className="text-xs text-white/60 mb-1">Чистая прибыль</p>
                  <p className="font-bold text-emerald-300 text-sm">{formatMoney(results.netProfit)}</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <p className="text-xs text-white/60 mb-1">К возврату</p>
                  <p className="font-bold text-purple-300 text-sm">{formatMoney(results.totalRepayment)}</p>
                </div>
              </div>

              {monthlyPayments && (
                <div className="p-3 bg-white/10 rounded-xl">
                  <p className="text-xs text-white/60 mb-1">Ежемесячный платеж</p>
                  <p className="text-xl font-bold text-white">{formatMoney(results.monthlyPayment)} сом</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Currency Exchange */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="glass-strong rounded-2xl border border-white/10 shadow-xl">
            <div className="p-5 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-semibold text-white">Курсы валют в Бишкеке</h2>
                </div>
                <button className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                  <RefreshCw className="w-4 h-4 text-white/40" />
                </button>
              </div>
            </div>
            <div className="px-5 pb-5 space-y-2">
              {currencies.map((currency, index) => {
                const change = (Math.random() * 2 - 1).toFixed(2);
                const isPositive = parseFloat(change) > 0;
                
                return (
                  <motion.div
                    key={currency.code}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{currency.flag}</div>
                      <div>
                        <p className="font-medium text-white text-sm">{currency.code}</p>
                        <p className="text-xs text-white/50">{currency.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white text-sm">{currency.rate.toFixed(2)} сом</p>
                      <p className={`text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{change}%
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}