# Opportunity Service API Documentation

**Version:** 1.0.0
**Base URL:** \`http://localhost:5003/api/opportunities\`

## Overview

The Opportunity Service manages the "Deals" or Sales Pipeline. It allows you to track potential revenue, deal stages, and link them to contacts.

## Endpoints

### 1. Get All Opportunities

Retrieve a list of all opportunities, sorted by newest first.

-   **URL:** \`/api/opportunities\`
-   **Method:** \`GET\`
-   **Success Response:**
    -   **Code:** 200 OK
    -   **Content:**
        \`\`\`json
        {
          "success": true,
          "message": "Opportunities retrieved successfully",
          "data": [
            {
              "_id": "60d0fe4f5311236168a109cb",
              "title": "Website Redesign Project",
              "amount": 50000,
              "stage": "Proposal",
              "contactId": "60d0fe4f5311236168a109ca",
              "createdAt": "2023-10-27T10:00:00.000Z"
            }
          ]
        }
        \`\`\`

### 2. Get Single Opportunity

Retrieve details of a specific opportunity.

-   **URL:** \`/api/opportunities/:id\`
-   **Method:** \`GET\`
-   **URL Params:** \`id=[string]\`
-   **Success Response:**
    -   **Code:** 200 OK
    -   **Content:**
        \`\`\`json
        {
          "success": true,
          "message": "Opportunity retrieved successfully",
          "data": { ... }
        }
        \`\`\`
-   **Error Response:**
    -   **Code:** 404 Not Found
    -   **Content:** \`{ "success": false, "message": "Opportunity not found" }\`

### 3. Create New Opportunity

Add a new deal to the pipeline.

-   **URL:** \`/api/opportunities\`
-   **Method:** \`POST\`
-   **Data Params (JSON Body):**
    -   \`title\` (Required): String
    -   \`amount\` (Required): Number
    -   \`contactId\` (Required): String (ID of the related Contact)
    -   \`stage\` (Optional): String ('New', 'Discovery', 'Proposal', 'Negotiation', 'Won', 'Lost') - Default: 'New'
    -   \`expectedCloseDate\` (Optional): Date String

-   **Example Body:**
    \`\`\`json
    {
      "title": "Mobile App Development",
      "amount": 120000,
      "contactId": "64f1a2b...",
      "stage": "Discovery"
    }
    \`\`\`

-   **Success Response:**
    -   **Code:** 201 Created
    -   **Content:**
        \`\`\`json
        {
          "success": true,
          "message": "Opportunity created successfully",
          "data": { ... }
        }
        \`\`\`

### 4. Update Opportunity

Update deal details (e.g., move to next stage, change amount).

-   **URL:** \`/api/opportunities/:id\`
-   **Method:** \`PUT\`
-   **URL Params:** \`id=[string]\`
-   **Example Body:**
    \`\`\`json
    {
      "stage": "Won",
      "amount": 115000
    }
    \`\`\`
-   **Success Response:** 200 OK

### 5. Delete Opportunity

Remove a deal from the pipeline.

-   **URL:** \`/api/opportunities/:id\`
-   **Method:** \`DELETE\`
-   **Success Response:** 200 OK
