# Speakeasy Education Platform MVP

A minimal full-stack web application for Speakeasy with simple structure: 1 teacher, 1 class, students join via class code.

## Tech Stack

- **Frontend**: React with TypeScript (Vite)
- **Backend**: Node.js with Express and TypeScript  
- **Database**: Supabase (PostgreSQL with built-in auth)
- **Authentication**: Supabase Auth
- **File Upload**: Supabase Storage for video files

## Project Structure

```
speakeasy/
├── frontend/          # React TypeScript app
├── backend/           # Express TypeScript API
└── README.md         # This file
```

## Database Schema

The application uses the following Supabase tables (start empty):

### Tables:
1. **profiles** (extends auth.users)
   - id (uuid, references auth.users)
   - role ('teacher' or 'student')
   - name (text)

2. **class** (single class only)
   - id (uuid)
   - name (text)
   - join_code (text, unique)
   - teacher_id (uuid, references profiles)

3. **assignments**
   - id (uuid)
   - title (text)
   - description (text)
   - due_date (timestamp)

4. **submissions**
   - id (uuid)
   - assignment_id (uuid, references assignments)
   - student_id (uuid, references profiles)
   - video_url (text)
   - score (integer)
   - feedback_json (jsonb)
   - submitted_at (timestamp)

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file with the provided Supabase credentials:
   ```
   SUPABASE_URL=https://hhqkzwfmzwocbnvhtmvp.supabase.co
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhocWt6d2ZtendvY2Judmh0bXZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzMwMTQwMCwiZXhwIjoyMDY4ODc3NDAwfQ.q5N-ShfMoG41aLmldEsZHf_WmA1csK_mUsNmI38WdfE
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file with the provided Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://hhqkzwfmzwocbnvhtmvp.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhocWt6d2ZtendvY2Judmh0bXZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDE0MDAsImV4cCI6MjA2ODg3NzQwMH0.V7FXhcgV_wTjMmtrRRrP3RR7Kj-nwQntOTDYT4QBd1Y
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:5173`

## Usage

### Getting Started

1. **Create Database Tables**: In your Supabase dashboard, create the required tables using the schema above.

2. **Set up Storage**: Create a 'videos' bucket in Supabase Storage for video uploads.

3. **First Teacher Setup**:
   - Visit the frontend application
   - Sign up with an email/password
   - Select "Teacher" role
   - Manually create a class record in the Supabase dashboard with a join code

4. **Student Flow**:
   - Sign up with email/password
   - Select "Student" role
   - Enter the class join code provided by the teacher
   - View assignments and submit videos

### Key Features

- **Authentication**: Email/password signup and login
- **Role-based Access**: Different dashboards for teachers and students
- **Assignment Management**: Teachers can create assignments with due dates
- **Video Submissions**: Students can upload video files via Supabase Storage
- **Feedback System**: Webhook endpoint ready for AI feedback integration

## API Endpoints

### Auth
- `POST /api/auth/set-role` - Set user role after signup

### Class
- `GET /api/class` - Get class information
- `POST /api/class/join` - Student joins class with code

### Assignments
- `GET /api/assignments` - Get all assignments
- `POST /api/assignments` - Create new assignment (teacher only)
- `POST /api/assignments/:id/submit` - Submit video for assignment

### Submissions
- `GET /api/submissions` - Get submissions (role-based filtering)

### Webhook
- `POST /api/webhook/feedback` - Receive AI feedback from external service

## Development Notes

- All tables start empty - you'll need to manually populate initial data
- Single class system - hardcode class relationships where needed
- Simple role-based routing - teacher sees different pages than students
- Basic file upload to Supabase Storage
- Minimal UI styling - focus on functionality over design

## Next Steps

To extend this MVP:
1. Add proper error handling and loading states
2. Implement proper class management (multiple classes)
3. Add user management features
4. Integrate with n8n workflow for AI feedback
5. Add real-time updates with Supabase subscriptions
6. Improve UI/UX design