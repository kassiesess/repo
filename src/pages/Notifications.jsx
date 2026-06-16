import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell, Mail, MessageSquare, DollarSign, FileText, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

const notificationTypes = [
  {
    id: 'push_all',
    title: 'Push-уведомления',
    description: 'Показывать уведомления на устройстве',
    icon: Bell,
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  },
  {
    id: 'email_all',
    title: 'Email уведомления',
    description: 'Получать письма на почту',
    icon: Mail,
    color: 'text-purple-600',
    bg: 'bg-purple-50'
  },
  {
    id: 'loan_updates',
    title: 'Обновления займов',
    description: 'Новые займы, подписания, платежи',
    icon: DollarSign,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50'
  },
  {
    id: 'payment_reminders',
    title: 'Напоминания о платежах',
    description: 'Предстоящие и просроченные платежи',
    icon: AlertCircle,
    color: 'text-red-600',
    bg: 'bg-red-50'
  },
  {
    id: 'document_ready',
    title: 'Готовность документов',
    description: 'Договоры и исковые заявления',
    icon: FileText,
    color: 'text-amber-600',
    bg: 'bg-amber-50'
  },
  {
    id: 'messages',
    title: 'Сообщения',
    description: 'Сообщения от поддержки и пользователей',
    icon: MessageSquare,
    color: 'text-cyan-600',
    bg: 'bg-cyan-50'
  }
];

export default function Notifications() {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    push_all: true,
    email_all: true,
    loan_updates: true,
    payment_reminders: true,
    document_ready: true,
    messages: true
  });

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      // Load notification settings from user
      if (u?.notification_settings) {
        setSettings(u.notification_settings);
      }
    });
  }, []);

  const handleToggle = async (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    
    // Save to user profile
    await base44.auth.updateMe({
      notification_settings: newSettings
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-20">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-lg mx-auto px-4 py-8">
          <Link to={createPageUrl('More')}>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 -ml-2 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Настройки уведомлений</h1>
          <p className="text-slate-400 mt-2">Управление типами уведомлений</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-3">
        {notificationTypes.map((type, index) => {
          const Icon = type.icon;
          const isEnabled = settings[type.id];
          
          return (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-0 shadow-lg shadow-slate-200/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${type.bg}`}>
                      <Icon className={`w-5 h-5 ${type.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900">{type.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{type.description}</p>
                    </div>
                    <button
                      onClick={() => handleToggle(type.id)}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        isEnabled ? 'bg-emerald-500' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          isEnabled ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg shadow-slate-200/50 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">О уведомлениях</h3>
                  <p className="text-sm text-slate-600">
                    Вы можете в любой момент изменить настройки уведомлений. 
                    Некоторые критически важные уведомления (например, о безопасности) 
                    будут отправляться независимо от настроек.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}