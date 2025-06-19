import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { invoiceService } from '../services/invoiceService';
import { toast } from 'react-toastify';

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const data = await invoiceService.getInvoices();
      setInvoices(data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch invoices');
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId) => {
    try {
      await invoiceService.downloadInvoicePDF(invoiceId);
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      toast.error('Failed to download invoice');
      console.error('Download error:', error);
    }
  };

  if (loading) {
    return <div>Loading invoices...</div>;
  }

  return (
    <div className="invoice-list-container">
      <h2>Invoice History</h2>
      <table className="invoice-table">
        <thead>
          <tr>
            <th>Invoice Number</th>
            <th>Customer Name</th>
            <th>Total Amount</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice._id}>
              <td>
                <Link to={`/invoices/${invoice._id}`}>
                  {invoice.serialNumber}
                </Link>
              </td>
              <td>{invoice.customerName}</td>
              <td>${invoice.totalAmount.toFixed(2)}</td>
              <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
              <td>
                <button
                  onClick={() => handleDownloadInvoice(invoice._id)}
                  className="btn btn-download"
                >
                  Download
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceList;