import React from 'react';

export default function EquipmentTable({ equipment }) {
  if (!equipment || !equipment.length) return null;
  const parts = Object.keys(equipment[0]).filter(k => !['machine','qty','total_n'].includes(k));
  return (
    <div style={{ margin:'2rem 0' }}>
      <h2>設備需求表</h2>
      <div style={{ overflowX:'auto' }}>
        <table style={{ borderCollapse:'collapse', fontSize:12 }}>
          <thead>
            <tr>
              <th style={th('1F4E79')}>機器</th>
              {parts.map(p => <th key={p} style={th('2E75B6')}>{p}</th>)}
              <th style={th('2E75B6')}>Total N</th>
              <th style={th('2E75B6')}>台數</th>
            </tr>
          </thead>
          <tbody>
            {equipment.map((eq,i) => (
              <tr key={i} style={{ background: i%2===0 ? '#D9E1F2' : '#fff' }}>
                <td style={td(true)}>{eq.machine}</td>
                {parts.map(p => <td key={p} style={td()}>{eq[p] != null ? eq[p] : '—'}</td>)}
                <td style={td()}>{eq.total_n}</td>
                <td style={{ ...td(), background:'#2E75B6', color:'#fff', fontWeight:'bold' }}>{eq.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function th(bg) {
  return { background:'#'+bg, color:'#fff', border:'1px solid #ccc', padding:'6px 10px', textAlign:'center', fontWeight:'bold', whiteSpace:'nowrap' };
}
function td(bold=false) {
  return { border:'1px solid #ccc', padding:'4px 8px', textAlign:'center', fontWeight:bold?'bold':'normal' };
}
