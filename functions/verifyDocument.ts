import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const { documentImageUrl, documentType } = await req.json();
        
        if (!documentImageUrl) {
            return Response.json({ error: 'Document image required' }, { status: 400 });
        }
        
        // Use AI to verify document
        const result = await base44.integrations.Core.InvokeLLM({
            prompt: `Проанализируй этот документ (${documentType || 'паспорт'}) и проверь:
            1. Читаемость текста
            2. Наличие всех обязательных полей (ФИО, номер, дата выдачи)
            3. Признаки подделки или редактирования
            4. Качество фотографии
            
            Верни JSON с полями:
            - valid: boolean (документ валиден)
            - confidence: number (0-100, уверенность в проверке)
            - issues: array of strings (список проблем, если есть)
            - extracted_data: object (извлеченные данные: name, document_number, issue_date, birth_date)`,
            file_urls: [documentImageUrl],
            response_json_schema: {
                type: "object",
                properties: {
                    valid: { type: "boolean" },
                    confidence: { type: "number" },
                    issues: { type: "array", items: { type: "string" } },
                    extracted_data: {
                        type: "object",
                        properties: {
                            name: { type: "string" },
                            document_number: { type: "string" },
                            issue_date: { type: "string" },
                            birth_date: { type: "string" }
                        }
                    }
                }
            }
        });
        
        return Response.json({
            success: true,
            verification: result,
            verifiedAt: new Date().toISOString()
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});