# AI Customer Support System

## 🚀 How to Run

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd ai-customer-support
```

### 2. Frontend Setup

Open a terminal in the project root:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

### 3. Backend Setup

Open a new terminal:

```powershell
cd backend
```

Create a Python virtual environment:

```powershell
python -m venv .venv
```

Activate it:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install backend dependencies:

```powershell
pip install -r requirements.txt
```

Start the FastAPI server:

```powershell
uvicorn main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

FastAPI documentation:

```text
http://127.0.0.1:8000/docs
```

### 4. Run Frontend and Backend Together

You need two terminals.

**Terminal 1 — Frontend**

```powershell
cd ai-customer-support
npm run dev
```

**Terminal 2 — Backend**

```powershell
cd ai-customer-support\backend
.\.venv\Scripts\Activate.ps1
uvicorn main:app --reload
```

Then open:

```text
http://localhost:5173
```

---

## 🔐 Environment Variables

Create a `.env` file inside the `backend` folder:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
GROQ_API_KEY=your_groq_api_key
```

Never commit `.env` to GitHub.

---

## 📧 Gmail Setup

The Gmail integration uses the Gmail API and Google OAuth.

Place your Google OAuth credentials inside:

```text
backend/
├── credentials.json
└── token.json
```

`credentials.json` must be obtained from Google Cloud.

On the first Gmail authentication, the application generates:

```text
backend/token.json
```

Both files are sensitive and must never be committed to GitHub.

The Gmail integration supports:

- Reading emails
- Sending emails
- Modifying emails
- Moving emails to Trash
- Searching emails
- Monitoring incoming support emails

---

## 🤖 AI Features

The system uses AI for:

- Email classification
- Ticket categorization
- Priority detection
- AI-generated support workflows
- Knowledge-base question answering
- Retrieval-Augmented Generation (RAG)

Main AI technologies:

- Groq
- Sentence Transformers
- `all-MiniLM-L6-v2`
- RAG

---

## 📚 Knowledge Base

The Knowledge Base allows support documents to be uploaded and processed.

The process is:

1. Upload a document.
2. Extract the document content.
3. Split the content into chunks.
4. Generate embeddings.
5. Store the chunks in Supabase.
6. Retrieve relevant information when a question is asked.
7. Generate an AI-powered answer.

---

## 📬 Gmail Email Monitoring

The backend includes a Gmail scheduler that automatically checks for new support-related emails.

The scheduler runs when the FastAPI application starts and checks Gmail approximately every **5 minutes**.

New support emails can be:

- Retrieved from Gmail
- Classified using AI
- Assigned a priority
- Assigned a category
- Converted into support tickets
- Stored in Supabase

---

## 🗂️ Project Structure

```text
ai-customer-support/
│
├── backend/
│   ├── main.py
│   ├── gmail_service.py
│   ├── gmail_scheduler.py
│   ├── credentials.json
│   ├── token.json
│   ├── .env
│   └── knowledge_uploads/
│
├── public/
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── layouts/
│   └── pages/
│
├── .gitignore
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

> `credentials.json`, `token.json`, and `.env` are local files and must not be committed to GitHub.

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS
- DOMPurify

### Backend

- Python
- FastAPI
- Uvicorn

### Database

- Supabase

### AI / Machine Learning

- Groq
- Sentence Transformers
- `all-MiniLM-L6-v2`
- Retrieval-Augmented Generation (RAG)

### Email

- Gmail API
- Google OAuth

---

## 🔒 Security

The following files and folders must not be committed:

```text
.env
.env.*
credentials.json
token.json
.venv/
node_modules/
__pycache__/
```

Never put API keys, passwords, OAuth credentials, or access tokens directly inside source code.

---

## 🐛 Troubleshooting

### PowerShell does not allow virtual environment activation

Run:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then:

```powershell
.\.venv\Scripts\Activate.ps1
```

### Frontend dependencies are missing

Run:

```powershell
npm install
```

### Gmail authentication problems

Delete the local token:

```text
backend/token.json
```

Then restart the backend and authenticate with Google again.

### Backend port is already in use

Run the backend on another port:

```powershell
uvicorn main:app --reload --port 8001
```

---

## 👨‍💻 Development URLs

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://127.0.0.1:8000
```

FastAPI Swagger documentation:

```text
http://127.0.0.1:8000/docs
```

---

## 📌 Current Features

- Customer support dashboard
- Ticket management
- Gmail email monitoring
- Gmail email explorer
- HTML email rendering
- Email search
- Email deletion / Trash functionality
- AI ticket classification
- Priority detection
- Knowledge Base
- RAG-based question answering
- Supabase integration
- Gmail background scheduler

---

## 📄 License

This project is developed as a capstone project.
