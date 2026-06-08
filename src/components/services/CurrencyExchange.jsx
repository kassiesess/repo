import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, TrendingUp, ArrowUpDown, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const currencies = [
  { code: 'KGS', name: 'Киргизский сом', flag: '🇰🇬', symbol: 'сом' },
  { code: 'USD', name: 'Доллар США', flag: '🇺🇸', symbol: '$' },
  { code: 'EUR', name: 'Евро', flag: '🇪🇺', symbol: '€' },
  { code: 'RUB', name: 'Российский рубль', flag: '🇷🇺', symbol: '₽' },
  { code: 'KZT', name: 'Казахстанский тенге', flag: '🇰🇿', symbol: '₸' }
];

// Simulated exchange rates (KGS base)
const exchangeRates = {
  KGS: 1,
  USD: 87.5,
  EUR: 95.2,
  RUB: 0.95,
  KZT: 0.19
};

export default function CurrencyExchange({ onBack }) {
  const [fromCurrency, setFromCurrency] = useState('KGS');
  const [toCurrency, setToCurrency] = useState('USD');
  const [amount, setAmount] = useState('10000');
  const [result, setResult] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    calculateExchange();
  }, [amount, fromCurrency, toCurrency]);

  const calculateExchange = () => {
    const amountNum = parseFloat(amount) || 0;
    const fromRate = exchangeRates[fromCurrency];
    const toRate = exchangeRates[toCurrency];
    const converted = (amountNum / fromRate) * toRate;
    setResult(converted);
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const formatMoney = (value, code) => {
    const formatted = new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
    const currency = currencies.find(c => c.code === code);
    return `${formatted} ${currency?.symbol || code}`;
  };

  const getRate = (from, to) => {
    const rate = exchangeRates[to] / exchangeRates[from];
    return rate.toFixed(4);
  };

  const handleRefresh = () => {
    setLastUpdated(new Date());
    // In real app, fetch new rates from API
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-8">
      <div className="bg-gradient-to-br from-amber-600 via-amber-700 to-orange-700 text-white">
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
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/20">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Обмен валют</h1>
                <p className="text-amber-200 text-sm">
                  Обновлено: {lastUpdated.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-4">
        {/* Converter Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-0 shadow-xl shadow-slate-200/50">
            <CardHeader>
              <CardTitle>Конвертер валют</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* From Currency */}
              <div>
                <label className="text-sm text-slate-600 mb-2 block">Из</label>
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {currencies.map((currency) => (
                    <button
                      key={currency.code}
                      onClick={() => setFromCurrency(currency.code)}
                      className={`p-2 rounded-xl text-center transition-all ${
                        fromCurrency === currency.code
                          ? 'bg-emerald-100 ring-2 ring-emerald-500'
                          : 'bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-2xl mb-1">{currency.flag}</div>
                      <div className={`text-xs font-medium ${
                        fromCurrency === currency.code ? 'text-emerald-700' : 'text-slate-600'
                      }`}>
                        {currency.code}
                      </div>
                    </button>
                  ))}
                </div>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-16 text-2xl font-bold"
                  placeholder="0.00"
                />
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <button
                  onClick={swapCurrencies}
                  className="p-3 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <ArrowUpDown className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {/* To Currency */}
              <div>
                <label className="text-sm text-slate-600 mb-2 block">В</label>
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {currencies.map((currency) => (
                    <button
                      key={currency.code}
                      onClick={() => setToCurrency(currency.code)}
                      className={`p-2 rounded-xl text-center transition-all ${
                        toCurrency === currency.code
                          ? 'bg-blue-100 ring-2 ring-blue-500'
                          : 'bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-2xl mb-1">{currency.flag}</div>
                      <div className={`text-xs font-medium ${
                        toCurrency === currency.code ? 'text-blue-700' : 'text-slate-600'
                      }`}>
                        {currency.code}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="h-16 flex items-center px-4 bg-slate-50 rounded-xl">
                  <p className="text-2xl font-bold text-slate-900">
                    {formatMoney(result, toCurrency)}
                  </p>
                </div>
              </div>

              {/* Rate Info */}
              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
                <p className="text-sm text-slate-600 mb-1">Курс обмена</p>
                <p className="text-lg font-bold text-slate-900">
                  1 {fromCurrency} = {getRate(fromCurrency, toCurrency)} {toCurrency}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* All Rates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-xl shadow-slate-200/50">
            <CardHeader>
              <CardTitle>Курсы валют в Бишкеке</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {currencies.filter(c => c.code !== 'KGS').map((currency, index) => {
                const rate = exchangeRates[currency.code];
                const change = (Math.random() * 2 - 1).toFixed(2);
                const isPositive = parseFloat(change) > 0;
                
                return (
                  <motion.div
                    key={currency.code}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{currency.flag}</div>
                      <div>
                        <p className="font-medium text-slate-900">{currency.code}</p>
                        <p className="text-xs text-slate-500">{currency.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{rate.toFixed(2)} сом</p>
                      <p className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : ''}{change}%
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Информация о курсах</h3>
                  <p className="text-sm text-slate-600">
                    Курсы валют обновляются каждый час на основе данных коммерческих банков Бишкека. 
                    Для точных курсов обратитесь в ваш банк или обменный пункт.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}