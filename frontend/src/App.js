import React, { useState, useRef } from 'react';
import axios from 'axios';
import FromToChart from './components/FromToChart';
import FlowBetweenChart from './components/FlowBetweenChart';
import RelChart from './components/RelChart';
import EquipmentTable from './components/EquipmentTable';
import SpaceTable from './components/SpaceTable';
import { downloadTemplate } from './utils/excelTemplate';
import { parseExcel } from './utils/excelParser';
import './App.css';

const emptyForm = () => ({
  weekly_output: '',
  weekly_hours:  '',
  stations:      '',
  parts:      [{ name:'', qty:1, is_spare:false }],
  operations: [{ part_name:'', op_no:'', machine:'', uph:'', efficiency:'', defect_rate:'' }],
  space:      [{ machine:'', L:'', W:'', A_MTS:0, A_O:'', A_WIP:0 }],
  flows:      [{ from_station:'', to_station:'', volume:'' }],
});

export default function App() {
  const [form, setForm]           = useState(emptyForm());
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [importMsg, setImportMsg] = useState(null);
  const fileRef = useRef(null);

  const updateField = (field, value) =>
    setForm(f => ({ ...f, [field]: value }));

  const updateRow = (section, idx, key, value) =>
    setForm(f => {
      const arr = [...f[section]];
      arr[idx] = { ...arr[idx], [key]: value };
      return { ...f, [section]: arr };
    });

  const addRow = (section, template) =>
    setForm(f => ({ ...f, [section]: [...f[section], { ...template }] }));

  const removeRow = (section, idx) =>
    setForm(f => ({ ...f, [section]: f[section].filter((_, i) => i !== idx) }));

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportMsg(null);
    setError(null);
    try {
      const data = await parseExcel(file);
      setForm(data);
      setImportMsg('✅ 匯入成功：' + data.parts.length + ' 個零件，' + data.operations.length + ' 道工序，' + data.flows.length + ' 條路徑');
      setResult(null);
    } catch (err) {
      setError('Excel 匯入失敗：' + err.message);
    }
    e.target.value = '';
  };

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        weekly_output: parseInt(form.weekly_output),
        weekly_hours:  parseFloat(form.weekly_hours),
        stations: form.stations.split(',').map(s => s.trim()).filter(Boolean),
        parts: form.parts.map(p => ({
          name:     p.name,
          qty:      parseInt(p.qty),
          is_spare: p.is_spare === true || String(p.is_spare).toLowerCase() === 'true',
        })),
        operations: form.operations.map(o => ({
          part_name:   o.part_name,
          op_no:       o.op_no,
          machine:     o.machine,
          uph:         parseFloat(o.uph),
          efficiency:  parseFloat(o.efficiency),
          defect_rate: parseFloat(o.defect_rate),
        })),
        space: form.space.map(s => ({
          machine: s.machine,
          L:     parseFloat(s.L),
          W:     parseFloat(s.W),
          A_MTS: parseFloat(s.A_MTS) || 0,
          A_O:   parseFloat(s.A_O)   || 0,
          A_WIP: parseFloat(s.A_WIP) || 0,
        })),
        flows: form.flows.map(f => ({
          from_station: f.from_station,
          to_station:   f.to_station,
          volume:       parseInt(f.volume),
        })),
      };
      const res = await axios.post('https://facilities-planner-backend.onrender.com/calculate', payload);
      const interpretRes = await axios.post('https://facilities-planner-backend.onrender.com/interpret', res.data);
      setResult({ data: res.data, stations: payload.stations, analysis: interpretRes.data.analysis });
    } catch (e) {
      setError(e.response?.data?.detail ? JSON.stringify(e.response.data.detail, null, 2) : e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display:'flex', gap:24, padding:24, fontFamily:'Arial, sans-serif' }}>
      <div style={{ minWidth:480, maxWidth:560 }}>
        <h1 style={{ marginTop:0 }}>Facilities Planning Tool</h1>
        <div style={{ padding:12, background:'#F0F4FF', borderRadius:6, border:'1px solid #B0C4DE', marginBottom:16 }}>
          <div style={{ fontWeight:'bold', color:'#1F4E79', marginBottom:8 }}>📂 Excel 匯入</div>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <button onClick={() => fileRef.current.click()} style={btnTemplate}>選擇 Excel 檔案</button>
            <button onClick={downloadTemplate} style={{ ...btnTemplate, background:'#2E75B6' }}>⬇ 下載模板</button>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display:'none' }} onChange={handleExcelUpload} />
          </div>
          {importMsg && <div style={{ color:'green', fontSize:12, marginTop:8 }}>{importMsg}</div>}
        </div>
        {error && <pre style={{ color:'red', fontSize:11, marginBottom:8 }}>{error}</pre>}
        <Section title="基本設定">
          <Row label="週產量"><input type="number" value={form.weekly_output} onChange={e => updateField('weekly_output', e.target.value)} style={inputStyle} /></Row>
          <Row label="週工時 (hrs)"><input type="number" value={form.weekly_hours} onChange={e => updateField('weekly_hours', e.target.value)} style={inputStyle} /></Row>
          <Row label="工作站 (逗號分隔)"><input value={form.stations} placeholder="S,LH,DP,..." onChange={e => updateField('stations', e.target.value)} style={{ ...inputStyle, width:280 }} /></Row>
        </Section>
        <Section title="零件 BOM">
          <table style={tableStyle}>
            <thead><tr>{['零件名稱','數量','備品',''].map(h=><th key={h} style={tdStyle}>{h}</th>)}</tr></thead>
            <tbody>{form.parts.map((p,i)=>(
              <tr key={i}>
                <td style={tdStyle}><input value={p.name} onChange={e=>updateRow('parts',i,'name',e.target.value)} style={inputStyle}/></td>
                <td style={tdStyle}><input type="number" value={p.qty} min={1} onChange={e=>updateRow('parts',i,'qty',e.target.value)} style={{...inputStyle,width:50}}/></td>
                <td style={tdStyle}><input type="checkbox" checked={p.is_spare===true||p.is_spare==='true'} onChange={e=>updateRow('parts',i,'is_spare',e.target.checked)}/></td>
                <td style={tdStyle}><button onClick={()=>removeRow('parts',i)} style={btnDel}>✕</button></td>
              </tr>
            ))}</tbody>
          </table>
          <button onClick={()=>addRow('parts',{name:'',qty:1,is_spare:false})} style={btnAdd}>+ 新增零件</button>
        </Section>
        <Section title="工序">
          <table style={tableStyle}>
            <thead><tr>{['零件','工序編號','機器','UPH','效率','良率',''].map(h=><th key={h} style={tdStyle}>{h}</th>)}</tr></thead>
            <tbody>{form.operations.map((o,i)=>(
              <tr key={i}>
                {['part_name','op_no','machine'].map(k=>(<td key={k} style={tdStyle}><input value={o[k]} onChange={e=>updateRow('operations',i,k,e.target.value)} style={{...inputStyle,width:70}}/></td>))}
                {['uph','efficiency','defect_rate'].map(k=>(<td key={k} style={tdStyle}><input type="number" value={o[k]} step="0.01" onChange={e=>updateRow('operations',i,k,e.target.value)} style={{...inputStyle,width:55}}/></td>))}
                <td style={tdStyle}><button onClick={()=>removeRow('operations',i)} style={btnDel}>✕</button></td>
              </tr>
            ))}</tbody>
          </table>
          <button onClick={()=>addRow('operations',{part_name:'',op_no:'',machine:'',uph:'',efficiency:'',defect_rate:''})} style={btnAdd}>+ 新增工序</button>
        </Section>
        <Section title="機器空間">
          <table style={tableStyle}>
            <thead><tr>{['機器','L(m)','W(m)','A_MTS','A_O','A_WIP',''].map(h=><th key={h} style={tdStyle}>{h}</th>)}</tr></thead>
            <tbody>{form.space.map((s,i)=>(
              <tr key={i}>
                {['machine','L','W','A_MTS','A_O','A_WIP'].map(k=>(<td key={k} style={tdStyle}><input type={k==='machine'?'text':'number'} value={s[k]} step="0.01" onChange={e=>updateRow('space',i,k,e.target.value)} style={{...inputStyle,width:k==='machine'?60:50}}/></td>))}
                <td style={tdStyle}><button onClick={()=>removeRow('space',i)} style={btnDel}>✕</button></td>
              </tr>
            ))}</tbody>
          </table>
          <button onClick={()=>addRow('space',{machine:'',L:'',W:'',A_MTS:0,A_O:'',A_WIP:0})} style={btnAdd}>+ 新增機器</button>
        </Section>
        <Section title="物流路徑">
          <table style={tableStyle}>
            <thead><tr>{['From','To','流量',''].map(h=><th key={h} style={tdStyle}>{h}</th>)}</tr></thead>
            <tbody>{form.flows.map((f,i)=>(
              <tr key={i}>
                {['from_station','to_station'].map(k=>(<td key={k} style={tdStyle}><input value={f[k]} onChange={e=>updateRow('flows',i,k,e.target.value)} style={{...inputStyle,width:60}}/></td>))}
                <td style={tdStyle}><input type="number" value={f.volume} onChange={e=>updateRow('flows',i,'volume',e.target.value)} style={{...inputStyle,width:70}}/></td>
                <td style={tdStyle}><button onClick={()=>removeRow('flows',i)} style={btnDel}>✕</button></td>
              </tr>
            ))}</tbody>
          </table>
          <button onClick={()=>addRow('flows',{from_station:'',to_station:'',volume:''})} style={btnAdd}>+ 新增路徑</button>
        </Section>
        <button onClick={handleCalculate} disabled={loading} style={btnCalc}>{loading ? '計算中...' : '▶ 計算'}</button>
      </div>
      <div style={{ flex:1 }}>
        {result ? (
          <>
            <EquipmentTable equipment={result.data.equipment}/>
            <SpaceTable space={result.data.space}/>
            <FromToChart flows={result.data.fromto} stations={result.stations}/>
            <FlowBetweenChart flows={result.data.flowbetween} stations={result.stations}/>
            <RelChart rel={result.data.rel} stations={result.stations} thresholds={result.data.thresholds}/>
            {result.analysis && (
              <div style={{ marginTop:24, padding:16, background:'#F0F4FF', borderRadius:6, border:'1px solid #B0C4DE' }}>
                <h3 style={{ margin:'0 0 8px', color:'#1F4E79' }}>🤖 AI 分析</h3>
                <p style={{ margin:0, fontSize:13, lineHeight:1.8, whiteSpace:'pre-wrap' }}>{result.analysis}</p>
              </div>
            )}
          </>
        ) : (
          <div style={{ color:'#aaa', marginTop:80, textAlign:'center' }}>匯入 Excel 或填入資料後按「計算」</div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom:20 }}>
      <h3 style={{ margin:'0 0 8px', color:'#1F4E79', borderBottom:'2px solid #1F4E79', paddingBottom:4 }}>{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
      <label style={{ minWidth:140, fontSize:13 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle  = { padding:'3px 6px', border:'1px solid #ccc', borderRadius:3, fontSize:12, width:80 };
const tableStyle  = { borderCollapse:'collapse', fontSize:12, marginBottom:6 };
const tdStyle     = { border:'1px solid #ddd', padding:'3px 6px' };
const btnAdd      = { fontSize:12, padding:'3px 10px', cursor:'pointer', background:'#E2EFDA', border:'1px solid #92D050', borderRadius:3 };
const btnDel      = { fontSize:11, padding:'1px 6px', cursor:'pointer', background:'#FFE0E0', border:'1px solid #FF0000', borderRadius:3, color:'#FF0000' };
const btnCalc     = { marginTop:12, padding:'10px 30px', fontSize:14, fontWeight:'bold', background:'#1F4E79', color:'#fff', border:'none', borderRadius:4, cursor:'pointer', width:'100%' };
const btnTemplate = { fontSize:12, padding:'6px 12px', cursor:'pointer', background:'#1F4E79', color:'#fff', border:'none', borderRadius:3 };
