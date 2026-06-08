import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { base44 } from '@/api/base44Client';
import { Upload, Camera, CheckCircle2, Shield, AlertCircle, Loader2, FileText, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VerificationFlow({ user, onComplete }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    passport_series: '',
    passport_number: '',
    inn: '',
    birth_date: '',
    address: '',
    phone: '',
    passport_front_url: '',
    passport_back_url: '',
    selfie_url: ''
  });

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, [field]: file_url }));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Ошибка загрузки. Попробуйте еще раз.');
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.full_name || !formData.passport_series || !formData.passport_number || 
        !formData.inn || !formData.birth_date || !formData.address || !formData.phone ||
        !formData.passport_front_url || !formData.passport_back_url || !formData.selfie_url) {
      alert('Заполните все поля и загрузите все документы');
      return;
    }

    setLoading(true);
    try {
      // Save data first
      await base44.auth.updateMe({
        full_name: formData.full_name,
        passport_series: formData.passport_series,
        passport_number: formData.passport_number,
        inn: formData.inn,
        birth_date: formData.birth_date,
        address: formData.address,
        phone: formData.phone,
        passport_front_url: formData.passport_front_url,
        passport_back_url: formData.passport_back_url,
        selfie_url: formData.selfie_url,
        verification_status: 'pending',
        verification_submitted_date: new Date().toISOString().split('T')[0]
      });
      
      // Run KYC verification
      try {
        const kycResult = await base44.functions.invoke('kycVerification', {
          passportFrontUrl: formData.passport_front_url,
          passportBackUrl: formData.passport_back_url,
          selfieUrl: formData.selfie_url
        });
        
        if (kycResult.data.verified) {
          await base44.auth.updateMe({
            verification_status: 'approved',
            passport_data: kycResult.data.passport.data
          });
        } else {
          await base44.auth.updateMe({
            verification_status: 'rejected',
            verification_rejection_reason: kycResult.data.passport.issues?.join(', ') || 'Документы не прошли проверку'
          });
        }
      } catch (e) {
        console.log('KYC check error:', e);
      }
      
      onComplete();
    } catch (error) {
      console.error('Verification failed:', error);
      alert('Ошибка при отправке документов. Попробуйте еще раз.');
    }
    setLoading(false);
  };

  const progress = step === 0 ? 0 : ((step / 3) * 100);

  const stepVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 text-white mb-4 shadow-lg shadow-fuchsia-500/50">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white">Верификация личности</h1>
          <p className="text-slate-400 mt-2">{step === 0 ? 'Личные данные' : `Шаг ${step} из 3`}</p>
        </div>

        {step > 0 && <Progress value={progress} className="mb-8 h-2 bg-slate-100" />}

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <div className="glass-strong rounded-3xl p-6 border border-white/10 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-violet-500/20 border border-violet-500/30">
                    <User className="w-5 h-5 text-violet-300" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Личные данные</h2>
                    <p className="text-sm text-slate-400">Заполните данные из паспорта</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-400 text-sm">Имя и фамилия (как в паспорте)</Label>
                    <Input
                      placeholder="Иванов Иван Иванович"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                      className="mt-1.5 h-12 glass border-white/20 text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:ring-violet-500/50"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-400 text-sm">Серия паспорта</Label>
                      <Input
                        placeholder="ID"
                        value={formData.passport_series}
                        onChange={(e) => setFormData(prev => ({ ...prev, passport_series: e.target.value.toUpperCase() }))}
                        className="mt-1.5 h-12"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-400 text-sm">Номер паспорта</Label>
                      <Input
                        placeholder="1234567"
                        value={formData.passport_number}
                        onChange={(e) => setFormData(prev => ({ ...prev, passport_number: e.target.value }))}
                        className="mt-1.5 h-12"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-slate-400 text-sm">ИНН</Label>
                    <Input
                      placeholder="12345678901234"
                      value={formData.inn}
                      onChange={(e) => setFormData(prev => ({ ...prev, inn: e.target.value }))}
                      className="mt-1.5 h-12"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-slate-400 text-sm">Дата рождения</Label>
                    <Input
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                      className="mt-1.5 h-12"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-slate-400 text-sm">Адрес регистрации</Label>
                    <Input
                      placeholder="г. Бишкек, ул. ..."
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="mt-1.5 h-12"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-slate-400 text-sm">Телефон</Label>
                    <Input
                      placeholder="+996 ..."
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="mt-1.5 h-12"
                    />
                  </div>

                  <Button 
                    onClick={() => setStep(1)} 
                    className="w-full h-12 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 hover:from-violet-600 hover:via-fuchsia-600 hover:to-pink-600 text-white shadow-lg shadow-fuchsia-500/50"
                    disabled={!formData.full_name || !formData.passport_series || !formData.passport_number || 
                              !formData.inn || !formData.birth_date || !formData.address || !formData.phone}
                  >
                    Продолжить
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0 shadow-xl shadow-slate-200/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-50">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Паспорт КР (лицевая сторона)</CardTitle>
                      <CardDescription>Загрузите фото главной страницы</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-emerald-400 transition-colors">
                    {formData.passport_front_url ? (
                      <div className="space-y-4">
                        <img 
                          src={formData.passport_front_url} 
                          alt="Passport Front" 
                          className="max-h-48 mx-auto rounded-xl shadow-md"
                        />
                        <div className="flex items-center justify-center gap-2 text-emerald-600">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="font-medium">Загружено</span>
                        </div>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'passport_front_url')}
                          disabled={loading}
                        />
                        <div className="space-y-3">
                          {loading ? (
                            <Loader2 className="w-12 h-12 mx-auto text-slate-400 animate-spin" />
                          ) : (
                            <Upload className="w-12 h-12 mx-auto text-slate-400" />
                          )}
                          <p className="text-slate-600">Нажмите для загрузки</p>
                          <p className="text-sm text-slate-400">JPG, PNG до 10MB</p>
                        </div>
                      </label>
                    )}
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-900">Требования к фото:</p>
                        <ul className="text-xs text-amber-700 mt-1 space-y-1">
                          <li>• Четкое изображение без бликов</li>
                          <li>• Все данные должны быть читаемы</li>
                          <li>• Фото не должно быть обрезано</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setStep(0)}
                      className="flex-1 h-12 border-slate-200"
                    >
                      Назад
                    </Button>
                    <Button 
                      onClick={() => setStep(2)} 
                      className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg"
                      disabled={!formData.passport_front_url}
                    >
                      Продолжить
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0 shadow-xl shadow-slate-200/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-violet-50">
                      <FileText className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Паспорт КР (обратная сторона)</CardTitle>
                      <CardDescription>Загрузите фото задней страницы</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-emerald-400 transition-colors">
                    {formData.passport_back_url ? (
                      <div className="space-y-4">
                        <img 
                          src={formData.passport_back_url} 
                          alt="Passport Back" 
                          className="max-h-48 mx-auto rounded-xl shadow-md"
                        />
                        <div className="flex items-center justify-center gap-2 text-emerald-600">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="font-medium">Загружено</span>
                        </div>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'passport_back_url')}
                          disabled={loading}
                        />
                        <div className="space-y-3">
                          {loading ? (
                            <Loader2 className="w-12 h-12 mx-auto text-slate-400 animate-spin" />
                          ) : (
                            <Upload className="w-12 h-12 mx-auto text-slate-400" />
                          )}
                          <p className="text-slate-600">Нажмите для загрузки</p>
                          <p className="text-sm text-slate-400">JPG, PNG до 10MB</p>
                        </div>
                      </label>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setStep(1)}
                      className="flex-1 h-12 border-slate-200"
                    >
                      Назад
                    </Button>
                    <Button 
                      onClick={() => setStep(3)} 
                      className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg"
                      disabled={!formData.passport_back_url}
                    >
                      Продолжить
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0 shadow-xl shadow-slate-200/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-50">
                      <Camera className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Селфи для верификации</CardTitle>
                      <CardDescription>Сделайте фото вашего лица</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-emerald-400 transition-colors">
                    {formData.selfie_url ? (
                      <div className="space-y-4">
                        <img 
                          src={formData.selfie_url} 
                          alt="Selfie" 
                          className="max-h-48 mx-auto rounded-xl shadow-md"
                        />
                        <div className="flex items-center justify-center gap-2 text-emerald-600">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="font-medium">Загружено</span>
                        </div>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <input 
                          type="file" 
                          accept="image/*" 
                          capture="user"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'selfie_url')}
                          disabled={loading}
                        />
                        <div className="space-y-3">
                          {loading ? (
                            <Loader2 className="w-12 h-12 mx-auto text-slate-400 animate-spin" />
                          ) : (
                            <Camera className="w-12 h-12 mx-auto text-slate-400" />
                          )}
                          <p className="text-slate-600">Нажмите для съемки</p>
                          <p className="text-sm text-slate-400">Лицо должно быть четко видно</p>
                        </div>
                      </label>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Требования к селфи:</p>
                        <ul className="text-xs text-blue-700 mt-1 space-y-1">
                          <li>• Смотрите прямо в камеру</li>
                          <li>• Хорошее освещение</li>
                          <li>• Без головных уборов и очков</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setStep(2)}
                      className="flex-1 h-12 border-slate-200"
                    >
                      Назад
                    </Button>
                    <Button 
                      onClick={handleSubmit} 
                      className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg"
                      disabled={!formData.selfie_url || loading}
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5 mr-2" />
                          Отправить на проверку
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 p-4 bg-slate-50 rounded-2xl">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-700">Безопасность данных</p>
              <p className="text-xs text-slate-500 mt-1">
                Ваши документы защищены шифрованием и используются только для верификации личности
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}