import * as XLSX from 'xlsx';

export function downloadTemplate() {
  const wb = XLSX.utils.book_new();

  // Sheet 1: BasicSettings
  const ws1 = XLSX.utils.aoa_to_sheet([
    ['weekly_output', 'weekly_hours', 'stations'],
    [4100, 40, 'S,LH,DP,BH,SW,F,BP,ML,E'],
  ]);
  XLSX.utils.book_append_sheet(wb, ws1, 'BasicSettings');

  // Sheet 2: Parts
  const ws2 = XLSX.utils.aoa_to_sheet([
    ['name', 'qty', 'is_spare'],
    ['#1 Pin',   2, 'true'],
    ['#2 Body',  1, 'false'],
    ['#3 Screw', 1, 'false'],
    ['#4 Ring',  2, 'true'],
    ['P1 Assy',  1, 'false'],
  ]);
  XLSX.utils.book_append_sheet(wb, ws2, 'Parts');

  // Sheet 3: Operations
  const ws3 = XLSX.utils.aoa_to_sheet([
    ['part_name', 'op_no', 'machine', 'uph', 'efficiency', 'defect_rate'],
    ['#1 Pin',   '1-2-1', 'LH', 120, 0.85, 0.02],
    ['#2 Body',  '2-3-1', 'SW',  70, 0.90, 0.01],
    ['#2 Body',  '2-4-2', 'F',   60, 0.95, 0.00],
    ['#2 Body',  '2-5-3', 'BP',  60, 0.90, 0.02],
    ['#2 Body',  '2-3-4', 'SW',  60, 0.85, 0.01],
    ['#2 Body',  '2-6-5', 'ML',  30, 0.80, 0.01],
    ['#2 Body',  '2-6-6', 'ML',  30, 0.80, 0.03],
    ['#2 Body',  '2-6-7', 'ML',  40, 0.80, 0.01],
    ['#2 Body',  '2-7-8', 'DP', 120, 0.90, 0.01],
    ['#2 Body',  '2-8-9', 'BH',  40, 0.95, 0.00],
    ['#3 Screw', '3-2-1', 'LH',  60, 0.85, 0.02],
    ['#3 Screw', '3-7-2', 'DP', 130, 0.90, 0.01],
    ['#3 Screw', '3-8-3', 'BH', 120, 0.95, 0.00],
    ['#4 Ring',  '4-2-1', 'LH', 180, 0.85, 0.02],
    ['P1 Assy',  'P-8-1', 'BH', 240, 0.95, 0.00],
    ['P1 Assy',  'P-8-2', 'BH', 240, 0.95, 0.00],
    ['P1 Assy',  'P-8-3', 'BH', 120, 0.95, 0.01],
  ]);
  XLSX.utils.book_append_sheet(wb, ws3, 'Operations');

  // Sheet 4: Space
  const ws4 = XLSX.utils.aoa_to_sheet([
    ['machine', 'L', 'W', 'A_MTS', 'A_O', 'A_WIP'],
    ['LH', 4.8,  1.3,  2.0, 1.6, 0.6],
    ['SW', 1.6,  4.8,  0.0, 1.0, 0.0],
    ['F',  1.4,  0.63, 0.0, 1.0, 0.5],
    ['BP', 1.45, 1.1,  1.2, 1.2, 0.6],
    ['ML', 2.9,  2.75, 2.0, 1.6, 0.6],
    ['DP', 1.0,  0.65, 0.0, 1.0, 0.5],
    ['BH', 1.24, 0.85, 0.0, 1.4, 0.0],
  ]);
  XLSX.utils.book_append_sheet(wb, ws4, 'Space');

  // Sheet 5: Flows
  const ws5 = XLSX.utils.aoa_to_sheet([
    ['from_station', 'to_station', 'volume'],
    ['S',  'LH', 20500],
    ['S',  'SW', 4100],
    ['LH', 'E',  16400],
    ['LH', 'DP', 4100],
    ['SW', 'F',  4100],
    ['F',  'BP', 4100],
    ['BP', 'SW', 4100],
    ['SW', 'ML', 4100],
    ['ML', 'DP', 4100],
    ['DP', 'BH', 8200],
    ['BH', 'E',  12300],
  ]);
  XLSX.utils.book_append_sheet(wb, ws5, 'Flows');

  XLSX.writeFile(wb, 'facilities_planning_template.xlsx');
}

