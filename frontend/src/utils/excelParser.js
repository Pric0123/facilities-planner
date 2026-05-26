import * as XLSX from 'xlsx';

export function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });

        // Sheet 1: BasicSettings
        const ws1   = wb.Sheets['BasicSettings'];
        const basic = XLSX.utils.sheet_to_json(ws1);
        if (!basic.length) throw new Error('BasicSettings sheet 是空的');
        const row = basic[0];

        const weekly_output = row['weekly_output'];
        const weekly_hours  = row['weekly_hours'];
        const stations      = row['stations'];

        if (!weekly_output) throw new Error('缺少 weekly_output');
        if (!weekly_hours)  throw new Error('缺少 weekly_hours');
        if (!stations)      throw new Error('缺少 stations');

        // Sheet 2: Parts
        const ws2  = wb.Sheets['Parts'];
        const parts = XLSX.utils.sheet_to_json(ws2).map(r => ({
          name:     String(r['name']     ?? ''),
          qty:      Number(r['qty']      ?? 1),
          is_spare: String(r['is_spare'] ?? '').toLowerCase() === 'true',
        }));
        if (!parts.length) throw new Error('Parts sheet 是空的');

        // Sheet 3: Operations
        const ws3 = wb.Sheets['Operations'];
        const operations = XLSX.utils.sheet_to_json(ws3).map(r => ({
          part_name:   String(r['part_name']   ?? ''),
          op_no:       String(r['op_no']       ?? ''),
          machine:     String(r['machine']     ?? ''),
          uph:         Number(r['uph']         ?? 0),
          efficiency:  Number(r['efficiency']  ?? 0),
          defect_rate: Number(r['defect_rate'] ?? 0),
        }));
        if (!operations.length) throw new Error('Operations sheet 是空的');

        // Sheet 4: Space
        const ws4 = wb.Sheets['Space'];
        const space = XLSX.utils.sheet_to_json(ws4).map(r => ({
          machine: String(r['machine'] ?? ''),
          L:       Number(r['L']       ?? 0),
          W:       Number(r['W']       ?? 0),
          A_MTS:   Number(r['A_MTS']   ?? 0),
          A_O:     Number(r['A_O']     ?? 0),
          A_WIP:   Number(r['A_WIP']   ?? 0),
        }));
        if (!space.length) throw new Error('Space sheet 是空的');

        // Sheet 5: Flows
        const ws5 = wb.Sheets['Flows'];
        const flows = XLSX.utils.sheet_to_json(ws5).map(r => ({
          from_station: String(r['from_station'] ?? ''),
          to_station:   String(r['to_station']   ?? ''),
          volume:       Number(r['volume']        ?? 0),
        }));
        if (!flows.length) throw new Error('Flows sheet 是空的');

        resolve({
          weekly_output: String(weekly_output),
          weekly_hours:  String(weekly_hours),
          stations:      String(stations),
          parts,
          operations,
          space,
          flows,
        });

      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('檔案讀取失敗'));
    reader.readAsArrayBuffer(file);
  });
}

