import React from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
// Card import removed - using glass style directly
import { 
  HelpCircle,
  FileText,
  MessageCircle,
  LogOut,
  ChevronRight,
  User,
  Shield,
  Info,
  Settings,
  Bell
} from 'lucide-react';

const menuSections = [
  {
    title: 'Аккаунт',
    items: [
      { icon: User, label: 'Профиль', page: 'Profile' },
      { icon: Settings, label: 'Настройки', page: 'Settings' },
      { icon: Bell, label: 'Уведомления', page: 'Notifications' }
    ]
  },
  {
    title: 'Информация',
    items: [
      { icon: FileText, label: 'Условия использования', page: 'Terms' },
      { icon: Shield, label: 'Политика конфиденциальности', page: 'Privacy' },
      { icon: Info, label: 'О приложении', page: 'About' }
    ]
  },
  {
    title: 'Помощь',
    items: [
      { icon: MessageCircle, label: 'Поддержка', page: 'Support' },
      { icon: HelpCircle, label: 'FAQ', page: 'FAQ' }
    ]
  }
];

export default function More() {
  const handleLogout = async () => {
    await base44.auth.logout();
    window.location.href = '/#/Welcome';
  };

  return (
    <div className="min-h-screen page-bg pb-20">
      <div className="page-header">
        <div className="max-w-lg mx-auto px-4 pt-8 pb-12">
          <h1 className="text-2xl font-bold">Еще</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-4">
        {menuSections.map((section) => (
          <div key={section.title}>
            <h2 className="text-xs font-semibold uppercase tracking-wide mb-2 px-2" style={{color: 'inherit', opacity: 0.6}}>
              {section.title}
            </h2>
            <div className="glass-strong rounded-2xl border border-white/10 overflow-hidden">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      to={createPageUrl(item.page)}
                      className="flex items-center gap-3 p-4 hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0"
                    >
                      <Icon className="w-5 h-5 text-white/70" />
                      <span className="flex-1 text-white">{item.label}</span>
                      <ChevronRight className="w-4 h-4 text-white/40" />
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}

        <div
          onClick={handleLogout}
          className="glass-strong rounded-2xl border border-red-500/30 cursor-pointer hover:bg-red-500/10 transition-all overflow-hidden"
        >
          <div className="flex items-center gap-3 p-4">
            <LogOut className="w-5 h-5 text-red-400" />
            <span className="flex-1 font-semibold text-red-400">Выйти</span>
          </div>
        </div>

        <div className="text-center text-xs text-white/30 py-4">
          <p>© 2026 Долг.кг</p>
        </div>
      </div>
    </div>
  );
}