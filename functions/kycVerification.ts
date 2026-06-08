import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const { passportFrontUrl, passportBackUrl, selfieUrl } = await req.json();
        
        if (!passportFrontUrl || !selfieUrl) {
            return Response.json({ error: 'Passport and selfie images required' }, { status: 400 });
        }
        
        // Use AI to verify KYC documents
        const passportVerification = await base44.integrations.Core.InvokeLLM({
            prompt: `Проверь этот паспорт Кыргызской Республики и извлеки данные:
            1. ФИО держателя
            2. Номер паспорта
            3. Дата рождения
            4. Дата выдачи
            5. Срок действия
            6. Место выдачи
            7. Проверь на признаки подделки
            
            Верни JSON с полями:
            - valid: boolean
            - confidence: number (0-100)
            - data: object с извлеченными данными
            - issues: array of strings (если есть проблемы)`,
            file_urls: [passportFrontUrl, passportBackUrl].filter(Boolean),
            response_json_schema: {
                type: "object",
                properties: {
                    valid: { type: "boolean" },
                    confidence: { type: "number" },
                    data: {
                        type: "object",
                        properties: {
                            full_name: { type: "string" },
                            passport_number: { type: "string" },
                            birth_date: { type: "string" },
                            issue_date: { type: "string" },
                            expiry_date: { type: "string" },
                            issuing_authority: { type: "string" }
                        }
                    },
                    issues: { type: "array", items: { type: "string" } }
                }
            }
        });
        
        // Verify selfie matches passport photo
        const faceMatch = await base44.integrations.Core.InvokeLLM({
            prompt: `Сравни фотографию в паспорте с селфи. 
            Это один и тот же человек? 
            Верни JSON: { match: boolean, confidence: number (0-100), reason: string }`,
            file_urls: [passportFrontUrl, selfieUrl],
            response_json_schema: {
                type: "object",
                properties: {
                    match: { type: "boolean" },
                    confidence: { type: "number" },
                    reason: { type: "string" }
                }
            }
        });
        
        const overallValid = passportVerification.valid && 
                            faceMatch.match && 
                            passportVerification.confidence > 70 &&
                            faceMatch.confidence > 70;
        
        // Update user verification status
        if (overallValid) {
            await base44.auth.updateMe({
                kyc_verified: true,
                kyc_verified_date: new Date().toISOString(),
                passport_number: passportVerification.data.passport_number,
                passport_verified: true
            });
        }
        
        // Send notification
        await base44.integrations.Core.SendEmail({
            to: user.email,
            subject: overallValid ? '✅ KYC верификация пройдена' : '❌ KYC верификация не пройдена',
            body: `
                <h2>Результат KYC верификации</h2>
                <p><strong>Статус:</strong> ${overallValid ? 'Успешно ✅' : 'Не пройдено ❌'}</p>
                ${overallValid ? `
                    <p>Ваши документы успешно проверены. Теперь вам доступны все функции платформы.</p>
                ` : `
                    <p>К сожалению, верификация не пройдена. Причины:</p>
                    <ul>
                        ${passportVerification.issues?.map(i => `<li>${i}</li>`).join('') || ''}
                        ${!faceMatch.match ? `<li>Фото в паспорте не совпадает с селфи</li>` : ''}
                    </ul>
                    <p>Пожалуйста, попробуйте снова с качественными фотографиями.</p>
                `}
            `
        });
        
        return Response.json({
            success: true,
            verified: overallValid,
            passport: passportVerification,
            faceMatch,
            verifiedAt: new Date().toISOString()
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});