# Contact Service API Documentation

**Version:** 1.0.0
**Base URL:** \`http://localhost:5002/api/contacts\`

## Overview

The Contact Service allows you to manage customer and lead information. It supports full CRUD (Create, Read, Update, Delete) operations.

## Authentication

*Currently, this service is **Public**. In the future, it will require a JWT token from the Auth Service.*

---

## Endpoints

### 1. Get All Contacts

Retrieve a list of all stored contacts, sorted by newest first.

-   **URL:** \`/api/contacts\`
-   **Method:** \`GET\`
-   **Success Response:**
    -   **Code:** 200 OK
    -   **Content:**
        \`\`\`json
        {
          "success": true,
          "message": "Contacts retrieved successfully",
          "data": [
            {
              "_id": "60d0fe4f5311236168a109ca",
              "name": "Arun Kumar",
              "email": "arun@example.com",
              "phone": "9876543210",
              "company": "Tech Solutions",
              "status": "New",
              "createdAt": "2023-10-27T10:00:00.000Z"
            }
          ]
        }
        \`\`\`

### 2. Get Single Contact

Retrieve details of a specific contact by their ID.

-   **URL:** \`/api/contacts/:id\`
-   **Method:** \`GET\`
-   **URL Params:** \`id=[string]\`
-   **Success Response:**
    -   **Code:** 200 OK
    -   **Content:**
        \`\`\`json
        {
          "success": true,
          "message": "Contact retrieved successfully",
          "data": { ... }
        }
        \`\`\`
-   **Error Response:**
    -   **Code:** 404 Not Found
    -   **Content:** \`{ "success": false, "message": "Contact not found" }\`

### 3. Create New Contact

Add a new contact to the database.

-   **URL:** \`/api/contacts\`
-   **Method:** \`POST\`
-   **Data Params (JSON Body):**
    -   \`name\` (Required): String
    -   \`email\` (Required): String
    -   \`phone\` (Optional): String
    -   \`company\` (Optional): String
    -   \`status\` (Optional): String ('New', 'Contacted', 'Qualified', 'Lost', 'Customer') - Default: 'New'

-   **Example Body:**
    \`\`\`json
    {
      "name": "Priya Sharma",
      "email": "priya@business.com",
      "phone": "+91 9988776655",
      "company": "Innovate Inc"
    }
    \`\`\`

-   **Success Response:**
    -   **Code:** 201 Created
    -   **Content:**
        \`\`\`json
        {
          "success": true,
          "message": "Contact created successfully",
          "data": { ... }
        }
        \`\`\`

### 4. Update Contact

Update an existing contact's information.

-   **URL:** \`/api/contacts/:id\`
-   **Method:** \`PUT\`
-   **URL Params:** \`id=[string]\`
-   **Data Params:** Any of the fields used in creation.
-   **Example Body:**
    \`\`\`json
    {
      "status": "Qualified"
    }
    \`\`\`
-   **Success Response:** 200 OK

### 5. Delete Contact

Remove a contact permanently.

-   **URL:** \`/api/contacts/:id\`
-   **Method:** \`DELETE\`
-   **Success Response:**
    -   **Code:** 200 OK
    -   **Content:**
        \`\`\`json
        {
          "success": true,
          "message": "Contact deleted successfully",
          "data": {}
        }
        \`\`\`
