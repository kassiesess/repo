import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CheckCircle2, Clock, AlertCircle, Calendar } from 'lucide-react';

const statusConfig = {
  scheduled: { label: 'Запланирован', icon: Clock, color: 'bg-slate-100 text-slate-600' },
  paid: { label: 'Оплачен', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700' },
  overdue: { label: 'Просрочен', icon: AlertCircle, color: 'bg-red-100 text-red-700' },
  partial: { label: 'Частично', icon: Clock, color: 'bg-amber-100 text-amber-700' }
};

export default function PaymentSchedule({ payments, onPayment, canPay = false }) {
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('ru-RU').format(amount || 0);
  };

  const sortedPayments = [...(payments || [])].sort((a, b) => 
    new Date(a.due_date) - new Date(b.due_date)
  );

  return (
    <Card className="border-0 shadow-lg shadow-slate-200/50">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-50">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <CardTitle className="text-lg">График платежей</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {sortedPayments.length === 0 ? (
          <p className="text-center text-slate-500 py-8">Платежи не запланированы</p>
        ) : (
          <div className="space-y-3">
            {sortedPayments.map((payment, index) => {
              const status = statusConfig[payment.status] || statusConfig.scheduled;
              const StatusIcon = status.icon;

              return (
                <div 
                  key={payment.id || index}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    payment.status === 'overdue' ? 'border-red-200 bg-red-50/50' : 'border-slate-100 bg-slate-50/50'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${status.color}`}>
                    <StatusIcon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">
                        Платеж #{payment.payment_number || index + 1}
                      </span>
                      <Badge variant="outline" className={status.color}>
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      {payment.due_date ? format(new Date(payment.due_date), 'd MMMM yyyy', { locale: ru }) : '-'}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{formatMoney(payment.amount)} сом</p>
                    {payment.principal_amount && (
                      <p className="text-xs text-slate-500">
                        {formatMoney(payment.principal_amount)} + {formatMoney(payment.interest_amount)} %
                      </p>
                    )}
                  </div>

                  {canPay && payment.status !== 'paid' && (
                    <Button
                      size="sm"
                      onClick={() => onPayment(payment)}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Оплатить
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}