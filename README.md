# 🎨 Design O Thon – Setup Guide

A complete hackathon management system for a 3-round design hackathon.

---

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
cd design-o-thon
npm install
```

### Step 2: Configure Environment

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/design-o-thon
BASE_URL=http://localhost:5000

# Gmail (use App Password, not your regular password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_char_app_password
EMAIL_FROM=Design O Thon <your_email@gmail.com>
```

> **Gmail App Password**: Go to Google Account → Security → 2-Step Verification → App Passwords → Generate one for "Mail"

### Step 3: Start MongoDB

Make sure MongoDB is running locally:
```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Or use MongoDB Atlas (cloud) — update MONGO_URI accordingly
```

### Step 4: Run the Server

```bash
npm start
# or for development with auto-restart:
npm run dev
```

---

## 📱 Pages & URLs

| Page | URL | Who Uses It |
|------|-----|-------------|
| Registration | http://localhost:5000/registration.html | Teams |
| Admin Panel | http://localhost:5000/admin.html | Organizers |
| Scoring Panel | http://localhost:5000/scoring.html?userId=XXX&role=mentor | Mentors/Judges |
| Live Projection | http://localhost:5000/projection.html | Audience/Organizers |

---

## 📋 Step-by-Step Workflow

### 1. Load Teams
- Go to **Registration** page
- Click **"Upload CSV"** and upload `sample-teams.csv`
- Or add teams manually with the **"+ Add Team"** button

### 2. Add Mentors & Judges
- Go to **Admin Panel**
- Click **"+ Add Mentor"** or switch to Judges tab → **"+ Add Judge"**
- Fill name, email, organization, role
- Click **"Add & Send Email"** → they receive a scoring link via email

### 3. Assign Teams
- In Admin Panel, click **"Assign Teams Automatically"**
- Teams are distributed equally among mentors (R1+R2) and judges (R3)

### 4. Teams Register
- Teams visit the **Registration** page
- Find their team, fill in details, click **"Register Team"**

### 5. Scoring
- Mentors/Judges click their emailed link
- They see their assigned teams and submit scores per round

### 6. Track Progress
- Open **Live Projection** page on a big screen
- It auto-refreshes every 15 seconds
- See who's been evaluated and the live leaderboard

---

## 🗂️ API Endpoints

### Teams
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/teams | Get all teams |
| GET | /api/teams/:id | Get single team |
| POST | /api/teams/add | Add a team manually |
| POST | /api/teams/register/:id | Register a team |
| POST | /api/teams/upload-csv | Upload CSV to bulk-import teams |
| POST | /api/teams/assign | Auto-assign teams to mentors/judges |
| POST | /api/teams/:id/score | Submit scores for a team |

### Users (Mentors/Judges)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users | Get all users |
| GET | /api/users/by-uid/:userId | Get user by unique link ID |
| POST | /api/users/add | Add mentor or judge |
| DELETE | /api/users/:id | Remove a user |
| GET | /api/users/stats/summary | Get dashboard stats |

---

## 📊 Scoring Structure

| Round | Evaluator | Criteria | Max/Criteria | Total |
|-------|-----------|----------|-------------|-------|
| Round 1 | Mentor | 5 | 5 marks | 25 |
| Round 2 | Mentor | 5 | 5 marks | 25 |
| Round 3 | Judge | 5 | 10 marks | 50 |
| **Total** | | | | **100** |

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **Email**: Nodemailer
- **File Upload**: Multer + csv-parser
- **Frontend**: Vanilla HTML/CSS/JS
- **Fonts**: Syne + DM Sans (Google Fonts)

---

## 🔧 Troubleshooting

**MongoDB won't connect**: Make sure MongoDB is running. Check `MONGO_URI` in `.env`.

**Email not sending**: 
- Use Gmail App Password (not your login password)
- Enable 2FA on your Google account first
- Check spam folder

**Teams not showing after CSV upload**: CSV must have a column named `teamName`, `Team Name`, or `team_name`.

**Scoring link not working**: The `userId` in the URL must match a user in the database. Re-add the mentor/judge if needed.
