# 📓 Digital Productivity Diary — B.Tech Edition

A full-stack personal productivity diary app built for B.Tech students. Dark-themed, modern UI inspired by Notion/Todoist.

---

## 🚀 Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18 + Vite + Tailwind CSS      |
| Backend    | Node.js + Express                   |
| Database   | MongoDB Atlas (free cloud DB)       |
| Auth       | JWT (JSON Web Tokens) + bcryptjs    |
| Charts     | Chart.js + react-chartjs-2          |
| Icons      | Lucide React                        |

---

## ✅ Features

- 🔐 Secure Login/Register with JWT
- 📋 Task Manager (add, edit, delete, complete with checkbox)
- 📓 Daily Diary with auto-save
- 😄 Mood Tracker (5 moods per day)
- 📊 Analytics — weekly bar charts, line graphs, completion rates
- 🔥 Streak Tracker
- ⏱️ Productive vs Wasted Time tracking
- 🌙 Full dark theme

---

## 📁 Project Structure

```
digital-productivity-diary/
├── client/          ← React Frontend (Vite)
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── context/
│       └── services/
└── server/          ← Node.js + Express Backend
    ├── config/
    ├── models/
    ├── routes/
    ├── controllers/
    └── middleware/
```

---

## ⚙️ SETUP INSTRUCTIONS (Step by Step)

### Prerequisites
Make sure you have installed:
- [Node.js](https://nodejs.org) (v18 or higher)
- [Git](https://git-scm.com)
- A code editor like [VS Code](https://code.visualstudio.com)

---

### STEP 1 — Get MongoDB URI

1. Go to https://cloud.mongodb.com and create a free account
2. Click "Create a Free Cluster" → choose M0 Free Tier
3. Go to **Database Access** → Add User (username + password, save them!)
4. Go to **Network Access** → Add IP Address → Allow from Anywhere (0.0.0.0/0)
5. Go to your cluster → Click **Connect** → **Drivers** → Copy the URI:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/
   ```
6. Add your DB name at the end:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/productivity-diary
   ```

---

### STEP 2 — Setup Backend

```bash
cd server

# Copy the env template
cp .env.example .env
```

Now open `server/.env` in VS Code and fill in your details:
```
MONGO_URI=mongodb+srv://youruser:yourpass@cluster0.xxxxx.mongodb.net/productivity-diary
JWT_SECRET=anyLongRandomStringYouChoose123456
PORT=5000
CLIENT_URL=http://localhost:5173
```

```bash
# Install dependencies
npm install

# Start the server (development)
npm run dev
```

You should see:
```
🚀 Server running on port 5000
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
```

---

### STEP 3 — Setup Frontend

Open a new terminal window:

```bash
cd client

# Install dependencies
npm install

# Start the dev server
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in XXX ms
  ➜  Local:   http://localhost:5173/
```

Open http://localhost:5173 in your browser. Register an account and start using the app!

---

## 🌐 DEPLOYMENT GUIDE

### Deploy Backend to Render (Free)

1. Push your project to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/productivity-diary.git
   git push -u origin main
   ```

2. Go to https://render.com → Sign up free → **New Web Service**

3. Connect your GitHub repo

4. Configure:
   - **Name**: productivity-diary-api
   - **Root Directory**: server
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node

5. Add Environment Variables in Render dashboard:
   ```
   MONGO_URI        = your mongodb uri
   JWT_SECRET       = your jwt secret
   CLIENT_URL       = https://your-frontend-url.vercel.app
   NODE_ENV         = production
   ```

6. Click **Deploy** — your API will be live at something like:
   `https://productivity-diary-api.onrender.com`

---

### Deploy Frontend to Vercel (Free)

1. Go to https://vercel.com → Sign up → **New Project**

2. Import your GitHub repository

3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: client
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Add Environment Variables:
   ```
   VITE_API_URL = https://productivity-diary-api.onrender.com/api
   ```

5. Update `client/src/services/api.js` — change the baseURL to use the env var:
   ```js
   baseURL: import.meta.env.VITE_API_URL || '/api',
   ```

6. Also update `client/vite.config.js` proxy target to your Render URL for local dev.

7. Click **Deploy** — your app will be live! 🎉

---

## 🔮 Future Improvements

- [ ] Google OAuth login
- [ ] Push notifications / reminders
- [ ] Pomodoro timer integration
- [ ] Export diary as PDF
- [ ] Monthly calendar view
- [ ] Shared study groups
- [ ] AI-powered weekly summary
- [ ] Mobile app (React Native)

---

## 🛡️ Security Notes

- Passwords are hashed with bcryptjs (never stored plain)
- JWT tokens expire in 7 days
- All API routes are protected with the auth middleware
- CORS is restricted to your frontend URL in production

---

Made with 💜 for B.Tech students
