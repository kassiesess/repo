import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@2.5.2';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const { loanId } = await req.json();
        
        const loans = await base44.entities.Loan.filter({ id: loanId });
        if (loans.length === 0) {
            return Response.json({ error: 'Loan not found' }, { status: 404 });
        }
        
        const loan = loans[0];
        
        // Check access
        if (loan.lender_id !== user.id && loan.borrower_id !== user.id && user.role !== 'admin') {
            return Response.json({ error: 'Access denied' }, { status: 403 });
        }
        
        const doc = new jsPDF();
        
        // Title
        doc.setFontSize(20);
        doc.text('ДОГОВОР ЗАЙМА', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(`№ ${loan.id.substring(0, 8).toUpperCase()}`, 105, 30, { align: 'center' });
        
        doc.setFontSize(10);
        doc.text(`г. Бишкек`, 20, 45);
        doc.text(`${new Date(loan.start_date).toLocaleDateString('ru-RU')}`, 170, 45);
        
        let y = 60;
        
        // Parties
        doc.setFontSize(11);
        doc.text('1. СТОРОНЫ ДОГОВОРА', 20, y);
        y += 10;
        
        doc.setFontSize(10);
        doc.text(`ЗАЙМОДАВЕЦ: ${loan.lender_name}`, 20, y);
        y += 6;
        doc.text(`Паспорт: ${loan.lender_passport}`, 20, y);
        y += 10;
        
        doc.text(`ЗАЕМЩИК: ${loan.borrower_name}`, 20, y);
        y += 6;
        doc.text(`Паспорт: ${loan.borrower_passport}`, 20, y);
        y += 6;
        doc.text(`Email: ${loan.borrower_email}`, 20, y);
        y += 15;
        
        // Terms
        doc.setFontSize(11);
        doc.text('2. УСЛОВИЯ ЗАЙМА', 20, y);
        y += 10;
        
        doc.setFontSize(10);
        doc.text(`Сумма займа: ${loan.amount.toLocaleString('ru-RU')} сом`, 20, y);
        y += 6;
        doc.text(`Процентная ставка: ${loan.interest_rate}% годовых`, 20, y);
        y += 6;
        doc.text(`Срок займа: ${loan.term_months} месяцев`, 20, y);
        y += 6;
        doc.text(`Дата начала: ${new Date(loan.start_date).toLocaleDateString('ru-RU')}`, 20, y);
        y += 6;
        doc.text(`Дата окончания: ${new Date(loan.end_date).toLocaleDateString('ru-RU')}`, 20, y);
        y += 6;
        doc.text(`Общая сумма процентов: ${loan.total_interest.toLocaleString('ru-RU')} сом`, 20, y);
        y += 6;
        doc.text(`НДФЛ (10%): ${loan.tax_amount.toLocaleString('ru-RU')} сом`, 20, y);
        y += 6;
        doc.text(`Общая сумма к возврату: ${loan.total_repayment.toLocaleString('ru-RU')} сом`, 20, y);
        y += 10;
        
        if (loan.monthly_payments) {
            doc.text(`График платежей: Ежемесячно по ${loan.monthly_payment.toLocaleString('ru-RU')} сом`, 20, y);
        } else {
            doc.text('График платежей: Единовременный возврат в конце срока', 20, y);
        }
        y += 15;
        
        // Rights and obligations
        doc.setFontSize(11);
        doc.text('3. ПРАВА И ОБЯЗАННОСТИ СТОРОН', 20, y);
        y += 10;
        
        doc.setFontSize(9);
        const obligations = [
            '3.1. Заемщик обязуется вернуть сумму займа с процентами в установленный срок.',
            '3.2. Займодавец имеет право требовать досрочного возврата займа при нарушении условий.',
            '3.3. При просрочке платежа начисляется пеня 0.1% от суммы долга за каждый день просрочки.',
            '3.4. Заемщик имеет право на досрочное погашение займа без дополнительных комиссий.',
            '3.5. Все споры решаются в соответствии с законодательством Кыргызской Республики.'
        ];
        
        obligations.forEach(text => {
            doc.text(text, 20, y, { maxWidth: 170 });
            y += 8;
        });
        
        y += 10;
        
        // Signatures
        doc.setFontSize(11);
        doc.text('4. ПОДПИСИ СТОРОН', 20, y);
        y += 15;
        
        doc.setFontSize(10);
        doc.text('ЗАЙМОДАВЕЦ:', 20, y);
        doc.text('ЗАЕМЩИК:', 120, y);
        y += 10;
        
        doc.text(`_________________`, 20, y);
        doc.text(`_________________`, 120, y);
        y += 5;
        doc.text(loan.lender_name, 20, y);
        doc.text(loan.borrower_name, 120, y);
        
        const pdfBytes = doc.output('arraybuffer');
        
        return new Response(pdfBytes, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=loan-contract-${loan.id.substring(0, 8)}.pdf`
            }
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});