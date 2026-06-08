import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@2.5.2';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const { year } = await req.json();
        const targetYear = year || new Date().getFullYear();
        
        // Get user's loans as lender (for interest income)
        const allLoans = await base44.entities.Loan.filter({ lender_id: user.id });
        
        // Filter by year
        const yearLoans = allLoans.filter(l => {
            const loanYear = new Date(l.created_date).getFullYear();
            return loanYear === targetYear;
        });
        
        // Calculate totals
        const totalInterestIncome = yearLoans.reduce((sum, l) => sum + (l.total_interest || 0), 0);
        const totalTaxPaid = yearLoans.reduce((sum, l) => sum + (l.tax_amount || 0), 0);
        const totalLoansIssued = yearLoans.reduce((sum, l) => sum + l.amount, 0);
        
        const doc = new jsPDF();
        
        // Title
        doc.setFontSize(18);
        doc.text('НАЛОГОВЫЙ ОТЧЕТ', 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`за ${targetYear} год`, 105, 28, { align: 'center' });
        
        let y = 45;
        
        // User info
        doc.setFontSize(11);
        doc.text('Налогоплательщик:', 20, y);
        y += 8;
        doc.setFontSize(10);
        doc.text(`ФИО: ${user.full_name}`, 20, y);
        y += 6;
        doc.text(`Email: ${user.email}`, 20, y);
        y += 15;
        
        // Summary
        doc.setFontSize(11);
        doc.text('Сводка по займам:', 20, y);
        y += 10;
        
        doc.setFontSize(10);
        doc.text(`Количество выданных займов: ${yearLoans.length}`, 20, y);
        y += 6;
        doc.text(`Общая сумма выданных займов: ${totalLoansIssued.toLocaleString('ru-RU')} сом`, 20, y);
        y += 6;
        doc.text(`Общая сумма процентных доходов: ${totalInterestIncome.toLocaleString('ru-RU')} сом`, 20, y);
        y += 6;
        doc.text(`Общая сумма уплаченного НДФЛ (10%): ${totalTaxPaid.toLocaleString('ru-RU')} сом`, 20, y);
        y += 15;
        
        // Details table
        if (yearLoans.length > 0) {
            doc.setFontSize(11);
            doc.text('Детализация:', 20, y);
            y += 10;
            
            doc.setFontSize(9);
            doc.text('Дата', 20, y);
            doc.text('Заемщик', 55, y);
            doc.text('Сумма займа', 110, y);
            doc.text('Проценты', 150, y);
            doc.text('НДФЛ', 180, y);
            y += 5;
            
            yearLoans.slice(0, 20).forEach(loan => {
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
                
                doc.text(new Date(loan.created_date).toLocaleDateString('ru-RU'), 20, y);
                doc.text(loan.borrower_name.substring(0, 20), 55, y);
                doc.text(loan.amount.toLocaleString('ru-RU'), 110, y);
                doc.text(loan.total_interest.toLocaleString('ru-RU'), 150, y);
                doc.text(loan.tax_amount.toLocaleString('ru-RU'), 180, y);
                y += 6;
            });
        }
        
        // Footer
        doc.setFontSize(9);
        doc.text(`Отчет сформирован: ${new Date().toLocaleDateString('ru-RU')}`, 20, 280);
        doc.text('Долг.кг - Платформа займов', 105, 285, { align: 'center' });
        
        const pdfBytes = doc.output('arraybuffer');
        
        return new Response(pdfBytes, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=tax-report-${targetYear}.pdf`
            }
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});