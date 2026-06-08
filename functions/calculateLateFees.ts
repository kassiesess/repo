import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Can be called by users or automations
        const { loanId } = await req.json();
        
        if (!loanId) {
            return Response.json({ error: 'Loan ID required' }, { status: 400 });
        }
        
        const loans = await base44.asServiceRole.entities.Loan.filter({ id: loanId });
        if (loans.length === 0) {
            return Response.json({ error: 'Loan not found' }, { status: 404 });
        }
        
        const loan = loans[0];
        
        // Get all payments for this loan
        const payments = await base44.asServiceRole.entities.Payment.filter({ loan_id: loanId });
        const overduePayments = payments.filter(p => 
            p.status === 'overdue' && 
            new Date(p.due_date) < new Date()
        );
        
        let totalLateFee = 0;
        const lateFeeDetails = [];
        
        // Calculate late fees: 0.1% per day
        const DAILY_LATE_FEE_RATE = 0.001; // 0.1%
        
        for (const payment of overduePayments) {
            const dueDate = new Date(payment.due_date);
            const today = new Date();
            const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
            
            if (daysOverdue > 0) {
                const lateFee = Math.round(payment.amount * DAILY_LATE_FEE_RATE * daysOverdue);
                totalLateFee += lateFee;
                
                lateFeeDetails.push({
                    paymentId: payment.id,
                    paymentNumber: payment.payment_number,
                    dueDate: payment.due_date,
                    amount: payment.amount,
                    daysOverdue,
                    lateFee
                });
            }
        }
        
        return Response.json({
            success: true,
            loanId,
            totalLateFee,
            overduePaymentsCount: overduePayments.length,
            lateFeeDetails,
            calculatedAt: new Date().toISOString()
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});