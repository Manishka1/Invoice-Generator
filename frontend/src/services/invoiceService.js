import axios from 'axios';

// Base URL for API calls
const BASE_URL = 'http://localhost:5000/api/invoices';

// Create a configured axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const invoiceService = {
  // Create a new invoice
  createInvoice: async (invoiceData) => {
    try {
      console.log('Creating Invoice - Payload:', JSON.stringify(invoiceData, null, 2));
      const response = await apiClient.post('/create', invoiceData);
      console.log('Invoice Creation Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Invoice Creation Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  // Get list of invoices
  getInvoices: async () => {
    try {
      const response = await apiClient.get('/list');
      return response.data;
    } catch (error) {
      console.error('Fetch Invoices Error:', error);
      throw error;
    }
  },

  // Get invoice by ID
  getInvoiceById: async (invoiceId) => {
    try {
      const response = await apiClient.get(`/${invoiceId}`);
      return response.data;
    } catch (error) {
      console.error('Fetch Invoice Details Error:', error);
      throw error;
    }
  },

  // Download invoice PDF
  downloadInvoicePDF: async (invoiceId) => {
    try {
      const response = await axios({
        url: `${BASE_URL}/download/${invoiceId}`,
        method: 'GET',
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('PDF Download Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  }
};