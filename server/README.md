# WebGrave Backend

## Overview
WebGrave is a digital memorial platform that allows users to create and manage digital memorials, send digital flowers, and integrate scannable QR codes.

## Prerequisites
- Node.js (v14+ recommended)
- MongoDB
- Stripe Account
- Gmail Account (for contact form emails)

## Installation
1. Clone the repository
2. Navigate to the server directory
3. Install dependencies:
   ```
   npm install
   ```

## Environment Variables
Create a `.env` file with the following variables:
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT token generation
- `STRIPE_SECRET_KEY`: Stripe secret key
- `FRONTEND_URL`: Frontend application URL
- `SUPPORT_EMAIL`: Support email address
- `SUPPORT_EMAIL_PASSWORD`: Email password/app password
- `PORT`: Server port (default: 5000)

## Running the Server
- Development: `npm run dev`
- Production: `npm start`

## API Endpoints
- `/api/auth`: Authentication routes
- `/api/memorials`: Memorial management
- `/api/flowers`: Digital flower tributes
- `/api/contact`: Contact form submissions

## Features
- User authentication
- Memorial creation and management
- Digital flower tributes
- QR code generation
- Contact form submissions

## Security
- JWT-based authentication
- Password hashing
- Input validation
- Secure payment processing

## Contributing
Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License
This project is licensed under the MIT License.
