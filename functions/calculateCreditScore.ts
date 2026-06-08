import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const { userId } = await req.json();
        const targetUserId = userId || user.id;
        
        // Get user's loan history
        const borrowedLoans = await base44.entities.Loan.filter({ borrower_id: targetUserId });
        const lentLoans = await base44.entities.Loan.filter({ lender_id: targetUserId });
        
        // Calculate credit score (300-1000)
        let score = 650; // Base score
        
        // Positive factors
        const completedLoans = borrowedLoans.filter(l => l.status === 'completed');
        score += completedLoans.length * 15; // +15 per completed loan
        
        // Negative factors
        const overdueLoans = borrowedLoans.filter(l => l.status === 'overdue');
        score -= overdueLoans.length * 50; // -50 per overdue
        
        const defaultedLoans = borrowedLoans.filter(l => l.status === 'defaulted');
        score -= defaultedLoans.length * 100; // -100 per defaulted
        
        // Payment history
        for (const loan of borrowedLoans.filter(l => l.status === 'active' || l.status === 'completed')) {
            const paymentRate = loan.amount_paid / loan.total_repayment;
            if (paymentRate > 0.8) score += 10;
        }
        
        // Lending activity (positive)
        score += Math.min(lentLoans.length * 5, 50);
        
        // Clamp score
        score = Math.max(300, Math.min(1000, score));
        
        // Determine category
        let category = 'Плохая';
        let color = 'red';
        if (score >= 850) { category = 'Отличная'; color = 'green'; }
        else if (score >= 750) { category = 'Очень хорошая'; color = 'emerald'; }
        else if (score >= 650) { category = 'Хорошая'; color = 'blue'; }
        else if (score >= 550) { category = 'Средняя'; color = 'yellow'; }
        
        // Calculate max loan amount based on score
        const maxLoanAmount = Math.floor((score - 300) * 100);
        
        return Response.json({
            success: true,
            creditScore: Math.round(score),
            category,
            color,
            maxLoanAmount,
            statistics: {
                totalBorrowed: borrowedLoans.length,
                totalLent: lentLoans.length,
                completed: completedLoans.length,
                overdue: overdueLoans.length,
                defaulted: defaultedLoans.length
            },
            calculatedAt: new Date().toISOString()
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});