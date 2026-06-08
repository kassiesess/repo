import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        // Admin only
        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }
        
        // Fetch all entities
        const [
            users,
            loans,
            payments,
            orders,
            products,
            reviews,
            chats,
            messages,
            insurances,
            companies,
            cryptoInvestments
        ] = await Promise.all([
            base44.asServiceRole.entities.User.filter({}),
            base44.asServiceRole.entities.Loan.filter({}),
            base44.asServiceRole.entities.Payment.filter({}),
            base44.asServiceRole.entities.MarketplaceOrder.filter({}),
            base44.asServiceRole.entities.Product.filter({}),
            base44.asServiceRole.entities.ProductReview.filter({}),
            base44.asServiceRole.entities.Chat.filter({}),
            base44.asServiceRole.entities.ChatMessage.filter({}),
            base44.asServiceRole.entities.LoanInsurance.filter({}),
            base44.asServiceRole.entities.InsuranceCompany.filter({}),
            base44.asServiceRole.entities.CryptoInvestment.filter({})
        ]);
        
        const backup = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            entities: {
                users,
                loans,
                payments,
                orders,
                products,
                reviews,
                chats,
                messages,
                insurances,
                companies,
                cryptoInvestments
            },
            metadata: {
                totalRecords: users.length + loans.length + payments.length + orders.length + 
                             products.length + reviews.length + chats.length + messages.length +
                             insurances.length + companies.length + cryptoInvestments.length,
                backupBy: user.email
            }
        };
        
        const jsonString = JSON.stringify(backup, null, 2);
        
        // Send backup to admin email
        await base44.asServiceRole.integrations.Core.SendEmail({
            to: user.email,
            subject: '💾 Database Backup',
            body: `
                <h2>Резервная копия базы данных</h2>
                <p><strong>Дата:</strong> ${new Date().toLocaleString('ru-RU')}</p>
                <p><strong>Всего записей:</strong> ${backup.metadata.totalRecords}</p>
                <p>Файл backup прикреплен к письму в виде JSON.</p>
                <p><em>Примечание: Храните backup в безопасном месте.</em></p>
            `
        });
        
        return new Response(jsonString, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename=database-backup-${Date.now()}.json`
            }
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});