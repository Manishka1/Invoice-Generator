const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  serialNumber: { type: String, required: true },
  invoiceTo: [{
    company: { type: String, required: true },
    address: { type: String, required: true },
    gst: { type: String }
  }],
  reportTo: {
    useSame: { type: Boolean },
    company: { type: String, required: true },
    address: { type: String, required: true },
    gst: { type: String }
  },
  items: [{
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    discount: { type: Number }
  }],
  totalAmount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Invoice', invoiceSchema);