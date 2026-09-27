# Thinqloud Quotation-to-Order System: Final Documentation

## 1. Complete Project Architecture
The project follows a standard **MERN stack architecture** (using Vanilla JS for the frontend). It implements a RESTful API backend communicating with a responsive, glassmorphic frontend.
- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript, Fetch API. It acts as a static client that consumes the REST API.
- **Backend**: Node.js and Express.js handle API requests, business logic, and database operations.
- **Database**: MongoDB Atlas (NoSQL) stores structured business entities with relations referenced via ObjectIds.

## 2. Database Schema Explanation
- **User**: Stores employee data (`name`, `email`, `password`, `role`). `password` is hashed using bcrypt. `role` dictates authorization level (ADMIN, SALES, MANAGER).
- **Customer**: Stores client data (`name`, `companyName`, `email`, `phone`, etc.) with a `createdBy` reference to the User.
- **Product**: Defines sellable items (`name`, `sku`, `price`, `taxRate`, `isActive`).
- **Quotation**: The core transactional document. Contains embedded `items` (snapshot of product details at quotation time to prevent historical changes if product price changes later). It tracks `status` (DRAFT, APPROVED, etc.), calculated totals, and references to `Customer` and `User`.
- **Approval**: Tracks manager reviews for a specific Quotation. Includes `status` and `comments`.
- **Order**: Represents a finalized sale. Created *only* by converting an ACCEPTED quotation. Contains its own snapshot of items and totals to maintain a strict historical record.

## 3. API List
- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`
- **Customers**: `GET /api/customers`, `POST /api/customers`, `GET /api/customers/:id`, `PUT /api/customers/:id`, `DELETE /api/customers/:id`
- **Products**: `GET /api/products`, `POST /api/products`, `GET /api/products/:id`, `PUT /api/products/:id`, `DELETE /api/products/:id`
- **Quotations**: `GET /api/quotations`, `POST /api/quotations`, `GET /api/quotations/:id`, `PUT /api/quotations/:id`, `DELETE /api/quotations/:id`
- **Quotation Workflow**: 
  - `POST /api/quotations/:id/submit` (DRAFT -> PENDING_APPROVAL)
  - `POST /api/quotations/:id/approve` (PENDING_APPROVAL -> APPROVED)
  - `POST /api/quotations/:id/reject` (PENDING_APPROVAL -> REJECTED)
  - `POST /api/quotations/:id/send` (APPROVED -> SENT)
  - `POST /api/quotations/:id/accept` (SENT -> ACCEPTED)
  - `POST /api/quotations/:id/convert` (ACCEPTED -> CONVERTED + Creates Order)
- **Orders**: `GET /api/orders`, `GET /api/orders/:id`, `PUT /api/orders/:id/status`

## 4. Complete Business Workflow
1. **SALES** creates a Customer and selects Products to create a **DRAFT** Quotation.
2. **SALES** submits the Quotation. Status -> **PENDING_APPROVAL**.
3. **MANAGER** reviews the Quotation. Can Reject (Status -> **REJECTED**) or Approve (Status -> **APPROVED**).
4. Once **APPROVED**, **SALES** sends it to the customer. Status -> **SENT**.
5. Customer agrees. **SALES** marks it as **ACCEPTED**.
6. **SALES** clicks "Convert to Order". The Quotation becomes **CONVERTED** and a new **Order** is generated with **CONFIRMED** status.

## 5. Authentication Explanation
Authentication answers *"Who is the user?"*. When a user logs in with their email and password, the backend verifies the credentials using `bcrypt.compare()`. If successful, a JWT (JSON Web Token) is generated and returned to the frontend. The frontend stores this token in `localStorage`.

## 6. JWT Explanation
JWT is a stateless authentication mechanism. The payload contains the user's `id` and `role`. It is signed using a secret key (`process.env.JWT_SECRET`) which prevents tampering. For every protected request, the frontend sends this token in the `Authorization: Bearer <token>` header. The `authMiddleware` verifies the token's signature and attaches the decoded user data to `req.user`.

## 7. Role Authorization Explanation
Authorization answers *"What can the user do?"*. After `authMiddleware` authenticates the user, `roleMiddleware` checks if `req.user.role` is included in the allowed roles for that specific route (e.g., `authorizeRoles("MANAGER", "ADMIN")`). If not, it returns a `403 Forbidden` error.

## 8. Quotation Calculation Explanation
The frontend calculates totals for display purposes *only*. When the Quotation is saved, the backend fetches the latest price and tax rate for each product from the database to prevent malicious frontend tampering. It calculates:
- `amount = quantity * unitPrice`
- `subtotal = sum of all amounts`
- `discountAmount = subtotal * (discountPercent / 100)`
- `taxableAmount = subtotal - discountAmount`
- `taxAmount = proportional calculation based on individual item tax rates`
- `grandTotal = taxableAmount + taxAmount`

## 9. Approval Workflow Explanation
Submitting a quotation creates an `Approval` record with status `PENDING`. A MANAGER queries pending quotations, reviews the details, and submits a decision. The `Approval` record is updated with their `userId`, timestamp, and comments, keeping a strict audit trail of who approved/rejected what and why.

## 10. Quotation-to-Order Conversion Explanation
Conversion relies on a strict state machine rule: *Only ACCEPTED quotations can be converted*.
The conversion process utilizes **MongoDB Transactions** (Mongoose sessions). It checks if an order for this quotation already exists to prevent duplicate generation. It copies the exact item snapshots and calculated totals to a new `Order` document, updates the quotation status to `CONVERTED`, and commits both changes atomically. If anything fails, the transaction rolls back.

## 11. Security Explanation
- **Passwords**: Never stored in plain text; hashed using `bcryptjs`.
- **JWT**: Stateless, tamper-proof tokens with an expiration time.
- **Environment Variables**: Sensitive data (DB connection, JWT secret) is stored in `.env` and ignored in Git.
- **Data Integrity**: Totals are always recalculated on the backend; pricing data is snapshotted to prevent historical mutations.
- **Transactions**: Used for critical operations (conversion) to prevent orphaned data or duplicate orders.
- **Error Handling**: Centralized error middleware ensures stack traces or sensitive database structure details are never leaked to the client.

## 12. Postman Testing Sequence
*(A separate artifact named `postman_testing_flow.md` was generated with the exact step-by-step sequence and variables for Postman).*

## 13. Frontend-Backend Architecture
- **Decoupled**: The frontend and backend are completely separate. The frontend is purely static files (HTML/CSS/JS) that can be hosted on a CDN (like Vercel or Netlify).
- **Communication**: The frontend uses the browser's native `Fetch API` to send asynchronous HTTP requests (AJAX) to the Express.js backend.
- **State Management**: Authentication state is maintained in `localStorage`. Page state is managed via vanilla DOM manipulation.

## 14. Deployment Steps
1. **Database**: Create a MongoDB Atlas cluster. Retrieve the connection string.
2. **Backend (e.g., Render/Heroku)**:
   - Push backend code to GitHub.
   - Connect the repo to the hosting provider.
   - Set Environment Variables (`MONGO_URI`, `JWT_SECRET`, `PORT`).
   - Run `npm install` and `node server.js`.
3. **Frontend (e.g., Vercel/Netlify)**:
   - Update `API_URL` in `js/api.js` to point to the deployed backend URL.
   - Deploy the `frontend/` directory as a static site.

## 15. GitHub README.md
*(You can create a README.md file in your repo copying this high-level documentation).*

## 16. Thinqloud Interview Explanation
During the interview, emphasize the **separation of concerns** (Controllers vs Routes vs Utils) and **data integrity**. Highlight how you utilized MongoDB transactions for the Quotation-to-Order conversion to ensure atomicity. Point out that you took a security-first approach by never trusting frontend calculations and implementing strict role-based access control (RBAC).

## 17. Likely Technical Interview Questions and Answers
**Q1: Why did you snapshot product details inside the Quotation items array?**
*Answer*: If a product's price changes 3 months from now, historical quotations and orders must retain the original price agreed upon with the customer. Referencing the product ID dynamically would alter historical financial records.

**Q2: How do you prevent a user from converting the same quotation twice?**
*Answer*: The backend explicitly queries the `Order` collection to see if an order with that `quotationId` already exists. Furthermore, `quotationId` is marked as `unique: true` in the Order schema, enforcing a database-level constraint.

**Q3: What is the difference between Authentication and Authorization in your app?**
*Answer*: Authentication (`authMiddleware`) verifies the JWT to prove *who* the user is. Authorization (`roleMiddleware`) checks the decoded user's `role` to determine *what* they are allowed to do (e.g., only Managers can approve).

**Q4: Why recalculate totals on the backend if the frontend already does it?**
*Answer*: The frontend is out of our control. A malicious user could intercept the HTTP request or modify the DOM to submit a quotation with a $0 grand total. The backend must always be the source of truth for business math.

## 18. Explanation of Why Each Technology Was Selected
- **Node.js + Express**: Extremely fast for I/O heavy operations (like REST APIs). Express provides a lightweight, unopinionated routing layer that makes building JSON APIs rapid.
- **MongoDB + Mongoose**: As a NoSQL document database, it perfectly fits the JSON-like nature of quotations and nested item arrays. Mongoose provides necessary schema validation on top of MongoDB's flexible nature.
- **JWT**: Allows for stateless authentication. The server doesn't need to maintain session memory, making the backend highly scalable.
- **Vanilla JS + CSS (Frontend)**: Demonstrates strong fundamental web development skills without relying on heavy frameworks like React or Bootstrap, which is highly valued in placement assessments to prove core competency.
