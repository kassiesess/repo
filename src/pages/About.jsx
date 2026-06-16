import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Users, Zap, Award, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function About() {
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
          <h1 className="text-2xl font-bold">О приложении</h1>
          <p className="text-slate-400 mt-2">P2P Займы КР</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-4">
        {/* Version */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-0 shadow-xl shadow-slate-200/50">
            <CardContent className="p-6 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                <span className="text-3xl font-bold text-white">P2P</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">P2P Займы КР</h2>
              <p className="text-slate-500 mb-3">Версия 1.0.0</p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full text-sm text-emerald-600">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                Актуальная версия
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-xl shadow-slate-200/50">
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Возможности</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-50">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Безопасность</p>
                    <p className="text-sm text-slate-500">Верификация личности и защита данных</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50">
                    <Zap className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Быстро и просто</p>
                    <p className="text-sm text-slate-500">Создание займа за несколько минут</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-50">
                    <Award className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Юридическая сила</p>
                    <p className="text-sm text-slate-500">Документы по законодательству КР</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-50">
                    <Users className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">P2P платформа</p>
                    <p className="text-sm text-slate-500">Прямые займы между людьми</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-gradient-to-br from-emerald-50 to-teal-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-100">
                  <Heart className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Наша миссия</h3>
                  <p className="text-sm text-slate-600">
                    Мы создали P2P Займы КР, чтобы упростить процесс оформления займов между людьми 
                    и обеспечить юридическую защиту для обеих сторон. Наша цель — сделать финансовые 
                    отношения прозрачными, безопасными и удобными для всех граждан Кыргызстана.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Legal Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-xl shadow-slate-200/50">
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Правовая информация</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p>© 2024 P2P Займы КР</p>
                <p>Все права защищены</p>
                <p className="pt-3 border-t">
                  Приложение соответствует требованиям:
                </p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Гражданского кодекса КР</li>
                  <li>Налогового кодекса КР</li>
                  <li>Закона о защите персональных данных</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-xl shadow-slate-200/50">
            <CardContent className="p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Контакты</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p><strong>Email:</strong> support@p2ploans.kg</p>
                <p><strong>Телефон:</strong> +996 700 000 000</p>
                <p><strong>Адрес:</strong> г. Бишкек, Кыргызская Республика</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}