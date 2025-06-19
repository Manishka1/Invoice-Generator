import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { invoiceService } from '../services/invoiceService';
import { toast } from 'react-toastify';

const InvoiceDetails = () => {
  const { invoiceId } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    fetchInvoiceDetails();
  }, [invoiceId]);

  const fetchInvoiceDetails = async () => {
    try {
      const data = await invoiceService.getInvoiceById(invoiceId);
      setInvoice(data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch invoice details');
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    setIsDownloading(true);
    try {
      await invoiceService.downloadInvoicePDF(invoiceId);
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      toast.error('Failed to download invoice');
      console.error('Download error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return <div>Loading invoice details...</div>;
  }

  if (!invoice) {
    return <div>Invoice not found</div>;
  }

  return (
    <div className="invoice-details-container">
      <div className="invoice-header">
        <h2>Invoice Details</h2>
        <button 
          onClick={handleDownloadInvoice}
          disabled={isDownloading}
          className="btn btn-download"
        >
          {isDownloading ? 'Downloading...' : 'Download Invoice PDF'}
        </button>
      </div>

      <div className="invoice-info">
        <p>Invoice Number: {invoice.serialNumber}</p>
        <p>Customer: {invoice.customerName}</p>
        <p>Email: {invoice.customerEmail}</p>
        <p>Total Amount: ${invoice.totalAmount.toFixed(2)}</p>
        <p>Date: {new Date(invoice.createdAt).toLocaleString()}</p>
      </div>

      <div className="invoice-items">
        <h3>Invoice Items</h3>
        <table className="invoice-items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index}>
                <td>{item.description}</td>
                <td>{item.quantity}</td>
                <td>${item.unitPrice.toFixed(2)}</td>
                <td>${(item.quantity * item.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceDetails;