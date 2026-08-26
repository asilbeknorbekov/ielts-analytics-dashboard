import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import StudentDeepDive from './StudentDeepDive';

const StudentsPage = ({ data, studentsList }) => {
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredSearch = studentsList.filter(s => s.toLowerCase().includes(query.toLowerCase()) && !selectedStudents.includes(s));

  const handleSelect = (student) => {
    setSelectedStudents([...selectedStudents, student]);
    setQuery('');
    setIsOpen(false);
  };

  const handleRemove = (student) => {
    setSelectedStudents(selectedStudents.filter(s => s !== student));
  };

  // Derived Views
  const dataAll = data.all || [];
  
  // 1. TOP 10 View
  const sortedStudents = [...dataAll].sort((a, b) => (b.overall || 0) - (a.overall || 0));
  const top10 = sortedStudents.slice(0, 10);
  const top10ChartData = top10.map(s => ({
    name: s.student_id,
    overall: s.overall || 0
  }));

  // 2. Comparison View
  const categories = ['Overall', 'Reading', 'Listening', 'Writing', 'Speaking'];
  const comparisonData = categories.map(cat => {
    const obj = { category: cat };
    selectedStudents.forEach(s => {
      const studentInfo = dataAll.find(a => a.student_id === s) || {};
      const keyMap = { 
        Overall: 'overall', 
        Reading: 'overall_reading', 
        Listening: 'overall_listening', 
        Writing: 'overall_writing', 
        Speaking: 'overall_speaking' 
      };
      obj[s] = studentInfo[keyMap[cat]] || 0;
    });
    return obj;
  });

  // 3. Speaking Comparison
  const speakingCategories = ['Fluency', 'Lexical', 'Grammar', 'Pronunciation'];
  const speakingKeys = { 'Fluency': 's_fluencycoherence', 'Lexical': 'lexical_resource', 'Grammar': 'grammatical_range_accuracy', 'Pronunciation': 'pronunciation' };
  const speakingComparisonData = speakingCategories.map(cat => {
    const obj = { category: cat };
    selectedStudents.forEach(s => {
       const studentData = data[s] || [];
       const spkRow = studentData.find(row => row.s_fluencycoherence !== null && row.s_fluencycoherence !== undefined) || {};
       obj[s] = spkRow[speakingKeys[cat]] || 0;
    });
    return obj;
  });

  // 4. Reading/Listening Accuracy Comparison
  const getQuestionTypeComparison = (typeKey, numKey, correctKey) => {
    const allTypes = new Set();
    selectedStudents.forEach(s => {
      (data[s] || []).forEach(row => {
        if (row[typeKey]) allTypes.add(row[typeKey]);
      });
    });
    return Array.from(allTypes).map(cat => {
      const obj = { category: cat };
      selectedStudents.forEach(s => {
        const row = (data[s] || []).find(r => r[typeKey] === cat);
        if (row && row[numKey]) {
          obj[s] = Math.round((row[correctKey] / row[numKey]) * 100);
        } else {
          obj[s] = 0;
        }
      });
      return obj;
    });
  };

  const readingComparisonData = getQuestionTypeComparison('r_question_type', 'r_num_questions', 'r_correctness');
  const listeningComparisonData = getQuestionTypeComparison('l_question_type', 'l_num_questions', 'l_correctness');

  // 5. Writing Tasks Comparison
  const writingCategories = ['Task 1', 'Task 2'];
  const writingComparisonData = writingCategories.map(cat => {
    const obj = { category: cat };
    selectedStudents.forEach(s => {
      let score = 0;
      (data[s] || []).forEach(row => {
        if (cat === 'Task 1' && row.task1 !== null && row.task1 !== undefined) score = row.task1;
        if (cat === 'Task 2' && row.task2 !== null && row.task2 !== undefined) score = row.task2;
      });
      obj[s] = score;
    });
    return obj;
  });

  const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#0ea5e9', '#84cc16'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Search & Select Bar */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '1rem', fontWeight: 600 }}>Search & Compare Students</h3>
        
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <input 
            type="text" 
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            placeholder="Type a username to search..."
            style={{ 
              width: '100%', padding: '12px 16px', borderRadius: '8px', 
              background: 'rgba(255,255,255,0.05)', color: '#fff', 
              border: '1px solid var(--border-color)', outline: 'none',
              fontSize: '0.9rem'
            }}
          />
          {isOpen && filteredSearch.length > 0 && (
            <div style={{ 
              position: 'absolute', top: '100%', left: 0, right: 0, 
              background: 'var(--card-bg)', border: '1px solid var(--border-color)', 
              zIndex: 10, borderRadius: '8px', marginTop: '4px', maxHeight: '200px', overflowY: 'auto' 
            }}>
              {filteredSearch.map(s => (
                <div 
                  key={s} 
                  onClick={() => handleSelect(s)}
                  style={{ padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem' }}
                  onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseOut={e => e.target.style.background = 'transparent'}
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Badges */}
        {selectedStudents.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
            {selectedStudents.map(s => (
              <div key={s} style={{ 
                padding: '6px 12px', background: 'rgba(139, 92, 246, 0.2)', border: '1px solid var(--accent-purple)',
                borderRadius: '16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px',
                color: 'var(--accent-purple)', fontWeight: 600
              }}>
                {s}
                <button onClick={() => handleRemove(s)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>&times;</button>
              </div>
            ))}
            {selectedStudents.length > 0 && (
              <button 
                onClick={() => setSelectedStudents([])}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </div>

      {/* Dynamic Content Views */}
      {selectedStudents.length === 0 && (
        <div className="card chart-card">
          <span className="chart-card-title">Top 10 Students (Leaderboard)</span>
          <div className="chart-container" style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top10ChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2e2e42" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} />
                <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} domain={[0, 9]} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1a1a27', borderColor: '#2e2e42', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="overall" radius={[6, 6, 0, 0]} maxBarSize={50}>
                  {top10ChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedStudents.length === 1 && (
        <div style={{ marginTop: '8px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '1.25rem' }}>Deep-Dive: {selectedStudents[0]}</h3>
          <StudentDeepDive studentId={selectedStudents[0]} studentData={data[selectedStudents[0]]} />
        </div>
      )}

      {selectedStudents.length > 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card chart-card">
            <span className="chart-card-title">Overall Sections Comparison: {selectedStudents.join(' vs ')}</span>
            <div className="chart-container" style={{ height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2e2e42" vertical={false} />
                  <XAxis dataKey="category" stroke="#9ca3af" axisLine={false} tickLine={false} />
                  <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} domain={[0, 9]} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1a1a27', borderColor: '#2e2e42', borderRadius: '8px', color: '#fff' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  {selectedStudents.map((s, index) => (
                    <Bar key={s} dataKey={s} fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} maxBarSize={40} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="charts-grid">
            <div className="card chart-card">
              <span className="chart-card-title">Speaking Criteria Comparison</span>
              <div className="chart-container" style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={speakingComparisonData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2e2e42" vertical={false} />
                    <XAxis dataKey="category" stroke="#9ca3af" axisLine={false} tickLine={false} />
                    <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} domain={[0, 9]} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1a1a27', borderColor: '#2e2e42', borderRadius: '8px', color: '#fff' }} />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    {selectedStudents.map((s, index) => (
                      <Bar key={s} dataKey={s} fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} maxBarSize={30} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card chart-card">
              <span className="chart-card-title">Writing Tasks Comparison</span>
              <div className="chart-container" style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={writingComparisonData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2e2e42" vertical={false} />
                    <XAxis dataKey="category" stroke="#9ca3af" axisLine={false} tickLine={false} />
                    <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} domain={[0, 9]} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1a1a27', borderColor: '#2e2e42', borderRadius: '8px', color: '#fff' }} />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    {selectedStudents.map((s, index) => (
                      <Bar key={s} dataKey={s} fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} maxBarSize={30} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="card chart-card">
              <span className="chart-card-title">Reading Accuracy Comparison</span>
              {readingComparisonData.length > 0 ? (
                <div className="chart-container" style={{ height: '350px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={readingComparisonData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2e2e42" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" />
                      <YAxis dataKey="category" type="category" width={100} stroke="#9ca3af" tick={{fontSize: 11}} />
                      <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1a1a27', borderColor: '#2e2e42', borderRadius: '8px', color: '#fff' }} />
                      <Legend wrapperStyle={{ paddingBottom: '10px' }} />
                      {selectedStudents.map((s, index) => (
                        <Bar key={s} dataKey={s} fill={COLORS[index % COLORS.length]} radius={[0, 4, 4, 0]} barSize={15} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <div style={{ color: 'var(--text-muted)' }}>No data available</div>}
            </div>

            <div className="card chart-card">
              <span className="chart-card-title">Listening Accuracy Comparison</span>
              {listeningComparisonData.length > 0 ? (
                <div className="chart-container" style={{ height: '350px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={listeningComparisonData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2e2e42" horizontal={false} />
                      <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" />
                      <YAxis dataKey="category" type="category" width={100} stroke="#9ca3af" tick={{fontSize: 11}} />
                      <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1a1a27', borderColor: '#2e2e42', borderRadius: '8px', color: '#fff' }} />
                      <Legend wrapperStyle={{ paddingBottom: '10px' }} />
                      {selectedStudents.map((s, index) => (
                        <Bar key={s} dataKey={s} fill={COLORS[index % COLORS.length]} radius={[0, 4, 4, 0]} barSize={15} />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <div style={{ color: 'var(--text-muted)' }}>No data available</div>}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentsPage;
