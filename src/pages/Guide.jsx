import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, ChevronLeft, Play, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';

const guides = [
  {
    title: 'Регистрация и верификация',
    steps: [
      {
        title: 'Создайте аккаунт',
        description: 'Зарегистрируйтесь используя email и пароль',
        image: '📧'
      },
      {
        title: 'Загрузите фото паспорта',
        description: 'Сфотографируйте главную страницу паспорта КР',
        image: '📄'
      },
      {
        title: 'Сделайте селфи',
        description: 'Сделайте фото лица для подтверждения личности',
        image: '🤳'
      },
      {
        title: 'Заполните данные',
        description: 'Введите данные из паспорта: серия, номер, ИНН',
        image: '✍️'
      }
    ]
  },
  {
    title: 'Создание займа',
    steps: [
      {
        title: 'Нажмите "Создать займ"',
        description: 'Перейдите на вкладку создания займа',
        image: '➕'
      },
      {
        title: 'Укажите параметры',
        description: 'Выберите сумму, процентную ставку и срок займа',
        image: '💰'
      },
      {
        title: 'Введите email заемщика',
        description: 'Укажите адрес электронной почты человека, который возьмет займ',
        image: '📨'
      },
      {
        title: 'Проверьте договор',
        description: 'Система автоматически сгенерирует договор - проверьте все данные',
        image: '📋'
      },
      {
        title: 'Создайте займ',
        description: 'Подтвердите создание - заемщик получит уведомление',
        image: '✅'
      }
    ]
  },
  {
    title: 'Подписание договора',
    steps: [
      {
        title: 'Откройте детали займа',
        description: 'Нажмите на займ в списке',
        image: '👆'
      },
      {
        title: 'Просмотрите договор',
        description: 'Изучите все условия договора',
        image: '👀'
      },
      {
        title: 'Нажмите "Подписать"',
        description: 'Обе стороны должны подписать договор',
        image: '✍️'
      },
      {
        title: 'Займ активирован',
        description: 'После подписания обеими сторонами займ становится активным',
        image: '🎉'
      }
    ]
  },
  {
    title: 'Внесение платежей',
    steps: [
      {
        title: 'Откройте активный займ',
        description: 'Перейдите в детали займа, который нужно погасить',
        image: '📱'
      },
      {
        title: 'Нажмите "Внести платеж"',
        description: 'Откроется форма для внесения платежа',
        image: '💳'
      },
      {
        title: 'Укажите сумму',
        description: 'Введите сумму платежа (можно частично или полностью)',
        image: '💵'
      },
      {
        title: 'Подтвердите платеж',
        description: 'Платеж будет зафиксирован в системе',
        image: '✅'
      }
    ]
  },
  {
    title: 'Действия при просрочке',
    steps: [
      {
        title: 'Проверьте статус займа',
        description: 'Займ автоматически станет просроченным',
        image: '⚠️'
      },
      {
        title: 'Попробуйте договориться',
        description: 'Свяжитесь с другой стороной для урегулирования',
        image: '📞'
      },
      {
        title: 'Сформируйте исковое заявление',
        description: 'Нажмите кнопку "Сформировать исковое заявление"',
        image: '⚖️'
      },
      {
        title: 'Распечатайте документ',
        description: 'Документ готов к подаче в суд',
        image: '🖨️'
      }
    ]
  }
];

export default function Guide() {
  const [activeGuide, setActiveGuide] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  const currentGuide = guides[activeGuide];
  const currentStep = currentGuide.steps[activeStep];
  const isLastStep = activeStep === currentGuide.steps.length - 1;
  const isLastGuide = activeGuide === guides.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      if (!isLastGuide) {
        setActiveGuide(activeGuide + 1);
        setActiveStep(0);
      }
    } else {
      setActiveStep(activeStep + 1);
    }
  };

  const handlePrev = () => {
    if (activeStep === 0) {
      if (activeGuide > 0) {
        setActiveGuide(activeGuide - 1);
        setActiveStep(guides[activeGuide - 1].steps.length - 1);
      }
    } else {
      setActiveStep(activeStep - 1);
    }
  };

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
          <h1 className="text-2xl font-bold">Руководство пользователя</h1>
          <p className="text-slate-400 mt-2">Пошаговые инструкции</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4">
        {/* Guide Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {guides.map((guide, index) => (
              <button
                key={index}
                onClick={() => {
                  setActiveGuide(index);
                  setActiveStep(0);
                }}
                className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-colors ${
                  activeGuide === index
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'bg-white text-slate-600 shadow-md'
                }`}
              >
                {guide.title}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeGuide}-${activeStep}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-xl shadow-slate-200/50">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">{currentStep.image}</div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">{currentStep.title}</h2>
                  <p className="text-slate-600">{currentStep.description}</p>
                </div>

                {/* Progress Dots */}
                <div className="flex justify-center gap-2 mb-6">
                  {currentGuide.steps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveStep(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === activeStep
                          ? 'w-8 bg-emerald-600'
                          : index < activeStep
                          ? 'w-2 bg-emerald-400'
                          : 'w-2 bg-slate-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handlePrev}
                    disabled={activeGuide === 0 && activeStep === 0}
                    className="flex-1"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Назад
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={isLastGuide && isLastStep}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isLastStep ? (isLastGuide ? 'Завершено' : 'Следующий раздел') : 'Далее'}
                    {!isLastStep && <ChevronRight className="w-4 h-4 ml-2" />}
                    {isLastStep && !isLastGuide && <ChevronRight className="w-4 h-4 ml-2" />}
                    {isLastGuide && isLastStep && <CheckCircle2 className="w-4 h-4 ml-2" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* All Steps Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <Card className="border-0 shadow-xl shadow-slate-200/50">
            <CardContent className="p-5">
              <h3 className="font-semibold text-slate-900 mb-4">Все шаги</h3>
              <div className="space-y-2">
                {currentGuide.steps.map((step, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveStep(index)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                      index === activeStep
                        ? 'bg-emerald-50 border border-emerald-200'
                        : 'bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-2xl">{step.image}</div>
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${index === activeStep ? 'text-emerald-900' : 'text-slate-900'}`}>
                        {step.title}
                      </p>
                    </div>
                    {index < activeStep && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}