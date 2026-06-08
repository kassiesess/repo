import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Plus, Wallet, ClipboardList, MoreHorizontal, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { name: 'Home', label: 'Главная', icon: Home },
  { name: 'Services', label: 'Услуги', icon: Wallet },
  { name: 'CreateLoan', label: 'Создать', icon: Plus, special: true },
  { name: 'LoanManagement', label: 'Займы', icon: ClipboardList },
  { name: 'More', label: 'Еще', icon: MoreHorizontal }
];

// Apply theme immediately (outside component) to prevent flash
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
  document.documentElement.classList.add('light-theme');
  document.documentElement.classList.remove('dark-theme');
} else {
  document.documentElement.classList.add('dark-theme');
  document.documentElement.classList.remove('light-theme');
}

export default function Layout({ children, currentPageName }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') !== 'light';
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    setIsAuthenticated(true);
  }, []); 

  // Don't show nav on loan details page or when not authenticated
  const hideNav = currentPageName === 'LoanDetails' || !isAuthenticated;

  return (
    <div className={`min-h-screen relative overflow-x-hidden ${isDark ? 'bg-slate-950' : 'bg-slate-100'}`}>
      <div className={`fixed inset-0 -z-10 bg-gradient-to-br ${isDark ? 'from-violet-600/10 via-fuchsia-500/10 to-cyan-500/10' : 'from-violet-200/40 via-fuchsia-100/40 to-cyan-100/40'}`}></div>
      
      <style>{`
        :root {
          --color-primary: #8b5cf6;
          --color-primary-dark: #7c3aed;
        }
        
        * {
          -webkit-tap-highlight-color: transparent;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          overscroll-behavior-y: none;
        }
        
        button, a, nav {
          user-select: none;
          -webkit-user-select: none;
        }
        
        .safe-top {
          padding-top: env(safe-area-inset-top, 0);
        }
        
        .safe-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0);
        }
        
        .dark-theme .glass {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .dark-theme .glass-strong {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .light-theme .glass {
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 0, 0, 0.08);
        }
        .light-theme .glass-strong {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        /* Light theme text overrides */
        .light-theme .text-white { color: #1e1b4b !important; }
        .light-theme .text-white\\/60 { color: rgba(30,27,75,0.6) !important; }
        .light-theme .text-white\\/70 { color: rgba(30,27,75,0.7) !important; }
        .light-theme .text-white\\/90 { color: rgba(30,27,75,0.9) !important; }
        .light-theme .text-slate-300 { color: #4c1d95 !important; }
        .light-theme .text-slate-400 { color: #5b21b6 !important; }
        .light-theme .border-white\\/10 { border-color: rgba(0,0,0,0.08) !important; }
        .light-theme .border-white\\/20 { border-color: rgba(0,0,0,0.12) !important; }

        /* Page backgrounds */
        .light-theme .page-bg {
          background: linear-gradient(to bottom, #f1f5f9, #ffffff) !important;
        }
        .dark-theme .page-bg {
          background: transparent !important;
        }

        /* Page header (dark header on pages) */
        .light-theme .page-header {
          background: linear-gradient(to bottom right, #ede9fe, #ddd6fe, #e0e7ff) !important;
          color: #1e1b4b !important;
        }
        .dark-theme .page-header {
          background: linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a) !important;
          color: white !important;
        }

        /* Card backgrounds */
        .light-theme .card-surface {
          background: white !important;
          color: #1e1b4b !important;
        }
        .dark-theme .card-surface {
          background: rgba(255,255,255,0.05) !important;
          color: white !important;
        }

        .light-theme .page-header p,
        .light-theme .page-header span { color: #4c1d95 !important; }
        .dark-theme .page-header p,
        .dark-theme .page-header span { color: #94a3b8 !important; }

        /* Inner cards on pages */
        .light-theme .bg-white\\/10 { background: rgba(0,0,0,0.05) !important; }
        .light-theme .bg-white\\/20 { background: rgba(0,0,0,0.08) !important; }
        .light-theme .bg-slate-50 { background: #f8fafc !important; }
        .light-theme .text-slate-900 { color: #1e1b4b !important; }
        .light-theme .text-slate-700 { color: #312e81 !important; }
        .light-theme .text-slate-600 { color: #4c1d95 !important; }
        .light-theme .text-slate-500 { color: #6d28d9 !important; }
        .light-theme .border-t { border-color: rgba(0,0,0,0.08) !important; }
        .light-theme .border-b { border-color: rgba(0,0,0,0.08) !important; }
        

      `}</style>
      
      <main className={hideNav ? '' : 'pb-20'}>
        {children}
      </main>
      
      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 glass-strong border-t border-white/20 safe-bottom z-50">
          <div className="max-w-lg mx-auto px-2 py-2">
            <div className="flex justify-around items-center">
        {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.name;
                
                if (item.special) {
                  return (
                    <button
                      key={item.name}
                      onClick={() => navigate(createPageUrl(item.name))}
                      className="relative -mt-10"
                    >
                      <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/30 border border-white/20 active:scale-95 transition-transform">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    </button>
                  );
                }
                
                return (
                  <button
                    key={item.name}
                    onClick={() => navigate(createPageUrl(item.name))}
                    className="relative flex flex-col items-center py-2 px-4"
                  >
                    {isActive && (
                      <div className="absolute inset-0 glass-strong rounded-2xl"></div>
                    )}
                    <Icon 
                      className={`w-6 h-6 relative z-10 transition-colors ${isActive ? 'text-white' : 'text-slate-400'}`}
                    />
                    <span 
                      className={`text-xs mt-1 relative z-10 transition-all ${isActive ? 'text-white font-medium' : 'text-slate-400'}`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}