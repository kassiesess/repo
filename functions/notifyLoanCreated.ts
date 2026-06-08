import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const { loanId } = await req.json();
        
        // Get loan details
        const loans = await base44.entities.Loan.filter({ id: loanId });
        if (loans.length === 0) {
            return Response.json({ error: 'Loan not found' }, { status: 404 });
        }
        
        const loan = loans[0];
        
        // Send email to borrower
        await base44.asServiceRole.integrations.Core.SendEmail({
            to: loan.borrower_email,
            subject: '📩 Приглашение к займу',
            body: `
                <h2>Здравствуйте!</h2>
                <p>${loan.lender_name} предлагает вам займ на следующих условиях:</p>
                <p><strong>Сумма займа:</strong> ${loan.amount.toLocaleString('ru-RU')} сом</p>
                <p><strong>Процентная ставка:</strong> ${loan.interest_rate}% годовых</p>
                <p><strong>Срок:</strong> ${loan.term_months} месяцев</p>
                <p><strong>Общая сумма к возврату:</strong> ${loan.total_repayment.toLocaleString('ru-RU')} сом</p>
                ${loan.monthly_payments ? 
                    `<p><strong>Ежемесячный платеж:</strong> ${loan.monthly_payment.toLocaleString('ru-RU')} сом</p>` : 
                    `<p><em>Полная оплата в конце срока</em></p>`
                }
                <p>Войдите в приложение Долг.кг, чтобы просмотреть детали и подписать договор.</p>
                <p>С уважением,<br/>Команда Долг.кг</p>
            `
        });
        
        // Send confirmation to lender
        const lender = await base44.asServiceRole.entities.User.filter({ id: loan.lender_id });
        if (lender.length > 0) {
            await base44.asServiceRole.integrations.Core.SendEmail({
                to: lender[0].email,
                subject: '✅ Займ создан',
                body: `
                    <h2>Здравствуйте, ${loan.lender_name}!</h2>
                    <p>Ваш займ успешно создан и отправлен заемщику.</p>
                    <p><strong>Заемщик:</strong> ${loan.borrower_name} (${loan.borrower_email})</p>
                    <p><strong>Сумма:</strong> ${loan.amount.toLocaleString('ru-RU')} сом</p>
                    <p><strong>Доход:</strong> ${loan.total_interest.toLocaleString('ru-RU')} сом (${loan.interest_rate}% годовых)</p>
                    <p>После вычета налога 10%: ${(loan.total_interest - loan.tax_amount).toLocaleString('ru-RU')} сом</p>
                    <p>Заемщик получит уведомление и сможет подписать договор в приложении.</p>
                    <p>С уважением,<br/>Команда Долг.кг</p>
                `
            });
        }
        
        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});