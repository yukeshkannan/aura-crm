# Notification Service API Documentation

**Version:** 1.0.0
**Base URL:** \`http://localhost:5005/api/notifications\` (Direct) or \`http://localhost:5000/api/notifications\` (Gateway)

## Overview

The Notification Service handles all email communications.
1.  **Manual Trigger:** You can send emails via API.
2.  **Automated Job:** Automatically checks for overdue tasks every minute (Demo Mode) and emails the admin.

## Endpoints

### 1. Send Manual Email

Trigger a custom email to any recipient.

-   **URL:** \`/api/notifications/email\`
-   **Method:** \`POST\`
-   **Data Params (JSON Body):**
    -   \`to\` (Required): Recipient Email
    -   \`subject\` (Required): Email Subject
    -   \`message\` (Required): Email Body (Text or HTML)

-   **Example Body:**
    \`\`\`json
    {
      "to": "client@example.com",
      "subject": "Welcome to Our CRM",
      "message": "<h1>Welcome!</h1><p>We are happy to have you.</p>"
    }
    \`\`\`

-   **Success Response:**
    -   **Code:** 200 OK
    -   **Content:** \`{ "success": true, "message": "Email sent successfully" }\`

---

## Automated Jobs (Cron)

### Overdue Task Reminder
-   **Schedule:** Runs every minute (for Demo purposes).
-   **Logic:**
    1.  Fetches all tasks from Task Service (`Port 5004`).
    2.  Filters for `Pending` tasks.
    3.  Sends an email reminder to the Admin (configured in `.env`) listing the pending tasks.
