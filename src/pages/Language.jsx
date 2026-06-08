import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Globe, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

const languages = [
  { code: 'ky', name: 'Кыргызча', nativeName: 'Кыргызча', flag: '🇰🇬' },
  { code: 'ru', name: 'Русский', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' }
];

export default function Language() {
  const [user, setUser] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('ru');

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setSelectedLanguage(u?.language || 'ru');
    });
  }, []);

  const handleSelectLanguage = async (code) => {
    setSelectedLanguage(code);
    await base44.auth.updateMe({ language: code });
    
    // In a real app, this would trigger a language change
    // For now, just show a message
    alert(`Язык изменен на: ${languages.find(l => l.code === code)?.name}`);
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
          <h1 className="text-2xl font-bold">Язык</h1>
          <p className="text-slate-400 mt-2">Выберите язык интерфейса</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-3">
        {languages.map((language, index) => {
          const isSelected = selectedLanguage === language.code;
          
          return (
            <motion.div
              key={language.code}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`border-0 shadow-lg shadow-slate-200/50 cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-emerald-500' : ''
                }`}
                onClick={() => handleSelectLanguage(language.code)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{language.flag}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{language.nativeName}</h3>
                      <p className="text-sm text-slate-500">{language.name}</p>
                    </div>
                    {isSelected && (
                      <div className="p-2 rounded-full bg-emerald-100">
                        <Check className="w-5 h-5 text-emerald-600" />
                      </div>
                    )}
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
                <Globe className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Языки приложения</h3>
                  <p className="text-sm text-slate-600 mb-2">
                    Выбранный язык будет использоваться во всем приложении, 
                    включая меню, кнопки и уведомления.
                  </p>
                  <p className="text-sm text-slate-600">
                    <strong>Примечание:</strong> Официальные документы (договоры и исковые заявления) 
                    всегда генерируются на русском языке в соответствии с законодательством КР.
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