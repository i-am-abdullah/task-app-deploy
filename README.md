# Base - BE Version with NestJS and PostgreSQL

A production-ready backend starter template built with NestJS and PostgreSQL, featuring comprehensive authentication, user management, and database migrations support. This project provides a solid foundation for building scalable and secure web applications.

![NestJS](https://img.shields.io/badge/NestJS-11.0.1-red)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-blue)
![TypeORM](https://img.shields.io/badge/TypeORM-0.3.20-green)

## ✨ Features

- **Authentication System**
  - JWT-based authentication
  - Refresh token mechanism
  - Token validation and verification
  - Protected routes with Guards
  
- **User Management**
  - User registration and login
  - Profile management
  - Role-based access control

- **Database**
  - PostgreSQL integration
  - TypeORM for database management
  - Migration system
  - Database health checks

- **Security**
  - Password hashing with bcrypt
  - Request validation
  - Protected routes
  - Environment configuration

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

### Environment Setup

1. Clone the repository
```bash
git clone <repository-url>
cd base-be-nestjs
```

2. Create a `.env` file in the root directory:
```env
# Database
DATABASE_USER=sample
DATABASE_PASSWORD=sample
DATABASE_NAME=sampledb
DATABASE_PORT=5432
DATABASE_HOST=localhost

# App
PORT=3000
NODE_ENV=development

JWT_SECRET=your_secure_secret_here
JWT_REFRESH_SECRET=your_secure_refresh_secret_here
```

3. Install dependencies
```bash
npm install
```

### Database Setup

1. Generate migrations
```bash
npm run migration:generate --name=init
```

2. Run migrations
```bash
npm run migration:run
```

### Running the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

The application will be available at `http://localhost:3000`

## 📚 Project Structure

```
src/
├── auth/               # Authentication module
├── users/              # User management module
├── config/            # Configuration files
├── migrations/        # Database migrations
├── common/            # Shared resources
└── main.ts           # Application entry point
```

## 🛠️ Available Scripts

- `npm run start:dev` - Start the application in development mode
- `npm run build` - Build the application
- `npm run start:prod` - Start the application in production mode
- `npm run migration:generate --name=<name>` - Generate new migration
- `npm run migration:run` - Run pending migrations
- `npm run migration:revert` - Revert last migration
- `npm run test` - Run tests
- `npm run lint` - Run linting
- `npm run format` - Format code

## 🔒 Security

This project implements several security best practices:
- JWT-based authentication
- Password hashing
- Request validation
- Protected routes
- Environment variable configuration

## 🚧 API Documentation

### Authentication Endpoints
- `POST /auth/register` - Register new user
  - Body: `RegisterDto` (email, password, etc.)
  - Returns: User object with tokens

- `POST /auth/login` - User login
  - Body: `LoginDto` (email, password)
  - Returns: Access token and refresh token

- `POST /auth/refresh` - Refresh access token
  - Body: `{ refreshToken: string }`
  - Returns: New access token

- `POST /auth/validate` - Validate access token
  - Body: `{ accessToken: string }`
  - Returns: Token validity and payload

### User Endpoints (Protected with AuthGuard)
- `POST /users` - Create new user
  - Body: `CreateUserDto`
  - Returns: Created user object

- `GET /users` - Get all users
  - Returns: Array of users
  - Protected: Requires authentication

- `GET /users/:id` - Get user by ID
  - Returns: User object
  - Protected: Requires authentication

- `PUT /users/:id` - Update user
  - Body: `UpdateUserDto`
  - Returns: Updated user object
  - Protected: Requires authentication

- `DELETE /users/:id` - Delete user
  - Returns: Success message
  - Protected: Requires authentication

## 📦 Dependencies

Key dependencies include:
- NestJS v11.0.1
- TypeORM v0.3.20
- PostgreSQL
- JWT for authentication
- bcrypt for password hashing
- class-validator for request validation

## ⚡ Performance

The application includes several performance optimizations:
- Database connection pooling
- Proper indexing
- Caching capabilities
- Optimized TypeORM queries

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## 🌟 Support

For support, please raise an issue in the repository or contact the development team.