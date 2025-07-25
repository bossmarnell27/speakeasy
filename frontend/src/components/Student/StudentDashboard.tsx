import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { VideoRecorder } from '../VideoRecorder';

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
}

interface Submission {
  id: string;
  assignment_id: string;
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
}

interface ClassData {
  id: string;
  name: string;
  join_code: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export function StudentDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [recordingFor, setRecordingFor] = useState<string | null>(null);
  const { user, signOut } = useAuth();

  useEffect(() => {
    checkServerConnection();
    fetchClassData();
    fetchAssignments();
    fetchSubmissions();
  }, []);

  const checkServerConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Server connection successful:', data.message);
      } else {
        console.error('❌ Server health check failed:', response.status);
        alert(`Server is not responding properly. Status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Cannot connect to server:', error);
      alert(`Cannot connect to server at ${API_BASE_URL}. Please ensure the backend is running on port 3001.`);
    }
  };

  const fetchClassData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/class`);
      if (response.ok) {
        const data = await response.json();
        setClassData(data);
      } else {
        console.error('Failed to fetch class data:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching class data:', error);
      alert('Unable to connect to server. Please ensure the backend is running on port 3001.');
    }
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
      const response = await fetch(`${API_BASE_URL}/api/submissions?userId=${user?.id}&role=student`);
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

  const joinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/class/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          joinCode,
        }),
      });

      if (response.ok) {
        setJoinCode('');
        fetchClassData();
        alert('Successfully joined class!');
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error('Error joining class:', error);
    }
  };

  const handleVideoUpload = async (assignmentId: string, file: File) => {
    if (!user) return;

    setUploadingFor(assignmentId);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${assignmentId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName);

      const response = await fetch(`${API_BASE_URL}/api/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: user.id,
          videoUrl: urlData.publicUrl,
        }),
      });

      if (response.ok) {
        fetchSubmissions();
        alert('Video submitted successfully!');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Error uploading video. Please try again.');
    } finally {
      setUploadingFor(null);
    }
  };

  const handleVideoRecording = async (assignmentId: string, videoBlob: Blob) => {
    if (!user) return;

    setUploadingFor(assignmentId);
    try {
      // Step 1: Create submission record first (without video URL)
      const submissionResponse = await fetch(`${API_BASE_URL}/api/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: user.id,
        }),
      });

      if (!submissionResponse.ok) {
        throw new Error(`Failed to create submission: ${submissionResponse.status}`);
      }

      const submission = await submissionResponse.json();
      const submissionId = submission.id;

      // Step 2: Get assignment details for metadata
      const assignment = assignments.find(a => a.id === assignmentId);
      
      // Step 3: Create FormData with video, metadata, and submission ID
      const formData = new FormData();
      formData.append('video', videoBlob, 'recording.webm');
      formData.append('studentId', user.id);
      formData.append('assignmentId', assignmentId);
      formData.append('submissionId', submissionId);
      formData.append('assignmentTitle', assignment?.title || 'Unknown Assignment');
      formData.append('assignmentDescription', assignment?.description || '');
      formData.append('submittedAt', new Date().toISOString());
      formData.append('videoFormat', 'webm');
      formData.append('videoSize', videoBlob.size.toString());

      // Step 4: Send to n8n webhook with submission ID
      const webhookResponse = await fetch('https://redclay.app.n8n.cloud/webhook-test/testai', {
        method: 'POST',
        body: formData
      });

      if (!webhookResponse.ok) {
        throw new Error(`Webhook failed: ${webhookResponse.status}`);
      }

      // Step 5: Upload to Supabase for backup
      const fileName = `${user.id}/${assignmentId}/${Date.now()}.webm`;
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, videoBlob);

      if (uploadError) {
        console.warn('Supabase backup failed:', uploadError);
        // Continue anyway since webhook succeeded
      }

      // Step 6: Update submission record with video URL
      const { data: urlData } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName);

      const updateResponse = await fetch(`${API_BASE_URL}/api/assignments/${assignmentId}/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl: urlData.publicUrl,
        }),
      });

      if (updateResponse.ok) {
        fetchSubmissions();
        setRecordingFor(null);
        alert('Video recorded and sent for AI analysis successfully!');
      } else {
        console.warn('Failed to update submission with video URL');
        // Still consider success since video was sent to n8n
        fetchSubmissions();
        setRecordingFor(null);
        alert('Video recorded and sent for AI analysis successfully!');
      }
    } catch (error) {
      console.error('Error processing recording:', error);
      alert(`Error processing recording: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setUploadingFor(null);
    }
  };

  const getSubmissionForAssignment = (assignmentId: string) => {
    return submissions.find(sub => sub.assignment_id === assignmentId);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Student Dashboard</h1>
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

      {!classData && (
        <div style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ddd', borderRadius: '4px' }}>
          <h2>Join Class</h2>
          <p>Enter the class code provided by your teacher to join the class.</p>
          <form onSubmit={joinClass} style={{ display: 'flex', gap: '10px', alignItems: 'end' }}>
            <div>
              <label>Class Code:</label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                required
                style={{ padding: '8px', marginTop: '5px' }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Join Class
            </button>
          </form>
        </div>
      )}

      {classData && (
        <div style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <h3>Class: {classData.name}</h3>
          <p>Class Code: <strong>{classData.join_code}</strong></p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Assignments Section */}
        <div>
          <h2>Assignments</h2>
          <div>
            {assignments.map((assignment) => {
              const submission = getSubmissionForAssignment(assignment.id);
              return (
                <div key={assignment.id} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }}>
                  <h3>{assignment.title}</h3>
                  <p>{assignment.description}</p>
                  <p><strong>Due:</strong> {new Date(assignment.due_date).toLocaleString()}</p>
                  
                  {submission ? (
                    <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#d4edda', borderRadius: '4px' }}>
                      <p><strong>Status:</strong> Submitted</p>
                      <p><strong>Submitted:</strong> {new Date(submission.submitted_at).toLocaleString()}</p>
                      {submission.score && <p><strong>Score:</strong> {submission.score}/100</p>}
                    </div>
                  ) : (
                    <div style={{ marginTop: '15px' }}>
                      {recordingFor === assignment.id ? (
                        <div>
                          <VideoRecorder
                            onVideoRecorded={(videoBlob) => handleVideoRecording(assignment.id, videoBlob)}
                            isUploading={uploadingFor === assignment.id}
                          />
                          <button
                            onClick={() => setRecordingFor(null)}
                            disabled={uploadingFor === assignment.id}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#6c757d',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: uploadingFor === assignment.id ? 'not-allowed' : 'pointer',
                              marginTop: '10px',
                              opacity: uploadingFor === assignment.id ? 0.6 : 1
                            }}
                          >
                            Cancel Recording
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div style={{ marginBottom: '15px' }}>
                            <button
                              onClick={() => setRecordingFor(assignment.id)}
                              disabled={uploadingFor === assignment.id}
                              style={{
                                padding: '12px 24px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: uploadingFor === assignment.id ? 'not-allowed' : 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                marginRight: '10px'
                              }}
                            >
                              {uploadingFor === assignment.id ? 'Processing...' : 'Record Video Response'}
                            </button>
                          </div>
                          
                          <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
                            <label style={{ fontSize: '14px', color: '#666' }}>Or upload a video file:</label>
                            <input
                              type="file"
                              accept="video/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleVideoUpload(assignment.id, file);
                                }
                              }}
                              disabled={uploadingFor === assignment.id}
                              style={{ display: 'block', marginTop: '5px' }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Submissions Section */}
        <div>
          <h2>My Submissions</h2>
          <div>
            {submissions.map((submission) => (
              <div key={submission.id} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '10px' }}>
                <h4>{submission.assignments.title}</h4>
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