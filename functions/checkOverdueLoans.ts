import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Use service role for admin operations
        const today = new Date().toISOString().split('T')[0];
        
        // Get all active loans
        const loans = await base44.asServiceRole.entities.Loan.filter({ status: 'active' });
        
        let overdueCount = 0;
        let notifiedCount = 0;
        
        for (const loan of loans) {
            // Check if loan is overdue
            if (loan.end_date < today) {
                // Mark as overdue
                await base44.asServiceRole.entities.Loan.update(loan.id, {
                    status: 'overdue'
                });
                overdueCount++;
                
                // Notify borrower
                try {
                    await base44.asServiceRole.integrations.Core.SendEmail({
                        to: loan.borrower_email,
                        subject: '⚠️ Просрочка по займу',
                        body: `
                            <h2>Уважаемый(ая) ${loan.borrower_name},</h2>
                            <p>Ваш займ на сумму <strong>${loan.amount.toLocaleString('ru-RU')} сом</strong> просрочен.</p>
                            <p>Срок погашения: ${new Date(loan.end_date).toLocaleDateString('ru-RU')}</p>
                            <p>Задолженность: <strong>${(loan.total_repayment - loan.amount_paid).toLocaleString('ru-RU')} сом</strong></p>
                            <p>Пожалуйста, погасите задолженность как можно скорее.</p>
                            <p>С уважением,<br/>Команда Долг.кг</p>
                        `
                    });
                    
                    // Notify lender
                    const lender = await base44.asServiceRole.entities.User.filter({ id: loan.lender_id });
                    if (lender.length > 0) {
                        await base44.asServiceRole.integrations.Core.SendEmail({
                            to: lender[0].email,
                            subject: '⚠️ Займ просрочен',
                            body: `
                                <h2>Уважаемый(ая) ${loan.lender_name},</h2>
                                <p>Займ заемщику <strong>${loan.borrower_name}</strong> на сумму ${loan.amount.toLocaleString('ru-RU')} сом просрочен.</p>
                                <p>Срок погашения был: ${new Date(loan.end_date).toLocaleDateString('ru-RU')}</p>
                                <p>Оплачено: ${loan.amount_paid.toLocaleString('ru-RU')} сом</p>
                                <p>Осталось: ${(loan.total_repayment - loan.amount_paid).toLocaleString('ru-RU')} сом</p>
                                <p>С уважением,<br/>Команда Долг.кг</p>
                            `
                        });
                    }
                    
                    notifiedCount++;
                } catch (emailError) {
                    console.error('Email error:', emailError);
                }
            }
            
            // Check overdue payments
            const payments = await base44.asServiceRole.entities.Payment.filter({ 
                loan_id: loan.id,
                status: 'scheduled'
            });
            
            for (const payment of payments) {
                if (payment.due_date < today) {
                    await base44.asServiceRole.entities.Payment.update(payment.id, {
                        status: 'overdue'
                    });
                }
            }
        }
        
        return Response.json({ 
            success: true,
            overdueLoans: overdueCount,
            notificationsSent: notifiedCount,
            checkedAt: new Date().toISOString()
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});