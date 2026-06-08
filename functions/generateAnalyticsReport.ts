import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        // Admin only
        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }
        
        const { period } = await req.json(); // 'week', 'month', 'year', 'all'
        
        // Calculate date range
        const now = new Date();
        let startDate = new Date(0);
        
        if (period === 'week') {
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (period === 'month') {
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        } else if (period === 'year') {
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        }
        
        // Fetch all data
        const [loans, orders, users, products, reviews] = await Promise.all([
            base44.asServiceRole.entities.Loan.filter({}),
            base44.asServiceRole.entities.MarketplaceOrder.filter({}),
            base44.asServiceRole.entities.User.filter({}),
            base44.asServiceRole.entities.Product.filter({}),
            base44.asServiceRole.entities.ProductReview.filter({})
        ]);
        
        // Filter by period
        const periodLoans = loans.filter(l => new Date(l.created_date) >= startDate);
        const periodOrders = orders.filter(o => new Date(o.created_date) >= startDate);
        const periodUsers = users.filter(u => new Date(u.created_date) >= startDate);
        
        // Loan analytics
        const loanStats = {
            total: periodLoans.length,
            totalAmount: periodLoans.reduce((sum, l) => sum + l.amount, 0),
            avgAmount: periodLoans.length > 0 ? Math.round(periodLoans.reduce((sum, l) => sum + l.amount, 0) / periodLoans.length) : 0,
            byStatus: {
                active: periodLoans.filter(l => l.status === 'active').length,
                completed: periodLoans.filter(l => l.status === 'completed').length,
                overdue: periodLoans.filter(l => l.status === 'overdue').length,
                defaulted: periodLoans.filter(l => l.status === 'defaulted').length
            },
            totalInterest: periodLoans.reduce((sum, l) => sum + (l.total_interest || 0), 0),
            totalPaid: periodLoans.reduce((sum, l) => sum + (l.amount_paid || 0), 0)
        };
        
        // Marketplace analytics
        const orderStats = {
            total: periodOrders.length,
            totalRevenue: periodOrders.reduce((sum, o) => sum + o.total_amount, 0),
            avgOrderValue: periodOrders.length > 0 ? Math.round(periodOrders.reduce((sum, o) => sum + o.total_amount, 0) / periodOrders.length) : 0,
            byStatus: {
                pending: periodOrders.filter(o => o.status === 'pending').length,
                paid: periodOrders.filter(o => o.status === 'paid').length,
                on_loan: periodOrders.filter(o => o.status === 'on_loan').length,
                cancelled: periodOrders.filter(o => o.status === 'cancelled').length
            },
            byPaymentMethod: {
                cash: periodOrders.filter(o => o.payment_method === 'cash').length,
                card: periodOrders.filter(o => o.payment_method === 'card').length,
                loan: periodOrders.filter(o => o.payment_method === 'loan').length
            }
        };
        
        // User analytics
        const userStats = {
            total: users.length,
            newUsers: periodUsers.length,
            admins: users.filter(u => u.role === 'admin').length,
            verified: users.filter(u => u.credit_history_verified).length
        };
        
        // Product analytics
        const productStats = {
            total: products.length,
            active: products.filter(p => p.status === 'active').length,
            avgPrice: products.length > 0 ? Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length) : 0,
            byCategory: {}
        };
        
        products.forEach(p => {
            productStats.byCategory[p.category] = (productStats.byCategory[p.category] || 0) + 1;
        });
        
        // Review analytics
        const reviewStats = {
            total: reviews.length,
            avgRating: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2) : 0
        };
        
        return Response.json({
            success: true,
            period,
            startDate: startDate.toISOString(),
            endDate: now.toISOString(),
            loans: loanStats,
            marketplace: orderStats,
            users: userStats,
            products: productStats,
            reviews: reviewStats,
            generatedAt: new Date().toISOString()
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});