import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export function RoleSelection() {
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'student' | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { setRole } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !selectedRole) return;

    setLoading(true);
    setError('');

    try {
      await setRole(selectedRole, name);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1>Complete Your Profile</h1>
      <p>Please select your role and enter your name to continue.</p>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Your Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Role:</label>
          <div style={{ marginTop: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              <input
                type="radio"
                value="teacher"
                checked={selectedRole === 'teacher'}
                onChange={(e) => setSelectedRole(e.target.value as 'teacher')}
                style={{ marginRight: '8px' }}
              />
              Teacher
            </label>
            <label style={{ display: 'block' }}>
              <input
                type="radio"
                value="student"
                checked={selectedRole === 'student'}
                onChange={(e) => setSelectedRole(e.target.value as 'student')}
                style={{ marginRight: '8px' }}
              />
              Student
            </label>
          </div>
        </div>
        
        {error && (
          <div style={{ color: 'red', marginBottom: '15px' }}>
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading || !name || !selectedRole}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading || !name || !selectedRole ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Setting up...' : 'Continue'}
        </button>
      </form>
    </div>
  );
}