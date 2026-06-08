import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function Privacy() {
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
          <h1 className="text-2xl font-bold">Политика конфиденциальности</h1>
          <p className="text-slate-400 mt-2">Защита ваших данных</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-0 shadow-xl shadow-slate-200/50">
            <CardContent className="p-6">
              <div className="prose prose-sm max-w-none text-slate-600 space-y-4 max-h-[70vh] overflow-y-auto">
                <h2 className="text-lg font-bold text-slate-900">1. Введение</h2>
                <p>
                  Настоящая Политика конфиденциальности описывает, как приложение P2P Займы КР 
                  собирает, использует и защищает вашу персональную информацию.
                </p>

                <h2 className="text-lg font-bold text-slate-900">2. Собираемые данные</h2>
                <p>Мы собираем следующие категории данных:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li><strong>Личные данные:</strong> ФИО, дата рождения, паспортные данные, ИНН</li>
                  <li><strong>Контактные данные:</strong> email, номер телефона, адрес регистрации</li>
                  <li><strong>Биометрические данные:</strong> фотография паспорта, селфи</li>
                  <li><strong>Финансовые данные:</strong> информация о займах, платежах</li>
                  <li><strong>Технические данные:</strong> IP-адрес, данные устройства, логи активности</li>
                </ul>

                <h2 className="text-lg font-bold text-slate-900">3. Цели использования данных</h2>
                <p>Ваши данные используются для:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Верификации личности пользователей</li>
                  <li>Создания и управления договорами займа</li>
                  <li>Генерации юридических документов</li>
                  <li>Обеспечения безопасности и предотвращения мошенничества</li>
                  <li>Связи с пользователями по вопросам займов</li>
                  <li>Улучшения работы приложения</li>
                </ul>

                <h2 className="text-lg font-bold text-slate-900">4. Защита данных</h2>
                <p>
                  Мы применяем современные меры безопасности для защиты ваших данных:
                </p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Шифрование данных при передаче (SSL/TLS)</li>
                  <li>Шифрование данных при хранении (AES-256)</li>
                  <li>Многофакторная аутентификация</li>
                  <li>Регулярный аудит безопасности</li>
                  <li>Ограниченный доступ к персональным данным</li>
                  <li>Резервное копирование данных</li>
                </ul>

                <h2 className="text-lg font-bold text-slate-900">5. Передача данных третьим лицам</h2>
                <p>
                  Мы не продаем и не передаем ваши персональные данные третьим лицам, за исключением:
                </p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Передачи данных другой стороне по договору займа (только необходимые данные)</li>
                  <li>Выполнения требований законодательства (по запросу суда, правоохранительных органов)</li>
                  <li>Защиты наших прав и безопасности пользователей</li>
                </ul>

                <h2 className="text-lg font-bold text-slate-900">6. Хранение данных</h2>
                <p>
                  Ваши данные хранятся на защищенных серверах в течение:
                </p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Активные договоры займа: до полного погашения + 3 года</li>
                  <li>Завершенные договоры: 5 лет (требование законодательства КР)</li>
                  <li>Данные верификации: весь период использования аккаунта + 1 год</li>
                  <li>Технические логи: 6 месяцев</li>
                </ul>

                <h2 className="text-lg font-bold text-slate-900">7. Ваши права</h2>
                <p>Вы имеете право:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Получить доступ к своим персональным данным</li>
                  <li>Исправить неточные данные</li>
                  <li>Удалить свои данные (при отсутствии активных обязательств)</li>
                  <li>Ограничить обработку данных</li>
                  <li>Получить копию данных в структурированном формате</li>
                  <li>Отозвать согласие на обработку данных</li>
                </ul>

                <h2 className="text-lg font-bold text-slate-900">8. Cookies и аналитика</h2>
                <p>
                  Приложение использует cookies и аналитические инструменты для улучшения 
                  пользовательского опыта. Вы можете управлять настройками cookies в браузере.
                </p>

                <h2 className="text-lg font-bold text-slate-900">9. Изменения политики</h2>
                <p>
                  Мы можем обновлять Политику конфиденциальности. О существенных изменениях 
                  вы будете уведомлены через приложение или email.
                </p>

                <h2 className="text-lg font-bold text-slate-900">10. Контакты</h2>
                <p>
                  По вопросам конфиденциальности:
                  <br />Email: privacy@p2ploans.kg
                  <br />Телефон: +996 700 000 000
                </p>
              </div>

              <div className="mt-6 pt-6 border-t bg-blue-50 -mx-6 -mb-6 p-6 rounded-b-xl">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Ваши данные защищены</h3>
                    <p className="text-sm text-slate-600">
                      Мы используем банковский уровень шифрования для защиты ваших персональных данных
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}