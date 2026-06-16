# Lend App Backend Server

Standalone Node.js/Express backend for the Lend P2P Lending App.

## Features

- **Authentication**: JWT-based auth with bcrypt password hashing
- **Loans Management**: Create, update, sign, and manage loans
- **Payments**: Track and manage loan payments
- **Notifications**: In-app notifications system
- **Insurance**: Loan insurance management
- **AI Chat**: Bot assistant with rule-based responses
- **File Upload**: Document and receipt uploads
- **Cloud Functions**: API endpoint for business logic
- **SQLite Database**: Persistent storage with better-sqlite3

## Quick Start

### Option 1: Docker (Recommended)

```bash
cd server
docker-compose up -d
```

### Option 2: Node.js

```bash
cd server
npm install
npm run db:init
npm start
```

Server will run at http://localhost:3001

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update user

### Loans
- `GET /api/loans` - List loans
- `POST /api/loans` - Create loan
- `GET /api/loans/:id` - Get loan
- `PUT /api/loans/:id` - Update loan
- `POST /api/loans/:id/sign` - Sign contract
- `DELETE /api/loans/:id` - Delete loan

### Payments
- `GET /api/payments/loan/:loanId` - Get payments for loan
- `POST /api/payments` - Create payment
- `PUT /api/payments/:id` - Update payment

### Notifications
- `GET /api/notifications` - List notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

### Insurance
- `GET /api/insurance/companies` - List companies
- `GET /api/insurance` - List user insurances
- `POST /api/insurance` - Create insurance
- `GET /api/insurance/eligibility/:loanId` - Check eligibility

### Chat
- `POST /api/chat/ai` - AI chat
- `GET /api/chat/history/:sessionId` - Chat history
- `GET /api/chat/sessions` - List sessions
- `DELETE /api/chat/session/:sessionId` - Clear session

### Files
- `POST /api/upload/file` - Upload file
- `GET /api/upload/files` - List user files
- `DELETE /api/upload/file/:id` - Delete file

### Functions
- `POST /api/functions/invoke` - Invoke cloud function

## Environment Variables

Create a `.env` file (see `.env.example`):

```
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:5173
```

## Database

SQLite database is stored at `data/lend.db`. Initialize with:

```bash
npm run db:init
```

## Production Deployment

### Docker

```bash
# Build and run
docker-compose -f docker-compose.yml up -d

# With custom JWT secret
JWT_SECRET=your-production-secret docker-compose up -d
```

### Manual

```bash
npm install --production
JWT_SECRET=your-secret NODE_ENV=production npm start
```

## API Response Format

All responses follow this format:

```json
{
  "data": { ... }
}
```

Errors:

```json
{
  "error": "Error message"
}
```

## Security

- Helmet.js for HTTP headers
- Rate limiting (1000 requests/15min per IP)
- JWT authentication
- Password hashing with bcrypt
- Input validation with express-validator
- CORS configuration

## License

MIT
