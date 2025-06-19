const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const { generateInvoicePDF } = require('../utils/pdfGenerator');

router.post('/create', async (req, res) => {
  try {
    const { serialNumber, invoiceTo, reportTo, items, totalAmount } = req.body;

    if (!serialNumber) {
      return res.status(400).json({ error: 'Serial number is required' });
    }

    if (!invoiceTo || !invoiceTo[0].company || !invoiceTo[0].address) {
      return res.status(400).json({ error: 'Invoice To details are required' });
    }

    if (!reportTo || !reportTo.company || !reportTo.address) {
      return res.status(400).json({ error: 'Report To details are required' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'At least one invoice item is required' });
    }

    if (totalAmount === undefined || totalAmount <= 0) {
      return res.status(400).json({ error: 'Invalid total amount' });
    }

    const latestInvoice = await Invoice.findOne().sort({ createdAt: -1 });
    const generatedSerial = latestInvoice
      ? `INV-${parseInt(latestInvoice.serialNumber.split('-')[1]) + 1}`
      : 'INV-1000';

    const newInvoice = new Invoice({
      serialNumber: generatedSerial,
      invoiceTo,
      reportTo,
      items,
      totalAmount,
      createdAt: new Date()
    });

    const savedInvoice = await newInvoice.save();

    res.status(201).json({
      message: 'Invoice created successfully',
      invoice: savedInvoice
    });
  } catch (error) {
    console.error('Invoice Creation Error:', error);
    res.status(500).json({ error: 'Failed to create invoice', details: error.message });
  }
});

router.get('/download/:invoiceId', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.invoiceId);

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const pdfBuffer = await generateInvoicePDF(invoice);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=invoice-${invoice.serialNumber}.pdf`,
      'Content-Length': pdfBuffer.length
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF Download Error:', error);
    res.status(500).json({ error: 'Could not generate PDF' });
  }
});

module.exports = router;