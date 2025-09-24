# DCC-SFA - Sales Force Automation System

A modern Sales Force Automation system built with a Turborepo monorepo architecture.

## 🏗️ Architecture

This project uses **Turborepo** to manage a monorepo with the following packages:

- **`dcc-sfa-be`** - Backend API (Node.js + Express + TypeScript + Prisma)
- **`dcc-sfa-fe`** - Frontend Application (React + Vite + TypeScript)

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/manikantxampleserv/dcc-sfa.git
cd dcc-sfa

# Install all dependencies
npm run install:all
```

### Development

```bash
# Start both frontend and backend in development mode
npm run dev

# The backend will run on: http://localhost:4000
# The frontend will run on: http://localhost:5173
```

## 📦 Available Scripts

| Script                | Description                                         |
| --------------------- | --------------------------------------------------- |
| `npm run dev`         | Start both frontend and backend in development mode |
| `npm run build`       | Build both packages for production                  |
| `npm run install:all` | Install dependencies for all packages               |
| `npm run clean`       | Clean build artifacts                               |
| `npm run format`      | Format code with Prettier                           |

## 🏢 Project Structure

```
dcc-sfa/
├── dcc-sfa-be/          # Backend API
│   ├── src/
│   │   └── index.ts     # Express server entry point
│   ├── .env.example     # Environment variables template
│   ├── package.json
│   └── tsconfig.json
├── dcc-sfa-fe/          # Frontend Application
│   ├── src/
│   │   ├── App.tsx      # React app entry point
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── package.json         # Root package.json (monorepo config)
├── turbo.json          # Turborepo configuration
└── README.md
```

## 🔧 Backend (dcc-sfa-be)

### Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: JWT
- **File Storage**: Backblaze B2
- **Email**: SMTP (Gmail)

### Environment Setup

1. Copy the environment template:

   ```bash
   cp dcc-sfa-be/.env.example dcc-sfa-be/.env
   ```

2. Update the `.env` file with your actual values:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/dcc_sfa_db"
   JWT_SECRET="your-super-secret-jwt-key-here"
   PORT=4000
   # ... other variables
   ```

### API Endpoints

- `GET /` - Health check endpoint

## 🎨 Frontend (dcc-sfa-fe)

### Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: CSS

### Development

The frontend runs on `http://localhost:5173` and will proxy API requests to the backend.

## 🛠️ Development Workflow

### Adding New Dependencies

```bash
# Add to backend
npm install <package> --workspace=dcc-sfa-be

# Add to frontend
npm install <package> --workspace=dcc-sfa-fe

# Add to root (monorepo tools)
npm install <package> -w
```

### Running Individual Packages

```bash
# Backend only
cd dcc-sfa-be && npm run dev

# Frontend only
cd dcc-sfa-fe && npm run dev
```

## 🔒 Environment Variables

### Backend (.env)

| Variable              | Description                  | Example                                    |
| --------------------- | ---------------------------- | ------------------------------------------ |
| `DATABASE_URL`        | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET`          | Secret key for JWT tokens    | `your-secret-key`                          |
| `PORT`                | Server port                  | `4000`                                     |
| `BACKBLAZE_B2_KEY_ID` | Backblaze B2 key ID          | `your-key-id`                              |
| `SMTP_USERNAME`       | Email username               | `your-email@gmail.com`                     |

See `dcc-sfa-be/.env.example` for all available variables.

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This will build both the frontend and backend for production.

### Backend Deployment

The backend builds to `dcc-sfa-be/dist/` and can be started with:

```bash
cd dcc-sfa-be
npm start
```

### Frontend Deployment

The frontend builds to `dcc-sfa-fe/dist/` and can be served with any static file server.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 Code Style

This project uses Prettier for code formatting:

```bash
# Format all files
npm run format
```

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**: Change the `PORT` in `dcc-sfa-be/.env`
2. **Database connection**: Ensure PostgreSQL is running and `DATABASE_URL` is correct
3. **Dependencies**: Run `npm run install:all` to ensure all packages have dependencies

### Getting Help

- Check the [Issues](https://github.com/manikantxampleserv/dcc-sfa/issues) page
- Create a new issue if you find a bug

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

- **Author**: MKX
- **Organization**: DCC Consulting

---

Built with ❤️ using Turborepo, React, and Node.js
