import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  User, 
  Shield, 
  Phone, 
  MapPin, 
  CreditCard, 
  Calendar,
  CheckCircle2,
  Edit2,
  Loader2,
  LogOut,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import CreditScore from '../components/profile/CreditScore';
import TaxReportButton from '../components/profile/TaxReportButton';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});


  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setFormData({
        phone: u?.phone || '',
        address: u?.address || ''
      });
    });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await base44.auth.updateMe(formData);
      const updated = await base44.auth.me();
      setUser(updated);
      setEditing(false);
    } catch (error) {
      console.error('Update failed:', error);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await base44.auth.logout();
    } catch (e) {
      console.error('Logout error:', e);
    }
    window.location.href = '/#/Welcome';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">
                {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold">{user.full_name || 'Пользователь'}</h1>
              <p className="text-slate-400 text-sm">{user.email}</p>
              {user.verification_status === 'approved' && (
                <Badge className="mt-2 bg-emerald-500/20 text-emerald-400 border-0">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Верифицирован
                </Badge>
              )}
              {user.verification_status === 'pending' && (
                <Badge className="mt-2 bg-blue-500/20 text-blue-400 border-0">
                  На проверке
                </Badge>
              )}
              {user.verification_status === 'rejected' && (
                <Badge className="mt-2 bg-red-500/20 text-red-400 border-0">
                  Отклонено
                </Badge>
              )}
              </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-4">
        {/* Personal Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-0 shadow-xl shadow-slate-200/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-slate-400" />
                Личные данные
              </CardTitle>
              {!editing && (
                <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                  <Edit2 className="w-4 h-4 mr-1" />
                  Изменить
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <div>
                    <Label className="text-slate-600 text-sm">Телефон</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+996 ..."
                      className="mt-1.5 h-12"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-600 text-sm">Адрес</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="г. Бишкек, ул. ..."
                      className="mt-1.5 h-12"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setEditing(false)}
                      className="flex-1"
                    >
                      Отмена
                    </Button>
                    <Button 
                      onClick={handleSave}
                      disabled={loading}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Сохранить'}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {user.full_name && (
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                      <User className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-sm text-slate-500">Имя и фамилия (из паспорта)</p>
                        <p className="font-medium">{user.full_name}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">Телефон</p>
                      <p className="font-medium">{user.phone || 'Не указан'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                    <MapPin className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">Адрес</p>
                      <p className="font-medium">{user.address || 'Не указан'}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Verification Status */}
        {user.verification_status !== 'approved' && user.verification_status !== 'not_started' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {user.verification_status === 'pending' ? (
              <Card className="border-0 shadow-xl shadow-blue-200/50 bg-gradient-to-br from-blue-50 to-cyan-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-2">Верификация на проверке</h3>
                      <p className="text-sm text-slate-600">
                        Ваши документы отправлены на проверку. Обычно это занимает 1-2 рабочих дня.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-xl shadow-red-200/50 bg-gradient-to-br from-red-50 to-pink-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Shield className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-2">Верификация отклонена</h3>
                      <p className="text-sm text-slate-600 mb-3">
                        {user.verification_rejection_reason || 'Пожалуйста, проверьте ваши документы и попробуйте снова'}
                      </p>
                      <Button 
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => window.location.href = '/#/Verification'}
                      >
                        Повторить верификацию
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {user.verification_status === 'not_started' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-xl shadow-amber-200/50 bg-gradient-to-br from-amber-50 to-orange-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Shield className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-2">Верификация не пройдена</h3>
                    <p className="text-sm text-slate-600 mb-3">
                      Для создания займов необходимо пройти обязательную верификацию личности
                    </p>
                    <Button 
                      className="bg-amber-600 hover:bg-amber-700"
                      onClick={() => window.location.href = '/#/Verification'}
                    >
                      Пройти верификацию
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Credit Score */}
        {user.verification_status === 'approved' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <CreditScore userId={user.id} />
          </motion.div>
        )}

        {/* Tax Report */}
        {user.verification_status === 'approved' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
          >
            <TaxReportButton />
          </motion.div>
        )}

        {/* Documents */}
        {user.verification_status === 'approved' && (user.passport_series || user.inn) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-xl shadow-slate-200/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-slate-400" />
                  Документы
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.passport_series && (
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                    <CreditCard className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">Паспорт</p>
                      <p className="font-medium">
                        {user.passport_series} {user.passport_number}
                      </p>
                    </div>
                  </div>
                )}
                {user.inn && (
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                    <CreditCard className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">ИНН</p>
                      <p className="font-medium">{user.inn}</p>
                    </div>
                  </div>
                )}
                {user.birth_date && (
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">Дата рождения</p>
                      <p className="font-medium">
                        {format(new Date(user.birth_date), 'd MMMM yyyy', { locale: ru })}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Photos */}
        {user.verification_status === 'approved' && (user.passport_front_url || user.passport_back_url || user.selfie_url) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-xl shadow-slate-200/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Фотографии</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {user.passport_front_url && (
                    <div>
                      <p className="text-sm text-slate-500 mb-2">Паспорт (лицевая)</p>
                      <img 
                        src={user.passport_front_url} 
                        alt="Passport Front" 
                        className="w-full h-32 object-cover rounded-xl"
                      />
                    </div>
                  )}
                  {user.passport_back_url && (
                    <div>
                      <p className="text-sm text-slate-500 mb-2">Паспорт (обратная)</p>
                      <img 
                        src={user.passport_back_url} 
                        alt="Passport Back" 
                        className="w-full h-32 object-cover rounded-xl"
                      />
                    </div>
                  )}
                  {user.selfie_url && (
                    <div>
                      <p className="text-sm text-slate-500 mb-2">Селфи</p>
                      <img 
                        src={user.selfie_url} 
                        alt="Selfie" 
                        className="w-full h-32 object-cover rounded-xl"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}



        {/* About Us */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-xl shadow-slate-200/50">
            <CardHeader>
              <CardTitle className="text-lg">О нас</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-600 leading-relaxed">
                <strong>Долг.кг</strong> — платформа для создания официальных договоров займа между физическими лицами в соответствии с законодательством Кыргызской Республики.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <p className="text-xs text-slate-600 mb-1">Зарегистрировано</p>
                  <p className="text-lg font-bold text-emerald-600">500+</p>
                  <p className="text-xs text-slate-500">пользователей</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <p className="text-xs text-slate-600 mb-1">Создано займов</p>
                  <p className="text-lg font-bold text-blue-600">1,200+</p>
                  <p className="text-xs text-slate-500">договоров</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Community Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-0 shadow-xl shadow-slate-200/50">
            <CardHeader>
              <CardTitle className="text-lg">Сообщество</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl opacity-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-bold">
                    T
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Telegram</p>
                    <p className="text-xs text-slate-500">Скоро</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-pink-50 rounded-xl opacity-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg font-bold">
                    I
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Instagram</p>
                    <p className="text-xs text-slate-500">Скоро</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Referral Program */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-0 shadow-xl shadow-emerald-200/50 bg-gradient-to-br from-emerald-50 to-teal-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-2">Реферальная программа</h3>
                  <p className="text-sm text-slate-600 mb-3">
                    Приглашайте друзей и получайте бонусы за каждый завершенный займ
                  </p>
                  <div className="p-3 bg-white rounded-lg mb-3">
                    <p className="text-xs text-slate-500 mb-1">Ваш реферальный код</p>
                    <div className="flex items-center justify-between">
                      <p className="font-mono font-bold text-emerald-600">{user.id?.substring(0, 8).toUpperCase()}</p>
                      <Button size="sm" variant="outline" className="h-8">
                        Копировать
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-white rounded-lg text-center">
                      <p className="text-xs text-slate-500">Приглашено</p>
                      <p className="text-lg font-bold text-emerald-600">0</p>
                    </div>
                    <div className="p-2 bg-white rounded-lg text-center">
                      <p className="text-xs text-slate-500">Бонусы</p>
                      <p className="text-lg font-bold text-emerald-600">0 сом</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="border-0 shadow-xl shadow-slate-200/50">
            <CardHeader>
              <CardTitle className="text-lg">Информация об аккаунте</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">Дата регистрации</span>
                <span className="font-medium text-slate-900">
                  {user.created_date ? format(new Date(user.created_date), 'd MMM yyyy', { locale: ru }) : '-'}
                </span>
              </div>
              <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">Роль</span>
                <Badge variant="outline">{user.role === 'admin' ? 'Администратор' : 'Пользователь'}</Badge>
              </div>
              <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">ID аккаунта</span>
                <span className="font-mono text-xs text-slate-500">{user.id?.substring(0, 12)}...</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="w-full h-14 border-red-200 text-red-600 hover:bg-red-50 rounded-2xl"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Выйти
          </Button>
        </motion.div>
      </div>
    </div>
  );
}