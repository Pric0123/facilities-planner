import React from 'react';
const CELL_SIZE = 60;
export default function FromToChart({ flows, stations }) {
  return (
    <div style={{ margin: '2rem 0' }}>
      <h2>From-to Chart</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              <th style={thStyle('D6DCE4')}>From \ To</th>
              {stations.map(s => <th key={s} style={thStyle('2E75B6', '#fff')}>{s}</th>)}
            </tr>
          </thead>
          <tbody>
            {stations.map(s_from => (
              <tr key={s_from}>
                <td style={thStyle('D6DCE4')}>{s_from}</td>
                {stations.map(s_to => {
                  if (s_from === s_to) return <td key={s_to} style={diagStyle()}>╲</td>;
                  const v = flows[s_from+'->'+s_to] || 0;
                  return <td key={s_to} style={cellStyle(v)}>{v > 0 ? v : ''}</td>;
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
