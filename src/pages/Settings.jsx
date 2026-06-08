import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Lock, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setFormData({
        full_name: u?.full_name || '',
        phone: u?.phone || '',
        email: u?.email || ''
      });
    });
  }, []);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await base44.auth.updateMe({
        phone: formData.phone
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Update failed:', error);
    }
    setLoading(false);
  };

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      alert('Пароли не совпадают');
      return;
    }
    if (passwordData.new.length < 6) {
      alert('Пароль должен быть не менее 6 символов');
      return;
    }
    
    setLoading(true);
    // Simulate password change
    await new Promise(resolve => setTimeout(resolve, 1000));
    setPasswordData({ current: '', new: '', confirm: '' });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold">Настройки</h1>
          <p className="text-slate-400 mt-2">Управление аккаунтом</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-4">
        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-0 shadow-xl shadow-slate-200/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Профиль</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-600 text-sm">Полное имя</Label>
                <Input
                  value={formData.full_name}
                  disabled
                  className="mt-1.5 h-12 bg-slate-50"
                />
                <p className="text-xs text-slate-400 mt-1">Имя из паспорта нельзя изменить</p>
              </div>
              <div>
                <Label className="text-slate-600 text-sm">Email</Label>
                <Input
                  value={formData.email}
                  disabled
                  className="mt-1.5 h-12 bg-slate-50"
                />
                <p className="text-xs text-slate-400 mt-1">Email нельзя изменить</p>
              </div>
              <div>
                <Label className="text-slate-600 text-sm">Телефон</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+996 ..."
                  className="mt-1.5 h-12"
                />
              </div>
              <Button 
                onClick={handleSaveProfile}
                disabled={loading || saved}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : saved ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Сохранено
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Сохранить изменения
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Password Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-xl shadow-slate-200/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-50">
                  <Lock className="w-5 h-5 text-red-600" />
                </div>
                <CardTitle className="text-lg">Изменить пароль</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-slate-600 text-sm">Текущий пароль</Label>
                <Input
                  type="password"
                  value={passwordData.current}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                  placeholder="••••••••"
                  className="mt-1.5 h-12"
                />
              </div>
              <div>
                <Label className="text-slate-600 text-sm">Новый пароль</Label>
                <Input
                  type="password"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                  placeholder="••••••••"
                  className="mt-1.5 h-12"
                />
              </div>
              <div>
                <Label className="text-slate-600 text-sm">Подтвердите пароль</Label>
                <Input
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                  placeholder="••••••••"
                  className="mt-1.5 h-12"
                />
              </div>
              <Button 
                onClick={handleChangePassword}
                disabled={loading || !passwordData.current || !passwordData.new || !passwordData.confirm}
                className="w-full h-12 bg-red-600 hover:bg-red-700"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Изменить пароль'
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Delete Account */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-xl shadow-slate-200/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-50">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <CardTitle className="text-lg">Опасная зона</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Удаление аккаунта необратимо. Все ваши данные будут удалены.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full h-12 border-red-200 text-red-600 hover:bg-red-50">
                    Удалить аккаунт
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Удалить аккаунт?</DialogTitle>
                  </DialogHeader>
                  <p className="text-slate-600 mb-6">
                    Это действие нельзя отменить. Все ваши данные, займы и история будут удалены навсегда.
                  </p>
                  <div className="flex gap-3">
                    <DialogClose asChild>
                      <Button variant="outline" className="flex-1">
                        Отмена
                      </Button>
                    </DialogClose>
                    <Button 
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      onClick={async () => {
                        await base44.auth.logout();
                        window.location.href = '/';
                      }}
                    >
                      Да, удалить
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}