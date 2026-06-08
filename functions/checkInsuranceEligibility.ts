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
        
        // Get all active insurance companies
        const companies = await base44.entities.InsuranceCompany.filter({ is_active: true });
        
        const eligibleCompanies = [];
        
        for (const company of companies) {
            // Check eligibility
            const minAmount = company.min_loan_amount || 0;
            const maxAmount = company.max_loan_amount || Infinity;
            
            if (loan.amount >= minAmount && loan.amount <= maxAmount) {
                // Calculate premium
                const premiumAmount = (loan.amount * company.insurance_rate * loan.term_months) / (12 * 100);
                
                eligibleCompanies.push({
                    id: company.id,
                    name: company.company_name,
                    name_en: company.company_name_en,
                    logo: company.logo_url,
                    rate: company.insurance_rate,
                    coverage: company.coverage_percent,
                    premium: Math.round(premiumAmount),
                    features: company.features || [],
                    contact: {
                        phone: company.contact_phone,
                        email: company.contact_email,
                        website: company.website
                    }
                });
            }
        }
        
        // Sort by premium (cheapest first)
        eligibleCompanies.sort((a, b) => a.premium - b.premium);
        
        return Response.json({
            success: true,
            loan: {
                id: loan.id,
                amount: loan.amount,
                term_months: loan.term_months
            },
            eligibleCompanies,
            recommendation: eligibleCompanies.length > 0 ? eligibleCompanies[0] : null
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});