import React, { useState } from 'react';
import { classifyComplaint } from '../gemini';

const API_BASE = 'http://localhost:5000'; // Adjust if backend runs on another port

export default function Chatbot() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [complaint, setComplaint] = useState('');
  const [suggestedDept, setSuggestedDept] = useState('');
  const [dept, setDept] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [myComplaints, setMyComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);

  // On complaint entry, classify with Gemini
  const handleClassify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const department = await classifyComplaint(complaint);
      setSuggestedDept(department);
      setDept(department);
      setStep(2);
    } catch (err) {
      setError('Could not classify department. You can select manually.');
      setStep(2);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/submit_complaint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, complaint, department: dept })
      });
      const data = await res.json();
      if (res.ok) {
        setTicketId(data.ticket_id);
        setStep(3);
      } else {
        setError(data.error || 'Submission failed');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  const handleStatusCheck = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/get_status?ticket_id=${ticketId}`);
      const data = await res.json();
      if (res.ok) {
        setStatus(data);
      } else {
        setError(data.error || 'Not found');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', minWidth: '100vw', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 0, background: 'linear-gradient(135deg, #18191A 70%, #232526 100%)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, width: '100%' }}>
        <span style={{ fontSize: 36, marginRight: 10, color: '#fff' }}>🟣</span>
        <h2 style={{ textAlign: 'center', color: '#fff', letterSpacing: 1, fontWeight: 700, fontSize: 28, margin: 0, textShadow: '0 2px 8px #222' }}>Grievance Chatbot</h2>
      </div>
      <div style={{ width: '100%', maxWidth: 480, background: 'rgba(30,30,32,0.95)', borderRadius: 20, boxShadow: '0 8px 32px 0 rgba(0,0,0,0.45)', padding: 32, margin: '0 auto' }}>
        {step === 0 && (
        <>
        <form onSubmit={() => setStep(1)}>
          <label style={{ fontWeight: 500, color: '#fff' }}>Your Name:<br />
            <input value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #444', background: '#242526', color: '#eee' }} />
          </label><br /><br />
          <button type="submit" style={{ width: '100%', padding: 10, background: '#00bcd4', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>Next</button>
        </form>
        <button onClick={async () => {
          setLoadingComplaints(true);
          setError('');
          setStatus(null);
          setMyComplaints([]);
          try {
            const res = await fetch(`${API_BASE}/complaints_by_user?name=${encodeURIComponent(name)}`);
            const data = await res.json();
            if (res.ok) {
              setMyComplaints(data);
            } else {
              setError(data.error || 'Could not fetch complaints');
            }
          } catch (err) {
            setError('Network error');
          }
          setLoadingComplaints(false);
        }}
        disabled={!name || loadingComplaints}
        style={{ width: '100%', padding: 10, background: '#232526', color: '#fff', border: '1.5px solid #00bcd4', borderRadius: 6, fontWeight: 600, letterSpacing: 1, marginTop: 8 }}>
          {loadingComplaints ? 'Loading...' : 'View My Complaints'}
        </button>
        {myComplaints.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h3 style={{ color: '#00bcd4', marginBottom: 12 }}>My Complaints</h3>
            {myComplaints.map((c, idx) => (
              <div key={c.ticket_id} style={{ background: '#232526', border: '1.5px solid #00bcd4', borderRadius: 12, padding: 16, marginBottom: 16, color: '#fff', boxShadow: '0 2px 8px #111' }}>
                <div style={{ marginBottom: 4 }}><span style={{ fontWeight: 700, color: '#00bcd4' }}>Ticket ID:</span> <span style={{ fontWeight: 500 }}>{c.ticket_id}</span></div>
                <div style={{ marginBottom: 4 }}><span style={{ fontWeight: 700 }}>Department:</span> <span>{c.department}</span></div>
                <div style={{ marginBottom: 4 }}><span style={{ fontWeight: 700 }}>Status:</span> <span>{c.status}</span></div>
                <div style={{ marginBottom: 8 }}><span style={{ fontWeight: 700 }}>Complaint:</span> <span>{c.complaint}</span></div>
                <button style={{ marginTop: 8, background: '#00bcd4', color: '#18191A', border: 'none', borderRadius: 6, fontWeight: 700, letterSpacing: 1, padding: '8px 16px', fontSize: '1rem' }}
                  onClick={async () => {
                    setLoading(true);
                    setError('');
                    setTicketId(c.ticket_id);
                    try {
                      const res = await fetch(`${API_BASE}/get_status?ticket_id=${c.ticket_id}`);
                      const data = await res.json();
                      if (res.ok) {
                        setStatus(data);
                        setStep(4);
                      } else {
                        setError(data.error || 'Not found');
                      }
                    } catch (err) {
                      setError('Network error');
                    }
                    setLoading(false);
                  }}
                >Check Status</button>
              </div>
            ))}
          </div>
        )}
        </>
      )}
      {step === 1 && (
        <form onSubmit={handleClassify}>
          <label style={{ fontWeight: 500, color: '#fff' }}>Describe your grievance:<br />
            <textarea value={complaint} onChange={e => setComplaint(e.target.value)} required rows={4} style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #444', background: '#242526', color: '#eee' }} />
          </label><br /><br />
          <button type="button" onClick={() => setStep(0)} style={{ marginRight: 8, padding: 8, borderRadius: 6, border: '1px solid #444', background: '#242526', color: '#eee' }}>Back</button>
          <button type="submit" disabled={loading} style={{ padding: 8, borderRadius: 6, background: '#00bcd4', color: '#18191A', border: 'none', fontWeight: 600, letterSpacing: 1 }}>{loading ? 'Classifying...' : 'Next'}</button>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12, color: '#fff' }}>
            <b>Suggested Department:</b> <span style={{ color: '#00bcd4', fontWeight: 600, background: 'transparent' }}>{suggestedDept || '...'}</span>
          </div>
          <label style={{ fontWeight: 500, color: '#fff' }}>Edit Department (if needed):<br />
            <select value={dept} onChange={e => setDept(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #444', background: '#242526', color: '#eee' }}>
              <option value="Water Department">Water Department</option>
              <option value="Public Works Department">Public Works Department</option>
              <option value="Electricity Department">Electricity Department</option>
              <option value="General Administration">General Administration</option>
            </select>
          </label><br /><br />
          <button type="button" onClick={() => setStep(1)} style={{ marginRight: 8, padding: 8, borderRadius: 6, border: '1px solid #444', background: '#242526', color: '#eee' }}>Back</button>
          <button type="submit" disabled={loading} style={{ padding: 8, borderRadius: 6, background: '#00bcd4', color: '#18191A', border: 'none', fontWeight: 600, letterSpacing: 1 }}>{loading ? 'Submitting...' : 'Submit Complaint'}</button>
        </form>
      )}
      {step === 3 && (
        <div>
          <p>✅ <b>Thank you! Your ticket ID is <span style={{ color: '#00bcd4', fontWeight: 600, background: 'transparent' }}>{ticketId}</span>.</b></p>
          <button onClick={() => setStep(4)} style={{ marginRight: 8, padding: 8, borderRadius: 6, background: '#e0e0e0', border: 'none' }}>Check Status</button>
          <button onClick={() => { setStep(0); setName(''); setComplaint(''); setTicketId(''); setStatus(null); setDept(''); setSuggestedDept(''); }} style={{ padding: 8, borderRadius: 6, background: '#00bcd4', color: '#18191A', border: 'none', fontWeight: 600, letterSpacing: 1 }}>New Complaint</button>
        </div>
      )}
      {step === 4 && (
        <form onSubmit={handleStatusCheck}>
          <label style={{ fontWeight: 500, color: '#fff' }}>Enter Ticket ID:<br />
            <input value={ticketId} onChange={e => setTicketId(e.target.value)} required style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #444', background: '#242526', color: '#eee' }} />
          </label><br /><br />
          <button type="submit" disabled={loading} style={{ marginRight: 8, padding: 8, borderRadius: 6, background: '#2d5e7c', color: 'white', border: 'none' }}>{loading ? 'Checking...' : 'Check Status'}</button>
          <button type="button" onClick={() => setStep(0)} style={{ padding: 8, borderRadius: 6, border: '1px solid #aaa' }}>Back</button>
        </form>
      )}
      {status && (
        <div style={{ marginTop: 32, padding: 24, background: '#232526', borderRadius: 14, border: '1.5px solid #00bcd4', color: '#fff', boxShadow: '0 2px 16px #111', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 10 }}>
            Status: <span style={{ color: status.status === 'Resolved' ? '#4caf50' : '#00bcd4' }}>{status.status}</span>
          </div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Department: <span style={{ fontWeight: 400 }}>{status.department}</span></div>
          <div style={{ fontWeight: 700, marginBottom: 14 }}>Complaint: <span style={{ fontWeight: 400 }}>{status.complaint}</span></div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Updates:</div>
          <ul style={{ paddingLeft: 0, listStyle: 'none', margin: 0 }}>
            {status.updates && status.updates.length > 0 ? status.updates.map((u, i) => (
              <li key={i} style={{ background: '#18191A', borderRadius: 8, marginBottom: 10, padding: '10px 14px', border: '1px solid #333' }}>
                <div style={{ fontWeight: 600, color: '#00bcd4', marginBottom: 2 }}>{u.status} <span style={{ color: '#bbb', fontWeight: 400 }}>by {u.officer}</span></div>
                <div style={{ fontSize: 13, color: '#bbb', marginBottom: 2 }}>{new Date(u.timestamp).toLocaleString()}</div>
                <div style={{ color: '#fff' }}>{u.remark}</div>
              </li>
            )) : <li style={{ color: '#bbb' }}>No updates yet.</li>}
          </ul>
        </div>
      )}
      {error && <div style={{ color: 'red', marginTop: 16, textAlign: 'center' }}>{error}</div>}
      </div>
    </div>
  );
}
