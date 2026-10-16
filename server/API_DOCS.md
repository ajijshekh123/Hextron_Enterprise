# Hextron Enterprises — REST API v1 Specification

Base URL: `http://localhost:5000/api/v1`

All requests expecting or returning a JSON body use `Content-Type: application/json`.
Protected endpoints require `Authorization: Bearer <JWT_TOKEN>`.

---

## 1. Authentication & Security Endpoints (`/api/v1/auth`)

### `POST /api/v1/auth/login`
- **Description:** Authenticate user and issue JWT token. Subject to strict brute-force rate limiting (15 attempts / 15 mins).
- **Body:**
  ```json
  {
    "email": "admin@hextron-demo.internal",
    "password": "DemoAdmin@2026!"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "id": "usr_admin",
        "email": "admin@hextron-demo.internal",
        "role": "ADMIN",
        "employee": {
          "id": "emp_01",
          "fullName": "Rajesh M. Patel",
          "designation": "Managing Partner & Machine Shop Head",
          "department": "Operations & Management",
          "employeeCode": "EMP-001"
        }
      }
    }
  }
  ```

### `GET /api/v1/auth/me`
- **Description:** Retrieve currently authenticated user context.
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Response (200 OK):** User context object.

### `POST /api/v1/auth/logout`
- **Description:** Terminate client session.

### `POST /api/v1/auth/setup-admin`
- **Description:** Safely initialize the first administrator if database has zero users. Disabled once an administrator exists.

---

## 2. Dashboard Endpoints (`/api/v1/dashboard`)

### `GET /api/v1/dashboard/metrics`
- **Description:** Returns real database-driven metrics and recent activity stream.
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Permissions:** `ADMIN`, `SALES`, `EMPLOYEE`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "metrics": {
        "totalQuotations": 4,
        "pendingQuotations": 2,
        "totalEnquiries": 3,
        "unresolvedEnquiries": 2,
        "activeProducts": 6,
        "activeCategories": 5,
        "activeEmployees": 4
      },
      "recentActivity": {
        "quotations": [...],
        "enquiries": [...]
      }
    }
  }
  ```

---

## 3. Quotation Management (`/api/v1/quotations`)

### `POST /api/v1/quotations/public`
- **Description:** Public quote request submission from corporate website. Rate limited (20 req / 15 mins).
- **Body:**
  ```json
  {
    "fullName": "Vikram Seth",
    "companyName": "Apex Machinery & Pumps Pvt Ltd",
    "email": "vikram@apexmachinery.in",
    "phone": "+91 9825123456",
    "serviceType": "CNC Turning Job Work",
    "material": "EN24 Alloy Steel",
    "quantity": 500,
    "requirements": "Batch production of stepped drive shaft per drawing DWG-2026-AP-04 rev B",
    "drawingRef": "DWG-2026-AP-04-revB.pdf"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Quotation request submitted successfully...",
    "data": {
      "quotationNumber": "HEX-QT-2026-0005",
      "status": "NEW"
    }
  }
  ```

### `GET /api/v1/quotations`
- **Description:** List quotations with search, status filters, and pagination.
- **Query Params:** `status=ALL|NEW|UNDER_REVIEW|QUOTED|ACCEPTED|REJECTED|CLOSED`, `search=...`, `page=1`, `limit=20`
- **Headers:** `Authorization: Bearer <TOKEN>`

### `GET /api/v1/quotations/:id`
- **Description:** Retrieve single quotation with line items, audit history, customer, and internal notes.

### `POST /api/v1/quotations`
- **Description:** Staff manual creation of full quotation with multi-line items.
- **Permissions:** `ADMIN`, `SALES`
- **Body:**
  ```json
  {
    "customerName": "Vikram Seth",
    "companyName": "Apex Machinery",
    "email": "vikram@apexmachinery.in",
    "phone": "+91 9825123456",
    "componentName": "Stepped Drive Shaft",
    "materialType": "EN24",
    "discountPercent": 5,
    "taxRate": 18,
    "estimatedDelivery": "10 working days",
    "items": [
      {
        "partName": "Drive Shaft Dia 32x180",
        "quantity": 500,
        "unit": "PCS",
        "unitPrice": 175.00
      }
    ]
  }
  ```

### `PATCH /api/v1/quotations/:id/status`
- **Description:** Transition quotation status and record audit log entry with remarks.
- **Permissions:** `ADMIN`, `SALES`
- **Body:** `{ "status": "QUOTED", "remarks": "Rate approved by engineering lead" }`

### `POST /api/v1/quotations/:id/notes`
- **Description:** Add internal note to quotation (hidden from customers).

### `DELETE /api/v1/quotations/:id`
- **Description:** Archive quotation. (ADMIN only)

---

## 4. Contact Enquiry Management (`/api/v1/enquiries`)

### `POST /api/v1/enquiries/public`
- **Description:** Public submission from Contact Us form with rate limiting & anti-spam.
- **Body:** `{ "name": "...", "email": "...", "phone": "...", "subject": "...", "message": "..." }`

### `GET /api/v1/enquiries`
- **Description:** Staff list of enquiries with status filters (`NEW`, `IN_PROGRESS`, `RESPONDED`, `CLOSED`).

### `GET /api/v1/enquiries/:id`
- **Description:** Get single enquiry with notes and assigned employee.

### `PATCH /api/v1/enquiries/:id`
- **Description:** Update status, assign employee, or set follow-up date.

### `POST /api/v1/enquiries/:id/notes`
- **Description:** Add internal note.

---

## 5. Product Management (`/api/v1/products`)

- `GET /api/v1/products`: Public catalog of active and visible products (with search & category filter).
- `GET /api/v1/products/:id`: Public single product detail view.
- `GET /api/v1/products/admin/all`: Staff listing of all products.
- `POST /api/v1/products`: Create product (ADMIN, SALES).
- `PUT /api/v1/products/:id`: Update product (ADMIN, SALES).
- `DELETE /api/v1/products/:id`: Delete product (ADMIN only).

---

## 6. Category Management (`/api/v1/categories`)

- `GET /api/v1/categories`: Public list of active categories.
- `GET /api/v1/categories/admin`: Staff list with assigned product counts.
- `POST /api/v1/categories`: Create category (ADMIN only).
- `PUT /api/v1/categories/:id`: Update category (ADMIN only).
- `PATCH /api/v1/categories/:id/status`: Toggle active status (ADMIN only).
- `DELETE /api/v1/categories/:id`: Delete category with constraint check (rejects if products are attached).

---

## 7. Employee Management (`/api/v1/employees`)

- `GET /api/v1/employees`: List employees with department filter and search.
- `GET /api/v1/employees/:id`: Retrieve employee profile.
- `POST /api/v1/employees`: Add employee (ADMIN only).
- `PUT /api/v1/employees/:id`: Edit employee (ADMIN only).
- `PATCH /api/v1/employees/:id/status`: Toggle active status (ADMIN only).

---

## 8. User & Role Management (`/api/v1/users`)

- `GET /api/v1/users`: List users with role badge (ADMIN only).
- `POST /api/v1/users`: Create user account with bcrypt password hashing (ADMIN only).
- `PUT /api/v1/users/:id`: Update role or active status (ADMIN only).
- `POST /api/v1/users/:id/reset-password`: Reset user password (ADMIN only).

---

## 9. System Settings (`/api/v1/settings`)

- `GET /api/v1/settings`: Retrieve quotation numbering prefix, default tax rate, and email readiness status.
- `PUT /api/v1/settings`: Update settings (ADMIN only).
