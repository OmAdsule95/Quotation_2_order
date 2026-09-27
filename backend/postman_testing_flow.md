# API Testing Flow (Postman)

Base URL: `http://localhost:5000`

Variables in Postman to set:
- `admin_token`
- `sales_token`
- `manager_token`
- `customer_id`
- `product_id`
- `quotation_id`

---

## 1. Register ADMIN
- **Method**: POST
- **URL**: `/api/auth/register`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
      "name": "Admin User",
      "email": "admin@example.com",
      "password": "password123",
      "role": "ADMIN"
  }
  ```
- **Expected Response**: 201 Created with user details.

## 2. Register SALES
- **Method**: POST
- **URL**: `/api/auth/register`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
      "name": "Sales User",
      "email": "sales@example.com",
      "password": "password123",
      "role": "SALES"
  }
  ```
- **Expected Response**: 201 Created.

## 3. Register MANAGER
- **Method**: POST
- **URL**: `/api/auth/register`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
      "name": "Manager User",
      "email": "manager@example.com",
      "password": "password123",
      "role": "MANAGER"
  }
  ```
- **Expected Response**: 201 Created.

## 4. Login ADMIN
- **Method**: POST
- **URL**: `/api/auth/login`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
      "email": "admin@example.com",
      "password": "password123"
  }
  ```
- **Expected Response**: 200 OK with `token`. *Save as `admin_token`*.

## 5. Login SALES
- **Method**: POST
- **URL**: `/api/auth/login`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
      "email": "sales@example.com",
      "password": "password123"
  }
  ```
- **Expected Response**: 200 OK. *Save token as `sales_token`*.

## 6. Login MANAGER
- **Method**: POST
- **URL**: `/api/auth/login`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
      "email": "manager@example.com",
      "password": "password123"
  }
  ```
- **Expected Response**: 200 OK. *Save token as `manager_token`*.

## 7. Test Invalid Login
- **Method**: POST
- **URL**: `/api/auth/login`
- **Headers**: `Content-Type: application/json`
- **Request Body**: `{"email": "admin@example.com", "password": "wrongpassword"}`
- **Expected Response**: 401 Unauthorized.

## 8. Create Customer (as SALES)
- **Method**: POST
- **URL**: `/api/customers`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer {{sales_token}}`
- **Request Body**:
  ```json
  {
      "name": "Acme Corp",
      "companyName": "Acme",
      "email": "contact@acme.com",
      "phone": "1234567890"
  }
  ```
- **Expected Response**: 201 Created. *Save `data._id` as `customer_id`*.

## 9. Get Customers
- **Method**: GET
- **URL**: `/api/customers`
- **Headers**: `Authorization: Bearer {{sales_token}}`
- **Expected Response**: 200 OK with list of customers.

## 10. Update Customer (as SALES)
- **Method**: PUT
- **URL**: `/api/customers/{{customer_id}}`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer {{sales_token}}`
- **Request Body**: `{"city": "New York"}`
- **Expected Response**: 200 OK with updated customer.

## 11. Create Product (as ADMIN)
- **Method**: POST
- **URL**: `/api/products`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer {{admin_token}}`
- **Request Body**:
  ```json
  {
      "name": "Enterprise Software License",
      "sku": "ENT-SW-01",
      "price": 1000,
      "taxRate": 10
  }
  ```
- **Expected Response**: 201 Created. *Save `data._id` as `product_id`*.

## 12. Get Products (as SALES)
- **Method**: GET
- **URL**: `/api/products`
- **Headers**: `Authorization: Bearer {{sales_token}}`
- **Expected Response**: 200 OK with list of products.

## 13. Create Quotation (as SALES)
- **Method**: POST
- **URL**: `/api/quotations`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer {{sales_token}}`
- **Request Body**:
  ```json
  {
      "customerId": "{{customer_id}}",
      "items": [
          {
              "productId": "{{product_id}}",
              "quantity": 2
          }
      ],
      "discountPercent": 5
  }
  ```
- **Expected Response**: 201 Created. *Save `data._id` as `quotation_id`*.

## 14. Calculate Quotation Totals
- Verifying the previous response: The backend should return `subtotal`, `discountAmount`, `taxAmount`, and `grandTotal` correctly calculated based on item price and quantity.

## 15. Submit Quotation
- **Method**: POST
- **URL**: `/api/quotations/{{quotation_id}}/submit`
- **Headers**: `Authorization: Bearer {{sales_token}}`
- **Expected Response**: 200 OK. Status becomes `PENDING_APPROVAL`.

## 16. Manager Login
- (Already logged in, use `manager_token`)

## 17. Approve Quotation (as MANAGER)
- **Method**: POST
- **URL**: `/api/quotations/{{quotation_id}}/approve`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer {{manager_token}}`
- **Request Body**: `{"comments": "Approved with standard terms"}`
- **Expected Response**: 200 OK. Status becomes `APPROVED`.

## 18. Send Quotation (as SALES)
- **Method**: POST
- **URL**: `/api/quotations/{{quotation_id}}/send`
- **Headers**: `Authorization: Bearer {{sales_token}}`
- **Expected Response**: 200 OK. Status becomes `SENT`.

## 19. Accept Quotation (as SALES)
- **Method**: POST
- **URL**: `/api/quotations/{{quotation_id}}/accept`
- **Headers**: `Authorization: Bearer {{sales_token}}`
- **Expected Response**: 200 OK. Status becomes `ACCEPTED`.

## 20. Convert Quotation to Order (as SALES)
- **Method**: POST
- **URL**: `/api/quotations/{{quotation_id}}/convert`
- **Headers**: `Authorization: Bearer {{sales_token}}`
- **Expected Response**: 201 Created. Order is created.

## 21. Get Order
- **Method**: GET
- **URL**: `/api/orders`
- **Headers**: `Authorization: Bearer {{sales_token}}`
- **Expected Response**: 200 OK with the new order.

## 22. Test Unauthorized Request
- **Method**: GET
- **URL**: `/api/customers`
- **Headers**: (None)
- **Expected Response**: 401 Unauthorized.

## 23. Test Wrong Role
- **Method**: DELETE
- **URL**: `/api/customers/{{customer_id}}`
- **Headers**: `Authorization: Bearer {{sales_token}}`
- **Expected Response**: 403 Forbidden.

## 24. Test Duplicate Conversion
- **Method**: POST
- **URL**: `/api/quotations/{{quotation_id}}/convert`
- **Headers**: `Authorization: Bearer {{sales_token}}`
- **Expected Response**: 400 Bad Request.
