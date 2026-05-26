import React from 'react';

export default function SpaceTable({ space }) {
  if (!space || !space.length) return null;
  return (
    <div style={{ margin:'2rem 0' }}>
      <h2>空間需求表</h2>
      <div style={{ overflowX:'auto' }}>
        <table style={{ borderCollapse:'collapse', fontSize:12 }}>
          <thead>
            <tr>
              {['機器','L(m)','W(m)','機器面積','A_MTS','A_O','A_WIP','單位工作站','台數','總面積','總面積+20%走道'].map(h => (
                <th key={h} style={th()}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {space.map((s,i) => (
              <tr key={i} style={{ background: i%2===0 ? '#D9E1F2' : '#fff' }}>
                <td style={td(true)}>{s.machine}</td>
                <td style={td()}>{s.L}</td>
                <td style={td()}>{s.W}</td>
                <td style={td()}>{s.mach_area}</td>
                <td style={td()}>{s.A_MTS || '—'}</td>
                <td style={td()}>{s.A_O}</td>
                <td style={td()}>{s.A_WIP || '—'}</td>
                <td style={td()}>{s.unit_ws}</td>
                <td style={td()}>{s.qty}</td>
                <td style={td()}>{s.total}</td>
                <td style={{ ...td(), background:'#2E75B6', color:'#fff', fontWeight:'bold' }}>{s.total_aisle}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function th() {
  return { background:'#1F4E79', color:'#fff', border:'1px solid #ccc', padding:'6px 10px', textAlign:'center', fontWeight:'bold', whiteSpace:'nowrap' };
}
function td(bold=false) {
  return { border:'1px solid #ccc', padding:'4px 8px', textAlign:'center', fontWeight:bold?'bold':'normal' };
}
