import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ArrowUpRight, ArrowDownLeft, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const statusConfig = {
  pending: { label: 'Ожидает', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  active: { label: 'Активный', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  completed: { label: 'Завершен', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
  overdue: { label: 'Просрочен', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  defaulted: { label: 'Невозврат', color: 'bg-red-500/20 text-red-300 border-red-500/30' }
};

export default function LoanCard({ loan, currentUserId, compact = false }) {
  const isLender = loan.lender_id === currentUserId;
  const status = statusConfig[loan.status] || statusConfig.pending;
  
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('ru-RU').format(amount || 0);
  };

  const progressPercent = loan.total_repayment > 0 
    ? Math.min(100, ((loan.amount_paid || 0) / loan.total_repayment) * 100)
    : 0;

  if (compact) {
    return (
      <Link to={createPageUrl('LoanDetails') + `?id=${loan.id}`}>
        <div className="glass-strong rounded-2xl p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer group border border-white/10">
          <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-xl ${isLender ? 'bg-violet-500/20' : 'bg-fuchsia-500/20'} border ${isLender ? 'border-violet-500/30' : 'border-fuchsia-500/30'}`}>
              {isLender ? (
                <ArrowUpRight className="w-5 h-5 text-violet-300" />
              ) : (
                <ArrowDownLeft className="w-5 h-5 text-fuchsia-300" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-white truncate">
                  {isLender ? (loan.borrower_name || loan.borrower_email) : loan.lender_name}
                </p>
                <Badge variant="outline" className={`text-xs ${status.color}`}>
                  {status.label}
                </Badge>
              </div>
              <p className="text-sm text-slate-400">
                {isLender ? 'Вы дали в долг' : 'Вы взяли в долг'}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg text-white">{formatMoney(loan.amount)}</p>
              <p className="text-xs text-slate-400">сом</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-slate-300 transition-colors" />
          </div>
          <div className="mt-2 pt-2 border-t border-white/10">
            <p className="text-xs text-slate-500">
              ID: <span className="font-mono text-slate-400">LOAN-{loan.id.substring(0, 8).toUpperCase()}</span>
            </p>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={createPageUrl('LoanDetails') + `?id=${loan.id}`}>
      <div className="glass-strong rounded-3xl overflow-hidden hover:bg-white/10 transition-all duration-300 cursor-pointer group border border-white/10 shadow-2xl">
        <div className={`h-1.5 ${isLender ? 'bg-gradient-to-r from-violet-500 to-purple-600' : 'bg-gradient-to-r from-fuchsia-500 to-pink-600'}`} />
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${isLender ? 'bg-violet-500/20 border border-violet-500/30' : 'bg-fuchsia-500/20 border border-fuchsia-500/30'} shadow-lg ${isLender ? 'shadow-violet-500/20' : 'shadow-fuchsia-500/20'}`}>
                {isLender ? (
                  <ArrowUpRight className="w-6 h-6 text-violet-300" />
                ) : (
                  <ArrowDownLeft className="w-6 h-6 text-fuchsia-300" />
                )}
              </div>
              <div>
                <p className="text-sm text-slate-400">{isLender ? 'Вы дали в долг' : 'Вы взяли в долг'}</p>
                <p className="font-semibold text-white">
                  {isLender ? (loan.borrower_name || loan.borrower_email) : loan.lender_name}
                </p>
              </div>
            </div>
            <Badge variant="outline" className={status.color}>
              {status.label}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="glass rounded-xl p-3 text-center border border-white/10">
              <p className="text-xs text-slate-400 mb-1">Сумма</p>
              <p className="font-bold text-white">{formatMoney(loan.amount)}</p>
            </div>
            <div className="glass rounded-xl p-3 text-center border border-white/10">
              <p className="text-xs text-slate-400 mb-1">Ставка</p>
              <p className="font-bold text-white">{loan.interest_rate}%</p>
            </div>
            <div className="glass rounded-xl p-3 text-center border border-white/10">
              <p className="text-xs text-slate-400 mb-1">Срок</p>
              <p className="font-bold text-white">{loan.term_months} мес.</p>
            </div>
          </div>

          {loan.status === 'active' && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Выплачено</span>
                <span className="font-medium text-white">{formatMoney(loan.amount_paid)} / {formatMoney(loan.total_repayment)} сом</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Calendar className="w-4 h-4" />
              <span>до {loan.end_date ? format(new Date(loan.end_date), 'd MMM yyyy', { locale: ru }) : '-'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-violet-400 font-medium">
              <span>Подробнее</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-white/10">
            <p className="text-xs text-slate-500">
              ID: <span className="font-mono text-slate-400">LOAN-{loan.id.substring(0, 8).toUpperCase()}</span>
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}