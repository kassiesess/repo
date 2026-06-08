import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Admin only function
        const user = await base44.auth.me();
        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }
        
        const today = new Date().toISOString().split('T')[0];
        
        // Get all payments due today with status 'scheduled'
        const allPayments = await base44.asServiceRole.entities.Payment.filter({ status: 'scheduled' });
        const duePayments = allPayments.filter(p => p.due_date === today);
        
        let processed = 0;
        let failed = 0;
        
        for (const payment of duePayments) {
            try {
                // Get loan details
                const loans = await base44.asServiceRole.entities.Loan.filter({ id: payment.loan_id });
                if (loans.length === 0) continue;
                
                const loan = loans[0];
                
                // NOTE: В реальном приложении здесь была бы интеграция с банковским API
                // для автоматического списания средств с карты/счета заемщика
                
                // For now, we just send a notification
                await base44.asServiceRole.integrations.Core.SendEmail({
                    to: loan.borrower_email,
                    subject: '💳 Платеж сегодня',
                    body: `
                        <h2>Уважаемый(ая) ${loan.borrower_name},</h2>
                        <p>Сегодня день платежа по вашему займу.</p>
                        <p><strong>Сумма платежа:</strong> ${payment.amount.toLocaleString('ru-RU')} сом</p>
                        <p><strong>Платеж №:</strong> ${payment.payment_number}</p>
                        <p>Пожалуйста, убедитесь что на вашем счету достаточно средств.</p>
                        <p><em>В будущем платеж будет списываться автоматически.</em></p>
                        <p>С уважением,<br/>Команда Долг.кг</p>
                    `
                });
                
                // Mark as notified (не меняем статус на paid, так как нет реальной интеграции)
                processed++;
                
            } catch (error) {
                console.error('Payment processing error:', error);
                failed++;
            }
        }
        
        return Response.json({
            success: true,
            processed,
            failed,
            total: duePayments.length,
            note: 'Real automatic payments require bank API integration',
            processedAt: new Date().toISOString()
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});