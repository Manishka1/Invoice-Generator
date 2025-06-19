const Invoice = require('../models/Invoice');
const { generateInvoicePDF } = require('../utils/pdfGenerator');

exports.createInvoice = async (req, res) => {
  try {
    // Generate serial number logic
    const latestInvoice = await Invoice.findOne({}).sort({ createdAt: -1 });
    const serialNumber = latestInvoice 
      ? `INV-${parseInt(latestInvoice.serialNumber.split('-')[1]) + 1}` 
      : 'INV-1000';
    
    const invoiceData = {
      ...req.body,
      serialNumber
    };
    
    const invoice = new Invoice(invoiceData);
    await invoice.save();
    
    // Generate PDF
    const pdfFileName = await generateInvoicePDF(invoice);
    
    res.status(201).json({
      invoice,
      pdfFileName
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({});
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};