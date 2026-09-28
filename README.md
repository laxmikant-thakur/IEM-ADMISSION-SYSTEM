# IEM Admission System

The IEM Admission System provides a complete applicant and administrator workflow for managing college admissions.

The system separates frontend presentation, backend business logic, authentication, structured database storage, document handling, and administrative operations.

## Architecture Overview

The frontend is responsible for the user interface and client-side interaction.
The backend is responsible for authentication, authorization, validation, business rules, database operations, and application processing.

> **Note:** The backend is the final authority for important business rules. Frontend validation is not treated as a replacement for backend validation.

---

## Complete System Flow

```text
                         IEM ADMISSION SYSTEM
                                  |
                +-----------------+-----------------+
                |                                   |
                v                                   v
           APPLICANT                             ADMIN
                |                                   |
                v                                   v
           Register                              Login
                |                                   |
                v                                   v
             Login                              Dashboard
                |                                   |
                v                    +--------------+--------------+
           Application               |              |              |
                |                    v              v              v
                v               Applications    Students     Seat Management
        Upload Documents             |              |              |
                |                    v              v              v
                v                 Review        Filtering      Manage Seats
           Submit App                |
                |                    v
                v             Check Documents
           Submitted                 |
                |                    v
                |              Check Eligibility
                |                    |
                |                    v
                |             Check Seat Availability
                |                    |
                |             +------+------+
                |             |             |
                |             v             v
                |          Accept        Reject
                |             |             |
                |             v             v
                |        Seat - 1      Store Reason
                |             |             |
                |             +------+------+
                |                    |
                v                    v
           View Status          Final Status
```

---

## User Roles

### Applicant
Applicants can:
- Register and Log in
- Complete an application
- Upload documents
- Submit an application
- View application information and status

Applicants cannot:
- Access administrator pages
- Approve/Reject applications
- Modify department seat counts
- Modify an already submitted application

### Administrator
Administrators can:
- Log in through the administrator login
- View and Review applications
- View applicant information & uploaded documents
- Accept/Reject applications and enter rejection reasons
- View accepted, rejected, and awaiting-review students
- Filter students
- Manage department seats

---

## Application Status Lifecycle

The application follows this lifecycle:

```text
Submitted
    |
    | Application deadline passes
    v
Under Review
    |
    +----------------+
    |                |
    v                v
Accepted         Rejected
```

- **Submitted:** The application has been successfully submitted and the application period has not yet passed.
- **Under Review:** After the application deadline, submitted applications move into the administrative review stage.
- **Accepted:** The administrator approves the application. One seat is allocated from the applicant's selected department.
- **Rejected:** The administrator rejects the application. A rejection reason is recorded.

---

## Department Seat Management

Each department has a configured seat capacity. 
Example:
- `CSE` 2 / 6 (2 seats available out of 6 total)
- `ECE` 6 / 6
- `IT`  3 / 6

**Seat Allocation Rules:**
1. Submitting an application does not reduce seats.
2. Rejecting an application does not reduce seats.
3. Accepting an application reduces one available seat from the selected department.
4. Accepting an application does not change other departments.
5. A department with zero available seats cannot accept another applicant.
6. Available seats cannot become negative.
7. Seat information is maintained by the backend/database rather than being calculated independently by the frontend.

---

## Database Architecture

The system uses two databases for different responsibilities:

1. **MySQL**: Stores structured relational information (Applicant/Admin accounts, Applications, Status, Departments, Seats, Rejection info).
2. **MongoDB**: Used for the document-storage side of the application (Uploaded Document Data / Metadata references).

Structured applicant and application data should not be unnecessarily duplicated between the two databases.

---

## Prerequisites

Install the following before running the project:
- Node.js (`node --version`)
- npm (`npm --version`)
- MySQL Server
- MongoDB Server or MongoDB deployment
- Git (`git --version`)

## Installation

### 1. Clone the Repository
```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd IEM-Admission-System
```

### 2. Frontend Installation
```bash
cd Frontend
npm install
```

### 3. Backend Installation
```bash
cd Backend
npm install
```

---

## Environment Configuration

Create a `.env` file inside the backend directory (refer to `.env.example`).
**Do not commit the real `.env` file to GitHub.**

```env
PORT=5000

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=your_mysql_user
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=iem_admission

MONGODB_URI=mongodb://localhost:27017/iem_admission

SESSION_SECRET=your_secure_session_secret

ADMIN_1_EMAIL=admin1@example.com
ADMIN_1_PASSWORD=your_password
# Add more admins as needed...
```

---

## Setup

### MySQL Setup
Create the project database:
```sql
CREATE DATABASE iem_admission;
USE iem_admission;
```
Create the required tables using the SQL schema provided with the project.

### MongoDB Setup
Start MongoDB using the local service or deployment. Ensure `MONGODB_URI` is correctly configured in `.env`.

### Admin Account Setup
Administrator accounts are not created through a public registration page. Because this is a highly sensitive security issue, the process is split across three components to ensure passwords are never exposed in the source code:

1. **The `.env` File (The ONLY place for real passwords):**
   This file lives exclusively on your local computer or production server and is blocked from GitHub via `.gitignore`. You must put your **REAL** admin email, password, and name here.
   ```env
   ADMIN_1_NAME=John Doe
   ADMIN_1_EMAIL=admin.john@example.com
   ADMIN_1_PASSWORD=SuperSecretAdminPassword123!
   ```

2. **The `.env.example` File (The Blueprint):**
   This file is uploaded to GitHub for other developers. It acts as a template. You leave the values **BLANK** or use generic placeholders. You **never** put real passwords here.
   ```env
   ADMIN_1_NAME=
   ADMIN_1_EMAIL=
   ADMIN_1_PASSWORD=
   ```

3. **The `seed.js` Script (The Machine):**
   This script (`Backend/src/config/seed.js`) automates the creation process. You **do not** type your email or password anywhere in this code.

**To create the Admin accounts:**
Once your real credentials are saved in your local `.env` file, simply run the seed script:
```bash
npm run seed
```
The script will automatically reach into your secret `.env` file, securely hash the passwords, and save them into the MySQL database. It avoids creating duplicates and will update passwords if they change.

---

## Running the Application

### Start the Backend
From the `Backend` directory:
```bash
npm run dev
```

### Start the Frontend
From the `Frontend` directory:
```bash
npm run dev
```
The frontend development server will usually be available at `http://localhost:5173`.

---

## Authentication & Security

- **Authentication:** The project uses stateful, server-side session authentication (JWT is not used).
- **Authorization:** Role-based authorization distinguishes applicant and administrator access.
- **Passwords:** Hashed before storage. Plain-text passwords are never stored.
- **Validation:** Enforced heavily on the backend. Frontend validation alone is not considered sufficient.

---

## Testing

The project includes automated unit tests for important frontend, backend, validation, and admission-related logic.

To run tests:
**Frontend:** `npm test`
**Backend:** `npm test`

Tests are strictly organized alongside their corresponding frontend/backend source structures.

## API Overview

The backend exposes REST APIs spanning across:
- **Authentication:** Registration, Login, Logout, Current User
- **Applications:** Create, Retrieve, Submit, Status checks
- **Administration:** Retrieve apps, Review, Accept, Reject, Retrieve students
- **Departments / Seats:** Retrieve departments, seat info, update seats

---

### Before Deploying
1. Verify exact **npm commands** in `package.json`.
2. Verify exact **`.env` variable names** used by the backend.
3. Verify exact **API endpoint names** from your `routes/` files.
4. Verify exact **MySQL/MongoDB database and collection/table names**.
