import React from 'react';
const CELL_SIZE = 60;
const REL_COLORS = {
  A: { bg: '#FFE0E0', color: '#FF0000' },
  E: { bg: '#FFF0D0', color: '#FF9900' },
  I: { bg: '#E8F5E0', color: '#92D050' },
  O: { bg: '#D0F0FF', color: '#00B0F0' },
  U: { bg: '#FFFFFF', color: '#AAAAAA' },
};
export default function RelChart({ rel, stations, thresholds }) {
  return (
    <div style={{ margin: '2rem 0' }}>
      <h2>Relationship (REL) Chart</h2>
      <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap' }}>
        {Object.entries(REL_COLORS).map(([level, { bg, color }]) => (
          <div key={level} style={{ background:bg, color, border:'1px solid '+color, borderRadius:4, padding:'4px 10px', fontWeight:'bold', fontSize:12 }}>
            {level}{thresholds && level !== 'U' && <span style={{ fontWeight:'normal', marginLeft:4 }}>{'\u2265'}{thresholds[level]}</span>}
          </div>
        ))}
      </div>
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
                  const level = rel[s_i+'<>'+s_j] || 'U';
                  const { bg, color } = REL_COLORS[level] || REL_COLORS.U;
                  return <td key={s_j} style={{ background:bg, border:'1px solid #ccc', textAlign:'center', minWidth:CELL_SIZE, fontWeight:'bold', color, fontSize:14 }}>{level}</td>;
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
