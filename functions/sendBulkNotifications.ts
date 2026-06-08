import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        // Admin only
        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }
        
        const { subject, message, targetGroup } = await req.json();
        
        if (!subject || !message) {
            return Response.json({ error: 'Subject and message required' }, { status: 400 });
        }
        
        // Get target users
        let targetUsers = [];
        
        if (targetGroup === 'all') {
            targetUsers = await base44.asServiceRole.entities.User.filter({});
        } else if (targetGroup === 'borrowers') {
            const loans = await base44.asServiceRole.entities.Loan.filter({});
            const borrowerIds = [...new Set(loans.map(l => l.borrower_id))];
            targetUsers = await base44.asServiceRole.entities.User.filter({});
            targetUsers = targetUsers.filter(u => borrowerIds.includes(u.id));
        } else if (targetGroup === 'lenders') {
            const loans = await base44.asServiceRole.entities.Loan.filter({});
            const lenderIds = [...new Set(loans.map(l => l.lender_id))];
            targetUsers = await base44.asServiceRole.entities.User.filter({});
            targetUsers = targetUsers.filter(u => lenderIds.includes(u.id));
        } else if (targetGroup === 'sellers') {
            const products = await base44.asServiceRole.entities.Product.filter({});
            const sellerIds = [...new Set(products.map(p => p.seller_id))];
            targetUsers = await base44.asServiceRole.entities.User.filter({});
            targetUsers = targetUsers.filter(u => sellerIds.includes(u.id));
        } else if (targetGroup === 'buyers') {
            const orders = await base44.asServiceRole.entities.MarketplaceOrder.filter({});
            const buyerIds = [...new Set(orders.map(o => o.buyer_id))];
            targetUsers = await base44.asServiceRole.entities.User.filter({});
            targetUsers = targetUsers.filter(u => buyerIds.includes(u.id));
        }
        
        let sent = 0;
        let failed = 0;
        
        // Send emails in batches to avoid rate limits
        for (const targetUser of targetUsers) {
            try {
                await base44.asServiceRole.integrations.Core.SendEmail({
                    to: targetUser.email,
                    subject: subject,
                    body: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2>Здравствуйте, ${targetUser.full_name}!</h2>
                            <div style="background: white; padding: 20px; border-radius: 10px;">
                                ${message}
                            </div>
                            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
                                Это автоматическое уведомление от Долг.кг
                            </p>
                        </div>
                    `
                });
                sent++;
            } catch (e) {
                console.error(`Failed to send to ${targetUser.email}:`, e);
                failed++;
            }
        }
        
        return Response.json({
            success: true,
            sent,
            failed,
            total: targetUsers.length,
            targetGroup,
            sentAt: new Date().toISOString()
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});