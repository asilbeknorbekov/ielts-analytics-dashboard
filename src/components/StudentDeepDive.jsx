import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

const StudentDeepDive = ({ studentId, studentData }) => {
  if (!studentData || studentData.length === 0) return <div>No data available for this student.</div>;

  // Process Reading Data
  const readingData = studentData
    .filter(row => row.r_question_type && row.r_num_questions)
    .map(row => ({
      name: row.r_question_type,
      accuracy: Math.round((row.r_correctness / row.r_num_questions) * 100),
      correct: row.r_correctness,
      total: row.r_num_questions
    }));

  // Process Listening Data
  const listeningData = studentData
    .filter(row => row.l_question_type && row.l_num_questions)
    .map(row => ({
      name: row.l_question_type,
      accuracy: Math.round((row.l_correctness / row.l_num_questions) * 100),
      correct: row.l_correctness,
      total: row.l_num_questions
    }));

  // Process Writing Data
  const writingData = studentData
    .filter(row => row.w_question_type && (row.task1 !== null || row.task2 !== null))
    .map(row => ({
      type: row.w_question_type,
      task1: row.task1,
      task2: row.task2
    }));

  // Process Speaking Data (assume first row has it)
  const spkRow = studentData.find(row => row.s_fluencycoherence !== null);
  const speakingData = spkRow ? [
    { subject: 'Fluency', A: spkRow.s_fluencycoherence, fullMark: 9 },
    { subject: 'Lexical', A: spkRow.lexical_resource, fullMark: 9 },
    { subject: 'Grammar', A: spkRow.grammatical_range_accuracy, fullMark: 9 },
    { subject: 'Pronunciation', A: spkRow.pronunciation, fullMark: 9 },
  ] : [];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ backgroundColor: '#1a1a27', border: '1px solid #2e2e42', padding: '10px', borderRadius: '8px' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{data.name}</p>
          <p style={{ margin: 0, color: '#ec4899' }}>Accuracy: {data.accuracy}%</p>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#9ca3af' }}>{data.correct} / {data.total} correct</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div className="charts-grid">
        {/* Reading Performance */}
        <div className="card chart-card">
          <span className="chart-card-title">Reading Accuracy by Question Type</span>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={readingData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2e2e42" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" />
                <YAxis dataKey="name" type="category" width={120} stroke="#9ca3af" tick={{fontSize: 11}} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="accuracy" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Speaking Criteria Radar */}
        <div className="card chart-card">
          <span className="chart-card-title">Speaking Criteria</span>
          <div className="chart-container" style={{ display: 'flex', justifyContent: 'center' }}>
            {speakingData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={speakingData}>
                  <PolarGrid stroke="#2e2e42" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 9]} tick={{ fill: '#9ca3af' }} />
                  <Radar name="Student" dataKey="A" stroke="#ec4899" fill="#ec4899" fillOpacity={0.5} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a27', borderColor: '#2e2e42', borderRadius: '8px' }}
                    itemStyle={{ color: '#ec4899' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : <div className="flex-center" style={{height:'100%', color:'var(--text-muted)'}}>No Speaking Data</div>}
          </div>
        </div>
      </div>

      <div className="charts-grid">
        {/* Listening Performance */}
        <div className="card chart-card">
          <span className="chart-card-title">Listening Accuracy by Question Type</span>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={listeningData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2e2e42" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" />
                <YAxis dataKey="name" type="category" width={120} stroke="#9ca3af" tick={{fontSize: 11}} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="accuracy" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Writing Scores */}
        <div className="card chart-card">
          <span className="chart-card-title">Writing Tasks</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
            {writingData.map((w, idx) => (
              <div key={idx} style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{w.type}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>{w.task1 !== null ? `Task 1: ${w.task1}` : `Task 2: ${w.task2}`}</span>
                  <div style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '0.75rem', 
                    fontWeight: 700,
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    color: 'var(--success)'
                  }}>
                    {w.task1 !== null ? 'Task 1' : 'Task 2'}
                  </div>
                </div>
              </div>
            ))}
            {writingData.length === 0 && <div style={{color:'var(--text-muted)'}}>No writing data.</div>}
          </div>
        </div>
      </div>

    </div>
  );
};

export default StudentDeepDive;
