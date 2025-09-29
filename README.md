# DCC-SFA - Sales Force Automation System

A modern Sales Force Automation system built with a monorepo architecture using Concurrently for development workflow.

## 🏗️ Architecture

This project uses **Concurrently** to manage a monorepo with the following packages:

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

# Setup project (install dependencies + generate Prisma client)
npm run setup
```

### Development

```bash
# Start both frontend and backend in development mode
npm run dev

# The backend will run on: http://localhost:4000
# The frontend will run on: http://localhost:5173
```

## 📦 Available Scripts

| Script                    | Description                                         |
| ------------------------- | --------------------------------------------------- |
| `npm run setup`           | Install all dependencies and generate Prisma client |
| `npm run dev`             | Start both frontend and backend in development mode |
| `npm run build`           | Build both packages for production                  |
| `npm run start`           | Start production servers (BE + FE preview)          |
| `npm run prisma:generate` | Generate Prisma client from schema                  |
| `npm run format`          | Format code with Prettier                           |
| `npm run clean`           | Clean build artifacts and kill running processes    |

## 🏢 Project Structure

```
dcc-sfa/
├── dcc-sfa-be/          # Backend API
│   ├── src/
│   │   └── index.ts     # Express server entry point
│   ├── prisma/
│   │   └── schema.prisma # Database schema
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
└── README.md
```
