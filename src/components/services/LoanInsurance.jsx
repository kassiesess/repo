import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import MobileSelectDrawer from '@/components/ui/mobile-select-drawer';
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, CheckCircle2, Building, Loader2, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, addMonths } from 'date-fns';
import InsurancePaymentForm from '../insurance/InsurancePaymentForm';

export default function LoanInsurance({ onBack }) {
  const [user, setUser] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: loans = [] } = useQuery({
    queryKey: ['user-active-loans'],
    queryFn: async () => {
      const allLoans = await base44.entities.Loan.list('-created_date');
      return allLoans.filter(loan => 
        loan.status === 'active' && 
        (loan.lender_id === user?.id || loan.borrower_id === user?.id)
      );
    },
    enabled: !!user
  });

  const { data: companies = [] } = useQuery({
    queryKey: ['insurance-companies'],
    queryFn: () => base44.entities.InsuranceCompany.filter({ is_active: true }),
  });

  const { data: myInsurances = [] } = useQuery({
    queryKey: ['my-insurances'],
    queryFn: () => base44.entities.LoanInsurance.filter({ user_id: user?.id }),
    enabled: !!user
  });

  const createInsuranceMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.LoanInsurance.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-insurances']);
      setSelectedLoan(null);
      setSelectedCompany(null);
    }
  });

  const formatMoney = (value) => {
    return new Intl.NumberFormat('ru-RU').format(value || 0);
  };

  const calculatePremium = (company) => {
    if (!selectedLoan) return 0;
    return (selectedLoan.amount * (company.insurance_rate / 100) * (selectedLoan.term_months / 12));
  };

  const [paymentStep, setPaymentStep] = useState('select'); // select, payment, success

  const handleActivate = () => {
    if (!selectedCompany || !selectedLoan || !user) {
      alert('Выберите займ и страховую компанию');
      return;
    }
    setPaymentStep('payment');
  };

  const handlePaymentComplete = async (paymentData) => {
    const premium = calculatePremium(selectedCompany);
    const startDate = new Date();
    const endDate = addMonths(startDate, selectedLoan.term_months);

    await createInsuranceMutation.mutateAsync({
      loan_id: selectedLoan.id,
      user_id: user.id,
      insurance_company_id: selectedCompany.id,
      company_name: selectedCompany.company_name,
      loan_amount: selectedLoan.amount,
      term_months: selectedLoan.term_months,
      insurance_rate: selectedCompany.insurance_rate,
      premium_amount: premium,
      coverage_percent: selectedCompany.coverage_percent,
      status: 'active',
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
      policy_number: `POL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      payment_receipt_url: paymentData.receipt_url,
      payment_date: format(new Date(), 'yyyy-MM-dd')
    });
    
    setPaymentStep('success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-20">
      <div className="bg-gradient-to-br from-red-600 via-red-700 to-pink-700 text-white">
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
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Страхование займа</h1>
              <p className="text-red-200 text-sm">Защитите свои средства</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-4">
        {/* My Insurances */}
        {myInsurances.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-0 shadow-xl shadow-slate-200/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Мои страховки
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {myInsurances.map((insurance) => (
                  <div key={insurance.id} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-sm">{insurance.company_name}</p>
                      <Badge className="bg-emerald-100 text-emerald-700">
                        {insurance.status === 'active' ? 'Активна' : insurance.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      Полис: {insurance.policy_number}
                    </p>
                    <p className="text-sm font-bold text-slate-900 mt-1">
                      {formatMoney(insurance.loan_amount)} сом • {formatMoney(insurance.premium_amount)} сом премия
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Select Loan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-0 shadow-xl shadow-slate-200/50">
            <CardHeader>
              <CardTitle>Выберите займ для страхования</CardTitle>
            </CardHeader>
            <CardContent>
              <MobileSelectDrawer
                title="Выберите займ"
                value={selectedLoan?.id}
                onValueChange={(id) => setSelectedLoan(loans.find(l => l.id === id))}
                options={loans.map(loan => ({
                  value: loan.id,
                  label: `${formatMoney(loan.amount)} сом • ${loan.term_months} мес.`
                }))}
                trigger={
                  <button className="w-full h-12 flex items-center justify-between px-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                    <span>{selectedLoan ? `${formatMoney(selectedLoan.amount)} сом • ${selectedLoan.term_months} мес.` : 'Выберите займ'}</span>
                    <span className="text-slate-400">▾</span>
                  </button>
                }
              />
              {selectedLoan && (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Детали займа</p>
                  <p className="font-bold">{formatMoney(selectedLoan.amount)} сом</p>
                  <p className="text-xs text-slate-600">
                    {selectedLoan.term_months} мес. • {selectedLoan.interest_rate}% ставка
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Insurance Companies */}
        {selectedLoan && (
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900 px-2">Страховые компании</h3>
            {companies.map((company, index) => {
              const premium = calculatePremium(company);
              const isSelected = selectedCompany?.id === company.id;

            return (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`border-0 shadow-lg shadow-slate-200/50 cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-emerald-500' : ''
                  }`}
                  onClick={() => setSelectedCompany(company)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">🏢</div>
                        <div>
                          <p className="font-bold text-slate-900">{company.company_name}</p>
                          <p className="text-xs text-slate-500">Покрытие {company.coverage_percent}%</p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="p-1.5 bg-emerald-100 rounded-full">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-600 mb-1">Ставка</p>
                        <p className="font-bold text-slate-900">{company.insurance_rate}%</p>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-xl">
                        <p className="text-xs text-slate-600 mb-1">Премия</p>
                        <p className="font-bold text-emerald-600">{formatMoney(premium)} сом</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
          </div>
        )}

        {/* Payment Dialog */}
        {selectedCompany && paymentStep === 'select' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button 
              onClick={handleActivate}
              className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-lg"
            >
              Перейти к оплате
            </Button>
          </motion.div>
        )}

        {paymentStep === 'payment' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-0 shadow-xl shadow-slate-200/50">
              <CardHeader>
                <CardTitle>Оплата страховки</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-600 mb-2">Сумма к оплате</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {formatMoney(calculatePremium(selectedCompany))} сом
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-900">
                    <strong>Инструкция:</strong> Переведите указанную сумму на счет страховой компании через ваш банк, затем загрузите квитанцию об оплате.
                  </p>
                </div>

                <InsurancePaymentForm 
                  amount={calculatePremium(selectedCompany)}
                  onComplete={handlePaymentComplete}
                  onCancel={() => setPaymentStep('select')}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {paymentStep === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-0 shadow-xl shadow-emerald-200/50">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Страховка активирована!</h3>
                <p className="text-slate-600 mb-4">Ваш займ теперь застрахован</p>
                <Button onClick={onBack} className="w-full h-12 bg-emerald-600 hover:bg-emerald-700">
                  Вернуться
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Info */}
        <Card className="border-0 shadow-lg shadow-slate-200/50 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Что покрывает страхование?</h3>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Невозврат займа заемщиком</li>
                  <li>• Смерть или инвалидность заемщика</li>
                  <li>• Потеря работы заемщиком</li>
                  <li>• Форс-мажорные обстоятельства</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}