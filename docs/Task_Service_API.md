# Task Service API Documentation

**Version:** 1.0.0
**Base URL:** \`http://localhost:5004/api/tasks\`

## Overview

The Task Service manages sales activities like calls, meetings, and emails. It allows you to schedule tasks, assign them to users, and link them to contacts.

## Endpoints

### 1. Get All Tasks

Retrieve a list of all tasks, sorted by due date (soonest first).

-   **URL:** \`/api/tasks\`
-   **Method:** \`GET\`
-   **Success Response:**
    -   **Code:** 200 OK
    -   **Content:**
        \`\`\`json
        {
          "success": true,
          "message": "Tasks retrieved successfully",
          "data": [
            {
              "_id": "60d0fe4f5311236168a109cc",
              "title": "Call new lead",
              "type": "Call",
              "status": "Pending",
              "priority": "High",
              "dueDate": "2023-11-01T10:00:00.000Z",
              "contactId": "60d0fe4f5311236168a109ca"
            }
          ]
        }
        \`\`\`

### 2. Get Single Task

Retrieve details of a specific task.

-   **URL:** \`/api/tasks/:id\`
-   **Method:** \`GET\`
-   **URL Params:** \`id=[string]\`
-   **Success Response:**
    -   **Code:** 200 OK
    -   **Content:**
        \`\`\`json
        {
          "success": true,
          "message": "Task retrieved successfully",
          "data": { ... }
        }
        \`\`\`
-   **Error Response:**
    -   **Code:** 404 Not Found
    -   **Content:** \`{ "success": false, "message": "Task not found" }\`

### 3. Create New Task

Schedule a new activity.

-   **URL:** \`/api/tasks\`
-   **Method:** \`POST\`
-   **Data Params (JSON Body):**
    -   \`title\` (Required): String
    -   \`type\` (Optional): String ('Call', 'Meeting', 'Email', 'Other') - Default: 'Call'
    -   \`status\` (Optional): String ('Pending', 'In Progress', 'Completed', 'Cancelled') - Default: 'Pending'
    -   \`priority\` (Optional): String ('Low', 'Medium', 'High') - Default: 'Medium'
    -   \`dueDate\` (Optional): Date String
    -   \`contactId\` (Optional): String (ID of related Contact)
    -   \`assignedTo\` (Optional): String (ID of assigned User)
    -   \`description\` (Optional): String

-   **Example Body:**
    \`\`\`json
    {
      "title": "Weekly Status Meeting",
      "type": "Meeting",
      "priority": "High",
      "dueDate": "2023-12-25T14:00:00.000Z",
      "contactId": "64f1a2b..."
    }
    \`\`\`

-   **Success Response:**
    -   **Code:** 201 Created
    -   **Content:**
        \`\`\`json
        {
          "success": true,
          "message": "Task created successfully",
          "data": { ... }
        }
        \`\`\`

### 4. Update Task

Update task details (e.g., mark as completed, reschedule).

-   **URL:** \`/api/tasks/:id\`
-   **Method:** \`PUT\`
-   **URL Params:** \`id=[string]\`
-   **Example Body:**
    \`\`\`json
    {
      "status": "Completed"
    }
    \`\`\`
-   **Success Response:** 200 OK

### 5. Delete Task

Remove a task.

-   **URL:** \`/api/tasks/:id\`
-   **Method:** \`DELETE\`
-   **Success Response:** 200 OK
