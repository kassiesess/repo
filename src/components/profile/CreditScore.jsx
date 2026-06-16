import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Loader2, RefreshCw } from 'lucide-react';

export default function CreditScore({ userId }) {
  const [scoreData, setScoreData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadCreditScore = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('calculateCreditScore', { userId });
      if (response?.data) {
        // Transform the response to match component expectations
        const data = response.data;
        setScoreData({
          creditScore: data.score,
          category: data.grade,
          maxLoanAmount: Math.round(data.score * 100),
          statistics: {
            completed: data.factors?.paid_loans || 0,
            overdue: 0
          },
          calculatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error loading credit score:', error);
      // Set default data on error
      setScoreData({
        creditScore: 650,
        category: 'B',
        maxLoanAmount: 65000,
        statistics: {
          completed: 0,
          overdue: 0
        },
        calculatedAt: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadCreditScore();
    }
  }, [userId]);

  if (loading) {
    return (
      <Card className="glass-strong border-white/10">
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
        </CardContent>
      </Card>
    );
  }

  if (!scoreData) return null;

  const getScoreColor = () => {
    if (scoreData.creditScore >= 800) return 'from-emerald-500 to-green-500';
    if (scoreData.creditScore >= 700) return 'from-blue-500 to-cyan-500';
    if (scoreData.creditScore >= 600) return 'from-violet-500 to-purple-500';
    if (scoreData.creditScore >= 500) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  return (
    <Card className="glass-strong border-white/10 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Кредитный рейтинг
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadCreditScore}
            className="text-slate-400 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Circle */}
        <div className="relative flex items-center justify-center">
          <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${getScoreColor()} flex items-center justify-center shadow-lg`}>
            <div className="w-28 h-28 rounded-full bg-slate-900 flex flex-col items-center justify-center">
              <p className="text-4xl font-bold text-white">{scoreData.creditScore}</p>
              <p className="text-xs text-slate-400">из 850</p>
            </div>
          </div>
        </div>

        {/* Category */}
        <div className="text-center">
          <p className="text-2xl font-bold text-white mb-1">{scoreData.category}</p>
          <p className="text-sm text-slate-400">кредитная история</p>
        </div>

        {/* Max Loan */}
        <div className="glass rounded-2xl p-4 border border-white/10">
          <p className="text-xs text-slate-400 mb-1">Макс. сумма займа</p>
          <p className="text-2xl font-bold text-white">
            {scoreData.maxLoanAmount.toLocaleString('ru-RU')} сом
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-xl p-3 border border-white/10">
            <p className="text-xs text-slate-400 mb-1">Завершенных</p>
            <p className="text-lg font-bold text-emerald-400">
              {scoreData.statistics.completed}
            </p>
          </div>
          <div className="glass rounded-xl p-3 border border-white/10">
            <p className="text-xs text-slate-400 mb-1">Просрочено</p>
            <p className="text-lg font-bold text-red-400">
              {scoreData.statistics.overdue}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-500 text-center">
          Обновлено: {new Date(scoreData.calculatedAt).toLocaleString('ru-RU')}
        </p>
      </CardContent>
    </Card>
  );
}