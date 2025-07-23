import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Auth/Login';
import { RoleSelection } from './components/Auth/RoleSelection';
import { TeacherDashboard } from './components/Teacher/TeacherDashboard';
import { StudentDashboard } from './components/Student/StudentDashboard';

function AppContent() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (!profile) {
    return <RoleSelection />;
  }

  if (profile.role === 'teacher') {
    return <TeacherDashboard />;
  }

  return <StudentDashboard />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App
