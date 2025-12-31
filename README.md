# Crypto Investment Platform Backend

A comprehensive Node.js backend API for a cryptocurrency investment platform with user management, investment packages, transactions, and admin features.

## Features

- **User Authentication & Authorization**

  - JWT-based authentication
  - Role-based access control (User/Admin)
  - Profile management with KYC fields
  - Password encryption with bcrypt

- **Investment Management**

  - Multiple investment packages with different ROI rates
  - Automated return calculations
  - Investment tracking and analytics
  - Package management (Admin)

- **Transaction System**

  - Deposit and withdrawal requests
  - Multiple payment methods (Crypto, PayPal, Bank Transfer)
  - Admin approval workflow
  - Transaction history and analytics

- **Admin Dashboard**

  - User management
  - Transaction processing
  - Investment oversight
  - System analytics and reporting

- **Multi-language Support**

  - Language selection API
  - Configurable language settings
  - Translation system ready

- **Security Features**
  - Rate limiting
  - Input validation
  - CORS protection
  - Helmet security headers

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express-validator
- **Documentation**: Swagger/OpenAPI 3.0
- **Security**: Helmet, CORS, Rate limiting

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` file with your configuration:

   ```env
   MONGODB_URI=mongodb://localhost:27017/crypto-investment
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   PORT=5000
   NODE_ENV=development
   API_URL=https://minecrust-backend.onrender.com
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Seed the database** (Optional)

   ```bash
   node seed.js
   ```

6. **Start the server**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## API Documentation

Once the server is running, visit:

- **Swagger UI**: `https://minecrust-backend.onrender.com/api-docs`
- **Health Check**: `https://minecrust-backend.onrender.com/api/health`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Investment Packages

- `GET /api/packages` - Get all packages
- `GET /api/packages/:id` - Get single package
- `POST /api/packages` - Create package (Admin)
- `PUT /api/packages/:id` - Update package (Admin)
- `DELETE /api/packages/:id` - Delete package (Admin)
- `PATCH /api/packages/:id/toggle` - Toggle package status (Admin)

### Investments

- `GET /api/investments` - Get user investments
- `GET /api/investments/stats` - Get investment statistics
- `GET /api/investments/:id` - Get single investment
- `POST /api/investments` - Create new investment
- `PUT /api/investments/:id/returns` - Update returns (Admin)

### Transactions

- `GET /api/transactions` - Get user transactions
- `GET /api/transactions/stats` - Get transaction statistics
- `GET /api/transactions/:id` - Get single transaction
- `POST /api/transactions/deposit` - Create deposit request
- `POST /api/transactions/withdrawal` - Create withdrawal request

### Admin

- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users/:id/status` - Update user status
- `PATCH /api/admin/users/:id/balance` - Update user balance
- `GET /api/admin/transactions` - Get all transactions
- `PATCH /api/admin/transactions/:id/process` - Process transaction
- `GET /api/admin/investments` - Get all investments

### Settings

- `GET /api/settings` - Get public settings
- `GET /api/settings/language` - Get supported languages
- `GET /api/settings/admin` - Get all settings (Admin)
- `POST /api/settings` - Create/update setting (Admin)
- `DELETE /api/settings/:key` - Delete setting (Admin)

### Users

- `GET /api/users/profile` - Get user profile
- `GET /api/users/balance` - Get user balance

## Database Models

### User

- Personal information (name, email, phone, address)
- Authentication (password, role, verification status)
- Financial (balance, crypto wallet)
- Profile completion tracking

### Investment Package

- Package details (name, description, amounts, duration)
- ROI configuration
- Risk level and features
- Active status management

### Investment

- User-package relationship
- Amount and duration tracking
- Return calculations
- Status management (pending, active, completed)

### Transaction

- Multi-type support (deposit, withdrawal, investment, return)
- Payment method tracking
- Admin processing workflow
- Fee calculations

### Settings

- System configuration
- Multi-language support
- Public/private setting classification
- Category organization

## Security Features

1. **Authentication & Authorization**

   - JWT token-based authentication
   - Role-based access control
   - Protected routes with middleware

2. **Input Validation**

   - Express-validator for request validation
   - Data sanitization
   - Type checking

3. **Security Headers**

   - Helmet.js for security headers
   - CORS configuration
   - Rate limiting

4. **Data Protection**
   - Password hashing with bcrypt
   - Sensitive data exclusion from responses
   - Input sanitization

## Default Credentials

After running the seeder:

**Admin Account:**

- Email: `admin@minecrusttrading.com`
- Password: `admin123`

**Test User Accounts:**

- Email: `john.doe@example.com` / Password: `password123`
- Email: `jane.smith@example.com` / Password: `password123`

## Development

### Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests (when implemented)
```

### Project Structure

```
backend/
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── utils/          # Utility functions
├── seed.js         # Database seeder
├── server.js       # Main server file
└── package.json    # Dependencies
```

## Environment Variables

| Variable       | Description               | Default                                       |
| -------------- | ------------------------- | --------------------------------------------- |
| `MONGODB_URI`  | MongoDB connection string | `mongodb://localhost:27017/crypto-investment` |
| `JWT_SECRET`   | JWT signing secret        | Required                                      |
| `JWT_EXPIRE`   | JWT expiration time       | `7d`                                          |
| `PORT`         | Server port               | `5000`                                        |
| `NODE_ENV`     | Environment mode          | `development`                                 |
| `API_URL`      | API base URL              | `https://minecrust-backend.onrender.com`      |
| `FRONTEND_URL` | Frontend URL for CORS     | `http://localhost:3000`                       |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:

- Email: support@minecrusttrading.com
- Documentation: `/api-docs`
- Health Check: `/api/health`
