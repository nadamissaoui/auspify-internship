# Task 2 - Student Management System

Full-stack application to manage student records, built for the Auspify
Technologies Full Stack Development internship.

Stack: **Node.js + Express + MongoDB (Mongoose)** for the backend, and
**HTML + CSS + vanilla JavaScript** for the frontend.

## Features

- Create, read, update and delete student records (full CRUD)
- Search by name or email
- Filter by course and sort by date / name / grade
- Live statistics (total students, average grade, number of courses)
- Client-side and server-side validation
- Toast notifications and delete confirmation
- Responsive design

## Project structure

```
task2-student-management/
├── client/                 # Frontend
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── api.js          # Fetch wrapper for the REST API
│       └── app.js          # UI logic and event handling
└── server/                 # Backend
    ├── package.json
    ├── .env.example
    └── src/
        ├── server.js
        ├── models/Student.js
        ├── controllers/studentController.js
        └── routes/studentRoutes.js
```

## Setup

### 1. Database (MongoDB Atlas - free)

1. Create an account at https://www.mongodb.com/cloud/atlas/register
2. Create a free **M0** cluster
3. **Database Access**: add a user with a password
4. **Network Access**: allow access from anywhere (`0.0.0.0/0`)
5. Click **Connect -> Drivers** and copy the connection string

### 2. Backend

```bash
cd server
npm install
copy .env.example .env
```

Edit `.env` and set your connection string:

```
PORT=5000
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/student_management?retryWrites=true&w=majority
```

Start the server:

```bash
npm start
```

The API runs at `http://localhost:5000/api/students`.

### 3. Frontend

The Express server also serves the `client` folder, so once the backend is
running just open:

```
http://localhost:5000
```

## REST API

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/students` | List students (`?search=&course=&sort=`) |
| GET | `/api/students/stats` | Statistics |
| GET | `/api/students/:id` | Get one student |
| POST | `/api/students` | Create a student |
| PUT | `/api/students/:id` | Update a student |
| DELETE | `/api/students/:id` | Delete a student |
| GET | `/api/health` | Health / DB status |

## Student fields

| Field | Type | Required |
| --- | --- | --- |
| firstName | String | yes |
| lastName | String | yes |
| email | String (unique) | yes |
| phone | String | no |
| dateOfBirth | Date | no |
| gender | Male / Female / Other | no |
| course | String | yes |
| year | Number (1-7) | no |
| grade | Number (0-100) | no |
| address | String | no |

## Submission checklist

- [ ] Backend and frontend running locally
- [ ] Source code pushed to GitHub
- [ ] Screenshots (list, add form, edit, delete, stats)
- [ ] Optional: short demo video
