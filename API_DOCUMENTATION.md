# CQMR — Backend API Documentation

Base URL: `http://localhost:3000/api/v1`  
Authentication: Bearer token via `Authorization: Bearer <token>` header  
Content-Type: `application/json`

---

## Authentication

### POST `/auth/login`
Authenticate user and obtain access token.
```json
// Request
{ "email": "string", "password": "string" }

// Response 200
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { "id": "uuid", "name": "string", "email": "string", "role": "admin|approver|finance|maker", "isActive": true }
  }
}
```

### POST `/auth/logout`
Invalidate current session.  
**Auth required.** No request body.
```json
// Response 200
{ "success": true, "message": "Logged out successfully" }
```

### GET `/auth/me`
Get the currently authenticated user's profile.  
**Auth required.**
```json
// Response 200
{ "success": true, "data": { /* User object */ } }
```

### POST `/auth/refresh`
Refresh access token.  
**Auth required.**
```json
// Response 200
{ "success": true, "data": { "token": "newToken..." } }
```

### POST `/auth/change-password`
**Auth required.**
```json
// Request
{ "currentPassword": "string", "newPassword": "string" }
// Response 200
{ "success": true, "message": "Password changed successfully" }
```

---

## Users

All endpoints require authentication. Admin role required for write operations.

### GET `/users`
List all users.
```
Query params: page, limit, search, sortBy, sortOrder
```
```json
// Response 200
{
  "success": true,
  "data": [{ "id": "uuid", "name": "string", "email": "string", "role": "string", "isActive": true, "createdAt": "ISO8601" }],
  "meta": { "total": 5, "page": 1, "limit": 20, "totalPages": 1 }
}
```

### GET `/users/:id`
Get a single user.
```json
// Response 200
{ "success": true, "data": { /* User object */ } }
```

### POST `/users`
Create a new user. **Admin only.**
```json
// Request
{ "name": "string", "email": "string", "role": "admin|approver|finance|maker", "password": "string" }
// Response 201
{ "success": true, "message": "User created", "data": { /* User object */ } }
```

### PUT `/users/:id`
Update user. **Admin only.**
```json
// Request (all fields optional)
{ "name": "string", "email": "string", "role": "string" }
// Response 200
{ "success": true, "message": "User updated", "data": { /* User object */ } }
```

### DELETE `/users/:id`
Soft-delete user. **Admin only.**
```json
// Response 200
{ "success": true, "message": "User deleted" }
```

### PATCH `/users/:id/toggle-status`
Toggle user active/inactive. **Admin only.**
```json
// Response 200
{ "success": true, "data": { "isActive": false } }
```

---

## Company

### GET `/company`
Get company profile.
```json
// Response 200
{
  "success": true,
  "data": {
    "id": "uuid", "name": "string", "logo": "url|null",
    "address": "string", "city": "string", "state": "string",
    "country": "string", "pincode": "string", "phone": "string",
    "email": "string", "website": "string|null",
    "gstin": "string|null", "pan": "string|null"
  }
}
```

### PUT `/company`
Update company profile. **Admin only.**
```json
// Request (all fields optional)
{ "name": "string", "address": "string", "city": "string", "state": "string", "country": "string", "pincode": "string", "phone": "string", "email": "string", "website": "string", "gstin": "string", "pan": "string" }
```

### POST `/company/logo`
Upload company logo. **Admin only.**  
Content-Type: `multipart/form-data`
```
Form field: logo (file, max 2MB, image/png|jpeg|svg)
```
```json
// Response 200
{ "success": true, "data": { "url": "https://cdn.example.com/logos/company.png" } }
```

---

## Rate Cards

### GET `/rate-cards`
```
Query params: page, limit, search, sortBy, sortOrder
```
```json
// Response 200
{
  "success": true,
  "data": [{
    "id": "uuid", "name": "string", "description": "string|null",
    "laborType": "string", "hourlyRate": 450.00, "currency": "INR",
    "effectiveFrom": "2025-01-01", "effectiveTo": "string|null",
    "isActive": true, "createdAt": "ISO8601"
  }]
}
```

### GET `/rate-cards/:id`
Get a single rate card.

### POST `/rate-cards`
Create rate card. **Admin only.**
```json
{ "name": "string", "description": "string", "laborType": "string", "hourlyRate": 450, "currency": "INR", "effectiveFrom": "2025-01-01", "effectiveTo": "string|null", "isActive": true }
```

### PUT `/rate-cards/:id`
Update rate card. **Admin only.**

### DELETE `/rate-cards/:id`
Delete rate card. **Admin only.**

---

## Overhead Rates

### GET `/overhead-rates`
```json
// Response data item shape:
{ "id": "uuid", "name": "string", "description": "string|null", "rateType": "percentage|fixed", "value": 12.0, "applicableTo": "all|labor|materials|subcontract", "isActive": true, "createdAt": "ISO8601" }
```

### GET `/overhead-rates/:id`
### POST `/overhead-rates`
```json
{ "name": "string", "description": "string", "rateType": "percentage|fixed", "value": 12, "applicableTo": "all|labor|materials|subcontract", "isActive": true }
```
### PUT `/overhead-rates/:id`
### DELETE `/overhead-rates/:id`

---

## Tax Configurations

### GET `/tax-configs`
```json
// Response data item shape:
{ "id": "uuid", "name": "string", "taxType": "GST|CGST|SGST|IGST|VAT", "rate": 18.0, "description": "string|null", "isActive": true, "createdAt": "ISO8601" }
```

### GET `/tax-configs/:id`
### POST `/tax-configs`
```json
{ "name": "string", "taxType": "GST|CGST|SGST|IGST|VAT", "rate": 18, "description": "string", "isActive": true }
```
### PUT `/tax-configs/:id`
### DELETE `/tax-configs/:id`

---

## Clients

### GET `/clients`
```
Query params: page, limit, search, sortBy, sortOrder
```
```json
// Response data item shape:
{
  "id": "uuid", "name": "string", "contactPerson": "string",
  "email": "string", "phone": "string", "address": "string",
  "city": "string", "state": "string", "country": "string", "pincode": "string|null",
  "currency": "INR|USD|EUR|GBP", "gstin": "string|null", "pan": "string|null",
  "creditLimit": 500000, "paymentTerms": "immediate|net15|net30|net45|net60",
  "isActive": true, "createdAt": "ISO8601"
}
```

### GET `/clients/:id`
### POST `/clients`
```json
{ "name": "string", "contactPerson": "string", "email": "string", "phone": "string", "address": "string", "city": "string", "state": "string", "country": "string", "pincode": "string", "currency": "INR", "gstin": "string", "pan": "string", "creditLimit": 500000, "paymentTerms": "net30", "isActive": true }
```
### PUT `/clients/:id`
### DELETE `/clients/:id`
Soft-delete (sets `isActive: false`).
### PATCH `/clients/:id/toggle-status`

---

## Vendors

### GET `/vendors`
```
Query params: page, limit, search, sortBy, sortOrder
```
```json
// Response data item shape:
{
  "id": "uuid", "name": "string", "contactPerson": "string",
  "email": "string", "phone": "string", "address": "string",
  "city": "string", "state": "string", "country": "string", "pincode": "string|null",
  "vendorType": "material_supplier|subcontractor|equipment|labor|service",
  "gstin": "string|null", "pan": "string|null",
  "bankAccountNo": "string|null", "bankIfsc": "string|null", "bankName": "string|null",
  "isActive": true, "createdAt": "ISO8601"
}
```

### GET `/vendors/:id`
### POST `/vendors`
```json
{ "name": "string", "contactPerson": "string", "email": "string", "phone": "string", "address": "string", "city": "string", "state": "string", "country": "string", "pincode": "string", "vendorType": "material_supplier", "gstin": "string", "pan": "string", "bankAccountNo": "string", "bankIfsc": "string", "bankName": "string", "isActive": true }
```
### PUT `/vendors/:id`
### DELETE `/vendors/:id`
### PATCH `/vendors/:id/toggle-status`

---

## Staff

### GET `/staff`
```
Query params: page, limit, search, sortBy, sortOrder
```
```json
// Response data item shape:
{
  "id": "uuid", "name": "string", "employeeId": "string",
  "designation": "string", "department": "engineering|estimation|finance|operations|hr|management",
  "email": "string", "phone": "string",
  "role": "admin|approver|finance|maker",
  "hourlyRate": 450.00, "joiningDate": "2025-01-15",
  "isActive": true, "createdAt": "ISO8601"
}
```

### GET `/staff/:id`
### POST `/staff`
```json
{ "name": "string", "employeeId": "string", "designation": "string", "department": "string", "email": "string", "phone": "string", "role": "maker", "hourlyRate": 450, "joiningDate": "2025-01-15", "isActive": true }
```
### PUT `/staff/:id`
### DELETE `/staff/:id`
### PATCH `/staff/:id/toggle-status`

---

## Materials (Price Book)

### GET `/materials`
```
Query params: page, limit, search, sortBy, sortOrder, category
```
```json
// Response data item shape:
{
  "id": "uuid", "materialCode": "STL-001", "name": "string",
  "description": "string|null", "category": "steel|cement|electrical|plumbing|paint|wood|glass|tiles|other",
  "unit": "kg|ton|bag|sqft|sqm|rft|nos|ltr|set|cum",
  "unitPrice": 62.00, "currency": "INR",
  "supplier": "string|null", "lastUpdated": "2025-02-01",
  "isActive": true, "createdAt": "ISO8601"
}
```

### GET `/materials/:id`
### GET `/materials/categories`
Returns the list of unique categories with counts.
```json
{ "success": true, "data": ["steel", "cement", "electrical"] }
```

### POST `/materials`
```json
{ "materialCode": "string", "name": "string", "description": "string", "category": "string", "unit": "string", "unitPrice": 62, "currency": "INR", "supplier": "string", "lastUpdated": "2025-02-01", "isActive": true }
```

### PUT `/materials/:id`
### DELETE `/materials/:id`

### POST `/materials/import`
Bulk import via CSV. Content-Type: `multipart/form-data`
```
Form field: file (.csv, max 10MB)
CSV columns: materialCode, name, description, category, unit, unitPrice, currency, supplier, lastUpdated
```
```json
// Response 200
{ "success": true, "data": { "imported": 42, "failed": 2, "errors": [{ "row": 5, "reason": "Invalid unit" }] } }
```

---

## Common Response Shapes

### Success
```json
{ "success": true, "message": "string", "data": {}, "meta": { "total": 0, "page": 1, "limit": 20, "totalPages": 0 } }
```

### Error
```json
{ "success": false, "message": "Human-readable error", "errors": [{ "field": "email", "message": "Email already exists" }] }
```

### HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized (invalid/expired token) |
| 403 | Forbidden (insufficient role) |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 422 | Unprocessable Entity |
| 500 | Internal Server Error |

---

## Role-Permission Matrix

| Resource | Admin | Approver | Finance | Maker |
|----------|-------|----------|---------|-------|
| Users (CRUD) | ✅ | ❌ | ❌ | ❌ |
| Company (RW) | ✅ | ❌ | ❌ | ❌ |
| Rate Cards (CRUD) | ✅ | ❌ | ❌ | ❌ |
| Overhead Rates (CRUD) | ✅ | ❌ | ❌ | ❌ |
| Tax Configs (CRUD) | ✅ | ✅ (R) | ✅ (R) | ❌ |
| Clients (CRUD) | ✅ | ✅ (R) | ✅ (R) | ✅ (R) |
| Vendors (CRUD) | ✅ | ✅ (R) | ✅ (R) | ✅ (R) |
| Staff (CRUD) | ✅ | ❌ | ❌ | ❌ |
| Materials (CRUD) | ✅ | ✅ (R) | ✅ (R) | ✅ (RW) |
| Job Orders (CRUD) | ✅ | ✅ (R+Approve) | ✅ (R) | ✅ (RW) |
| Approvals | ✅ | ✅ | ❌ | ❌ |
| Invoices | ✅ | ❌ | ✅ | ❌ |
| Reports | ✅ | ✅ (R) | ✅ (R) | ✅ (R) |
