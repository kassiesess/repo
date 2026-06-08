import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { session_id } = await req.json();

    const messages = await base44.asServiceRole.entities.ChatMessage.filter({
      user_id: user.id,
      ...(session_id ? { session_id } : {})
    }, 'created_date', 100);

    return Response.json({ messages });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});