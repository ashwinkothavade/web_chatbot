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
        <form onSubmit={() => setStep(1)}>
          <label style={{ fontWeight: 500, color: '#fff' }}>Your Name:<br />
            <input value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: 8, marginTop: 4, borderRadius: 6, border: '1px solid #444', background: '#242526', color: '#eee' }} />
          </label><br /><br />
          <button type="submit" style={{ width: '100%', padding: 10, background: '#00bcd4', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, letterSpacing: 1 }}>Next</button>
        </form>
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
        <div style={{ marginTop: 24, padding: 16, background: '#fff', borderRadius: 8, border: '1px solid #e0e0e0' }}>
          <h4>Status: <span style={{ color: status.status === 'Resolved' ? 'green' : '#2d5e7c' }}>{status.status}</span></h4>
          <p><b>Department:</b> {status.department}</p>
          <p><b>Complaint:</b> {status.complaint}</p>
          <p><b>Updates:</b></p>
          <ul style={{ paddingLeft: 18 }}>
            {status.updates && status.updates.length > 0 ? status.updates.map((u, i) => (
              <li key={i}>{u.status} by {u.officer} ({u.timestamp}): {u.remark}</li>
            )) : <li>No updates yet.</li>}
          </ul>
        </div>
      )}
      {error && <div style={{ color: 'red', marginTop: 16, textAlign: 'center' }}>{error}</div>}
      </div>
    </div>
  );
}
