import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { parseWordChoiceFeedback, parseBodyLanguageFeedback, parseFillerWordFeedback } from '../../lib/supabase';

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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export function TeacherDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<Submission[]>([]);
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

  const fetchSubmissionsForAssignment = async (assignmentId: string) => {
    try {
      console.log('Fetching submissions for assignment:', assignmentId, 'user:', user?.id);
      const response = await fetch(`${API_BASE_URL}/api/submissions?assignmentId=${assignmentId}&role=teacher&userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Assignment submissions received:', data);
        setAssignmentSubmissions(data);
      } else {
        console.error('Failed to fetch assignment submissions:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Response body:', errorText);
      }
    } catch (error) {
      console.error('Error fetching assignment submissions:', error);
      alert('Unable to connect to server. Please ensure the backend is running on port 3001.');
    }
  };

  const viewAssignmentSubmissions = async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    await fetchSubmissionsForAssignment(assignment.id);
  };

  const backToAssignments = () => {
    setSelectedAssignment(null);
    setAssignmentSubmissions([]);
  };

  const getSubmissionCount = (assignmentId: string) => {
    return submissions.filter(sub => sub.assignment_id === assignmentId).length;
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/assignments`);
      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      } else {
        console.error('Failed to fetch assignments:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      alert('Unable to connect to server. Please ensure the backend is running on port 3001.');
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/submissions?userId=${user?.id}&role=teacher`);
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      } else {
        console.error('Failed to fetch submissions:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      alert('Unable to connect to server. Please ensure the backend is running on port 3001.');
    }
  };

  const createAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/assignments`, {
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
        <div>
          <h1>Teacher Dashboard</h1>
          {selectedAssignment && (
            <nav style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
              <button onClick={backToAssignments} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', padding: 0 }}>
                Assignments
              </button>
              <span style={{ margin: '0 8px' }}>›</span>
              <span>{selectedAssignment.title}</span>
            </nav>
          )}
        </div>
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

      {!selectedAssignment ? (
        // Assignments List View
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
            {assignments.map((assignment) => {
              const submissionCount = getSubmissionCount(assignment.id);
              return (
                <div key={assignment.id} style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                  <h3 style={{ margin: '0 0 10px 0' }}>{assignment.title}</h3>
                  <p style={{ color: '#666', marginBottom: '10px' }}>{assignment.description}</p>
                  <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                    <strong>Due:</strong> {new Date(assignment.due_date).toLocaleString()}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      backgroundColor: submissionCount > 0 ? '#28a745' : '#6c757d', 
                      color: 'white', 
                      borderRadius: '12px', 
                      fontSize: '12px' 
                    }}>
                      {submissionCount} submission{submissionCount !== 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={() => viewAssignmentSubmissions(assignment)}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      View Submissions
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // Assignment Submissions View
        <div>
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={backToAssignments}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginBottom: '15px'
              }}
            >
              ← Back to Assignments
            </button>
            <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <h2 style={{ margin: '0 0 10px 0' }}>{selectedAssignment.title}</h2>
              <p style={{ margin: '0 0 10px 0', color: '#666' }}>{selectedAssignment.description}</p>
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                <strong>Due:</strong> {new Date(selectedAssignment.due_date).toLocaleString()}
              </p>
            </div>
          </div>

          <h3>Student Submissions ({assignmentSubmissions.length})</h3>
          <div>
            {assignmentSubmissions.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
                No submissions yet for this assignment.
              </p>
            ) : (
              assignmentSubmissions.map((submission) => (
                <div key={submission.id} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0' }}>{submission.profiles.name}</h4>
                      <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                        <strong>Submitted:</strong> {new Date(submission.submitted_at).toLocaleString()}
                      </p>
                    </div>
                    {submission.score && (
                      <div style={{ padding: '4px 8px', backgroundColor: '#28a745', color: 'white', borderRadius: '4px', fontSize: '14px' }}>
                        Score: {submission.score}/100
                      </div>
                    )}
                  </div>
                  
                  {submission.video_url && (
                    <p style={{ marginBottom: '10px' }}>
                      <strong>Video:</strong> <a href={submission.video_url} target="_blank" rel="noopener noreferrer">View Video</a>
                    </p>
                  )}
                  
                  {(submission.word_choice_feedback || submission.body_language_feedback || submission.filler_word_feedback) && (() => {
                    const wordChoice = parseWordChoiceFeedback(submission.word_choice_feedback);
                    const bodyLanguage = parseBodyLanguageFeedback(submission.body_language_feedback);
                    const fillerWords = parseFillerWordFeedback(submission.filler_word_feedback);
                    
                    return (
                      <div style={{ marginTop: '15px' }}>
                        <strong>AI Analysis Feedback:</strong>
                        <div style={{ marginTop: '10px' }}>
                          {wordChoice && (
                            <div style={{ marginBottom: '12px', padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <strong style={{ color: '#1976d2', fontSize: '16px' }}>Word Choice</strong>
                                {wordChoice.score !== null && (
                                  <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{ 
                                      width: '60px', 
                                      height: '8px', 
                                      backgroundColor: '#e0e0e0', 
                                      borderRadius: '4px',
                                      marginRight: '8px',
                                      overflow: 'hidden'
                                    }}>
                                      <div style={{ 
                                        width: `${(wordChoice.score / 50) * 100}%`, 
                                        height: '100%', 
                                        backgroundColor: wordChoice.score >= 35 ? '#4caf50' : wordChoice.score >= 25 ? '#ff9800' : '#f44336',
                                        borderRadius: '4px'
                                      }}></div>
                                    </div>
                                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1976d2' }}>
                                      {wordChoice.score}/50
                                    </span>
                                  </div>
                                )}
                              </div>
                              {wordChoice.description && (
                                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.4' }}>{wordChoice.description}</p>
                              )}
                            </div>
                          )}
                          
                          {bodyLanguage && (
                            <div style={{ marginBottom: '12px', padding: '12px', backgroundColor: '#f3e5f5', borderRadius: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <strong style={{ color: '#7b1fa2', fontSize: '16px' }}>Body Language</strong>
                                {bodyLanguage.score !== null && (
                                  <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{ 
                                      width: '60px', 
                                      height: '8px', 
                                      backgroundColor: '#e0e0e0', 
                                      borderRadius: '4px',
                                      marginRight: '8px',
                                      overflow: 'hidden'
                                    }}>
                                      <div style={{ 
                                        width: `${(bodyLanguage.score / 50) * 100}%`, 
                                        height: '100%', 
                                        backgroundColor: bodyLanguage.score >= 35 ? '#4caf50' : bodyLanguage.score >= 25 ? '#ff9800' : '#f44336',
                                        borderRadius: '4px'
                                      }}></div>
                                    </div>
                                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#7b1fa2' }}>
                                      {bodyLanguage.score}/50
                                    </span>
                                  </div>
                                )}
                              </div>
                              {bodyLanguage.description && (
                                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.4' }}>{bodyLanguage.description}</p>
                              )}
                            </div>
                          )}
                          
                          {fillerWords && (
                            <div style={{ marginBottom: '12px', padding: '12px', backgroundColor: '#fff3e0', borderRadius: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <strong style={{ color: '#f57c00', fontSize: '16px' }}>Filler Words</strong>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <span style={{ fontSize: '14px', color: '#f57c00', fontWeight: 'bold' }}>
                                    Count: {fillerWords.count}
                                  </span>
                                  {fillerWords.score !== null && (
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                      <div style={{ 
                                        width: '60px', 
                                        height: '8px', 
                                        backgroundColor: '#e0e0e0', 
                                        borderRadius: '4px',
                                        marginRight: '8px',
                                        overflow: 'hidden'
                                      }}>
                                        <div style={{ 
                                          width: `${(fillerWords.score / 25) * 100}%`, 
                                          height: '100%', 
                                          backgroundColor: fillerWords.score >= 18 ? '#4caf50' : fillerWords.score >= 12 ? '#ff9800' : '#f44336',
                                          borderRadius: '4px'
                                        }}></div>
                                      </div>
                                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#f57c00' }}>
                                        {fillerWords.score}/25
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              {fillerWords.list && fillerWords.list.length > 0 && (
                                <div style={{ marginBottom: '8px' }}>
                                  <strong style={{ fontSize: '12px', color: '#666' }}>Detected words:</strong>
                                  <div style={{ marginTop: '4px' }}>
                                    {fillerWords.list.map((word, index) => (
                                      <span key={index} style={{ 
                                        display: 'inline-block',
                                        padding: '2px 6px', 
                                        backgroundColor: '#ffcc80', 
                                        borderRadius: '12px', 
                                        fontSize: '12px',
                                        margin: '2px',
                                        color: '#e65100'
                                      }}>
                                        {word}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {fillerWords.description && (
                                <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.4' }}>{fillerWords.description}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                  
                  {submission.feedback_json && (
                    <div style={{ marginTop: '10px' }}>
                      <strong>Additional Feedback:</strong>
                      <pre style={{ background: '#f8f9fa', padding: '10px', borderRadius: '4px', marginTop: '5px', fontSize: '12px' }}>
                        {JSON.stringify(submission.feedback_json, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}