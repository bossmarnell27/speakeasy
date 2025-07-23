import { useState, useRef, useCallback, useEffect } from 'react';

interface VideoRecorderProps {
  onVideoRecorded: (videoBlob: Blob) => void;
  isUploading: boolean;
}

type RecordingState = 'idle' | 'requesting-permission' | 'recording' | 'stopped' | 'error';

export function VideoRecorder({ onVideoRecorded, isUploading }: VideoRecorderProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string>('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const requestCameraAccess = useCallback(async () => {
    setRecordingState('requesting-permission');
    setError('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Check if WebM is supported
      const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus', 
        'video/webm'
      ];

      let supportedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          supportedMimeType = mimeType;
          break;
        }
      }

      if (!supportedMimeType) {
        throw new Error('WebM format not supported by this browser');
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: supportedMimeType
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
        
        // Stop camera tracks immediately after recording
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        
        onVideoRecorded(videoBlob);
        chunksRef.current = [];
      };

      mediaRecorderRef.current = mediaRecorder;
      setRecordingState('idle');
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      setError(err.message || 'Failed to access camera. Please ensure you have granted camera permissions.');
      setRecordingState('error');
    }
  }, [onVideoRecorded]);

  const startRecording = useCallback(() => {
    if (!mediaRecorderRef.current) return;

    chunksRef.current = [];
    setRecordingTime(0);
    mediaRecorderRef.current.start();
    setRecordingState('recording');
    startTimer();
  }, [startTimer]);

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.stop();
    setRecordingState('stopped');
    stopTimer();
  }, [stopTimer]);

  const resetRecording = useCallback(() => {
    setRecordingTime(0);
    setRecordingState('idle');
    setError('');
  }, []);

  const cleanup = useCallback(() => {
    stopTimer();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    mediaRecorderRef.current = null;
    setRecordingState('idle');
  }, [stopTimer]);

  // Cleanup camera stream when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const getStatusMessage = () => {
    if (isUploading) return 'Uploading video and sending to AI analysis...';
    
    switch (recordingState) {
      case 'requesting-permission':
        return 'Requesting camera access...';
      case 'recording':
        return `Recording: ${formatTime(recordingTime)} • Click Stop when finished`;
      case 'stopped':
        return 'Recording complete! The video will be submitted and analyzed by AI.';
      case 'error':
        return error;
      default:
        return 'Click to enable camera and start recording your response';
    }
  };

  const getButtonText = () => {
    if (isUploading) return 'Uploading...';
    switch (recordingState) {
      case 'idle':
        return streamRef.current ? 'Start Recording' : 'Enable Camera';
      case 'recording':
        return 'Stop Recording';
      case 'stopped':
        return 'Record Again';
      default:
        return 'Enable Camera';
    }
  };

  const handleButtonClick = () => {
    if (isUploading) return;
    
    switch (recordingState) {
      case 'idle':
        if (streamRef.current) {
          startRecording();
        } else {
          requestCameraAccess();
        }
        break;
      case 'recording':
        stopRecording();
        break;
      case 'stopped':
        resetRecording();
        break;
      case 'error':
        requestCameraAccess();
        break;
    }
  };

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      padding: '20px', 
      backgroundColor: '#f9f9f9',
      maxWidth: '500px',
      margin: '0 auto'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <h3>Record Your Video Response</h3>
        <p style={{ 
          color: recordingState === 'error' ? '#dc3545' : '#666',
          minHeight: '20px',
          margin: '10px 0'
        }}>
          {getStatusMessage()}
        </p>
      </div>

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          width: '100%',
          maxWidth: '400px',
          height: '300px',
          backgroundColor: '#000',
          borderRadius: '4px',
          display: 'block',
          margin: '0 auto 15px'
        }}
      />

      <div style={{ textAlign: 'center' }}>
        <button
          onClick={handleButtonClick}
          disabled={isUploading || recordingState === 'requesting-permission'}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '6px',
            cursor: isUploading || recordingState === 'requesting-permission' ? 'not-allowed' : 'pointer',
            backgroundColor: 
              recordingState === 'recording' ? '#dc3545' :
              recordingState === 'stopped' ? '#28a745' :
              '#007bff',
            color: 'white',
            minWidth: '150px'
          }}
        >
          {getButtonText()}
        </button>

        {recordingState === 'stopped' && (
          <button
            onClick={cleanup}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              border: '1px solid #6c757d',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              color: '#6c757d',
              cursor: 'pointer',
              marginLeft: '10px'
            }}
          >
            Cancel
          </button>
        )}
      </div>

      <div style={{ fontSize: '12px', color: '#666', textAlign: 'center', marginTop: '10px' }}>
        Recording format: WebM • Will be sent to AI for analysis
      </div>
    </div>
  );
}