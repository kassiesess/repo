import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function Terms() {
  const [accepted, setAccepted] = useState(false);

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
          <h1 className="text-2xl font-bold">Условия использования</h1>
          <p className="text-slate-400 mt-2">Правила работы с приложением</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-0 shadow-xl shadow-slate-200/50">
            <CardContent className="p-6">
              <div className="prose prose-sm max-w-none text-slate-600 space-y-4 max-h-[60vh] overflow-y-auto">
                <h2 className="text-lg font-bold text-slate-900">1. Общие положения</h2>
                <p>
                  Настоящие Условия использования (далее — «Условия») регулируют порядок использования 
                  мобильного приложения P2P Займы КР (далее — «Приложение»). Используя Приложение, 
                  вы соглашаетесь с настоящими Условиями.
                </p>

                <h2 className="text-lg font-bold text-slate-900">2. Описание услуг</h2>
                <p>
                  Приложение предоставляет платформу для оформления договоров займа между физическими лицами 
                  (peer-to-peer lending). Приложение автоматически генерирует юридически действительные 
                  документы в соответствии с законодательством Кыргызской Республики.
                </p>

                <h2 className="text-lg font-bold text-slate-900">3. Регистрация и верификация</h2>
                <p>
                  Для использования Приложения необходимо пройти процедуру регистрации и верификации личности. 
                  Верификация включает загрузку фотографии паспорта гражданина КР и селфи. 
                  Пользователь обязуется предоставлять актуальные и достоверные данные.
                </p>

                <h2 className="text-lg font-bold text-slate-900">4. Создание договоров займа</h2>
                <p>
                  Приложение позволяет создавать официальные договоры займа между пользователями. 
                  Договор вступает в силу после подписания обеими сторонами. Приложение не является 
                  стороной договора и не несет ответственности за исполнение обязательств по договору.
                </p>

                <h2 className="text-lg font-bold text-slate-900">5. Ответственность пользователей</h2>
                <p>
                  Пользователи несут полную ответственность за:
                </p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Достоверность предоставленных данных</li>
                  <li>Исполнение обязательств по заключенным договорам займа</li>
                  <li>Своевременность платежей</li>
                  <li>Соблюдение законодательства КР</li>
                </ul>

                <h2 className="text-lg font-bold text-slate-900">6. Налогообложение</h2>
                <p>
                  Согласно законодательству КР, доход в виде процентов по договору займа облагается налогом 
                  в размере 10%. Займодавец обязуется самостоятельно уплачивать налоги. Приложение 
                  автоматически рассчитывает сумму налога в договоре.
                </p>

                <h2 className="text-lg font-bold text-slate-900">7. Конфиденциальность</h2>
                <p>
                  Приложение обеспечивает защиту персональных данных пользователей в соответствии 
                  с Политикой конфиденциальности. Данные паспорта и селфи хранятся в зашифрованном виде 
                  и используются только для верификации.
                </p>

                <h2 className="text-lg font-bold text-slate-900">8. Судебные документы</h2>
                <p>
                  В случае невыполнения обязательств по договору займа, Приложение предоставляет возможность 
                  автоматической генерации исковых заявлений для подачи в суд. Документы составляются 
                  в соответствии с требованиями ГПК КР.
                </p>

                <h2 className="text-lg font-bold text-slate-900">9. Изменения условий</h2>
                <p>
                  Администрация Приложения оставляет за собой право изменять настоящие Условия. 
                  Пользователи будут уведомлены об изменениях через Приложение.
                </p>

                <h2 className="text-lg font-bold text-slate-900">10. Контакты</h2>
                <p>
                  По всем вопросам обращайтесь в службу поддержки:
                  <br />Email: support@p2ploans.kg
                  <br />Телефон: +996 700 000 000
                </p>
              </div>

              <div className="mt-6 pt-6 border-t">
                <Button
                  onClick={() => setAccepted(!accepted)}
                  className={`w-full h-12 ${accepted ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-600 hover:bg-slate-700'}`}
                >
                  {accepted ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Условия приняты
                    </>
                  ) : (
                    'Принять условия'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}