import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Shield, Fingerprint, Smartphone, CheckCircle2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function Security() {
  const [user, setUser] = useState(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      // Check if 2FA is enabled from user data
      setTwoFactorEnabled(u?.two_factor_enabled || false);
      setBiometricEnabled(u?.biometric_enabled || false);
    });
  }, []);

  const handleToggleTwoFactor = async () => {
    if (twoFactorEnabled) {
      // Disable 2FA
      await base44.auth.updateMe({ two_factor_enabled: false });
      setTwoFactorEnabled(false);
    } else {
      // Show setup dialog
      setShowTwoFactorSetup(true);
    }
  };

  const handleVerifyTwoFactor = async () => {
    // Simulate verification
    if (verificationCode.length === 6) {
      await base44.auth.updateMe({ two_factor_enabled: true });
      setTwoFactorEnabled(true);
      setShowTwoFactorSetup(false);
      setVerificationCode('');
    }
  };

  const handleToggleBiometric = async () => {
    // Check if biometric is available
    if ('credentials' in navigator) {
      const newState = !biometricEnabled;
      await base44.auth.updateMe({ biometric_enabled: newState });
      setBiometricEnabled(newState);
    } else {
      alert('Биометрия не поддерживается на вашем устройстве');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-8">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-lg mx-auto px-4 py-8">
          <Link to={createPageUrl('More')}>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 -ml-2 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Безопасность</h1>
          <p className="text-slate-400 mt-2">Защита вашего аккаунта</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-4">
        {/* Two-Factor Authentication */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-0 shadow-xl shadow-slate-200/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-violet-50">
                  <Smartphone className="w-5 h-5 text-violet-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">Двухфакторная аутентификация</CardTitle>
                  <CardDescription className="mt-1">
                    Дополнительный уровень защиты при входе
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  {twoFactorEnabled ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-slate-400" />
                  )}
                  <div>
                    <p className="font-medium text-slate-900">
                      {twoFactorEnabled ? 'Включено' : 'Отключено'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {twoFactorEnabled ? 'Аккаунт защищен' : 'Рекомендуем включить'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleToggleTwoFactor}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    twoFactorEnabled ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      twoFactorEnabled ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {showTwoFactorSetup && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 space-y-4 p-4 bg-violet-50 rounded-xl"
                >
                  <div className="text-center">
                    <div className="w-32 h-32 bg-white rounded-xl mx-auto mb-4 p-2">
                      <img 
                        src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=otpauth://totp/P2PLoans:user@example.com?secret=BASE32SECRET" 
                        alt="QR Code"
                        className="w-full h-full"
                      />
                    </div>
                    <p className="text-sm text-slate-600 mb-4">
                      Отсканируйте QR-код в приложении аутентификатора
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm">Код подтверждения</Label>
                    <Input
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="000000"
                      maxLength={6}
                      className="mt-1.5 h-12 text-center text-2xl tracking-widest"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowTwoFactorSetup(false)}
                      className="flex-1"
                    >
                      Отмена
                    </Button>
                    <Button 
                      onClick={handleVerifyTwoFactor}
                      disabled={verificationCode.length !== 6}
                      className="flex-1 bg-violet-600 hover:bg-violet-700"
                    >
                      Подтвердить
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Biometric Login */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-xl shadow-slate-200/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50">
                  <Fingerprint className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">Биометрический вход</CardTitle>
                  <CardDescription className="mt-1">
                    Вход по отпечатку пальца или Face ID
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  {biometricEnabled ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-slate-400" />
                  )}
                  <div>
                    <p className="font-medium text-slate-900">
                      {biometricEnabled ? 'Включено' : 'Отключено'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {biometricEnabled ? 'Быстрый вход активен' : 'Используйте пароль'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleToggleBiometric}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    biometricEnabled ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      biometricEnabled ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-100">
                  <Shield className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Советы по безопасности</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>• Используйте уникальный пароль для каждого сервиса</li>
                    <li>• Включите двухфакторную аутентификацию</li>
                    <li>• Не сообщайте пароль третьим лицам</li>
                    <li>• Регулярно проверяйте активность аккаунта</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}