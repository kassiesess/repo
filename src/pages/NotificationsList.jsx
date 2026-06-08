import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell, DollarSign, FileText, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function NotificationsList() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: loans = [] } = useQuery({
    queryKey: ['loans'],
    queryFn: () => base44.entities.Loan.list('-updated_date', 20),
    enabled: !!user
  });

  // Generate notifications from loan data
  const notifications = [];
  
  loans.forEach(loan => {
    const isMyLoan = loan.lender_id === user?.id || loan.borrower_id === user?.id;
    if (!isMyLoan) return;

    // Loan created notification
    if (loan.status === 'pending') {
      notifications.push({
        id: `loan-pending-${loan.id}`,
        type: 'loan_created',
        title: loan.lender_id === user?.id ? 'Займ создан' : 'Новое предложение займа',
        message: loan.lender_id === user?.id 
          ? `Займ на ${loan.amount} сом создан. Ожидает подтверждения заемщика.`
          : `${loan.lender_name} предлагает вам займ на ${loan.amount} сом`,
        date: loan.created_date,
        icon: DollarSign,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        link: `/LoanDetails?id=${loan.id}`
      });
    }

    // Active loan notification
    if (loan.status === 'active') {
      notifications.push({
        id: `loan-active-${loan.id}`,
        type: 'loan_active',
        title: 'Займ активен',
        message: `Договор подписан. Сумма к возврату: ${loan.total_repayment} сом`,
        date: loan.updated_date,
        icon: CheckCircle2,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        link: `/LoanDetails?id=${loan.id}`
      });
    }

    // Overdue notification
    if (loan.status === 'overdue') {
      notifications.push({
        id: `loan-overdue-${loan.id}`,
        type: 'payment_overdue',
        title: 'Просрочен платеж',
        message: loan.borrower_id === user?.id
          ? `Просрочен платеж по займу. Сумма задолженности: ${loan.total_repayment - loan.amount_paid} сом`
          : `Заемщик просрочил платеж по займу на ${loan.amount} сом`,
        date: loan.updated_date,
        icon: AlertCircle,
        color: 'text-red-600',
        bg: 'bg-red-50',
        link: `/LoanDetails?id=${loan.id}`
      });
    }

    // Contract ready notification
    if (loan.status === 'pending' && !loan.contract_signed_lender && loan.lender_id === user?.id) {
      notifications.push({
        id: `contract-pending-${loan.id}`,
        type: 'contract_ready',
        title: 'Договор готов к подписанию',
        message: `Подпишите договор займа на ${loan.amount} сом`,
        date: loan.created_date,
        icon: FileText,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        link: `/LoanDetails?id=${loan.id}`
      });
    }
  });

  // Sort by date
  notifications.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-20">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-lg mx-auto px-4 py-8">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 -ml-2 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Уведомления</h1>
              <p className="text-slate-400 text-sm">История уведомлений</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4">
        {notifications.length === 0 ? (
          <Card className="border-0 shadow-lg shadow-slate-200/50">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 font-medium">Нет уведомлений</p>
              <p className="text-sm text-slate-400 mt-1">Здесь будут появляться уведомления о займах</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification, index) => {
              const Icon = notification.icon;
              
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={createPageUrl('LoanDetails') + `?id=${notification.link.split('=')[1]}`}>
                    <Card className="border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-xl ${notification.bg} mt-0.5`}>
                            <Icon className={`w-5 h-5 ${notification.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900">{notification.title}</h3>
                            <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
                              <Clock className="w-3 h-3" />
                              <span>{format(new Date(notification.date), 'd MMM yyyy, HH:mm', { locale: ru })}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}