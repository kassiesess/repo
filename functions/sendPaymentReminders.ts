import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const today = new Date();
        const threeDaysLater = new Date(today);
        threeDaysLater.setDate(today.getDate() + 3);
        
        const todayStr = today.toISOString().split('T')[0];
        const threeDaysStr = threeDaysLater.toISOString().split('T')[0];
        
        // Get all scheduled payments due in 3 days
        const allPayments = await base44.asServiceRole.entities.Payment.filter({ status: 'scheduled' });
        const upcomingPayments = allPayments.filter(p => 
            p.due_date >= todayStr && p.due_date <= threeDaysStr
        );
        
        let remindersSent = 0;
        
        for (const payment of upcomingPayments) {
            // Get loan details
            const loans = await base44.asServiceRole.entities.Loan.filter({ id: payment.loan_id });
            if (loans.length === 0) continue;
            
            const loan = loans[0];
            const daysUntilDue = Math.ceil((new Date(payment.due_date) - today) / (1000 * 60 * 60 * 24));
            
            try {
                // Send reminder to borrower
                await base44.asServiceRole.integrations.Core.SendEmail({
                    to: loan.borrower_email,
                    subject: `📅 Напоминание: Платеж через ${daysUntilDue} дн.`,
                    body: `
                        <h2>Уважаемый(ая) ${loan.borrower_name},</h2>
                        <p>Напоминаем о предстоящем платеже по займу.</p>
                        <p><strong>Дата платежа:</strong> ${new Date(payment.due_date).toLocaleDateString('ru-RU')}</p>
                        <p><strong>Сумма платежа:</strong> ${payment.amount.toLocaleString('ru-RU')} сом</p>
                        <p><strong>Платеж №:</strong> ${payment.payment_number} из ${loan.term_months}</p>
                        <p>Пожалуйста, подготовьте средства для своевременной оплаты.</p>
                        <p>С уважением,<br/>Команда Долг.кг</p>
                    `
                });
                
                remindersSent++;
            } catch (emailError) {
                console.error('Email error:', emailError);
            }
        }
        
        return Response.json({ 
            success: true,
            remindersSent,
            paymentsChecked: upcomingPayments.length,
            checkedAt: new Date().toISOString()
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});