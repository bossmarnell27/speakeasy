import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
}

interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  video_url: string | null;
  score: number | null;
  feedback_json: any | null;
  submitted_at: string;
  word_choice_feedback: string | null;
  body_language_feedback: string | null;
  filler_word_feedback: string | null;
  assignments: {
    title: string;
    description: string;
    due_date: string;
  };
  profiles: {
    name: string;
  };
}

export function TeacherDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    dueDate: ''
  });
  const { user, signOut } = useAuth();

  useEffect(() => {
    fetchAssignments();
    fetchSubmissions();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/assignments');
      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/submissions?userId=${user?.id}&role=teacher`);
      const data = await response.json();
      setSubmissions(data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const createAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAssignment),
      });

      if (response.ok) {
        setNewAssignment({ title: '', description: '', dueDate: '' });
        setShowCreateForm(false);
        fetchAssignments();
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Teacher Dashboard</h1>
        <button
          onClick={signOut}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Sign Out
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Assignments Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Assignments</h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Create Assignment
            </button>
          </div>

          {showCreateForm && (
            <form onSubmit={createAssignment} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <div style={{ marginBottom: '10px' }}>
                <label>Title:</label>
                <input
                  type="text"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Description:</label>
                <textarea
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '5px', height: '80px' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label>Due Date:</label>
                <input
                  type="datetime-local"
                  value={newAssignment.dueDate}
                  onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                />
              </div>
              <div>
                <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', marginRight: '10px' }}>
                  Create
                </button>
                <button type="button" onClick={() => setShowCreateForm(false)} style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div>
            {assignments.map((assignment) => (
              <div key={assignment.id} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '10px' }}>
                <h3>{assignment.title}</h3>
                <p>{assignment.description}</p>
                <p><strong>Due:</strong> {new Date(assignment.due_date).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Submissions Section */}
        <div>
          <h2>Student Submissions</h2>
          <div>
            {submissions.map((submission) => (
              <div key={submission.id} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '10px' }}>
                <h4>{submission.assignments.title}</h4>
                <p><strong>Student:</strong> {submission.profiles.name}</p>
                <p><strong>Submitted:</strong> {new Date(submission.submitted_at).toLocaleString()}</p>
                {submission.video_url && (
                  <p><strong>Video:</strong> <a href={submission.video_url} target="_blank" rel="noopener noreferrer">View Video</a></p>
                )}
                {submission.score && (
                  <p><strong>Score:</strong> {submission.score}/100</p>
                )}
                {(submission.word_choice_feedback || submission.body_language_feedback || submission.filler_word_feedback) && (
                  <div style={{ marginTop: '15px' }}>
                    <strong>AI Analysis Feedback:</strong>
                    <div style={{ marginTop: '10px' }}>
                      {submission.word_choice_feedback && (
                        <div style={{ marginBottom: '8px', padding: '8px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
                          <strong style={{ color: '#1976d2' }}>Word Choice:</strong>
                          <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>{submission.word_choice_feedback}</p>
                        </div>
                      )}
                      {submission.body_language_feedback && (
                        <div style={{ marginBottom: '8px', padding: '8px', backgroundColor: '#f3e5f5', borderRadius: '4px' }}>
                          <strong style={{ color: '#7b1fa2' }}>Body Language:</strong>
                          <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>{submission.body_language_feedback}</p>
                        </div>
                      )}
                      {submission.filler_word_feedback && (
                        <div style={{ marginBottom: '8px', padding: '8px', backgroundColor: '#fff3e0', borderRadius: '4px' }}>
                          <strong style={{ color: '#f57c00' }}>Filler Words:</strong>
                          <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>{submission.filler_word_feedback}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {submission.feedback_json && (
                  <div style={{ marginTop: '10px' }}>
                    <strong>Additional Feedback:</strong>
                    <pre style={{ background: '#f8f9fa', padding: '10px', borderRadius: '4px', marginTop: '5px', fontSize: '12px' }}>
                      {JSON.stringify(submission.feedback_json, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}