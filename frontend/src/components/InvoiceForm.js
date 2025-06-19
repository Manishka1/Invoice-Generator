import React, { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { invoiceService } from '../services/invoiceService';
import styled from 'styled-components';

const FormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
`;

const SectionTitle = styled.h3`
  color: #333;
  border-bottom: 2px solid #4a90e2;
  padding-bottom: 10px;
  margin-bottom: 20px;
`;

const FormField = styled.div`
  margin-bottom: 15px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  resize: vertical;
  min-height: 100px;
`;

const FlexRow = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
`;

const Button = styled.button`
  background-color: #4a90e2;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #357abd;
  }

  &:disabled {
    background-color: #a0a0a0;
    cursor: not-allowed;
  }
`;

const ItemRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
`;

const TotalSection = styled.div`
  text-align: right;
  font-size: 18px;
  font-weight: bold;
  margin-top: 20px;
  padding: 10px 0;
  border-top: 1px solid #ddd;
`;

const Checkbox = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;

  input {
    margin-right: 10px;
  }
`;

const TableHeader = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
  font-weight: bold;
  color: #333;
`;

const TableHeaderItem = styled.div`
  flex: 1;
  text-align: center;
  padding: 5px;
`;

const InvoiceForm = () => {
  const [invoiceData, setInvoiceData] = useState({
    serialNumber: '',  // Adding serialNumber to state
    invoiceTo: [{ company: '', address: '', gst: '' }],
    reportTo: { useSame: false, company: '', address: '', gst: '' },
    items: [{ description: '', quantity: 1, unitPrice: 0, discount: 0 }]
  });

  const [createdInvoice, setCreatedInvoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInvoiceToChange = useCallback((index, e) => {
    const { name, value } = e.target;
    setInvoiceData(prev => {
      const updated = [...prev.invoiceTo];
      updated[index][name] = value;
      return { ...prev, invoiceTo: updated };
    });
  }, []);

  const handleSerialNumberChange = useCallback((e) => {
    const { value } = e.target;
    setInvoiceData(prev => ({
      ...prev,
      serialNumber: value
    }));
  }, []);

  const handleReportToChange = useCallback((e) => {
    const { name, value, checked } = e.target;
    setInvoiceData(prev => {
      if (name === 'useSame') {
        return {
          ...prev,
          reportTo: {
            ...prev.reportTo,
            useSame: checked,
            ...(checked ? { ...prev.invoiceTo[0] } : { company: '', address: '', gst: '' })
          }
        };
      }
      return {
        ...prev,
        reportTo: { ...prev.reportTo, [name]: value }
      };
    });
  }, []);

  const handleItemChange = useCallback((index, e) => {
    const { name, value } = e.target;
    setInvoiceData(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index][name] = name === 'description' ? value : Number(value);
      return { ...prev, items: updatedItems };
    });
  }, []);

  const addItem = useCallback(() => {
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, discount: 0 }]
    }));
  }, []);

  const removeItem = useCallback((index) => {
    setInvoiceData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  }, []);

  const calculateTotal = useCallback(() => {
    return invoiceData.items.reduce((total, item) => {
      const subtotal = item.quantity * item.unitPrice - (item.discount || 0);
      return total + subtotal;
    }, 0).toFixed(2);
  }, [invoiceData.items]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      ...invoiceData,
      totalAmount: parseFloat(calculateTotal())
    };

    try {
      console.log("Creating Invoice - Payload:", payload);
      const result = await invoiceService.createInvoice(payload);
      setCreatedInvoice(result.invoice);
      toast.success('Invoice created successfully!');
      setInvoiceData({
        serialNumber: '',  // Reset serialNumber
        invoiceTo: [{ company: '', address: '', gst: '' }],
        reportTo: { useSame: false, company: '', address: '', gst: '' },
        items: [{ description: '', quantity: 1, unitPrice: 0, discount: 0 }]
      });
    } catch (error) {
      if (error.response) {
        console.error('Invoice Creation Error:', error.response.data);
        toast.error(`Failed to create invoice: ${error.response.data.message}`);
      } else {
        console.error('Invoice Creation Error:', error);
        toast.error('Failed to create invoice');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [invoiceData, calculateTotal]);

  const handleDownloadInvoice = useCallback(async () => {
    if (!createdInvoice) return toast.error('No invoice to download');
    try {
      await invoiceService.downloadInvoicePDF(createdInvoice._id);
      toast.success('Invoice downloaded');
    } catch {
      toast.error('Failed to download invoice');
    }
  }, [createdInvoice]);

  return (
    <FormContainer>
      <form onSubmit={handleSubmit}>
        <SectionTitle>Invoice Details</SectionTitle>

        <FormField>
          <Input 
            name="serialNumber"
            value={invoiceData.serialNumber}
            onChange={handleSerialNumberChange}
            placeholder="Serial Number"
          />
        </FormField>

        <SectionTitle>Invoice To</SectionTitle>
        <FormField>
          <Input 
            name="company" 
            value={invoiceData.invoiceTo[0].company} 
            onChange={(e) => handleInvoiceToChange(0, e)} 
            placeholder="Company Name" 
          />
          <TextArea 
            name="address" 
            value={invoiceData.invoiceTo[0].address} 
            onChange={(e) => handleInvoiceToChange(0, e)} 
            placeholder="Company Address" 
          />
          <Input 
            name="gst" 
            value={invoiceData.invoiceTo[0].gst} 
            onChange={(e) => handleInvoiceToChange(0, e)} 
            placeholder="GST No." 
          />
        </FormField>

        <SectionTitle>Report To</SectionTitle>
        <Checkbox>
          <input 
            type="checkbox" 
            name="useSame" 
            checked={invoiceData.reportTo.useSame} 
            onChange={handleReportToChange} 
          />
          Same as Invoice To
        </Checkbox>

        {!invoiceData.reportTo.useSame && (
          <FormField>
            <Input 
              name="company" 
              value={invoiceData.reportTo.company} 
              onChange={handleReportToChange} 
              placeholder="Company Name" 
            />
            <TextArea 
              name="address" 
              value={invoiceData.reportTo.address} 
              onChange={handleReportToChange} 
              placeholder="Company Address" 
            />
            <Input 
              name="gst" 
              value={invoiceData.reportTo.gst} 
              onChange={handleReportToChange} 
              placeholder="GST No." 
            />
          </FormField>
        )}

        <SectionTitle>Invoice Items</SectionTitle>
        
        <TableHeader>
          <TableHeaderItem style={{ flex: 3 }}>Details</TableHeaderItem>
          <TableHeaderItem style={{ flex: 1 }}>Qty</TableHeaderItem>
          <TableHeaderItem style={{ flex: 1 }}>Unit Rate (INR)</TableHeaderItem>
          <TableHeaderItem style={{ flex: 1 }}>Discount (INR)</TableHeaderItem>
          <TableHeaderItem style={{ flex: 1 }}>Total (INR)</TableHeaderItem>
          <TableHeaderItem style={{ flex: 0.5 }}
                  ></TableHeaderItem> {/* For Remove button space */}
      </TableHeader>

      {invoiceData.items.map((item, i) => (
        <ItemRow key={i}>
          <Input 
            name="description" 
            value={item.description} 
            onChange={(e) => handleItemChange(i, e)} 
            placeholder="Item Description" 
            style={{ flex: 3 }}
          />
          <Input 
            name="quantity" 
            type="number" 
            value={item.quantity} 
            onChange={(e) => handleItemChange(i, e)} 
            placeholder="Qty" 
            style={{ flex: 1 }}
          />
          <Input 
            name="unitPrice" 
            type="number" 
            value={item.unitPrice} 
            onChange={(e) => handleItemChange(i, e)} 
            placeholder="Unit Price" 
            style={{ flex: 1 }}
          />
          <Input 
            name="discount" 
            type="number" 
            value={item.discount} 
            onChange={(e) => handleItemChange(i, e)} 
            placeholder="Discount" 
            style={{ flex: 1 }}
          />
          <Input 
            type="text" 
            readOnly 
            value={(item.quantity * item.unitPrice - item.discount).toFixed(2)} 
            style={{ flex: 1 }}
          />
          <Button 
            type="button" 
            onClick={() => removeItem(i)} 
            style={{ flex: 0.5 }}
          >
            Remove
          </Button>
        </ItemRow>
      ))}
      <Button type="button" onClick={addItem}>Add Item</Button>

      <TotalSection>
        Total: ₹{calculateTotal()}
      </TotalSection>

      <FlexRow>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Invoice'}
        </Button>

        {createdInvoice && (
          <Button type="button" onClick={handleDownloadInvoice}>
            Download Invoice
          </Button>
        )}
      </FlexRow>
    </form>
  </FormContainer>
  );
};

export default InvoiceForm;