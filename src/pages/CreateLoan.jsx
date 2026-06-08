import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2, Shield } from 'lucide-react';
import LoanCreationWizard from '../components/loans/LoanCreationWizard';

export default function CreateLoan() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (user.verification_status !== 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full glass-strong border-white/20 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/50">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Требуется верификация</h3>
            <p className="text-white/70 mb-6">
              Для создания займов необходимо пройти верификацию личности
            </p>
            <Button 
              onClick={() => window.location.href = user.verification_status === 'not_started' ? '/#/Verification' : '/#/Home'}
              className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white h-12 shadow-lg shadow-fuchsia-500/50"
            >
              {user.verification_status === 'not_started' ? 'Пройти верификацию' : 'Вернуться на главную'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }



  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-lg mx-auto mb-6">
        <Link to={createPageUrl('Home')}>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </Link>
      </div>
      <LoanCreationWizard 
        user={user}
        onComplete={() => {
          navigate(createPageUrl('LoanManagement'));
        }}
        onCancel={() => {
          navigate(createPageUrl('Home'));
        }}
      />
    </div>
  );
}