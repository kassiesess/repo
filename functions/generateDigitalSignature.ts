import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const { documentId, documentType, signatureData } = await req.json();
        
        if (!documentId || !documentType || !signatureData) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }
        
        // Generate signature hash
        const timestamp = new Date().toISOString();
        const signatureText = `${user.full_name}|${user.email}|${documentId}|${timestamp}`;
        
        // Simple hash function (в production использовать crypto.subtle.digest)
        const encoder = new TextEncoder();
        const data = encoder.encode(signatureText);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        const signature = {
            signatureHash: hashHex,
            signerId: user.id,
            signerName: user.full_name,
            signerEmail: user.email,
            documentId,
            documentType,
            signatureImageData: signatureData, // Base64 canvas image
            timestamp,
            ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
            userAgent: req.headers.get('user-agent') || 'unknown'
        };
        
        // Send confirmation email
        await base44.integrations.Core.SendEmail({
            to: user.email,
            subject: '✍️ Документ подписан',
            body: `
                <h2>Здравствуйте, ${user.full_name}!</h2>
                <p>Вы успешно подписали документ электронной подписью.</p>
                <p><strong>Тип документа:</strong> ${documentType}</p>
                <p><strong>ID документа:</strong> ${documentId}</p>
                <p><strong>Время подписания:</strong> ${new Date(timestamp).toLocaleString('ru-RU')}</p>
                <p><strong>Хеш подписи:</strong> ${hashHex.substring(0, 16)}...</p>
                <p><em>Примечание: Это упрощенная электронная подпись. Для юридической силы требуется интеграция с сертифицированным провайдером ЭЦП.</em></p>
                <p>С уважением,<br/>Команда Долг.кг</p>
            `
        });
        
        return Response.json({
            success: true,
            signature
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});