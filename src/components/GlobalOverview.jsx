import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

const MultiSelect = ({ label, options, selected, onChange }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const filteredSearch = options.filter(o => String(o).toLowerCase().includes(query.toLowerCase()) && !selected.includes(String(o)));

  const handleSelect = (val) => {
    onChange([...selected, String(val)]);
    setQuery('');
    setIsOpen(false);
  };
  const handleRemove = (val) => {
    onChange(selected.filter(s => s !== String(val)));
  };

  return (
    <div style={{ width: '100%', maxWidth: '300px' }}>
      <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input 
          type="text" 
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={`Search ${label.toLowerCase()}...`}
          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.9rem' }}
        />
        {isOpen && filteredSearch.length > 0 && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--card-bg)', border: '1px solid var(--border-color)', zIndex: 10, borderRadius: '8px', marginTop: '4px', maxHeight: '200px', overflowY: 'auto' }}>
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
      {selected.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
          {selected.map(s => (
            <div key={s} style={{ padding: '4px 10px', background: 'rgba(139, 92, 246, 0.2)', border: '1px solid var(--accent-purple)', borderRadius: '16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-purple)', fontWeight: 600 }}>
              {s}
              <button onClick={() => handleRemove(s)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>&times;</button>
            </div>
          ))}
          <button onClick={() => onChange([])} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}>Clear</button>
        </div>
      )}
    </div>
  );
};

const GlobalOverview = ({ data }) => {
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);

  const dataAll = data.all || [];
  if (!dataAll || dataAll.length === 0) return <div>No data available</div>;

  const teachers = [...new Set(dataAll.map(d => String(d.teacher_id)).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  const groups = [...new Set(dataAll.map(d => String(d.group_num)).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  const comparisonMode = selectedTeachers.length > 1 ? 'teachers' : selectedGroups.length > 1 ? 'groups' : 'none';
  const comparisonEntities = comparisonMode === 'teachers' ? selectedTeachers : comparisonMode === 'groups' ? selectedGroups : [];
  const entities = comparisonEntities.length > 0 ? comparisonEntities : ['Average'];

  const getStudentsForEntity = (entity) => {
    return dataAll.filter(d => {
      const t = String(d.teacher_id);
      const g = String(d.group_num);
      if (comparisonMode === 'teachers') {
        return t === entity && (selectedGroups.length === 0 || selectedGroups.includes(g));
      } else if (comparisonMode === 'groups') {
        return g === entity && (selectedTeachers.length === 0 || selectedTeachers.includes(t));
      } else {
        return (selectedTeachers.length === 0 || selectedTeachers.includes(t)) && 
               (selectedGroups.length === 0 || selectedGroups.includes(g));
      }
    });
  };

  const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#0ea5e9', '#84cc16'];

  // 1. Sections
  const sectionsCategories = ['overall', 'overall_reading', 'overall_listening', 'overall_writing', 'overall_speaking'];
  const sectionsLabels = ['Overall', 'Reading', 'Listening', 'Writing', 'Speaking'];
  const sectionsData = sectionsLabels.map((label, idx) => {
    const obj = { category: label };
    entities.forEach(ent => {
      const students = getStudentsForEntity(ent);
      if (students.length === 0) { obj[ent] = 0; return; }
      const sum = students.reduce((acc, curr) => acc + (curr[sectionsCategories[idx]] || 0), 0);
      obj[ent] = Number((sum / students.length).toFixed(1));
    });
    return obj;
  });

  // 2. Speaking
  const speakingCategories = ['Fluency', 'Lexical', 'Grammar', 'Pronunciation'];
  const speakingKeys = { 'Fluency': 's_fluencycoherence', 'Lexical': 'lexical_resource', 'Grammar': 'grammatical_range_accuracy', 'Pronunciation': 'pronunciation' };
  const speakingData = speakingCategories.map(cat => {
    const obj = { category: cat };
    entities.forEach(ent => {
      const students = getStudentsForEntity(ent);
      let sum = 0; let count = 0;
      students.forEach(s => {
         const studentDetailed = data[s.student_id] || [];
         const spkRow = studentDetailed.find(row => row.s_fluencycoherence !== null && row.s_fluencycoherence !== undefined);
         if (spkRow && spkRow[speakingKeys[cat]]) { sum += spkRow[speakingKeys[cat]]; count++; }
      });
      obj[ent] = count > 0 ? Number((sum / count).toFixed(1)) : 0;
    });
    return obj;
  });

  // 3. Writing
  const writingCategories = ['Task 1', 'Task 2'];
  const writingData = writingCategories.map(cat => {
    const obj = { category: cat };
    entities.forEach(ent => {
      const students = getStudentsForEntity(ent);
      let sum = 0; let count = 0;
      students.forEach(s => {
        const studentDetailed = data[s.student_id] || [];
        studentDetailed.forEach(row => {
          if (cat === 'Task 1' && row.task1 !== null && row.task1 !== undefined) { sum += row.task1; count++; }
          if (cat === 'Task 2' && row.task2 !== null && row.task2 !== undefined) { sum += row.task2; count++; }
        });
      });
      obj[ent] = count > 0 ? Number((sum / count).toFixed(1)) : 0;
    });
    return obj;
  });

  // 4. Reading/Listening
  const getQuestionTypeData = (typeKey, numKey, correctKey) => {
    const allTypes = new Set();
    const entityStudents = {};
    entities.forEach(ent => {
      entityStudents[ent] = getStudentsForEntity(ent);
      entityStudents[ent].forEach(s => {
        (data[s.student_id] || []).forEach(row => {
          if (row[typeKey]) allTypes.add(row[typeKey]);
        });
      });
    });

    return Array.from(allTypes).map(cat => {
      const obj = { category: cat };
      entities.forEach(ent => {
        let correct = 0; let total = 0;
        entityStudents[ent].forEach(s => {
          const row = (data[s.student_id] || []).find(r => r[typeKey] === cat);
          if (row && row[numKey]) {
            correct += row[correctKey] || 0;
            total += row[numKey] || 0;
          }
        });
        obj[ent] = total > 0 ? Math.round((correct / total) * 100) : 0;
      });
      return obj;
    });
  };

  const readingData = getQuestionTypeData('r_question_type', 'r_num_questions', 'r_correctness');
  const listeningData = getQuestionTypeData('l_question_type', 'l_num_questions', 'l_correctness');

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const pData = payload[0].payload;
      return (
        <div style={{ backgroundColor: '#1a1a27', border: '1px solid #2e2e42', padding: '10px', borderRadius: '8px', color: '#fff' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{pData.category}</p>
          {payload.map((pl, idx) => (
             <p key={idx} style={{ margin: 0, color: pl.fill }}>
               {pl.dataKey}: {pl.value}{pl.value > 10 ? '%' : ''}
             </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const totalFilteredStudents = getStudentsForEntity(entities[0] === 'Average' ? 'Average' : entities[0]).length + (entities.length > 1 ? getStudentsForEntity(entities[1]).length : 0); // rough estimate for top stats

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div className="card" style={{ padding: '24px', display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        <MultiSelect label="Teachers" options={teachers} selected={selectedTeachers} onChange={setSelectedTeachers} />
        <MultiSelect label="Groups" options={groups} selected={selectedGroups} onChange={setSelectedGroups} />
      </div>

      {comparisonMode === 'none' && (
        <div className="stats-grid">
          <div className="card stat-card" style={{ borderTop: '3px solid var(--accent-purple)' }}>
            <span className="stat-title">Overall Average</span>
            <span className="stat-value text-gradient">{sectionsData[0].Average}</span>
          </div>
          <div className="card stat-card">
            <span className="stat-title">Total Students</span>
            <span className="stat-value">{getStudentsForEntity('Average').length}</span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="card chart-card">
          <span className="chart-card-title">{entities.length > 1 ? `Comparison: ${entities.join(' vs ')}` : 'Sections Overall Average'}</span>
          <div className="chart-container" style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectionsData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2e2e42" vertical={false} />
                <XAxis dataKey="category" stroke="#9ca3af" axisLine={false} tickLine={false} />
                <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} domain={[0, 9]} />
                <Tooltip content={<CustomTooltip />} />
                {entities.length > 1 && <Legend wrapperStyle={{ paddingTop: '20px' }} />}
                {entities.map((ent, idx) => (
                  <Bar key={ent} dataKey={ent} fill={COLORS[idx % COLORS.length]} radius={[4, 4, 0, 0]} maxBarSize={40} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="charts-grid">
          <div className="card chart-card">
            <span className="chart-card-title">Speaking Criteria</span>
            <div className="chart-container" style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={speakingData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2e2e42" vertical={false} />
                  <XAxis dataKey="category" stroke="#9ca3af" axisLine={false} tickLine={false} />
                  <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} domain={[0, 9]} />
                  <Tooltip content={<CustomTooltip />} />
                  {entities.length > 1 && <Legend wrapperStyle={{ paddingTop: '10px' }} />}
                  {entities.map((ent, idx) => (
                    <Bar key={ent} dataKey={ent} fill={COLORS[idx % COLORS.length]} radius={[4, 4, 0, 0]} maxBarSize={30} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card chart-card">
            <span className="chart-card-title">Writing Tasks</span>
            <div className="chart-container" style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={writingData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2e2e42" vertical={false} />
                  <XAxis dataKey="category" stroke="#9ca3af" axisLine={false} tickLine={false} />
                  <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} domain={[0, 9]} />
                  <Tooltip content={<CustomTooltip />} />
                  {entities.length > 1 && <Legend wrapperStyle={{ paddingTop: '10px' }} />}
                  {entities.map((ent, idx) => (
                    <Bar key={ent} dataKey={ent} fill={COLORS[idx % COLORS.length]} radius={[4, 4, 0, 0]} maxBarSize={30} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="charts-grid">
          <div className="card chart-card">
            <span className="chart-card-title">Reading Accuracy (%)</span>
            {readingData.length > 0 ? (
              <div className="chart-container" style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={readingData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2e2e42" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" />
                    <YAxis dataKey="category" type="category" width={100} stroke="#9ca3af" tick={{fontSize: 11}} />
                    <Tooltip content={<CustomTooltip />} />
                    {entities.length > 1 && <Legend wrapperStyle={{ paddingBottom: '10px' }} />}
                    {entities.map((ent, idx) => (
                      <Bar key={ent} dataKey={ent} fill={COLORS[idx % COLORS.length]} radius={[0, 4, 4, 0]} barSize={15} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <div style={{ color: 'var(--text-muted)' }}>No data available</div>}
          </div>

          <div className="card chart-card">
            <span className="chart-card-title">Listening Accuracy (%)</span>
            {listeningData.length > 0 ? (
              <div className="chart-container" style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={listeningData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2e2e42" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" />
                    <YAxis dataKey="category" type="category" width={100} stroke="#9ca3af" tick={{fontSize: 11}} />
                    <Tooltip content={<CustomTooltip />} />
                    {entities.length > 1 && <Legend wrapperStyle={{ paddingBottom: '10px' }} />}
                    {entities.map((ent, idx) => (
                      <Bar key={ent} dataKey={ent} fill={COLORS[idx % COLORS.length]} radius={[0, 4, 4, 0]} barSize={15} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <div style={{ color: 'var(--text-muted)' }}>No data available</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalOverview;
