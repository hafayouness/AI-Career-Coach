# AI Career Coach 🚀

**AI Career Coach** is an AI-powered web platform designed to help job seekers improve their CVs, analyze job opportunities, manage applications, and prepare for interviews.

The platform analyzes the candidate's actual CV and compares it with a job description to identify matching skills, missing requirements, and opportunities for improvement — without inventing qualifications or professional experience.

## ✨ Features

- **CV Import & Analysis:** Upload CVs in PDF or DOCX format and extract professional information.
- **Job Offer Analysis:** Compare a CV with a job offer and identify matching skills, missing requirements, and relevant keywords.
- **AI-Powered CV Tailoring:** Generate a customized CV for a specific position, review changes, and export the validated version as a PDF.
- **Personal Pitch Generator:** Prepare professional introductions and personalized answers to common interview questions.
- **Interview Preparation:** Generate HR, technical, and behavioral questions based on the candidate's profile and target position.
- **Interactive Interview Simulation:** Practice with an AI interviewer and receive feedback and a final performance report.
- **Application Tracking:** Organize job applications, statuses, interview dates, and follow-up actions.
- **Dashboard & History:** Track analyses, CV versions, interview sessions, and career preparation progress.

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- TypeScript
- CSS3
- React Router
- Axios
- Lucide React

### Backend

- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JWT Authentication
- bcrypt
- Multer
- Zod
- Helmet

### Artificial Intelligence

- Configurable AI provider
- CV analysis and job matching
- Personalized interview question generation
- Interview response evaluation

### Document Processing

- PDF and DOCX text extraction
- PDF generation
- Secure document uploads

## 🏗️ Project Structure

```text
AI-Career-Coach/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.example
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── database/
│   │   ├── migrations/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   └── server.ts
│   ├── uploads/
│   ├── tests/
│   ├── package.json
│   └── .env.example
├── .gitignore
└── README.md
```

## ⚙️ Getting Started

### Prerequisites

Make sure you have installed:

- Node.js and npm
- PostgreSQL
- An AI provider API key, if using a hosted AI service

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/AI-Career-Coach.git
cd AI-Career-Coach
```

Replace `YOUR_USERNAME` with your GitHub username.

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file based on `.env.example` and configure your environment variables:

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/ai_career_coach
JWT_SECRET=replace_with_a_secure_random_secret
AI_PROVIDER=gemini
AI_API_KEY=your_ai_api_key
AI_MODEL=your_selected_model
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=10
```

Create the PostgreSQL database and run the database migrations using the commands configured in the backend's `package.json`.

**Security:** Never commit your `.env` file or expose your AI API key in the frontend.

### 3. Start the backend

From the `backend` directory, run the development command defined in `package.json`, for example:

```bash
npm run dev
```

The API should be available at:

```text
http://localhost:5000
```

### 4. Configure the frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create a `.env` file based on `.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 5. Start the frontend

```bash
npm run dev
```

Open the local URL displayed by Vite, usually:

```text
http://localhost:5173
```

> These commands assume the corresponding scripts, migrations, environment variables, and API routes have been implemented in the project.

## 🔐 Security & Data Integrity

- Passwords must be securely hashed.
- Protected routes must enforce authentication and user-specific access.
- Uploaded files must be validated and stored securely.
- AI API keys must remain on the backend.
- CV modifications must be reviewed before acceptance.
- The AI must never invent skills, qualifications, languages, experience, certifications, or achievements.
- Missing skills must be reported honestly rather than added automatically.

## 🗺️ Roadmap

- [ ] Frontend and backend setup
- [ ] PostgreSQL database and Sequelize migrations
- [ ] Authentication and user profiles
- [ ] PDF/DOCX CV import and text extraction
- [ ] AI-powered CV and job offer analysis
- [ ] CV customization and PDF export
- [ ] Personalized interview preparation
- [ ] Interactive interview simulations
- [ ] Job application tracking
- [ ] Automated tests and security validation
- [ ] Deployment

## 🤝 Contributing

Contributions, suggestions, and bug reports are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Open a pull request.

## 📄 License

Choose and add an appropriate open-source license before distributing the project.

---

**AI Career Coach — Prepare smarter. Apply with confidence.**
