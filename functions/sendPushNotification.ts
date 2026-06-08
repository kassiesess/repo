import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // This is a service function, can be called by automations
        const { userId, title, body, data } = await req.json();
        
        if (!userId || !title || !body) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }
        
        // Get user
        const users = await base44.asServiceRole.entities.User.filter({ id: userId });
        if (users.length === 0) {
            return Response.json({ error: 'User not found' }, { status: 404 });
        }
        
        const user = users[0];
        
        // Send email notification (push notifications require service worker setup)
        await base44.asServiceRole.integrations.Core.SendEmail({
            to: user.email,
            subject: `🔔 ${title}`,
            body: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
                        <h2 style="color: white; margin: 0;">🔔 ${title}</h2>
                    </div>
                    <div style="background: white; padding: 20px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <p style="font-size: 16px; color: #333;">${body}</p>
                        ${data?.action_url ? `<a href="${data.action_url}" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 10px;">Открыть</a>` : ''}
                    </div>
                    <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">Долг.кг - Ваш финансовый помощник</p>
                </div>
            `
        });
        
        return Response.json({ 
            success: true,
            message: 'Notification sent via email',
            sentAt: new Date().toISOString()
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});