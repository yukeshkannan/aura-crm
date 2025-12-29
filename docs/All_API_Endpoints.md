# 🌐 Company CRM - Full API Reference

Base URL: `http://localhost:5000` (API Gateway)

## 🔐 Auth Service (`/api/auth`)
- `POST /register`: Register new user.
- `POST /login`: Login and get Token.
- `GET /me`: Get current user details.

## 👥 Contact Service (`/api/contacts`)
- `GET /`: List all contacts.
- `GET /:id`: Get contact details.
- `POST /`: Create new contact.
- `PUT /:id`: Update contact.
- `DELETE /:id`: Delete contact.

## 💰 Opportunity Service (`/api/opportunities`)
- `GET /`: List all deals.
- `POST /`: Create new deal.
- `PUT /:id/stage`: Update deal stage (Won/Lost).

## 📦 Product Service (`/api/products`)
- `GET /`: List all products.
- `POST /`: Add new product to catalog.
- `PUT /:id`: Update price/stock.

## 🧾 Invoice Service (`/api/invoices`)
- `GET /`: List all invoices.
- `POST /`: Create invoice (Draft).
- `PUT /:id`: Update status (Sent/Paid).

## 🎫 Ticket Service (`/api/tickets`)
- `GET /`: List all support tickets.
- `POST /`: Raise new ticket.
- `PUT /:id`: Assign agent or resolve.

## ✅ Task Service (`/api/tasks`)
- `GET /`: List tasks.
- `POST /`: Create task.

## 📊 Analytics Service (`/api/analytics`)
- `GET /dashboard`: Get unified dashboard stats (Revenue, Leads, Tickets, Tasks).
