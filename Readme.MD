# Cashify Backend API

Enterprise-grade backend for device resale marketplace platform (Cashify clone).

## 📁 Project Structure

```
cashify-backend/
├── src/
│   ├── config/
│   │   └── database.js          # PostgreSQL connection config
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── deviceController.js  # Device CRUD operations
│   │   ├── orderController.js   # Order management
│   │   └── categoryController.js # Categories & brands
│   ├── models/
│   │   ├── User.js              # User model
│   │   ├── Device.js            # Device model
│   │   ├── Order.js             # Order model
│   │   └── Category.js          # Category model
│   ├── middlewares/
│   │   ├── auth.js              # JWT authentication
│   │   ├── validate.js          # Request validation
│   │   └── errorHandler.js      # Global error handler
│   ├── validators/
│   │   ├── authValidator.js     # Auth validation rules
│   │   └── deviceValidator.js   # Device validation rules
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints
│   │   ├── deviceRoutes.js      # Device endpoints
│   │   ├── orderRoutes.js       # Order endpoints
│   │   └── categoryRoutes.js    # Category endpoints
│   ├── database/
│   │   ├── schema.sql           # Database schema
│   │   └── migrate.js           # Migration runner
│   └── server.js                # Application entry point
├── .env.example                  # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- PostgreSQL (v12+)
- npm or yarn

### Installation

1. **Clone & Install**
```bash
npm install
```

2. **Setup Database**
```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE Resello;
\q
```

3. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Run Migrations**
```bash
npm run migrate
```

5. **Start Server**
```bash
# Development
npm run dev

# Production
npm start
```

## 📚 API Endpoints

### Authentication
```
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - User login
POST   /api/auth/logout          - User logOut
GET    /api/auth/profile        - Get user profile (auth)
PUT    /api/auth/profile        - Update profile (auth)
```

### Devices
```
POST   /api/devices             - Create device listing (auth)
GET    /api/devices             - Get all devices (public)
GET    /api/devices/my-devices  - Get user's devices (auth)
GET    /api/devices/:id         - Get device by ID
PUT    /api/devices/:id         - Update device (auth)
DELETE /api/devices/:id         - Delete device (auth)
```

### Orders
```
POST   /api/orders              - Create order (auth)
GET    /api/orders/my-orders    - Get user's orders (auth)
GET    /api/orders/:id          - Get order by ID (auth)
GET    /api/orders              - Get all orders (admin)
PUT    /api/orders/:id/status   - Update order status (admin)
```

### Categories
```
GET    /api/categories                    - Get all categories
GET    /api/categories/:id/brands         - Get brands for category
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

**Headers:**
```
Authorization: Bearer <your_token>
```

## 📝 Example Requests

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "password": "password123",
    "city": "Mumbai",
    "state": "Maharashtra"
  }'
```

### Create Device Listing
```bash
curl -X POST http://localhost:5000/api/devices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "category_id": 1,
    "brand_id": 1,
    "model": "iPhone 13 Pro",
    "variant": "256GB",
    "physical_condition": "excellent",
    "functional_status": "fully_functional",
    "estimated_price": 65000,
    "warranty_status": "active"
  }'
```

## 🗄️ Database Schema

### Key Tables
- **users** - User accounts and profiles
- **categories** - Device categories (Mobile, Laptop, etc.)
- **brands** - Device brands (Apple, Samsung, etc.)
- **devices** - Device listings with conditions & pricing
- **inspections** - Quality inspection records
- **orders** - Order details and tracking
- **price_history** - Historical pricing data

## 🛡️ Security Features

- JWT authentication
- Password hashing with bcrypt
- Input validation with express-validator
- SQL injection prevention (parameterized queries)
- Helmet.js for HTTP headers security
- CORS configuration
- Rate limiting ready

## 🔧 Environment Variables

```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cashify_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
```

## 📦 Dependencies

**Core:**
- express - Web framework
- pg - PostgreSQL client
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication

**Middleware:**
- cors - CORS handling
- helmet - Security headers
- morgan - HTTP logging
- compression - Response compression

**Validation:**
- express-validator - Request validation

## 🚦 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request      -- unsufficient params
- `401` - Unauthorized     -- login failed
- `403` - Forbidden        -- restricted
- `404` - Not Found
- `409` - Conflict         -- already exists
- `429` - Max Retries Exeeded -- Rate Limiting
- `500` - Server Error

## 📈 Future Enhancements

- [ ] Image upload with cloud storage
- [ ] Real-time notifications
- [ ] Payment gateway integration
- [ ] Advanced search & filters
- [ ] Analytics dashboard
- [ ] Email/SMS notifications
- [ ] Admin panel APIs

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first.

## 📄 License

ISC










# PRODUCT ENUMS => product_status
draft | active | archived


# USERS ENUMS => user_status
active | suspended | deleted

# ORDERS ENUMS  => order_status
pending | paid | shipped | cancelled

