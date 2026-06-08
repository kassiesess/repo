import React from 'react';
import { format, differenceInDays } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function CourtDocumentGenerator({ loan, lender, borrower, payments }) {
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('ru-RU').format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '_____________';
    return format(new Date(dateStr), 'd MMMM yyyy г.', { locale: ru });
  };

  const overduePayments = payments?.filter(p => p.status === 'overdue') || [];
  const totalOverdue = overduePayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const daysOverdue = loan.end_date ? Math.max(0, differenceInDays(new Date(), new Date(loan.end_date))) : 0;
  const penaltyRate = 0.001; // 0.1% в день
  const penaltyAmount = totalOverdue * penaltyRate * daysOverdue;
  const totalClaim = (loan.total_repayment || 0) - (loan.amount_paid || 0) + penaltyAmount;

  return (
    <div className="bg-white p-8 max-w-3xl mx-auto text-sm leading-relaxed print:p-0" id="court-document">
      <div className="text-right mb-8">
        <p className="font-bold">В Первомайский районный суд</p>
        <p>г. Бишкек</p>
        <p className="mt-4">
          <strong>Истец:</strong> {lender?.full_name || '_________________________'}<br />
          Адрес: {lender?.address || '_________________________'}<br />
          Телефон: {lender?.phone || '_________________________'}
        </p>
        <p className="mt-4">
          <strong>Ответчик:</strong> {borrower?.full_name || '_________________________'}<br />
          Адрес: {borrower?.address || '_________________________'}<br />
          Телефон: {borrower?.phone || '_________________________'}
        </p>
        <p className="mt-4">
          <strong>Цена иска:</strong> {formatMoney(Math.round(totalClaim))} сом
        </p>
      </div>

      <h1 className="text-xl font-bold text-center mb-8">
        ИСКОВОЕ ЗАЯВЛЕНИЕ<br />
        о взыскании суммы долга по договору займа
      </h1>

      <div className="space-y-4 text-justify">
        <p>
          {formatDate(loan.start_date)} между мной, {lender?.full_name || '_________________________'} (далее — Истец), 
          и {borrower?.full_name || '_________________________'} (далее — Ответчик) был заключен Договор займа 
          №{loan.id?.substring(0, 8).toUpperCase() || '________'}.
        </p>

        <p>
          В соответствии с условиями указанного Договора Истец передал Ответчику денежные средства в размере 
          <strong> {formatMoney(loan.amount)} сом</strong> сроком на <strong>{loan.term_months} месяц(ев)</strong> 
          под <strong>{loan.interest_rate}%</strong> годовых.
        </p>

        <p>
          Согласно п. 3.1 Договора, общая сумма к возврату составляет <strong>{formatMoney(loan.total_repayment)} сом</strong>, 
          включая сумму основного долга и проценты за пользование займом.
        </p>

        <p>
          Срок возврата займа истек <strong>{formatDate(loan.end_date)}</strong>.
        </p>

        <p>
          На момент подачи искового заявления Ответчиком возвращено <strong>{formatMoney(loan.amount_paid)} сом</strong>. 
          Таким образом, сумма невозвращенного долга составляет <strong>{formatMoney((loan.total_repayment || 0) - (loan.amount_paid || 0))} сом</strong>.
        </p>

        <p>
          В соответствии с п. 4.1 Договора, в случае нарушения срока возврата займа Заемщик уплачивает 
          пеню в размере 0,1% от невозвращенной суммы за каждый день просрочки.
        </p>

        <p>
          Просрочка составляет <strong>{daysOverdue} дней</strong>. 
          Сумма пени составляет: {formatMoney((loan.total_repayment || 0) - (loan.amount_paid || 0))} × 0,1% × {daysOverdue} = 
          <strong> {formatMoney(Math.round(penaltyAmount))} сом</strong>.
        </p>

        <p>
          Неоднократные устные и письменные требования о возврате долга Ответчиком были оставлены без удовлетворения.
        </p>

        <p>
          В соответствии со статьями 367-371 Гражданского кодекса Кыргызской Республики, 
          статьями 3, 131, 132 Гражданского процессуального кодекса Кыргызской Республики,
        </p>

        <h2 className="font-bold text-base pt-4">ПРОШУ:</h2>
        <ol className="list-decimal ml-6 space-y-2">
          <li>
            Взыскать с {borrower?.full_name || '_________________________'} в пользу {lender?.full_name || '_________________________'} 
            сумму основного долга в размере <strong>{formatMoney((loan.total_repayment || 0) - (loan.amount_paid || 0))} сом</strong>.
          </li>
          <li>
            Взыскать с Ответчика пеню за просрочку исполнения обязательств в размере <strong>{formatMoney(Math.round(penaltyAmount))} сом</strong>.
          </li>
          <li>
            Взыскать с Ответчика судебные расходы по уплате государственной пошлины.
          </li>
        </ol>

        <h2 className="font-bold text-base pt-4">ПРИЛОЖЕНИЯ:</h2>
        <ol className="list-decimal ml-6 space-y-1">
          <li>Копия Договора займа №{loan.id?.substring(0, 8).toUpperCase() || '________'} от {formatDate(loan.start_date)}</li>
          <li>Расчет суммы иска</li>
          <li>Копия паспорта Истца</li>
          <li>Квитанция об уплате государственной пошлины</li>
          <li>Копия искового заявления для Ответчика</li>
        </ol>

        <div className="mt-8 pt-8 border-t">
          <div className="flex justify-between">
            <div>
              <p>Дата: «____» _____________ 20___ г.</p>
            </div>
            <div className="text-right">
              <p>Подпись:</p>
              <p className="font-serif text-3xl my-2">{lender?.signature || '_________________'}</p>
              <p className="text-slate-500">({lender?.full_name || '_________________________'})</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <h2 className="font-bold text-base mb-4">РАСЧЕТ СУММЫ ИСКА</h2>
          <table className="w-full border-collapse">
            <tbody>
              <tr className="border-b">
                <td className="py-2">1. Сумма основного долга</td>
                <td className="py-2 text-right font-medium">{formatMoney(loan.amount)} сом</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">2. Проценты за пользование займом</td>
                <td className="py-2 text-right font-medium">{formatMoney(loan.total_interest)} сом</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">3. Итого к возврату по договору</td>
                <td className="py-2 text-right font-medium">{formatMoney(loan.total_repayment)} сом</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">4. Фактически уплачено</td>
                <td className="py-2 text-right font-medium">{formatMoney(loan.amount_paid)} сом</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">5. Задолженность</td>
                <td className="py-2 text-right font-bold">{formatMoney((loan.total_repayment || 0) - (loan.amount_paid || 0))} сом</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">6. Количество дней просрочки</td>
                <td className="py-2 text-right font-medium">{daysOverdue} дней</td>
              </tr>
              <tr className="border-b">
                <td className="py-2">7. Пеня (0,1% в день)</td>
                <td className="py-2 text-right font-medium">{formatMoney(Math.round(penaltyAmount))} сом</td>
              </tr>
              <tr className="border-t-2">
                <td className="py-2 font-bold">ИТОГО цена иска:</td>
                <td className="py-2 text-right font-bold text-lg">{formatMoney(Math.round(totalClaim))} сом</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}