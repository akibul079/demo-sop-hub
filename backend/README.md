<<<<<<< HEAD
# SOP Hub

**SOP Hub** is a modern, collaborative platform for creating, managing, and executing Standard Operating Procedures (SOPs). Designed for multi-tenant environments, it streamlines knowledge sharing, ensures compliance through approval workflows, and provides actionable checklists for teams.

---

## 🚀 Features

### 🏢 Workspaces & Multi-Tenancy
- **Isolated Environments**: Secure data separation for different organizations.
- **Role-Based Access Control (RBAC)**: Granular permissions for Super Admins, Admins, Managers, and Members.

### 📝 SOP Management
- **Rich Text Editor**: Create comprehensive SOPs with a block-based editor.
- **Versioning**: Track changes with full version history and rollback capabilities.
- **Categorization**: Organize content with nested folders, tags, and difficulty levels.
- **Templates**: Jumpstart creation with pre-built templates for common processes.

### ✅ Workflow & Execution
- **Interactive Checklists**: Instantiated runs of SOPs with progress tracking.
- **Approval System**: Strict `Submit -> Review -> Publish` workflows for quality control.
- **PDF Export**: Generate professional PDF documents for offline use.

### 👥 Collaboration
- **Comments**: Inline discussions on SOPs.
- **Assignments**: Assign specific SOPs to users for training or execution.

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (assumed based on trends, confirm if using vanilla CSS as per system prompt) & Lucide Icons
- **Editor**: [Lexical](https://lexical.dev/)
- **AI Integration**: [Google GenAI](https://ai.google.dev/)

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A Supabase project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/sop-hub.git
   cd sop-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
    Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📂 Project Structure

```
sop-hub/
├── components/       # Reusable UI components
├── lib/             # Utility functions and helpers
├── public/          # Static assets
├── types.ts         # TypeScript definitions
├── database.sql     # Database schema definitions
├── DATABASE_DOCS.md # Detailed database documentation
├── src/             
│   ├── App.tsx      # Main application component
│   └── main.tsx     # Entry point
└── package.json     # Dependencies and scripts
```

---

## 📚 Documentation
For a deep dive into the data model:
- 📖 [Database Documentation](./DATABASE_DOCS.md) - Full schema reference including Enums, Tables, and Relationships.
=======
# SOP Hub Backend

FastAPI backend for SOP Hub.

## Setup

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Database

By default, this uses SQLite (`sophub.db`). The database is auto-initialized on startup.
To use PostgreSQL, update `DATABASE_URL` in `.env` or `app/core/config.py`.

## First Login

Since the DB starts empty, you need to create a user first via the API or CLI.
Use `POST /api/v1/users/` to create your first admin/user.
>>>>>>> 69df247 (updated token)
