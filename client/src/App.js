import logo from './logo.svg';
import './App.css';

import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [status, setStatus] = useState(null);
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => setStatus(data));
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data));
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => setNotifications(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🏠 Eindhoven Rental Scanner Dashboard</h1>
        {loading && <p>Loading scanner status...</p>}
        {!loading && status && (
          <div style={{ background: '#fff', color: '#333', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px #eee', marginBottom: 24, minWidth: 320 }}>
            <h2>Status: <span style={{ color: status.status === 'running' ? '#28a745' : '#dc3545' }}>{status.status}</span></h2>
            <p><strong>Last Scan:</strong> {status.lastScan ? new Date(status.lastScan).toLocaleString() : 'Never'}</p>
            <p><strong>Total Notifications Sent:</strong> {status.totalNotifications}</p>
          </div>
        )}
        {!loading && stats && (
          <div style={{ background: '#f8f9fa', color: '#333', padding: 20, borderRadius: 8, minWidth: 320 }}>
            <h3>📊 Scan Stats</h3>
            <ul style={{ textAlign: 'left', listStyle: 'none', padding: 0 }}>
              <li><strong>Total Scans:</strong> {stats.totalScans}</li>
              <li><strong>Seen Properties:</strong> {stats.seenPropertiesCount}</li>
              <li><strong>Uptime:</strong> {Math.floor(stats.uptime / 60)} min</li>
              <li><strong>Kamernet Scans:</strong> {stats.siteStats.kamernet.scans} | New: {stats.siteStats.kamernet.newProperties} | Errors: {stats.siteStats.kamernet.errors}</li>
              <li><strong>Funda Scans:</strong> {stats.siteStats.funda.scans} | New: {stats.siteStats.funda.newProperties} | Errors: {stats.siteStats.funda.errors}</li>
              <li><strong>FriendlyHousing Scans:</strong> {stats.siteStats.friendlyhousing.scans} | New: {stats.siteStats.friendlyhousing.newProperties} | Errors: {stats.siteStats.friendlyhousing.errors}</li>
            </ul>
          </div>
        )}
        {/* Notification History */}
        {!loading && notifications && notifications.length > 0 && (
          <div style={{ background: '#fff', color: '#333', padding: 20, borderRadius: 8, marginTop: 32, minWidth: 320, maxWidth: 700 }}>
            <h3 style={{ marginBottom: 16 }}>📧 Recent Notifications</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ padding: 8, textAlign: 'left' }}>Site</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Title</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Price</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Sent</th>
                  <th style={{ padding: 8, textAlign: 'left' }}>Link</th>
                </tr>
              </thead>
              <tbody>
                {notifications.slice(0, 10).map((n, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: 8 }}>{n.source}</td>
                    <td style={{ padding: 8 }}>{n.title}</td>
                    <td style={{ padding: 8 }}>{n.price}</td>
                    <td style={{ padding: 8 }}>{n.sentAt ? new Date(n.sentAt).toLocaleString() : ''}</td>
                    <td style={{ padding: 8 }}>
                      <a href={n.link} target="_blank" rel="noopener noreferrer">View</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <footer style={{ marginTop: 40, fontSize: 14, color: '#888' }}>
          Eindhoven Rental Property Scanner &copy; {new Date().getFullYear()}
        </footer>
      </header>
    </div>
  );
}


export default App;
