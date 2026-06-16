import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PullToRefresh from '../components/ui/pull-to-refresh';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Plus,
  ArrowDownLeft,
  Bell,
  MessageCircle,
  Loader2,
  ChevronRight,
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle2,
  Sun,
  Moon
} from 'lucide-react';
import { motion } from 'framer-motion';
import LoanCard from '../components/loans/LoanCard';
import PaymentWithReceipt from '../components/loans/PaymentWithReceipt';

export default function Home() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [selectedLoanForPayment, setSelectedLoanForPayment] = useState(null);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') !== 'light');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    setIsAuthenticated(true);
  }, []);

  const handleRefresh = async () => {
    await queryClient.invalidateQueries(['loans']);
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  useEffect(() => {
    if (isAuthenticated === true) {
      base44.auth.me().then(setUser);
    } else if (isAuthenticated === false) {
      setUser(false);
    }
  }, [isAuthenticated]);

  const { data: loans = [], isLoading } = useQuery({
    queryKey: ['loans'],
    queryFn: () => base44.entities.Loan.list('-created_date', 5),
    enabled: !!(user && user.id)
  });

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('ru-RU').format(amount || 0);
  };

  // Loading state
  if (isAuthenticated === null || user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-fuchsia-500/20 to-cyan-500/20"></div>
        <Loader2 className="w-8 h-8 animate-spin text-violet-400 relative z-10" />
      </div>
    );
  }

  // Not authenticated - show welcome screen
  if (!isAuthenticated || user === false) {
    return (
      <div className="min-h-screen relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-lg mx-auto relative z-10"
        >
          {/* Header */}
          <div className="glass-strong border-b border-white/10 backdrop-blur-xl">
            <div className="px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/50">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-white">Долг.кг</h1>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2.5 rounded-xl glass hover:glass-strong transition-all">
                  <Bell className="w-5 h-5 text-slate-300" />
                </button>
                <button className="p-2.5 rounded-xl glass hover:glass-strong transition-all">
                  <MessageCircle className="w-5 h-5 text-slate-300" />
                </button>
              </div>
            </div>
          </div>

          <div className="px-4">
            {/* Welcome Banner */}
            <div className="mt-6">
              <div className="relative overflow-hidden rounded-3xl glass-strong p-8 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/10 to-pink-500/10"></div>
                
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-strong mb-4 bg-white/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-fuchsia-500"></span>
                    </span>
                    <span className="text-xs text-white font-medium">P2P Платформа</span>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
                    Займы между людьми
                  </h2>
                  <p className="text-white/90 text-sm mb-6 leading-relaxed">
                    Создавайте официальные договоры займа с полной юридической защитой и автоматической генерацией документов
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => navigate('/')}
                      className="flex-1 bg-white text-violet-600 hover:bg-white/90 font-semibold h-12 shadow-lg shadow-white/20"
                    >
                      Начать
                    </Button>
                    <Button 
                      onClick={() => navigate('/')}
                      className="flex-1 glass-strong text-white hover:bg-white/10 font-semibold h-12 border border-white/20"
                    >
                      Войти
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="glass-strong rounded-2xl p-4 text-center border border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-violet-500/30">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs text-white/70 mb-1">Выдано</p>
                <p className="font-bold text-white text-lg">—</p>
              </div>
              <div className="glass-strong rounded-2xl p-4 text-center border border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-fuchsia-500/30">
                  <ArrowDownLeft className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs text-white/70 mb-1">Взято</p>
                <p className="font-bold text-white text-lg">—</p>
              </div>
              <div className="glass-strong rounded-2xl p-4 text-center border border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/30">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs text-white/70 mb-1">Активных</p>
                <p className="font-bold text-white text-lg">—</p>
              </div>
            </div>

            {/* App Description */}
            <div className="mt-6 mb-6">
              <div className="glass-strong rounded-3xl p-6 border border-white/10">
                <h3 className="font-bold text-white mb-4 text-lg">Возможности платформы</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30 mt-0.5">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white mb-1">Официальные договоры</p>
                      <p className="text-xs text-white/70 leading-relaxed">Автоматическая генерация договоров по законодательству КР с полной юридической силой</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 shadow-lg shadow-fuchsia-500/30 mt-0.5">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white mb-1">Защита сторон</p>
                      <p className="text-xs text-white/70 leading-relaxed">Верификация личности и юридически действительные документы для безопасности</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30 mt-0.5">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white mb-1">Судебные документы</p>
                      <p className="text-xs text-white/70 leading-relaxed">Автоматическая генерация исковых заявлений при необходимости</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const myLoans = (user && user.id) ? loans.filter(
    loan => loan.lender_id === user.id || loan.borrower_id === user.id || loan.borrower_email === user.email
  ) : [];

  const lentLoans = myLoans.filter(loan => loan.lender_id === user.id && loan.status === 'active');
  const borrowedLoans = myLoans.filter(loan => (loan.borrower_id === user.id || loan.borrower_email === user.email) && loan.status === 'active');

  // Check if user needs verification
  const needsVerification = user && user.verification_status !== 'approved';
  const verificationPending = user && user.verification_status === 'pending';
  const verificationRejected = user && user.verification_status === 'rejected';

  const totalLent = lentLoans.reduce((sum, loan) => sum + (loan.amount || 0), 0);
  const totalBorrowed = borrowedLoans.reduce((sum, loan) => sum + (loan.amount || 0), 0);
  const activeLentCount = lentLoans.length;
  const activeBorrowedCount = borrowedLoans.length;

  const recentLoans = myLoans.slice(0, 3);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen pb-20 relative">
        {/* Top Header */}
        <div className="glass-strong border-b border-white/10 sticky top-0 z-10 backdrop-blur-xl safe-top">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to={createPageUrl('Profile')}>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg shadow-violet-500/30 cursor-pointer border border-white/20 active:scale-95 transition-transform">
                  {user.full_name?.charAt(0) || 'П'}
                </div>
              </Link>
              <div>
                <p className="text-xs text-white/60">Здравствуйте,</p>
                <h1 className="text-base font-bold text-white">{user.full_name || 'Пользователь'}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggleTheme} className="p-2.5 rounded-xl glass hover:glass-strong transition-colors active:scale-95">
                {isDark ? <Sun className="w-5 h-5 text-slate-300" /> : <Moon className="w-5 h-5 text-slate-300" />}
              </button>
              <Link to={createPageUrl('NotificationsList')}>
                <button className="p-2.5 rounded-xl glass hover:glass-strong transition-colors relative active:scale-95">
                  <Bell className="w-5 h-5 text-slate-300" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-fuchsia-500 rounded-full"></span>
                </button>
              </Link>
              <Link to={createPageUrl('Support')}>
                <button className="p-2.5 rounded-xl glass hover:glass-strong transition-colors active:scale-95">
                  <MessageCircle className="w-5 h-5 text-slate-300" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 relative z-10">

        {/* Verification Banner */}
        {needsVerification && (
          <div className="mt-4">
            {verificationPending ? (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 p-6 shadow-xl shadow-blue-500/30">
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    ⏳ Верификация на проверке
                  </h2>
                  <p className="text-blue-50 text-sm mb-4">
                    Ваши документы отправлены на проверку. Обычно это занимает 1-2 рабочих дня.
                  </p>
                </div>
                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute -top-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              </div>
            ) : verificationRejected ? (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-500 via-red-600 to-pink-600 p-6 shadow-xl shadow-red-500/30">
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    ❌ Верификация отклонена
                  </h2>
                  <p className="text-red-50 text-sm mb-4">
                    {user.verification_rejection_reason || 'Пожалуйста, проверьте ваши документы и попробуйте снова'}
                  </p>
                  <Link to={createPageUrl('Verification')}>
                    <Button className="bg-white text-red-600 hover:bg-slate-50">
                      Повторить верификацию
                    </Button>
                  </Link>
                </div>
                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute -top-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 p-6 shadow-xl shadow-amber-500/30">
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    ⚠️ Требуется верификация
                  </h2>
                  <p className="text-amber-50 text-sm mb-4">
                    Для создания займов необходимо пройти обязательную верификацию личности
                  </p>
                  <Link to={createPageUrl('Verification')}>
                    <Button className="bg-white text-amber-600 hover:bg-slate-50">
                      Пройти верификацию
                    </Button>
                  </Link>
                </div>
                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute -top-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              </div>
            )}
          </div>
        )}

        {/* Banner */}
        {!needsVerification && (
          <div className="mt-4">
            <div className="relative overflow-hidden rounded-3xl glass-strong p-8 shadow-lg border border-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/10 to-pink-500/10"></div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-strong mb-4 bg-white/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-fuchsia-500"></span>
                  </span>
                  <span className="text-xs text-white font-medium">Верифицирован</span>
                </div>

                <h2 className="text-2xl font-bold text-white mb-3 leading-tight">
                  Создайте займ за минуту
                </h2>
                <p className="text-white/90 text-sm mb-6 leading-relaxed">
                  Автоматическая генерация договоров с полной юридической защитой обеих сторон
                </p>
                <Link to={createPageUrl('CreateLoan')} className="block">
                  <Button className="w-full bg-white text-violet-600 hover:bg-white/90 font-semibold h-12 shadow-lg shadow-white/20">
                    <Plus className="w-5 h-5 mr-2" />
                    Создать займ
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {user && user.id && (
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="glass-strong rounded-2xl p-4 text-center border border-white/10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-violet-500/30">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs text-white/70 mb-1">Выдано</p>
              <p className="font-bold text-white text-lg">{activeLentCount}</p>
            </div>
            <div className="glass-strong rounded-2xl p-4 text-center border border-white/10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-fuchsia-500/30">
                <ArrowDownLeft className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs text-white/70 mb-1">Взято</p>
              <p className="font-bold text-white text-lg">{activeBorrowedCount}</p>
            </div>
            <div className="glass-strong rounded-2xl p-4 text-center border border-white/10">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/30">
                <Users className="w-6 h-6 text-white" />
              </div>
              <p className="text-xs text-white/70 mb-1">Активных</p>
              <p className="font-bold text-white text-lg">{myLoans.filter(l => l.status === 'active').length}</p>
            </div>
          </div>
        )}

        {/* App Description */}
        <div className="mt-6">
          <div className="glass-strong rounded-3xl p-6 border border-white/10">
            <h3 className="font-bold text-white mb-4 text-lg">Возможности платформы</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30 mt-0.5">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white mb-1">Официальные договоры</p>
                  <p className="text-xs text-slate-400 leading-relaxed">Автоматическая генерация договоров по законодательству КР с полной юридической силой</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 shadow-lg shadow-fuchsia-500/30 mt-0.5">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white mb-1">Защита сторон</p>
                  <p className="text-xs text-slate-400 leading-relaxed">Верификация личности и юридически действительные документы для безопасности</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30 mt-0.5">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white mb-1">Судебные документы</p>
                  <p className="text-xs text-slate-400 leading-relaxed">Автоматическая генерация исковых заявлений при необходимости</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Loans */}
        {recentLoans.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-lg">Последние займы</h3>
              <Link to={createPageUrl('LoanManagement')}>
                <Button variant="ghost" size="sm" className="text-violet-400 hover:text-violet-300">
                  Все
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {recentLoans.map((loan) => (
                <LoanCard 
                  key={loan.id} 
                  loan={loan} 
                  currentUserId={user.id} 
                  compact 
                  onPayment={setSelectedLoanForPayment}
                />
              ))}
              </div>
              </div>
              )}
              </div>

              {/* Payment Dialog */}
      <Dialog open={!!selectedLoanForPayment} onOpenChange={() => setSelectedLoanForPayment(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Оплата займа</DialogTitle>
          </DialogHeader>
          {selectedLoanForPayment && (
            <PaymentWithReceipt 
              loan={selectedLoanForPayment}
              onSuccess={() => {
                setSelectedLoanForPayment(null);
                window.location.reload();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      </div>
    </PullToRefresh>
  );
}