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

export function StudentDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [recordingFor, setRecordingFor] = useState<string | null>(null);
  const { user, signOut } = useAuth();

  useEffect(() => {
    fetchClassData();
    fetchAssignments();
    fetchSubmissions();
  }, []);

  const fetchClassData = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/class');
      if (response.ok) {
        const data = await response.json();
        setClassData(data);
      }
    } catch (error) {
      console.error('Error fetching class data:', error);
    }
  };

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
      const response = await fetch(`http://localhost:3001/api/submissions?userId=${user?.id}&role=student`);
      const data = await response.json();
      setSubmissions(data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const joinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/class/join', {
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

      const response = await fetch(`http://localhost:3001/api/assignments/${assignmentId}/submit`, {
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
      // Get assignment and student details for metadata
      const assignment = assignments.find(a => a.id === assignmentId);
      
      // Create FormData with video and metadata
      const formData = new FormData();
      formData.append('video', videoBlob, 'recording.webm');
      formData.append('studentId', user.id);
      formData.append('assignmentId', assignmentId);
      formData.append('assignmentTitle', assignment?.title || 'Unknown Assignment');
      formData.append('assignmentDescription', assignment?.description || '');
      formData.append('submittedAt', new Date().toISOString());
      formData.append('videoFormat', 'webm');
      formData.append('videoSize', videoBlob.size.toString());

      // Send directly to n8n webhook
      const webhookResponse = await fetch('https://redclay.app.n8n.cloud/webhook-test/testai', {
        method: 'POST',
        body: formData
      });

      if (!webhookResponse.ok) {
        throw new Error(`Webhook failed: ${webhookResponse.status}`);
      }

      // Also upload to Supabase for backup and create submission record
      const fileName = `${user.id}/${assignmentId}/${Date.now()}.webm`;
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, videoBlob);

      if (uploadError) {
        console.warn('Supabase backup failed:', uploadError);
        // Continue anyway since webhook succeeded
      }

      const { data: urlData } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName);

      // Create submission record
      const response = await fetch(`http://localhost:3001/api/assignments/${assignmentId}/submit`, {
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
                {submission.feedback_json && (
                  <div>
                    <strong>Feedback:</strong>
                    <pre style={{ background: '#f8f9fa', padding: '10px', borderRadius: '4px', marginTop: '5px' }}>
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