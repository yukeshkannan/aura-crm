# Analytics Service API Documentation

**Version:** 1.0.0
**Base URL:** \`http://localhost:5006/api/analytics\` (Direct) or \`http://localhost:5000/api/analytics\` (Gateway)

## Overview

The Analytics Service aggregates data from all other services to provide high-level insights for the Dashboard.

## Endpoints

### 1. Get Dashboard Data

Retrieve a consolidated report of Contacts, Revenue, and Tasks.

-   **URL:** \`/api/analytics/dashboard\`
-   **Method:** \`GET\`
-   **Success Response:**
    -   **Code:** 200 OK
    -   **Content:**
        \`\`\`json
        {
          "success": true,
          "message": "Dashboard data retrieved",
          "data": {
            "overview": {
              "totalRevenue": 150000,
              "totalContacts": 25,
              "totalDeals": 5,
              "winRate": "40.0%"
            },
            "actionItems": {
              "pendingTasks": 3,
              "newLeads": 5
            },
            "breakdown": {
              "dealsWon": 2,
              "dealsLost": 1,
              "activeDeals": 2
            }
          }
        }
        \`\`\`

---
> [!NOTE]
> If any service (e.g., Contact Service) is down, it will return processed data based on available services (empty data for the failed one).
