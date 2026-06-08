import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: 'Как создать займ?',
    answer: 'Перейдите на вкладку "Создать", заполните параметры займа (сумма, ставка, срок) и укажите email заемщика. Система автоматически сгенерирует договор.'
  },
  {
    question: 'Является ли договор юридически действительным?',
    answer: 'Да, договоры составлены в соответствии с законодательством Кыргызской Республики и имеют юридическую силу. Обе стороны должны подписать договор.'
  },
  {
    question: 'Что такое налог на доход?',
    answer: 'Согласно законодательству КР, с процентов по займу взимается налог 10%. Он автоматически рассчитывается и указывается в договоре. Налог уплачивает займодавец.'
  },
  {
    question: 'Как подписать договор?',
    answer: 'После создания займа, обе стороны должны открыть детали займа и нажать кнопку "Подписать договор". Займ станет активным после подписания обеими сторонами.'
  },
  {
    question: 'Можно ли создать беспроцентный займ?',
    answer: 'Да, при создании займа можно установить процентную ставку 0%. В этом случае заемщик возвращает только сумму займа без процентов.'
  },
  {
    question: 'Что делать при просрочке платежа?',
    answer: 'При просрочке платежа система позволяет сгенерировать исковое заявление в суд одним кликом. Документ содержит все необходимые расчеты и готов к подаче.'
  },
  {
    question: 'Как происходит верификация?',
    answer: 'Для верификации нужно загрузить фото паспорта КР и сделать селфи. Верификация необходима для защиты обеих сторон и юридической силы договоров.'
  },
  {
    question: 'Могу ли я досрочно погасить займ?',
    answer: 'Да, заемщик может внести любую сумму в счет погашения займа. При досрочном погашении проценты начисляются только за фактический период пользования.'
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

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
          <h1 className="text-2xl font-bold">Часто задаваемые вопросы</h1>
          <p className="text-slate-400 mt-2">Ответы на популярные вопросы</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 space-y-3">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="border-0 shadow-lg shadow-slate-200/50 overflow-hidden">
              <CardContent className="p-0">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-start justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-medium text-slate-900 pr-4">{faq.question}</span>
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                  )}
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-4 pb-4 text-sm text-slate-600 border-t border-slate-100 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}