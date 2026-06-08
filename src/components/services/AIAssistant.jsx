import { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Bot, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const SESSION_KEY = 'ai_chat_session_id';

function getOrCreateSessionId() {
  let sid = localStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = 'session_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    localStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

export default function AIAssistant({ onBack }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Здравствуйте! Я AI помощник платформы ZaymKG 🤖\n\nМогу помочь вам с:\n\n• 💰 Займами и расчётами\n• ⚖️ Юридическими вопросами\n• 🏦 Банковскими платежами\n• ❓ Любыми другими вопросами\n\nЗадайте ваш вопрос!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => getOrCreateSessionId());
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Загрузка истории при старте
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await base44.functions.invoke('getChatHistory', { session_id: sessionId });
        if (res.data?.messages?.length > 0) {
          const loaded = res.data.messages.map(m => ({ role: m.role, content: m.content }));
          setMessages([messages[0], ...loaded]);
        }
      } catch (e) {
        // нет истории - нормально
      }
    };
    loadHistory();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    const history = newMessages.slice(-12);

    try {
      const res = await base44.functions.invoke('aiChat', {
        message: userMessage,
        session_id: sessionId,
        history
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data?.reply || 'Нет ответа от сервера.'
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Произошла ошибка. Попробуйте ещё раз.'
      }]);
    }

    setLoading(false);
  };

  const handleClear = () => {
    const newSid = 'session_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    localStorage.setItem(SESSION_KEY, newSid);
    setMessages([{
      role: 'assistant',
      content: 'Чат очищен. Чем могу помочь? 😊'
    }]);
  };

  const quickQuestions = [
    'Как рассчитать проценты по займу?',
    'Какие документы нужны для займа?',
    'Что делать при просрочке платежа?',
    'Максимальная процентная ставка в КР?'
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 via-fuchsia-600 to-indigo-600 text-white">
        <div className="max-w-lg mx-auto px-4 py-5 safe-top">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-white hover:bg-white/10 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-white/70 hover:bg-white/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-white/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AI Помощник</h1>
              <p className="text-violet-200 text-xs">История сохраняется автоматически</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-4 overflow-y-auto pb-32">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex mb-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white rounded-tr-sm'
                  : 'glass text-white rounded-tl-sm'
              }`}>
                {message.role === 'user' ? (
                  <p>{message.content}</p>
                ) : (
                  <ReactMarkdown
                    className="prose prose-sm max-w-none prose-invert"
                    components={{
                      p: ({ children }) => <p className="text-slate-200 leading-relaxed my-1">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc ml-4 text-slate-200">{children}</ul>,
                      li: ({ children }) => <li className="my-0.5">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mr-2 flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
              <span className="text-sm text-slate-400">Думаю...</span>
            </div>
          </motion.div>
        )}

        {messages.length === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2 mt-4"
          >
            <p className="text-sm text-slate-500 text-center mb-3">Быстрые вопросы:</p>
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => {
                  setInput(question);
                  setTimeout(() => handleSend(), 100);
                }}
                className="w-full text-left p-3 glass rounded-xl hover:bg-white/10 transition-all text-sm text-slate-300 border border-white/10"
              >
                {question}
              </button>
            ))}
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 glass-strong border-t border-white/10 p-4 safe-bottom z-50">
        <div className="max-w-lg mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
            placeholder="Напишите вопрос..."
            disabled={loading}
            className="flex-1 h-12 bg-white/5 border-white/20 text-white placeholder:text-slate-500"
            autoFocus
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="h-12 w-12 p-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 disabled:opacity-40 rounded-xl"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}