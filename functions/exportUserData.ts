import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        // Export all user data (GDPR compliance)
        const [
            loans,
            orders,
            products,
            cartItems,
            wishlist,
            reviews,
            chats
        ] = await Promise.all([
            base44.entities.Loan.filter({ $or: [{ lender_id: user.id }, { borrower_id: user.id }] }),
            base44.entities.MarketplaceOrder.filter({ buyer_id: user.id }),
            base44.entities.Product.filter({ seller_id: user.id }),
            base44.entities.CartItem.filter({ user_id: user.id }),
            base44.entities.Wishlist.filter({ user_id: user.id }),
            base44.entities.ProductReview.filter({ user_id: user.id }),
            base44.entities.Chat.filter({ $or: [{ buyer_id: user.id }, { seller_id: user.id }] })
        ]);
        
        const exportData = {
            exportDate: new Date().toISOString(),
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                created_date: user.created_date
            },
            loans: {
                asLender: loans.filter(l => l.lender_id === user.id),
                asBorrower: loans.filter(l => l.borrower_id === user.id)
            },
            marketplace: {
                orders,
                products,
                cartItems,
                wishlist,
                reviews
            },
            communications: {
                chats
            }
        };
        
        const jsonString = JSON.stringify(exportData, null, 2);
        
        return new Response(jsonString, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename=user-data-${user.id}.json`
            }
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});