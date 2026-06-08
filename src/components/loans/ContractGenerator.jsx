import React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function ContractGenerator({ loan, lender, borrower }) {
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('ru-RU').format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '_____________';
    return format(new Date(dateStr), 'd MMMM yyyy г.', { locale: ru });
  };

  return (
    <div className="bg-white p-8 max-w-3xl mx-auto text-sm leading-relaxed print:p-0" id="contract">
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold mb-2">ДОГОВОР ЗАЙМА</h1>
        <p className="text-slate-600">
          №{loan.id?.substring(0, 8).toUpperCase() || '________'}
        </p>
      </div>

      <div className="flex justify-between mb-6">
        <p>г. Бишкек</p>
        <p>{formatDate(loan.start_date)}</p>
      </div>

      <div className="space-y-4 text-justify">
        <p>
          <strong>Займодавец:</strong> {lender?.full_name || '_________________________'}, 
          паспорт серии {lender?.passport_series || '____'} №{lender?.passport_number || '_________'}, 
          ИНН {lender?.inn || '________________'}, 
          зарегистрированный по адресу: {lender?.address || '________________________________________________'}, 
          с одной стороны, и
        </p>

        <p>
          <strong>Заемщик:</strong> {borrower?.full_name || '_________________________'}, 
          паспорт серии {borrower?.passport_series || '____'} №{borrower?.passport_number || '_________'}, 
          ИНН {borrower?.inn || '________________'}, 
          зарегистрированный по адресу: {borrower?.address || '________________________________________________'}, 
          с другой стороны, далее совместно именуемые «Стороны», заключили настоящий Договор о нижеследующем:
        </p>

        <h2 className="font-bold text-base pt-4">1. ПРЕДМЕТ ДОГОВОРА</h2>
        <p>
          1.1. Займодавец передает Заемщику денежные средства в размере 
          <strong> {formatMoney(loan.amount)} ({loan.amount ? numberToWords(loan.amount) : '_________'}) сом</strong>, 
          а Заемщик обязуется возвратить указанную сумму займа с процентами в порядке и сроки, установленные настоящим Договором.
        </p>
        <p>
          1.2. Срок займа составляет <strong>{loan.term_months || '___'} месяц(ев)</strong>.
        </p>
        <p>
          1.3. Дата возврата займа: <strong>{formatDate(loan.end_date)}</strong>.
        </p>

        <h2 className="font-bold text-base pt-4">2. ПРОЦЕНТЫ ЗА ПОЛЬЗОВАНИЕ ЗАЙМОМ</h2>
        <p>
          2.1. За пользование денежными средствами Заемщик уплачивает Займодавцу проценты из расчета 
          <strong> {loan.interest_rate || '___'}% </strong> годовых.
        </p>
        <p>
          2.2. Общая сумма процентов за весь период займа составляет 
          <strong> {formatMoney(loan.total_interest)} сом</strong>.
        </p>
        <p>
          2.3. Налог на доход от процентов (10%) составляет 
          <strong> {formatMoney(loan.tax_amount)} сом</strong> и уплачивается Займодавцем самостоятельно.
        </p>

        <h2 className="font-bold text-base pt-4">3. ПОРЯДОК ВОЗВРАТА ЗАЙМА</h2>
        <p>
          3.1. Общая сумма к возврату составляет <strong>{formatMoney(loan.total_repayment)} сом</strong>.
        </p>
        <p>
          3.2. Возврат суммы займа и процентов производится ежемесячными платежами в размере 
          <strong> {formatMoney(loan.monthly_payment)} сом</strong>.
        </p>
        <p>
          3.3. Заемщик вправе досрочно погасить сумму займа с уплатой процентов за фактический период пользования.
        </p>

        <h2 className="font-bold text-base pt-4">4. ОТВЕТСТВЕННОСТЬ СТОРОН</h2>
        <p>
          4.1. В случае нарушения срока возврата займа Заемщик уплачивает Займодавцу пеню в размере 0,1% от невозвращенной суммы за каждый день просрочки.
        </p>
        <p>
          4.2. В случае невозврата займа в установленный срок Займодавец вправе обратиться в суд для защиты своих прав.
        </p>

        <h2 className="font-bold text-base pt-4">5. ЗАКЛЮЧИТЕЛЬНЫЕ ПОЛОЖЕНИЯ</h2>
        <p>
          5.1. Настоящий Договор составлен в соответствии с законодательством Кыргызской Республики.
        </p>
        <p>
          5.2. Договор вступает в силу с момента подписания обеими Сторонами.
        </p>
        <p>
          5.3. Все споры разрешаются путем переговоров, а при недостижении согласия — в судебном порядке.
        </p>
        <p>
          5.4. Договор составлен в двух экземплярах, имеющих одинаковую юридическую силу.
        </p>

        <h2 className="font-bold text-base pt-4">6. РЕКВИЗИТЫ И ПОДПИСИ СТОРОН</h2>
        
        <div className="grid grid-cols-2 gap-8 mt-6">
          <div className="border-t pt-4">
            <p className="font-bold mb-2">ЗАЙМОДАВЕЦ:</p>
            <p>{lender?.full_name || '_________________________'}</p>
            <p>Паспорт: {lender?.passport_series || '____'} №{lender?.passport_number || '_________'}</p>
            <p>ИНН: {lender?.inn || '________________'}</p>
            <p>Тел: {lender?.phone || '________________'}</p>
            <div className="mt-6">
              <p>Подпись:</p>
              <p className="font-serif text-3xl my-2">{lender?.signature || '_________________'}</p>
            </div>
            <p className="mt-2">Дата: _________________</p>
          </div>
          <div className="border-t pt-4">
            <p className="font-bold mb-2">ЗАЕМЩИК:</p>
            <p>{borrower?.full_name || '_________________________'}</p>
            <p>Паспорт: {borrower?.passport_series || '____'} №{borrower?.passport_number || '_________'}</p>
            <p>ИНН: {borrower?.inn || '________________'}</p>
            <p>Тел: {borrower?.phone || '________________'}</p>
            <div className="mt-6">
              <p>Подпись:</p>
              <p className="font-serif text-3xl my-2">{borrower?.signature || '_________________'}</p>
            </div>
            <p className="mt-2">Дата: _________________</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function numberToWords(num) {
  const ones = ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'];
  const teens = ['десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать'];
  const tens = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто'];
  const hundreds = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот'];
  const thousands = ['', 'одна тысяча', 'две тысячи', 'три тысячи', 'четыре тысячи', 'пять тысяч', 'шесть тысяч', 'семь тысяч', 'восемь тысяч', 'девять тысяч'];

  if (num === 0) return 'ноль';
  if (num < 0) return 'минус ' + numberToWords(-num);

  let result = '';

  if (num >= 1000000) {
    const millions = Math.floor(num / 1000000);
    result += ones[millions] + ' миллион' + (millions > 1 ? 'ов' : '') + ' ';
    num %= 1000000;
  }

  if (num >= 1000) {
    const thousandPart = Math.floor(num / 1000);
    if (thousandPart < 10) {
      result += thousands[thousandPart] + ' ';
    } else {
      result += numberToWords(thousandPart) + ' тысяч ';
    }
    num %= 1000;
  }

  if (num >= 100) {
    result += hundreds[Math.floor(num / 100)] + ' ';
    num %= 100;
  }

  if (num >= 10 && num < 20) {
    result += teens[num - 10] + ' ';
  } else {
    if (num >= 20) {
      result += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
    }
    if (num > 0) {
      result += ones[num] + ' ';
    }
  }

  return result.trim();
}