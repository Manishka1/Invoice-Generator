import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import components
import CreateInvoice from './pages/CreateInvoice';
import InvoiceHistory from './pages/InvoiceHistory';
import InvoiceDetails from './components/InvoiceDetails';

// Import styles
import './styles/global.css';
import './styles/navbar.css';
import './styles/invoiceForm.css';
import './styles/invoiceList.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="navbar-container">
            <div className="navbar-logo">Invoice Generator</div>
            <div className="navbar-links">
              <Link to="/">Create Invoice</Link>
              <Link to="/history">Invoice History</Link>
            </div>
          </div>
        </nav>

        <div className="container">
          <Routes>
            <Route path="/" element={<CreateInvoice />} />
            <Route path="/history" element={<InvoiceHistory />} />
            <Route path="/invoices/:invoiceId" element={<InvoiceDetails />} />
          </Routes>
        </div>

        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;
