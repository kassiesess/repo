import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, session_id, history } = await req.json();

    if (!message || !session_id) {
      return Response.json({ error: 'message and session_id are required' }, { status: 400 });
    }

    // Сохраняем сообщение пользователя
    await base44.asServiceRole.entities.ChatMessage.create({
      user_id: user.id,
      session_id,
      role: 'user',
      content: message
    });

    // Формируем контекст из истории
    const historyContext = (history || [])
      .slice(-10)
      .map(m => `${m.role === 'user' ? 'Пользователь' : 'Ассистент'}: ${m.content}`)
      .join('\n');

    const prompt = `Ты умный AI помощник платформы P2P займов "ZaymKG" в Кыргызстане.

Информация о платформе:
- P2P займы между физическими лицами
- Максимальная процентная ставка: 36% годовых (по законодательству КР)
- Налог на доход от процентов: 10%
- Банки КР: Optima Bank, MBank, Деmir Bank, RSK Bank, KICB
- Договора займа имеют юридическую силу
- Верификация через паспорт обязательна

Предыдущий контекст разговора:
${historyContext}

Текущий вопрос пользователя: ${message}

Отвечай подробно, дружелюбно, на русском языке. Используй эмодзи где уместно.`;

    const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true
    });

    // Сохраняем ответ ассистента
    await base44.asServiceRole.entities.ChatMessage.create({
      user_id: user.id,
      session_id,
      role: 'assistant',
      content: response
    });

    return Response.json({ reply: response });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});