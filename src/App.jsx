import React, { useState } from 'react';
import { LayoutDashboard, Users } from 'lucide-react';
import GlobalOverview from './components/GlobalOverview';
import StudentsPage from './components/StudentsPage';
import './App.css';
import data from './data.json';

function App() {
  const [activeTab, setActiveTab] = useState('global'); // 'global' or 'students'
  const studentsList = Object.keys(data)
    .filter(k => k !== 'all' && k !== 'students_list')
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-logo">
          <span className="text-gradient">IELTS</span> Dashboard
        </div>
        <div className="sidebar-menu">
          <button 
            className={`menu-item ${activeTab === 'global' ? 'active' : ''}`}
            onClick={() => setActiveTab('global')}
          >
            <LayoutDashboard size={20} />
            Global Overview
          </button>
          
          <button 
            className={`menu-item ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            <Users size={20} />
            Students Directory
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="header">
          <div className="header-title">
            {activeTab === 'global' ? 'Class Performance Overview' : 'Students Directory'}
          </div>
          <div className="user-profile flex-center" style={{ gap: '12px' }}>
            <span style={{ fontSize: '0.875rem' }}>Welcome, Admin</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--accent-purple), var(--accent-pink))' }}></div>
          </div>
        </div>

        <div className="dashboard-content">
          {activeTab === 'global' ? (
            <GlobalOverview data={data} />
          ) : (
            <StudentsPage data={data} studentsList={studentsList} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
