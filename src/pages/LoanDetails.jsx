import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, addMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Printer,
  Gavel,
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
  Banknote,
  Calendar,
  Percent,
  User,
  Receipt
} from 'lucide-react';
import { motion } from 'framer-motion';
import ContractGenerator from '../components/loans/ContractGenerator';
import CourtDocumentGenerator from '../components/loans/CourtDocumentGenerator';
import PaymentSchedule from '../components/payments/PaymentSchedule';
import PaymentWithReceipt from '../components/loans/PaymentWithReceipt';

const statusConfig = {
  pending: { label: 'Ожидает подписания', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: Clock },
  active: { label: 'Активный', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: CheckCircle2 },
  completed: { label: 'Завершен', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30', icon: CheckCircle2 },
  overdue: { label: 'Просрочен', color: 'bg-red-500/20 text-red-300 border-red-500/30', icon: AlertCircle },
  defaulted: { label: 'Невозврат', color: 'bg-red-500/20 text-red-300 border-red-500/30', icon: AlertCircle }
};

export default function LoanDetails() {
  const [user, setUser] = useState(null);
  const [showContract, setShowContract] = useState(false);
  const [showCourtDocs, setShowCourtDocs] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const contractRef = useRef(null);
  const courtDocRef = useRef(null);
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(window.location.search);
  const loanId = urlParams.get('id');

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: loan, isLoading: loanLoading } = useQuery({
    queryKey: ['loan', loanId],
    queryFn: () => base44.entities.Loan.filter({ id: loanId }).then(res => res[0]),
    enabled: !!loanId
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments', loanId],
    queryFn: () => base44.entities.Payment.filter({ loan_id: loanId }),
    enabled: !!loanId
  });

  const { data: lenderData } = useQuery({
    queryKey: ['lender', loan?.lender_id],
    queryFn: () => base44.entities.User.filter({ id: loan?.lender_id }).then(res => res[0]),
    enabled: !!loan?.lender_id
  });

  const { data: borrowerData } = useQuery({
    queryKey: ['borrower', loan?.borrower_id],
    queryFn: () => base44.entities.User.filter({ id: loan?.borrower_id }).then(res => res[0]),
    enabled: !!loan?.borrower_id
  });

  const signLoanMutation = useMutation({
    mutationFn: async (role) => {
      const updateData = role === 'lender' 
        ? { contract_signed_lender: true }
        : { 
            contract_signed_borrower: true,
            borrower_id: user.id,
            borrower_name: user.full_name,
            borrower_passport: `${user.passport_series} ${user.passport_number}`
          };
      
      await base44.entities.Loan.update(loanId, updateData);
      
      // Check if both signed
      const updatedLoan = await base44.entities.Loan.filter({ id: loanId }).then(res => res[0]);
      if (updatedLoan.contract_signed_lender && updatedLoan.contract_signed_borrower) {
        // Activate loan and create payment schedule
        await base44.entities.Loan.update(loanId, { status: 'active' });
        
        // Create payment schedule
        const monthlyPayment = updatedLoan.monthly_payment;
        const startDate = new Date(updatedLoan.start_date);
        
        for (let i = 1; i <= updatedLoan.term_months; i++) {
          const dueDate = addMonths(startDate, i);
          await base44.entities.Payment.create({
            loan_id: loanId,
            amount: monthlyPayment,
            due_date: format(dueDate, 'yyyy-MM-dd'),
            status: 'scheduled',
            payment_number: i,
            principal_amount: Math.round(updatedLoan.amount / updatedLoan.term_months),
            interest_amount: Math.round(updatedLoan.total_interest / updatedLoan.term_months)
          });
        }
      }
    },
    onMutate: async (role) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries(['loan', loanId]);
      
      // Snapshot previous value
      const previousLoan = queryClient.getQueryData(['loan', loanId]);
      
      // Optimistically update
      queryClient.setQueryData(['loan', loanId], old => ({
        ...old,
        ...(role === 'lender' 
          ? { contract_signed_lender: true }
          : { 
              contract_signed_borrower: true,
              borrower_id: user.id,
              borrower_name: user.full_name
            }
        )
      }));
      
      return { previousLoan };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['loan', loanId], context.previousLoan);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['loan', loanId]);
      queryClient.invalidateQueries(['payments', loanId]);
    }
  });

  const makePaymentMutation = useMutation({
    mutationFn: async (amount) => {
      const newAmountPaid = (loan.amount_paid || 0) + parseFloat(amount);
      const isCompleted = newAmountPaid >= loan.total_repayment;
      
      await base44.entities.Loan.update(loanId, {
        amount_paid: newAmountPaid,
        status: isCompleted ? 'completed' : 'active'
      });

      // Update payment records
      const sortedPayments = [...payments].sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
      let remaining = parseFloat(amount);
      
      for (const payment of sortedPayments) {
        if (payment.status !== 'paid' && remaining > 0) {
          if (remaining >= payment.amount) {
            await base44.entities.Payment.update(payment.id, {
              status: 'paid',
              paid_date: format(new Date(), 'yyyy-MM-dd')
            });
            remaining -= payment.amount;
          } else {
            // Partial payment
            break;
          }
        }
      }
    },
    onMutate: async (amount) => {
      // Cancel queries
      await queryClient.cancelQueries(['loan', loanId]);
      await queryClient.cancelQueries(['payments', loanId]);
      
      // Snapshot
      const previousLoan = queryClient.getQueryData(['loan', loanId]);
      const previousPayments = queryClient.getQueryData(['payments', loanId]);
      
      // Optimistically update loan
      const newAmountPaid = (loan.amount_paid || 0) + parseFloat(amount);
      const isCompleted = newAmountPaid >= loan.total_repayment;
      
      queryClient.setQueryData(['loan', loanId], old => ({
        ...old,
        amount_paid: newAmountPaid,
        status: isCompleted ? 'completed' : 'active'
      }));
      
      // Optimistically update payments
      queryClient.setQueryData(['payments', loanId], old => {
        const sorted = [...old].sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
        let remaining = parseFloat(amount);
        
        return sorted.map(payment => {
          if (payment.status !== 'paid' && remaining > 0) {
            if (remaining >= payment.amount) {
              remaining -= payment.amount;
              return { ...payment, status: 'paid', paid_date: format(new Date(), 'yyyy-MM-dd') };
            }
          }
          return payment;
        });
      });
      
      return { previousLoan, previousPayments };
    },
    onError: (err, variables, context) => {
      // Rollback
      queryClient.setQueryData(['loan', loanId], context.previousLoan);
      queryClient.setQueryData(['payments', loanId], context.previousPayments);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['loan', loanId]);
      queryClient.invalidateQueries(['payments', loanId]);
      setShowPaymentDialog(false);
      setPaymentAmount('');
    }
  });

  const handlePrint = (ref) => {
    const content = ref.current;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Документ</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 20mm; }
            h1, h2 { text-align: center; }
            p { text-align: justify; line-height: 1.6; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 8px; }
            .border-b { border-bottom: 1px solid #ccc; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>${content.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('ru-RU').format(amount || 0);
  };

  if (!user || loanLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-lg mx-auto text-center py-12">
          <p className="text-slate-400">Займ не найден</p>
          <Link to={createPageUrl('Home')}>
            <Button className="mt-4">На главную</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isLender = loan.lender_id === user.id;
  const isBorrower = loan.borrower_id === user.id || loan.borrower_email === user.email;
  const status = statusConfig[loan.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  const progressPercent = loan.total_repayment > 0 
    ? Math.min(100, ((loan.amount_paid || 0) / loan.total_repayment) * 100)
    : 0;

  const canSign = loan.status === 'pending' && (
    (isLender && !loan.contract_signed_lender) ||
    (isBorrower && !loan.contract_signed_borrower)
  );

  const canPay = isBorrower && loan.status === 'active';
  const canGenerateCourtDocs = (loan.status === 'overdue' || loan.status === 'defaulted') && (isLender || isBorrower);

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="glass-strong border-b border-white/10 sticky top-0 z-10 backdrop-blur-xl safe-top">
        <div className="max-w-lg mx-auto px-4 py-6">
          <Link to={createPageUrl('Home')}>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 -ml-2 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <Badge variant="outline" className={`${status.color} mb-2`}>
                <StatusIcon className="w-3.5 h-3.5 mr-1" />
                {status.label}
              </Badge>
              <h1 className="text-2xl font-bold text-white">{formatMoney(loan.amount)} сом</h1>
              <p className="text-slate-400 text-sm mt-1">
                {isLender ? 'Вы дали в долг' : 'Вы взяли в долг'}
              </p>
              <p className="text-slate-500 text-xs mt-1 font-mono">
                ID: LOAN-{loan.id.substring(0, 8).toUpperCase()}
              </p>
            </div>
            <div className={`p-4 rounded-2xl ${isLender ? 'bg-violet-500/20 border border-violet-500/30' : 'bg-fuchsia-500/20 border border-fuchsia-500/30'} shadow-lg ${isLender ? 'shadow-violet-500/20' : 'shadow-fuchsia-500/20'}`}>
              {isLender ? (
                <ArrowUpRight className="w-8 h-8 text-violet-300" />
              ) : (
                <ArrowDownLeft className="w-8 h-8 text-fuchsia-300" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-4">
        {/* Progress Card */}
        {loan.status === 'active' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="glass-strong rounded-3xl p-5 border border-white/10 shadow-2xl">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Погашено</span>
                <span className="font-semibold text-white">{formatMoney(loan.amount_paid)} / {formatMoney(loan.total_repayment)} сом</span>
              </div>
              <Progress value={progressPercent} className="h-3 mb-3" />
              <p className="text-sm text-emerald-400 font-medium">
                Осталось выплатить: {formatMoney(loan.total_repayment - (loan.amount_paid || 0))} сом
              </p>
            </div>
          </motion.div>
        )}

        {/* Loan Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="glass-strong rounded-3xl p-6 border border-white/10 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Детали займа</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="glass rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <Banknote className="w-4 h-4" />
                    Сумма
                  </div>
                  <p className="font-bold text-lg text-white">{formatMoney(loan.amount)} сом</p>
                </div>
                <div className="glass rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <Percent className="w-4 h-4" />
                    Ставка
                  </div>
                  <p className="font-bold text-lg text-white">{loan.interest_rate}% годовых</p>
                </div>
                <div className="glass rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <Calendar className="w-4 h-4" />
                    Срок
                  </div>
                  <p className="font-bold text-lg text-white">{loan.term_months} мес.</p>
                </div>
                <div className="glass rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                    <Clock className="w-4 h-4" />
                    Платеж
                  </div>
                  <p className="font-bold text-lg text-white">{formatMoney(loan.monthly_payment)} сом</p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Проценты за период</span>
                  <span className="font-medium text-white">{formatMoney(loan.total_interest)} сом</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Налог на доход (10%)</span>
                  <span className="font-medium text-amber-400">{formatMoney(loan.tax_amount)} сом</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-white">Итого к возврату</span>
                  <span className="font-bold text-white">{formatMoney(loan.total_repayment)} сом</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Parties Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="glass-strong rounded-3xl p-6 border border-white/10 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Стороны договора</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 glass rounded-2xl border border-violet-500/30">
                <div className="p-2.5 bg-violet-500/20 rounded-xl border border-violet-500/30">
                  <User className="w-5 h-5 text-violet-300" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-violet-400 font-medium">Займодавец</p>
                  <p className="font-semibold text-white">{loan.lender_name}</p>
                </div>
                {loan.contract_signed_lender && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                )}
              </div>

              <div className="flex items-center gap-4 p-4 glass rounded-2xl border border-fuchsia-500/30">
                <div className="p-2.5 bg-fuchsia-500/20 rounded-xl border border-fuchsia-500/30">
                  <User className="w-5 h-5 text-fuchsia-300" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-fuchsia-400 font-medium">Заемщик</p>
                  <p className="font-semibold text-white">
                    {loan.borrower_name || loan.borrower_email}
                  </p>
                </div>
                {loan.contract_signed_borrower && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Payment Schedule */}
        {loan.status === 'active' && payments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <PaymentSchedule 
              payments={payments} 
              canPay={canPay}
              onPayment={() => setShowPaymentDialog(true)}
            />
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-3 pt-4"
        >
          {/* Sign Contract */}
          {canSign && (
            <Button 
              onClick={() => signLoanMutation.mutate(isLender ? 'lender' : 'borrower')}
              disabled={signLoanMutation.isPending}
              className="w-full h-14 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 hover:from-violet-600 hover:via-fuchsia-600 hover:to-pink-600 text-white shadow-lg shadow-fuchsia-500/50 rounded-2xl font-semibold"
            >
              {signLoanMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Подписать договор
                </>
              )}
            </Button>
          )}

          {/* Make Payment */}
          {canPay && (
            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
              <DialogTrigger asChild>
                <Button className="w-full h-14 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 hover:from-violet-600 hover:via-fuchsia-600 hover:to-pink-600 text-white shadow-lg shadow-fuchsia-500/50 rounded-2xl font-semibold">
                  <Banknote className="w-5 h-5 mr-2" />
                  Внести платеж
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Внести платеж</DialogTitle>
                  <p className="text-sm text-slate-500">
                    Оплата через ваш банк с загрузкой квитанции
                  </p>
                </DialogHeader>
                <PaymentWithReceipt 
                  loan={loan}
                  onSuccess={() => {
                    setShowPaymentDialog(false);
                    queryClient.invalidateQueries(['loan', loanId]);
                    queryClient.invalidateQueries(['payments', loanId]);
                  }}
                />
              </DialogContent>
            </Dialog>
          )}

          {/* Payment Receipts */}
          {loan.payment_receipts && loan.payment_receipts.length > 0 && (
            <div className="glass-strong rounded-3xl p-6 border border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
                <Receipt className="w-4 h-4" />
                История платежей
              </h3>
              <div className="space-y-2">
                {loan.payment_receipts.map((receipt, index) => (
                  <div key={index} className="flex items-center justify-between p-3 glass rounded-xl border border-white/10">
                    <div>
                      <p className="font-medium text-white">{formatMoney(receipt.amount)} сом</p>
                      <p className="text-xs text-slate-400">
                        {receipt.bank_name} • {format(new Date(receipt.payment_date), 'd MMM yyyy', { locale: ru })}
                      </p>
                    </div>
                    <a 
                      href={receipt.receipt_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <FileText className="w-5 h-5 text-slate-400" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* View Contract */}
          <Dialog open={showContract} onOpenChange={setShowContract}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full h-14 glass-strong border-white/20 text-white hover:bg-white/10 rounded-2xl">
                <FileText className="w-5 h-5 mr-2" />
                Просмотреть договор
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Договор займа</DialogTitle>
              </DialogHeader>
              <div ref={contractRef}>
                <ContractGenerator 
                  loan={loan}
                  lender={lenderData || { full_name: loan.lender_name }}
                  borrower={borrowerData || { full_name: loan.borrower_name, email: loan.borrower_email }}
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={() => handlePrint(contractRef)}>
                  <Printer className="w-4 h-4 mr-2" />
                  Печать
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Court Documents */}
          {canGenerateCourtDocs && (
            <Dialog open={showCourtDocs} onOpenChange={setShowCourtDocs}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full h-14 glass-strong border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-2xl">
                  <Gavel className="w-5 h-5 mr-2" />
                  Сформировать исковое заявление
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Исковое заявление</DialogTitle>
                </DialogHeader>
                <div ref={courtDocRef}>
                  <CourtDocumentGenerator 
                    loan={loan}
                    lender={lenderData || { full_name: loan.lender_name }}
                    borrower={borrowerData || { full_name: loan.borrower_name }}
                    payments={payments}
                  />
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <Button variant="outline" onClick={() => handlePrint(courtDocRef)}>
                    <Printer className="w-4 h-4 mr-2" />
                    Печать
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>
      </div>
    </div>
  );
}