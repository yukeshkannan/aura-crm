# 🔍 Global Search Service API Documentation

Base URL: `/api/search`

## Endpoints

### 1. Perform Search
**Endpoint:** `GET /`
**Description:** Searches across Contacts, Opportunities, Tickets, and Products.
**Query Parameters:**
- `q` (string): The search keyword (Required).

**Request Example:**
`GET /api/search?q=John`

**Response Example:**
```json
{
  "success": true,
  "query": "John",
  "results": {
    "contacts": {
      "count": 1,
      "data": [
        { "name": "John Doe", "email": "john@ex.com", ... }
      ]
    },
    "opportunities": {
      "count": 0,
      "data": []
    },
    "tickets": {
      "count": 1,
      "data": [
        { "title": "Login issue for John", "description": "...", ... }
      ]
    },
    "products": {
      "count": 0,
      "data": []
    }
  }
}
```
