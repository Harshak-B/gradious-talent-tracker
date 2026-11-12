# Gradious Talent Tracker — Placement Portal

A full-stack placement management portal for **Gradious Training**, built with **React + Vite** (frontend) and **Node.js + Express + MongoDB** (backend).

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Environment Configuration](#environment-configuration)
4. [Setup & Installation](#setup--installation)
5. [Running in Development](#running-in-development)
6. [Seeding Sample Data](#seeding-sample-data)
7. [API Overview](#api-overview)
8. [Features](#features)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool | Minimum Version | Notes |
|------|----------------|-------|
| Node.js | 18.x | [nodejs.org](https://nodejs.org) |
| npm | 9.x | Bundled with Node.js |
| MongoDB | 6.x | Local install **or** MongoDB Atlas (cloud) |

> **MongoDB Setup Options**
> - **Local**: Install from [mongodb.com/try/download](https://www.mongodb.com/try/download/community) and start `mongod`.
> - **Atlas**: Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com) and copy your connection string.

---

## Project Structure

```
gradious-talent-tracker/
├── package.json             ← Root convenience scripts
├── .gitignore
├── README.md
│
├── backend/
│   ├── .env.example         ← Copy to .env and fill in values
│   ├── package.json
│   ├── server.js            ← Express app entry point
│   ├── config/
│   │   └── db.js            ← MongoDB connection
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── Student.js
│   │   ├── Company.js
│   │   ├── Drive.js
│   │   ├── Interview.js
│   │   └── Outcome.js
│   ├── routes/
│   │   ├── students.js
│   │   ├── companies.js
│   │   ├── drives.js
│   │   ├── interviews.js
│   │   ├── outcomes.js
│   │   └── dashboard.js
│   └── seed/
│       └── seed.js          ← Sample data seed script
│
└── frontend/
    ├── .env.example
    ├── package.json
    ├── vite.config.js       ← Vite config with /api proxy
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── api/
        │   └── api.js       ← Axios API client
        ├── components/
        │   ├── Layout.jsx
        │   ├── Sidebar.jsx
        │   ├── Modal.jsx
        │   ├── Pagination.jsx
        │   └── States.jsx
        └── pages/
            ├── Dashboard.jsx
            ├── Students.jsx
            ├── Companies.jsx
            ├── Drives.jsx
            ├── Interviews.jsx
            └── Outcomes.jsx
```

---

## Environment Configuration

### Backend (`backend/.env`)

Copy the example file and fill in your values:

```bash
cd backend
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/gradious-talent-tracker` |
| `PORT` | Port the API server listens on | `5000` |
| `NODE_ENV` | Runtime environment | `development` |
| `CLIENT_URL` | Allowed CORS origin (frontend URL) | `http://localhost:5173` |

### Frontend (`frontend/.env`)

```bash
cd frontend
cp .env.example .env
```

The frontend uses Vite's built-in proxy to forward `/api` requests to the backend — no additional configuration is needed for local development.

---

## Setup & Installation

Install dependencies for **both** the backend and frontend:

```bash
# From inside the gradious-talent-tracker directory
npm run install:all
```

Or install each separately:

```bash
cd backend && npm install
cd ../frontend && npm install
```

---

## Running in Development

You need **two terminals** — one for each server.

**Terminal 1 — Backend API:**

```bash
# From the gradious-talent-tracker directory
cd backend
npm run dev
```

The API starts at `http://localhost:5000`.

**Terminal 2 — Frontend:**

```bash
# From the gradious-talent-tracker directory
cd frontend
npm run dev
```

The frontend starts at `http://localhost:5173` and proxies all `/api` calls to the backend.

Open `http://localhost:5173` in your browser.

---

## Seeding Sample Data

The seed script populates the database with realistic sample data (10 students, 5 companies, 5 drives, 9 interviews, 7 outcomes).

> ⚠️ **Warning:** The seed script **clears all existing data** in the collections before inserting. Do not run it against a production database.

```bash
cd backend
npm run seed
```

Expected output:

```
✅ Connected to MongoDB
🗑️  Cleared existing data
✅ Seeded 5 companies
✅ Seeded 10 students
✅ Seeded 5 drives
✅ Seeded 9 interviews
✅ Seeded 7 outcomes

🎉 Database seeding complete!
```

---

## API Overview

Base URL: `http://localhost:5000/api`

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |

### Students `/api/students`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List students (search, filter, paginate) |
| GET | `/:id` | Get student by ID |
| POST | `/` | Create student |
| PUT | `/:id` | Replace student |
| PATCH | `/:id` | Partial update |
| DELETE | `/:id` | Soft-deactivate student |

**Query params:** `search`, `department`, `graduationYear`, `placementStatus`, `page`, `limit`, `sort`

### Companies `/api/companies`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List companies |
| GET | `/:id` | Get company |
| POST | `/` | Create company |
| PUT | `/:id` | Replace company |
| PATCH | `/:id` | Partial update |
| DELETE | `/:id` | Soft-deactivate |

### Drives `/api/drives`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List drives |
| GET | `/:id` | Get drive (with registered students) |
| POST | `/` | Create drive |
| PUT | `/:id` | Replace drive |
| PATCH | `/:id` | Partial update |
| POST | `/:id/register` | Register a student for a drive |
| DELETE | `/:id` | Mark drive as Cancelled |

### Interviews `/api/interviews`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List interviews |
| GET | `/:id` | Get interview |
| POST | `/` | Create interview round |
| PUT | `/:id` | Replace interview |
| PATCH | `/:id` | Partial update |
| DELETE | `/:id` | Delete interview |

### Outcomes `/api/outcomes`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List outcomes |
| GET | `/:id` | Get outcome |
| POST | `/` | Record outcome (auto-syncs student status) |
| PUT | `/:id` | Replace outcome |
| PATCH | `/:id` | Partial update |
| DELETE | `/:id` | Delete outcome |

### Dashboard `/api/dashboard`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/summary` | Counts, placement rate, recent drives, top packages |

---

## Features

- 📊 **Dashboard** — KPI stats, placement-by-department bar chart, outcome breakdown, recent drives, top packages
- 🎓 **Students** — Full CRUD with search, department/status/year filters, skills tags, and soft delete
- 🏢 **Companies** — Full CRUD with search
- 📅 **Drives** — Full CRUD with eligibility criteria, drive status management, student registration
- 🗣️ **Interviews** — Round-by-round tracking with type, score, result, and feedback
- 🏆 **Outcomes** — Hiring outcome records that automatically update the student's placement status
- ✅ **Validation** — Client-side (inline errors) and server-side (express-validator + Mongoose)
- 🔒 **Security** — Helmet, CORS, rate limiting (200 req / 15 min per IP)
- 📄 **Pagination** — All list endpoints support `page` & `limit`

---

## Troubleshooting

### MongoDB connection fails

- Confirm MongoDB is running: `mongod --version` or check your Atlas connection string.
- Make sure `MONGODB_URI` in `backend/.env` is correct.
- For Atlas, whitelist your IP address in the Network Access settings.

### Port already in use

Change the port in `backend/.env` (`PORT=5001`) and update `frontend/vite.config.js` proxy target accordingly.

### CORS errors in browser

Make sure `CLIENT_URL` in `backend/.env` matches the URL shown in your browser (e.g. `http://localhost:5173`).

### `npm run seed` fails with duplicate key error

The seed script drops all data first. If you see a duplicate-key error, it may be a stale unique index. Drop the database and re-run:

```bash
# In mongosh
use gradious-talent-tracker
db.dropDatabase()
```

Then run `npm run seed` again.

### Frontend shows "Network Error"

Ensure the backend is running on port `5000` **before** starting the frontend. The Vite dev proxy (`/api → localhost:5000`) requires the backend to be up.
