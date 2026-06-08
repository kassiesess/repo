import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Book, ExternalLink, Scale, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function Legal() {
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
          <h1 className="text-2xl font-bold">Законодательство КР</h1>
          <p className="text-slate-400 mt-2">Правовая основа займов</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-4">
        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-0 shadow-xl shadow-slate-200/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-purple-50">
                  <Scale className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Краткое описание</h2>
              </div>
              
              <div className="space-y-4 text-sm text-slate-600">
                <p>
                  Договоры займа между физическими лицами в Кыргызской Республике регулируются 
                  Гражданским кодексом КР (статьи 367-371).
                </p>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Основные положения:</h3>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-1">•</span>
                      <span>Договор займа считается заключенным с момента передачи денег</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-1">•</span>
                      <span>Займодавец имеет право на получение процентов, если иное не предусмотрено договором</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-1">•</span>
                      <span>Заемщик обязан возвратить займ в срок и в порядке, предусмотренным договором</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-1">•</span>
                      <span>При просрочке возврата займодавец вправе требовать уплаты процентов и пени</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Налогообложение:</h3>
                  <p>
                    Согласно Налоговому кодексу КР, доход в виде процентов по договору займа 
                    облагается подоходным налогом по ставке <strong>10%</strong>. Налог уплачивается 
                    займодавцем самостоятельно.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Ответственность за неисполнение:</h3>
                  <ul className="space-y-2 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-1">•</span>
                      <span>Пеня за просрочку (обычно 0,1% в день)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-1">•</span>
                      <span>Взыскание задолженности через суд</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-600 mt-1">•</span>
                      <span>Принудительное исполнение решения суда</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Laws Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-xl shadow-slate-200/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-blue-50">
                  <Book className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Нормативные акты</h2>
              </div>

              <div className="space-y-3">
                <a 
                  href="http://cbd.minjust.gov.kg/act/view/ru-ru/1015" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="font-medium text-slate-900">Гражданский кодекс КР</p>
                      <p className="text-xs text-slate-500">Статьи 367-371</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </a>

                <a 
                  href="http://cbd.minjust.gov.kg/act/view/ru-ru/202445" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="font-medium text-slate-900">Налоговый кодекс КР</p>
                      <p className="text-xs text-slate-500">О подоходном налоге</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </a>

                <a 
                  href="http://cbd.minjust.gov.kg/act/view/ru-ru/111530" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="font-medium text-slate-900">Гражданский процессуальный кодекс КР</p>
                      <p className="text-xs text-slate-500">О взыскании долгов</p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Warning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <Scale className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Важно знать</h3>
                  <p className="text-sm text-slate-600 mb-2">
                    Приложение генерирует документы в соответствии с действующим законодательством КР. 
                    Однако рекомендуем проконсультироваться с юристом перед заключением крупных займов.
                  </p>
                  <p className="text-sm text-slate-600">
                    Все договоры и исковые заявления имеют юридическую силу и могут быть использованы 
                    в судебных разбирательствах.
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