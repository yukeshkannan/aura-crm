# Ticket Service API Documentation

Base URL: `/api/tickets`

## Endpoints

### 1. Get All Tickets
**Endpoint:** `GET /`
**Description:** Retrieves a list of all support tickets.
**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "64f1b2c3e4b0d1a2f3c4e5d6",
      "title": "Login Issue",
      "status": "Open",
      "priority": "High",
      ...
    }
  ]
}
```

### 2. Get Single Ticket
**Endpoint:** `GET /:id`
**Description:** Retrieves a single ticket by its ID.
**Parameters:**
- `id` (path): The Object ID of the ticket.
**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

### 3. Create Ticket
**Endpoint:** `POST /`
**Description:** Creates a new support ticket.
**Body:**
```json
{
  "customerId": "64f1...",       // ID of the Contact (Required)
  "title": "Cannot download PDF", // Required
  "description": "When I click download, it shows 404 error", // Required
  "priority": "High",            // 'Low', 'Medium', 'High', 'Critical'
  "status": "Open",              // 'Open', 'In Progress', 'Resolved', 'Closed'
  "assignedTo": "Support Agent 1" // Optional
}
```
**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

### 4. Update Ticket
**Endpoint:** `PUT /:id`
**Description:** Updates a ticket status or details.
**Body:**
```json
{
  "status": "Resolved",
  "assignedTo": "Yukesh"
}
```

### 5. Delete Ticket
**Endpoint:** `DELETE /:id`
**Description:** Deletes a ticket.
**Response:**
```json
{
  "success": true,
  "data": {}
}
```
