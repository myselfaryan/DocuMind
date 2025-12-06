# DocuMind
**AI-Assisted Document Authoring & Generation Platform**

DocuMind is a modern, full-stack application designed to revolutionize how you create business documents. By leveraging the power of Google's Gemini AI, DocuMind automates the generation of structured Word Documents (.docx) and PowerPoint Presentations (.pptx), allowing you to focus on the content that matters.

## 🚀 Features

*   **AI-Powered Content Generation**: Automatically generate comprehensive content for entire documents or specific sections/slides using Google Gemini.
*   **Smart Outlines**: Create custom outlines or let AI suggest the structure for your reports and presentations.
*   **Refinement Workflow**: Iterate on your content with AI. Request changes (e.g., "Make it more formal", "Add statistics") and view a complete history of your refinements.
*   **Document Export**: Seamlessly export your finalized projects to professional `.docx` and `.pptx` files.
*   **Project Management**: Organize your work with a dashboard view of all your document projects.
*   **Secure Authentication**: User registration and login protected by JWT authentication.

## 🧩 Tech Stack

### Frontend
*   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components**: [Shadcn UI](https://ui.shadcn.com/) / Lucide React
*   **State Management**: React Hooks

### Backend
*   **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
*   **Database**: [PostgreSQL](https://www.postgresql.org/) (via [Neon](https://neon.tech/))
*   **ORM**: [SQLAlchemy](https://www.sqlalchemy.org/)
*   **AI Model**: [Google Gemini API](https://ai.google.dev/)
*   **Document Processing**: `python-docx` & `python-pptx`

## 📂 Project Structure

```
DocuMind/
│
├── backend/                 # FastAPI Backend
│   ├── main.py             # Entry point
│   ├── database.py         # DB connection
│   ├── models.py           # SQLAlchemy models
│   ├── schemas.py          # Pydantic schemas
│   ├── routers/            # API endpoints
│   ├── services/           # Business logic (AI, Export)
│   └── requirements.txt    # Python dependencies
│
└── frontend/               # Next.js Frontend
    ├── app/                # App Router pages & API routes
    ├── components/         # Reusable UI components
    ├── lib/                # Utilities & Auth helpers
    └── public/             # Static assets
```

## ⚙️ Setup Instructions

### Prerequisites
*   Node.js & npm
*   Python 3.8+
*   PostgreSQL Database (or a Neon connection string)
*   Google Gemini API Key

### 1. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Create and activate a virtual environment:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Configure environment variables:
Create a `.env` file in the `backend` directory:
```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
JWT_SECRET=your_secret_key
BACKEND_URL=http://localhost:8000
```

Run the server:
```bash
uvicorn main:app --reload
```
The backend will be available at `http://localhost:8000`. API Docs at `http://localhost:8000/docs`.

### 2. Frontend Setup

Navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Configure environment variables:
Create a `.env.local` file in the `frontend` directory:
```env
BACKEND_URL=http://localhost:8000
```

Run the development server:
```bash
npm run dev
```
The application will be running at `http://localhost:3000`.

## 🔌 API Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **Auth** | | |
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login and receive JWT |
| **Projects** | | |
| `GET` | `/project/list` | List all user projects |
| `POST` | `/project/create` | Create a new project |
| `POST` | `/project/{id}/generate` | Generate content for all sections |
| `DELETE` | `/project/{id}` | Delete a project |
| **Refinement** | | |
| `POST` | `/refine/refine` | Refine section content |
| `GET` | `/refine/section/{id}/refinements` | Get refinement history |

## 📄 License

This project is licensed under the MIT License.

