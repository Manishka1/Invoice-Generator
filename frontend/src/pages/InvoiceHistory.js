import React from 'react';
import InvoiceList from '../components/InvoiceList';

const InvoiceHistory = () => {
  return (
    <div className="invoice-history-page">
      <h1>Invoice History</h1>
      <InvoiceList />
    </div>
  );
};

export default InvoiceHistory;