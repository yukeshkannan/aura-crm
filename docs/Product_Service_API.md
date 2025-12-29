# Product Service API Documentation

Base URL: `/api/products`

## Endpoints

### 1. Get All Products
**Endpoint:** `GET /`
**Description:** Retrieves a list of all products.
**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "64f1b2c3e4b0d1a2f3c4e5d6",
      "name": "Web Development",
      "sku": "WEB-DEV-001",
      "price": 1500,
      "description": "Full stack web development",
      "category": "Service",
      "stock": 0,
      "createdAt": "2023-09-01T10:00:00.000Z"
    }
  ]
}
```

### 2. Get Single Product
**Endpoint:** `GET /:id`
**Description:** Retrieves a single product by its ID.
**Parameters:**
- `id` (path): The Object ID of the product.
**Response:**
```json
{
  "success": true,
  "data": {
    "name": "Web Development",
    ...
  }
}
```

### 3. Create Product
**Endpoint:** `POST /`
**Description:** Creates a new product.
**Body:**
```json
{
  "name": "Mobile App Development",  // Required
  "sku": "MOB-APP-001",            // Required, Unique
  "price": 2500,                   // Required
  "description": "iOS and Android app development",
  "category": "Service",           // Enum: 'Software', 'Hardware', 'Service', 'Subscription'
  "stock": 10
}
```
**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

### 4. Update Product
**Endpoint:** `PUT /:id`
**Description:** Updates an existing product.
**Body:** (Any of the product fields)
```json
{
  "price": 2600,
  "stock": 5
}
```

### 5. Delete Product
**Endpoint:** `DELETE /:id`
**Description:** Deletes a product.
**Response:**
```json
{
  "success": true,
  "data": {}
}
```
