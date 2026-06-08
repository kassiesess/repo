import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PullToRefresh from '../components/ui/pull-to-refresh';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter,
  Loader2,
  FileText,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Percent,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function LoanManagement() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date'); // date, amount, rate
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const handleRefresh = async () => {
    await queryClient.invalidateQueries(['loans']);
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const { data: loans = [], isLoading } = useQuery({
    queryKey: ['loans'],
    queryFn: async () => {
      const allLoans = await base44.entities.Loan.list('-created_date');
      
      // Auto-delete pending loans older than 3 days
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      for (const loan of allLoans) {
        if (loan.status === 'pending') {
          const loanDate = new Date(loan.created_date);
          if (loanDate < threeDaysAgo) {
            await base44.entities.Loan.delete(loan.id);
          }
        }
      }
      
      // Return loans after cleanup
      return allLoans.filter(loan => {
        if (loan.status === 'pending') {
          const loanDate = new Date(loan.created_date);
          return loanDate >= threeDaysAgo;
        }
        return true;
      });
    },
    enabled: !!user
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('ru-RU').format(amount || 0);
  };

  const myLoans = loans.filter(
    loan => loan.lender_id === user.id || loan.borrower_id === user.id || loan.borrower_email === user.email
  );

  const lentLoans = myLoans.filter(loan => loan.lender_id === user.id);
  const borrowedLoans = myLoans.filter(loan => loan.borrower_id === user.id || loan.borrower_email === user.email);

  const totalLent = lentLoans.filter(l => l.status === 'active').reduce((sum, loan) => sum + (loan.amount || 0), 0);
  const totalBorrowed = borrowedLoans.filter(l => l.status === 'active').reduce((sum, loan) => sum + (loan.amount || 0), 0);
  const activeLentCount = lentLoans.filter(l => l.status === 'active').length;
  const activeBorrowedCount = borrowedLoans.filter(l => l.status === 'active').length;
  const totalInterestEarned = lentLoans.filter(l => l.status === 'completed').reduce((sum, l) => sum + (l.total_interest || 0), 0);

  let filteredLoans = activeTab === 'all' ? myLoans :
    activeTab === 'lent' ? lentLoans : borrowedLoans;

  if (statusFilter !== 'all') {
    filteredLoans = filteredLoans.filter(loan => loan.status === statusFilter);
  }

  if (searchTerm) {
    filteredLoans = filteredLoans.filter(loan => 
      loan.lender_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.borrower_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.borrower_email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Sort loans
  filteredLoans = [...filteredLoans].sort((a, b) => {
    if (sortBy === 'amount') return (b.amount || 0) - (a.amount || 0);
    if (sortBy === 'rate') return (b.interest_rate || 0) - (a.interest_rate || 0);
    return new Date(b.created_date) - new Date(a.created_date);
  });

  const statusConfig = {
    pending: { label: 'Ожидает', color: 'bg-amber-100 text-amber-700', icon: Clock },
    active: { label: 'Активный', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
    completed: { label: 'Завершен', color: 'bg-slate-100 text-slate-700', icon: CheckCircle2 },
    overdue: { label: 'Просрочен', color: 'bg-red-100 text-red-700', icon: AlertCircle },
    defaulted: { label: 'Невозврат', color: 'bg-red-100 text-red-700', icon: AlertCircle }
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen page-bg pb-20">
        {/* Header */}
        <div className="page-header safe-top">
        <div className="max-w-lg mx-auto px-4 pt-8 pb-12">
          <h1 className="text-2xl font-bold mb-6">Управление займами</h1>
          
          {/* Enhanced Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-slate-300">Выдано</span>
              </div>
              <p className="text-2xl font-bold">{formatMoney(totalLent)}</p>
              <p className="text-xs text-slate-400 mt-1">Активных: {activeLentCount}</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-slate-300">Взято</span>
              </div>
              <p className="text-2xl font-bold">{formatMoney(totalBorrowed)}</p>
              <p className="text-xs text-slate-400 mt-1">Активных: {activeBorrowedCount}</p>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 backdrop-blur-sm rounded-2xl p-4 border border-emerald-500/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-200 mb-1">Заработано процентов</p>
                <p className="text-xl font-bold text-emerald-100">{formatMoney(totalInterestEarned)} сом</p>
              </div>
              <div className="p-2 bg-emerald-500/30 rounded-xl">
                <DollarSign className="w-6 h-6 text-emerald-200" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4">
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-3 mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Поиск по имени или email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 bg-white/80 border-0 shadow-lg shadow-slate-200/50"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-12 bg-white/80 border-0 shadow-lg shadow-slate-200/50">
                <Filter className="w-4 h-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="pending">Ожидает</SelectItem>
                <SelectItem value="active">Активные</SelectItem>
                <SelectItem value="completed">Завершенные</SelectItem>
                <SelectItem value="overdue">Просроченные</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-12 bg-white/80 border-0 shadow-lg shadow-slate-200/50">
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">По дате</SelectItem>
                <SelectItem value="amount">По сумме</SelectItem>
                <SelectItem value="rate">По ставке</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-white/80 p-1 rounded-xl mb-4 shadow-lg shadow-slate-200/50">
            <TabsTrigger value="all" className="flex-1 rounded-lg data-[state=active]:bg-slate-900 data-[state=active]:text-white">
              Все ({myLoans.length})
            </TabsTrigger>
            <TabsTrigger value="lent" className="flex-1 rounded-lg data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
              Выдано ({lentLoans.length})
            </TabsTrigger>
            <TabsTrigger value="borrowed" className="flex-1 rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              Взято ({borrowedLoans.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              </div>
            ) : filteredLoans.length === 0 ? (
              <Card className="border-0 shadow-md">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-600 font-medium">Займы не найдены</p>
                  <p className="text-sm text-slate-400 mt-1">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Попробуйте изменить фильтры' 
                      : 'У вас пока нет займов'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredLoans.map((loan, index) => {
                  const isLender = loan.lender_id === user.id;
                  const status = statusConfig[loan.status] || statusConfig.pending;
                  const StatusIcon = status.icon;
                  const progressPercent = loan.total_repayment > 0 
                    ? Math.min(100, ((loan.amount_paid || 0) / loan.total_repayment) * 100)
                    : 0;

                  return (
                    <motion.div
                      key={loan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Link to={createPageUrl('LoanDetails') + `?id=${loan.id}`}>
                        <Card className="border-0 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl ${isLender ? 'bg-emerald-50' : 'bg-blue-50'}`}>
                                  {isLender ? (
                                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                                  ) : (
                                    <TrendingDown className="w-5 h-5 text-blue-600" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900">
                                    {isLender ? (loan.borrower_name || loan.borrower_email) : loan.lender_name}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {isLender ? 'Вы дали в долг' : 'Вы взяли в долг'}
                                  </p>
                                </div>
                              </div>
                              <Badge className={status.color}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {status.label}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mb-3">
                              <div className="bg-slate-50 rounded-lg p-2">
                                <div className="flex items-center gap-1 mb-1">
                                  <DollarSign className="w-3 h-3 text-slate-400" />
                                  <p className="text-xs text-slate-500">Сумма</p>
                                </div>
                                <p className="font-bold text-slate-900 text-sm">{formatMoney(loan.amount)}</p>
                              </div>
                              <div className="bg-slate-50 rounded-lg p-2">
                                <div className="flex items-center gap-1 mb-1">
                                  <Percent className="w-3 h-3 text-slate-400" />
                                  <p className="text-xs text-slate-500">Ставка</p>
                                </div>
                                <p className="font-bold text-slate-900 text-sm">{loan.interest_rate}%</p>
                              </div>
                              <div className="bg-slate-50 rounded-lg p-2">
                                <div className="flex items-center gap-1 mb-1">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  <p className="text-xs text-slate-500">Срок</p>
                                </div>
                                <p className="font-bold text-slate-900 text-sm">{loan.term_months} мес.</p>
                              </div>
                            </div>

                            {loan.status === 'active' && (
                              <div>
                                <div className="flex justify-between text-xs text-slate-500 mb-1">
                                  <span>Выплачено</span>
                                  <span>{formatMoney(loan.amount_paid)} / {formatMoney(loan.total_repayment)}</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${isLender ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                    style={{ width: `${progressPercent}%` }}
                                  />
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-3 pt-3 border-t">
                              <p className="text-xs text-slate-400">
                                {loan.end_date && format(new Date(loan.end_date), 'd MMM yyyy', { locale: ru })}
                              </p>
                              <p className="text-xs text-emerald-600 font-medium">Подробнее →</p>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </PullToRefresh>
  );
}