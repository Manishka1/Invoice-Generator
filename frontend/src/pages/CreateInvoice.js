import React from 'react';
import InvoiceForm from '../components/InvoiceForm';

const CreateInvoice = () => {
  return (
    <div className="create-invoice-page">
      <h1>Create New Invoice</h1>
      <InvoiceForm />
    </div>
  );
};

export default CreateInvoice;