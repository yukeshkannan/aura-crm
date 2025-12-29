# CRM Manual Testing Cheat Sheet (with JSON Samples)

**Gateway URL:** \`http://localhost:5000\`
*All requests should be sent to this URL.*

---

## 1. Auth Service

### Register New User
**POST** \`/api/auth/register\`
```json
{
  "name": "Arun Kumar",
  "email": "arun.sales@company.com",
  "password": "securePassword123",
  "designation": "Sales Executive",
  "department": "Sales"
}
```
*(Note: Role will automatically be set to 'Employee')*

### Login
**POST** \`/api/auth/login\`
```json
{
  "email": "arun.sales@company.com",
  "password": "securePassword123"
}
```

---

## 2. Contact Service (Leads/Customers)

### Create New Contact
**POST** \`/api/contacts\`
```json
{
  "name": "Ravi Teja",
  "email": "ravi.t@client_corp.com",
  "phone": "+91 98765 43210",
  "company": "Client Corp",
  "status": "New"
}
```

### Update Contact Status
**PUT** \`/api/contacts/:id\`
*(Replace :id with the actual ID from the Create response)*
```json
{
  "status": "Qualified",
  "company": "Client Corp Global"
}
```

---

## 3. Opportunity Service (Deals)

### Create New Deal
**POST** \`/api/opportunities\`
*(Requires a valid Contact ID)*
```json
{
  "title": "Annual Maintenance Contract",
  "amount": 150000,
  "stage": "Proposal",
  "contactId": "64f1a2b3c9e77b0012345678",
  "expectedCloseDate": "2023-12-31"
}
```

### Update Deal Stage
**PUT** \`/api/opportunities/:id\`
```json
{
  "stage": "Negotiation",
  "amount": 140000
}
```

---

## 4. Task Service (Activities)

### Create Call Task
**POST** \`/api/tasks\`
```json
{
  "title": "Follow up on Proposal",
  "type": "Call",
  "priority": "High",
  "dueDate": "2023-12-05T10:00:00.000Z",
  "description": "Call Ravi to discuss the AMC pricing."
}
```

### Create Meeting Task
**POST** \`/api/tasks\`
```json
{
  "title": "Final Negotiation Meeting",
  "type": "Meeting",
  "priority": "Medium",
  "dueDate": "2023-12-10T14:30:00.000Z",
  "assignedTo": "64f1a2b3c9e77b0087654321"
}
```

---

## 5. Document Service (Files)

### Upload File (Postman/Thunder Client)
**POST** \`/api/documents/upload\`
1.  **Body Tab:** Select `form-data`.
2.  **Key:** `file` (Change Type from Text to File).
3.  **Value:** Select a PDF or Image from your computer.

### View File
**GET** \`/api/documents/{filename}\`
*(Copy filename from Upload response)*

---

## 🛑 Quick Tip
If you are using **Postman**:
1.  Select **POST** or **PUT**.
2.  Go to **Body** tab.
3.  Select **raw** and then **JSON**.
4.  Paste the sample code from above.
