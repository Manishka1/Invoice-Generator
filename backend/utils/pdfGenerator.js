// Required modules
const PDFDocument = require('pdfkit');
const path = require('path');
const { toWords } = require('number-to-words');

const generateInvoicePDF = async (invoice) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const drawLine = (x1, y1, x2, y2) => doc.moveTo(x1, y1).lineTo(x2, y2).stroke();
    const drawText = (text, x, y, options = {}) => {
      const opts = Object.assign({ width: 100, align: 'left', size: 8 }, options);
      doc.fontSize(opts.size).fillColor(opts.color || 'black');
      if (opts.bold) {
        doc.font('Helvetica-Bold');
      }
      doc.text(text, x, y, opts);
      doc.font('Helvetica'); // Reset to default font
    };

    // Adjusted column layout
    const colX = [40, 65, 290, 330, 415, 495, 575];
    const fullWidth = colX[6] - colX[0];

    // === HEADER LOGO ===
    const logoPath = path.join(__dirname, '../assets/pic1.png');
    doc.image(logoPath, colX[0], 40, { width: 250 });

    // === ADDITIONAL IMAGE BELOW LOGO ===
    const extraPicPath = path.join(__dirname, '../assets/pic2.jpg');
    doc.image(extraPicPath, colX[0], 95, { width: fullWidth });

    // === HEADER IMAGE BELOW pic2 ===
    const invoiceHeaderPath = path.join(__dirname, '../assets/invoice.jpg');
    const headerImageY = 95 + 130;
    doc.image(invoiceHeaderPath, colX[0], headerImageY, { width: fullWidth });

    // === INVOICE TO / REPORT TO BLOCK ===
    const infoY = headerImageY + 30;
    drawText('INVOICE TO', colX[0], infoY, { bold: true });
    drawText('REPORT TO', colX[3]-20, infoY, { bold: true });

    drawText(invoice.invoiceTo[0].company, colX[0], infoY + 10, { width: colX[2] - colX[0] - 4 });
    drawText(invoice.invoiceTo[0].address, colX[0], infoY + 20, { width: colX[2] - colX[0] - 4 });
    drawText(invoice.invoiceTo[0].gst, colX[0], infoY + 30, { width: colX[2] - colX[0] - 4 });

    drawText(invoice.reportTo.company, colX[3]-20, infoY + 10, { width: colX[6] - colX[3] - 4 });
    drawText(invoice.reportTo.address, colX[3]-20, infoY + 20, { width: colX[6] - colX[3] - 4 });
    drawText(invoice.reportTo.gst, colX[3]-20, infoY + 30, { width: colX[6] - colX[3] - 4 });

    // === TABLE HEADER IMAGE ===
    const tableHeaderPath = path.join(__dirname, '../assets/table.jpg');
    const tableHeaderY = infoY + 60;
    doc.image(tableHeaderPath, colX[0], tableHeaderY, { width: fullWidth });

    let tableY = tableHeaderY + 25; // tighter row height
    const headers = ['S.No', 'Description', 'Qty', 'Unit Rate', 'Discount', 'Total'];

    drawLine(colX[0], tableY, colX[6], tableY);
    headers.forEach((text, i) => {
      drawText(text, colX[i] + 2, tableY + 7, { width: colX[i + 1] - colX[i] - 4, align: 'center', bold: true });
    });
    drawLine(colX[0], tableY + 15, colX[6], tableY + 15);
    colX.forEach(x => drawLine(x, tableY, x, tableY + 15));

    tableY += 15;
    let subTotal = 0;

    invoice.items.forEach((item, i) => {
      const total = item.quantity * item.unitPrice - item.discount;
      subTotal += total;
      const row = [i + 1, item.description, item.quantity, item.unitPrice.toFixed(2), item.discount.toFixed(2), total.toFixed(2)];
      row.forEach((val, j) => drawText(val.toString(), colX[j] + 2, tableY + 7, { width: colX[j + 1] - colX[j] - 4, align: 'center' }));
      drawLine(colX[0], tableY, colX[6], tableY);
      colX.forEach(x => drawLine(x, tableY, x, tableY + 15));
      tableY += 15;
    });

    // Two empty rows
    for (let i = 0; i < 2; i++) {
      colX.forEach(x => drawLine(x, tableY, x, tableY + 15));
      drawLine(colX[0], tableY, colX[6], tableY);
      tableY += 15;
    }
    drawLine(colX[0], tableY, colX[6], tableY);

    // Totals inside table structure
    const totals = [
      ['SubTotal (INR):', subTotal],
      ['CGST 9%:', subTotal * 0.09],
      ['SGST 9%:', subTotal * 0.09],
      ['IGST (%):', 0],
      ['Rounding Off:', 0],
      ['Total (INR):', subTotal + subTotal * 0.09 * 2]
    ];

    totals.forEach(([label, value], i) => {
      drawText(label, colX[4] + 4, tableY + 2, { width: colX[5] - colX[4] - 8 });
      drawText(value.toFixed(2), colX[5] + 2, tableY + 2, { align: 'right', width: colX[6] - colX[5] - 4 });
      drawLine(colX[0], tableY, colX[6], tableY);
      colX.forEach(x => drawLine(x, tableY, x, tableY + 15));
      tableY += 15;
    });
    drawLine(colX[0], tableY, colX[6], tableY);

    const total = subTotal + subTotal * 0.09 * 2;
    const inWords = toWords(Math.round(total)).replace(/\s+/g, ' '); // Remove extra spaces
    drawText(`Total Invoice Amount (in words): ${inWords.charAt(0).toUpperCase() + inWords.slice(1)} rupees only.`, colX[0], tableY + 8, { size: 8, width: fullWidth });

    const pic3Path = path.join(__dirname, '../assets/pic3.png');
    const pic3Y = tableY + 35;
    doc.image(pic3Path, colX[0], pic3Y, { width: fullWidth });

// Add S.No. on the left and Date/Time on the right, at the end of the invoice
const serialNumber = `S.No.: ${invoice.serialNumber}`;
const dateTime = new Date(parseInt(invoice._id.toString().substring(0, 8), 16) * 1000).toLocaleString();

// Adjust the Y position to prevent overflow to a new page
const bottomMargin = 40; 
const positionY = doc.page.height - bottomMargin - 20;

drawText(serialNumber, colX[0], positionY, { size: 8 });
drawText(`Date/Time: ${dateTime}`, colX[6] - 250, positionY, { size: 8 });
    doc.end();
  });
};

module.exports = { generateInvoicePDF };