import React from 'react';
const CELL_SIZE = 60;
export default function FlowBetweenChart({ flows, stations }) {
  return (
    <div style={{ margin: '2rem 0' }}>
      <h2>Flow-between Chart</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              <th style={thStyle('D6DCE4')}>Station</th>
              {stations.map(s => <th key={s} style={thStyle('2E75B6', '#fff')}>{s}</th>)}
            </tr>
          </thead>
          <tbody>
            {stations.map((s_i, i) => (
              <tr key={s_i}>
                <td style={thStyle('D6DCE4')}>{s_i}</td>
                {stations.map((s_j, j) => {
                  if (s_i === s_j) return <td key={s_j} style={diagStyle()}>╲</td>;
                  if (j < i) return <td key={s_j} style={{ background:'#F2F2F2', border:'1px solid #ccc', minWidth:CELL_SIZE }} />;
                  const v = flows[s_i+'<>'+s_j] || 0;
                  return <td key={s_j} style={cellStyle(v)}>{v > 0 ? v : ''}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function thStyle(bg, color='#000') {
  return { background:'#'+bg, color, border:'1px solid #ccc', padding:'6px 10px', textAlign:'center', minWidth:CELL_SIZE, fontWeight:'bold' };
}
function diagStyle() {
  return { background:'#595959', color:'#595959', border:'1px solid #ccc', textAlign:'center', minWidth:CELL_SIZE };
}
function cellStyle(v) {
  const bg = v > 10000 ? '#FFF2CC' : v > 0 ? '#E2EFDA' : '#fff';
  return { background:bg, border:'1px solid #ccc', textAlign:'center', minWidth:CELL_SIZE, fontWeight:v>0?'bold':'normal' };
}
