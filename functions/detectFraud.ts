import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const { userId, loanId, orderId, type } = await req.json();
        
        let riskScore = 0;
        const riskFactors = [];
        
        if (type === 'loan' && userId && loanId) {
            // Get user's loan history
            const userLoans = await base44.asServiceRole.entities.Loan.filter({ 
                borrower_id: userId 
            });
            
            const currentLoan = await base44.asServiceRole.entities.Loan.filter({ id: loanId });
            if (currentLoan.length === 0) {
                return Response.json({ error: 'Loan not found' }, { status: 404 });
            }
            
            const loan = currentLoan[0];
            
            // Check 1: Multiple active loans
            const activeLoans = userLoans.filter(l => l.status === 'active');
            if (activeLoans.length > 3) {
                riskScore += 30;
                riskFactors.push('Множественные активные займы');
            }
            
            // Check 2: History of defaults
            const defaults = userLoans.filter(l => l.status === 'defaulted');
            if (defaults.length > 0) {
                riskScore += 50;
                riskFactors.push(`${defaults.length} дефолтов в истории`);
            }
            
            // Check 3: Overdue loans
            const overdue = userLoans.filter(l => l.status === 'overdue');
            if (overdue.length > 0) {
                riskScore += 40;
                riskFactors.push(`${overdue.length} просроченных займов`);
            }
            
            // Check 4: Large loan amount for new user
            if (userLoans.length < 2 && loan.amount > 100000) {
                riskScore += 25;
                riskFactors.push('Большая сумма для нового пользователя');
            }
            
            // Check 5: Too many loans in short period
            const recentLoans = userLoans.filter(l => {
                const date = new Date(l.created_date);
                const monthAgo = new Date();
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return date >= monthAgo;
            });
            
            if (recentLoans.length > 5) {
                riskScore += 35;
                riskFactors.push('Слишком много займов за месяц');
            }
        }
        
        if (type === 'order' && userId && orderId) {
            // Get user's order history
            const userOrders = await base44.asServiceRole.entities.MarketplaceOrder.filter({ 
                buyer_id: userId 
            });
            
            const currentOrder = await base44.asServiceRole.entities.MarketplaceOrder.filter({ id: orderId });
            if (currentOrder.length === 0) {
                return Response.json({ error: 'Order not found' }, { status: 404 });
            }
            
            const order = currentOrder[0];
            
            // Check 1: Too many orders in short time
            const todayOrders = userOrders.filter(o => {
                const date = new Date(o.created_date);
                const today = new Date();
                return date.toDateString() === today.toDateString();
            });
            
            if (todayOrders.length > 10) {
                riskScore += 40;
                riskFactors.push('Подозрительно много заказов за день');
            }
            
            // Check 2: Large first order
            if (userOrders.length < 2 && order.total_amount > 50000) {
                riskScore += 30;
                riskFactors.push('Большая сумма первого заказа');
            }
            
            // Check 3: Multiple cancelled orders
            const cancelled = userOrders.filter(o => o.status === 'cancelled');
            if (cancelled.length > 3) {
                riskScore += 25;
                riskFactors.push('Множественные отмененные заказы');
            }
        }
        
        // Determine risk level
        let riskLevel = 'low';
        let action = 'approve';
        
        if (riskScore >= 70) {
            riskLevel = 'high';
            action = 'reject';
        } else if (riskScore >= 40) {
            riskLevel = 'medium';
            action = 'manual_review';
        }
        
        // Send notification if high risk
        if (riskLevel === 'high') {
            const admins = await base44.asServiceRole.entities.User.filter({ role: 'admin' });
            for (const admin of admins) {
                await base44.asServiceRole.integrations.Core.SendEmail({
                    to: admin.email,
                    subject: '🚨 Обнаружена подозрительная активность',
                    body: `
                        <h2>⚠️ Предупреждение системы безопасности</h2>
                        <p><strong>Тип:</strong> ${type}</p>
                        <p><strong>User ID:</strong> ${userId}</p>
                        <p><strong>Уровень риска:</strong> ${riskLevel.toUpperCase()} (${riskScore}/100)</p>
                        <p><strong>Факторы риска:</strong></p>
                        <ul>${riskFactors.map(f => `<li>${f}</li>`).join('')}</ul>
                        <p><strong>Рекомендуемое действие:</strong> ${action}</p>
                    `
                });
            }
        }
        
        return Response.json({
            success: true,
            riskScore,
            riskLevel,
            riskFactors,
            recommendedAction: action,
            checkedAt: new Date().toISOString()
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});