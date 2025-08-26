import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Auth/Login';
import { RoleSelection } from './components/Auth/RoleSelection';
import { TeacherDashboard } from './components/Teacher/TeacherDashboard';
import { StudentDashboard } from './components/Student/StudentDashboard';
import { AppHeader } from './components/AppHeader';

function AppContent() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div>
        <AppHeader />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <AppHeader />
        <Login />
      </div>
    );
  }

  if (!profile) {
    return (
      <div>
        <AppHeader />
        <RoleSelection />
      </div>
    );
  }

  if (profile.role === 'teacher') {
    return (
      <div>
        <AppHeader />
        <TeacherDashboard />
      </div>
    );
  }

  return (
    <div>
      <AppHeader />
      <StudentDashboard />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App
