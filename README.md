## Invoice Management System
This application provides functionalities for managing invoices, including creating invoices and generating PDFs.

# Features
Create Invoice: Automatically generate unique serial numbers and save invoices to the database.
List Invoices: Retrieve a list of all invoices stored in the system.
Generate PDF: Automatically create a PDF for each invoice upon creation.
Technologies Used
Node.js: JavaScript runtime for building server-side applications.
Express.js: Web framework for creating robust APIs.
MongoDB: NoSQL database for storing invoices.
Mongoose: ODM for MongoDB to streamline interactions.
pdfkit: Library for generating PDF documents.
Installation
# Clone the Repository:

BASH

git clone https://github.com/Manishka1/invoice-management.git
cd invoice-management
Install Dependencies:

BASH

npm install
Set Up MongoDB:
Ensure MongoDB is installed and running on your local machine.

 # Configure Environment Variables:
Create a .env file in the root directory and add your MongoDB connection string:


MONGODB_URI=mongodb://localhost:27017/invoiceDB
Start the Server:

BASH

npm start
Test the API:
Use Postman or curl to interact with the API endpoints.

API Endpoints
Create Invoice: POST /api/invoices/create

# Request Body:

JSON

Collapse
{
  "invoiceTo": [
    {
      "company": "Company Name",
      "address": "Company Address",
      "gst": "GST Number"
    }
  ],
  "reportTo": {
    "useSame": true,
    "company": "Company Name",
    "address": "Company Address",
    "gst": "GST Number"
  },
  "items": [
    {
      "description": "Item Description",
      "quantity": 10,
      "unitPrice": 100,
      "discount": 0
    }
  ],
  "totalAmount": 1000
}
Get Invoices: GET /api/invoices

# Response: Returns a list of all invoices.

# Error Handling
400 Bad Request: Triggered for incorrect input data.
500 Internal Server Error: Indicates server-side issues or database connection problems.
Contributing
Fork the Project.
Create Your Feature Branch: git checkout -b feature/YourFeatureName.
Commit Your Changes: git commit -m 'Add Your Feature'.
Push to the Branch: git push origin feature/YourFeatureName.
Open a Pull Request.
# License
This project is licensed under the MIT License.

# Contact
For questions or collaboration, please reach out to [manishka110518@example.com].


