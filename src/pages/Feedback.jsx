import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, MessageSquare, Send, Loader2, CheckCircle2, Bug, Lightbulb, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function Feedback() {
  const [formData, setFormData] = useState({
    type: '',
    subject: '',
    message: '',
    rating: 5
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSubmitted(true);
    setLoading(false);
    
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ type: '', subject: '', message: '', rating: 5 });
    }, 3000);
  };

  const feedbackTypes = [
    { value: 'bug', label: 'Сообщить об ошибке', icon: Bug, color: 'text-red-600' },
    { value: 'suggestion', label: 'Предложение', icon: Lightbulb, color: 'text-amber-600' },
    { value: 'feedback', label: 'Общий отзыв', icon: MessageSquare, color: 'text-blue-600' }
  ];

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
          <h1 className="text-2xl font-bold">Обратная связь</h1>
          <p className="text-slate-400 mt-2">Помогите нам стать лучше</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-0 shadow-xl shadow-slate-200/50">
            <CardHeader>
              <CardTitle>Отправить отзыв</CardTitle>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="font-medium text-slate-900">Спасибо за отзыв!</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Мы ценим ваше мнение и постараемся учесть ваши пожелания
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Тип обращения</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger className="mt-1.5 h-12">
                        <SelectValue placeholder="Выберите тип" />
                      </SelectTrigger>
                      <SelectContent>
                        {feedbackTypes.map(type => {
                          const Icon = type.icon;
                          return (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <Icon className={`w-4 h-4 ${type.color}`} />
                                <span>{type.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Тема</Label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Краткое описание"
                      className="mt-1.5 h-12"
                      required
                    />
                  </div>

                  <div>
                    <Label>Сообщение</Label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Опишите подробнее..."
                      className="mt-1.5 h-32"
                      required
                    />
                  </div>

                  <div>
                    <Label className="flex items-center justify-between">
                      <span>Оцените приложение</span>
                      <span className="text-amber-600 font-bold">{formData.rating}/5</span>
                    </Label>
                    <div className="flex gap-2 mt-2">
                      {[1, 2, 3, 4, 5].map(rating => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, rating }))}
                          className={`flex-1 h-12 rounded-xl transition-colors ${
                            rating <= formData.rating
                              ? 'bg-amber-100 border-2 border-amber-500'
                              : 'bg-slate-50 border-2 border-slate-200'
                          }`}
                        >
                          <Star className={`w-6 h-6 mx-auto ${
                            rating <= formData.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                          }`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700"
                    disabled={loading || !formData.type}
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Отправить
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4"
        >
          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Важно для нас</h3>
                  <p className="text-sm text-slate-600">
                    Ваши отзывы помогают нам улучшать приложение. Мы читаем все сообщения 
                    и стараемся учитывать пожелания пользователей в обновлениях.
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