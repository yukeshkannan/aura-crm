# 🎫 Ticket System Guide for CRM Users

## 🤔 What is a Ticket System?

Imagine a "Complaint Box" but digital and smarter.
When a customer has a problem ("My login is not working", "Where is my invoice?"), they raise a **Ticket**.

This system helps our Support Team:
1.  **Track Issues:** Nothing gets lost in emails.
2.  **Assign Work:** "John, you handle technical issues. Sarah, you handle billing."
3.  **Prioritize:** Fix "Server Down" (Critical) before "Spelling Mistake" (Low).

---

## 🔄 The Flow

1.  **Issue Raised:** A Ticket is created (Status: `Open`).
2.  **Triage:** Manager sees the ticket and sets **Priority** (`High`) and **Assigns** it to an Agent.
3.  **Work in Progress:** Agent starts working (Status: `In Progress`).
4.  **Resolution:** Agent fixes it (Status: `Resolved`).
5.  **Closure:** Customer confirms the fix (Status: `Closed`).

---

## 🛠️ API Endpoints Cheat Sheet

Base URL: `http://localhost:5000/api/tickets`

### 1. Create a Ticket (Customer/Admin)
**POST** `/`
```json
{
  "customerId": "64f...",
  "title": "Cannot access dashboard",
  "description": "Getting 403 Forbidden error",
  "priority": "High"
}
```

### 2. View All Tickets (Dashboard)
**GET** `/`
- Shows list of all tickets.
- Use this to build the Admin Support Panel.

### 3. Update Status (Agent)
**PUT** `/:id`
```json
{
  "status": "In Progress",
  "assignedTo": "Yukesh"
}
```

### 4. Delete Ticket (Admin)
**DELETE** `/:id`

---

## 💡 Best Practices
- **Priority Levels:**
    - **Critical:** System down, data loss (Fix immediately).
    - **High:** Feature broken, cannot work (Fix today).
    - **Medium:** Annoyance, workaround available (Fix this week).
    - **Low:** Cosmetic issue, typo (Fix when free).
