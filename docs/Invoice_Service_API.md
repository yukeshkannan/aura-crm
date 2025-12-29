# Invoice Service API Documentation

Base URL: `/api/invoices`

## Endpoints

### 1. Get All Invoices
**Endpoint:** `GET /`
**Description:** Retrieves a list of all invoices.
**Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "64f1b2c3e4b0d1a2f3c4e5d6",
      "customerName": "John Doe",
      "totalAmount": 1500,
      "status": "Draft",
      ...
    }
  ]
}
```

### 2. Get Single Invoice
**Endpoint:** `GET /:id`
**Description:** Retrieves a single invoice by its ID.
**Parameters:**
- `id` (path): The Object ID of the invoice.
**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

### 3. Create Invoice
**Endpoint:** `POST /`
**Description:** Creates a new invoice.
**Body:**
```json
{
  "customerId": "64f1...",       // ID of the Contact (Required)
  "customerName": "John Doe",    // Required
  "customerEmail": "john@example.com", // Required
  "dueDate": "2023-12-31",       // Required
  "totalAmount": 4500,           // Required
  "items": [
    {
      "description": "Web Development",
      "quantity": 1,
      "price": 1500
    },
    {
      "description": "App Development",
      "quantity": 1,
      "price": 3000
    }
  ]
}
```
**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

### 4. Update Invoice Status / Details
**Endpoint:** `PUT /:id`
**Description:** Updates an invoice.
**Body:**
```json
{
  "status": "Sent" // 'Draft', 'Sent', 'Paid', 'Overdue'
}
```
