# CRM API Gateway Guide

**Base URL:** \`http://localhost:5000\`

The **API Gateway** acts as the single entry point for the entire CRM application. Instead of remembering different ports for different services, you only need to use **Port 5000**.

## Service Mapping

| Service | Original Port | Gateway Route (Port 5000) |
| :--- | :--- | :--- |
| **Auth Service** | 5001 | \`/api/auth\` |
| **Contact Service** | 5002 | \`/api/contacts\` |
| **Opportunity Service** | 5003 | \`/api/opportunities\` |
| **Task Service** | 5004 | \`/api/tasks\` |

## Example Usage

### 1. Register (Auth)
- **OLD:** \`http://localhost:5001/api/auth/register\`
- **NEW:** \`http://localhost:5000/api/auth/register\`

### 2. Get Contacts
- **OLD:** \`http://localhost:5002/api/contacts\`
- **NEW:** \`http://localhost:5000/api/contacts\`

### 3. Create Opportunity
- **OLD:** \`http://localhost:5003/api/opportunities\`
- **NEW:** \`http://localhost:5000/api/opportunities\`

### 4. Create Task
- **OLD:** \`http://localhost:5004/api/tasks\`
- **NEW:** \`http://localhost:5000/api/tasks\`

---
> [!NOTE]
> Ensure **ALL** services (Gateway, Auth, Contact, Opportunity, Task) are running for this to work.
