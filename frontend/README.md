# Bookstore Frontend

A modern React TypeScript frontend for the Bookstore Microservice application.

## Features

- **Authentication**: Login/logout functionality with JWT tokens
- **Book Management**: View, add, and delete books
- **Order System**: Place orders for books
- **Real-time Notifications**: Toast notifications for user feedback
- **Responsive Design**: Modern UI with Tailwind CSS
- **Type Safety**: Full TypeScript support

## Services Covered

1. **User Service**: Authentication and user management
2. **Book Service**: CRUD operations for books
3. **Order Service**: Order placement and management
4. **Notification Service**: Real-time order notifications via RabbitMQ
5. **API Gateway**: Centralized routing and authentication

## Tech Stack

- React 18 with TypeScript
- React Router for navigation
- Axios for API communication
- Tailwind CSS for styling
- Lucide React for icons
- React Hot Toast for notifications

## Getting Started

### Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. The app will be available at `http://localhost:3000`

### Production

1. Build the application:
   ```bash
   npm run build
   ```

2. The built files will be in the `build` directory

## API Integration

The frontend communicates with the microservices through the API Gateway:

- **Authentication**: `/api/auth/login`
- **Books**: `/api/books` (GET, POST, DELETE)
- **Orders**: `/api/orders` (POST)

## Demo Credentials

- Username: `admin`
- Password: `password`

## Docker

The frontend is containerized and can be run with Docker Compose:

```bash
docker-compose up frontend
```

The frontend will be available at `http://localhost:3000` and will automatically proxy API requests to the API Gateway. 