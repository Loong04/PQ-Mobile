const fs = require('fs');
const path = require('path');

const shiftPlanPath = path.resolve(__dirname, '../modules/attendance/options/shift-plan.html');
const otPlanPath = path.resolve(__dirname, '../modules/attendance/options/ot-plan.html');

// 1. Fix shift-plan.html
let shiftContent = fs.readFileSync(shiftPlanPath, 'utf8');

shiftContent = shiftContent.replace('border-top: 1px solid #f1f5f9;', 'border-top: 1px solid var(--border-subtle);');
shiftContent = shiftContent.replace('.cal-summary-btn:active { transform: scale(0.98); background: #f5f3ff; }', '.cal-summary-btn:active { transform: scale(0.98); background: var(--purple-subtle); }');
shiftContent = shiftContent.replace('<div id="calendarTabView" style="display: none;">', '<div id="calendarTabView" style="display: none; padding-bottom: 24px;">');

const oldBadge = 'style="background: #52525b; color: #ffffff; padding: 4px 12px; border-radius: 12px; font-size: 11.5px; font-weight: 800;"';
const newBadge = 'style="background: var(--bg-input); color: var(--text-primary); border: 1px solid var(--border-subtle); padding: 4px 12px; border-radius: 12px; font-size: 11.5px; font-weight: 800;"';
shiftContent = shiftContent.replaceAll(oldBadge, newBadge);

fs.writeFileSync(shiftPlanPath, shiftContent, 'utf8');
console.log('shift-plan.html updated!');

// 2. Fix ot-plan.html
let otContent = fs.readFileSync(otPlanPath, 'utf8');

otContent = otContent.replace('.grid-cal-card { background: #ffffff; border: 1px solid #e2e8f0;', '.grid-cal-card { background: var(--bg-card); border: 1px solid var(--border-subtle);');
otContent = otContent.replace('.grid-cal-title { font-size: 16px; font-weight: 800; color: #0f172a;', '.grid-cal-title { font-size: 16px; font-weight: 800; color: var(--text-primary);');
otContent = otContent.replace('.grid-cal-toggle { display: flex; background: #f8fafc; border: 1px solid #e2e8f0;', '.grid-cal-toggle { display: flex; background: var(--bg-input); border: 1px solid var(--border-subtle);');
otContent = otContent.replace('.grid-cal-toggle-btn { padding: 4px 12px; font-size: 11px; font-weight: 700; color: #64748b;', '.grid-cal-toggle-btn { padding: 4px 12px; font-size: 11px; font-weight: 700; color: var(--text-muted);');
otContent = otContent.replace('.grid-cal-toggle-btn.active { background: #7c3aed; color: #ffffff;', '.grid-cal-toggle-btn.active { background: var(--purple-primary); color: var(--text-hero);');
otContent = otContent.replace('.grid-cal-nav-center { display: flex; align-items: center; gap: 16px; font-size: 14px; font-weight: 800; color: #0f172a;', '.grid-cal-nav-center { display: flex; align-items: center; gap: 16px; font-size: 14px; font-weight: 800; color: var(--text-primary);');
otContent = otContent.replace('.grid-cal-nav-btn { color: #0f172a;', '.grid-cal-nav-btn { color: var(--text-primary);');
otContent = otContent.replace('.grid-cal-today { color: #7c3aed;', '.grid-cal-today { color: var(--purple-primary);');
otContent = otContent.replace('.grid-cal-legend { display: flex; gap: 16px; font-size: 10.5px; font-weight: 700; color: #64748b;', '.grid-cal-legend { display: flex; gap: 16px; font-size: 10.5px; font-weight: 700; color: var(--text-muted);');
otContent = otContent.replace('.grid-cal-legend .dot.blue { background: #2563eb;', '.grid-cal-legend .dot.blue { background: var(--tag-blue-text);');
otContent = otContent.replace('.grid-cal-legend .dot.teal { background: #0d9488;', '.grid-cal-legend .dot.teal { background: var(--tag-teal-text);');
otContent = otContent.replace('.grid-cal-weekday { text-align: center; font-size: 10px; font-weight: 700; color: #64748b;', '.grid-cal-weekday { text-align: center; font-size: 10px; font-weight: 700; color: var(--text-muted);');
otContent = otContent.replace('.grid-cal-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0; border: 1px solid #f1f5f9; border-radius: 8px; overflow: hidden; background: #ffffff;', '.grid-cal-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0; border: 1px solid var(--border-subtle); border-radius: 8px; overflow: hidden; background: var(--bg-card);');
otContent = otContent.replace('.grid-cal-cell { aspect-ratio: 0.85; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;', '.grid-cal-cell { aspect-ratio: 0.85; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; border-right: 1px solid var(--border-divider); border-bottom: 1px solid var(--border-divider);');
otContent = otContent.replace('.grid-cal-cell.empty { background: #f8fafc;', '.grid-cal-cell.empty { background: var(--bg-input);');
otContent = otContent.replace('.grid-cal-cell.selected { border: 1.5px solid #7c3aed; background: #f5f3ff;', '.grid-cal-cell.selected { border: 1.5px solid var(--purple-primary); background: var(--purple-subtle);');
otContent = otContent.replace('.grid-cal-date { font-size: 12.5px; font-weight: 800; color: #0f172a;', '.grid-cal-date { font-size: 12.5px; font-weight: 800; color: var(--text-primary);');
otContent = otContent.replace('.grid-cal-stat-staff { font-size: 10px; font-weight: 800; color: #2563eb;', '.grid-cal-stat-staff { font-size: 10px; font-weight: 800; color: var(--tag-blue-text);');
otContent = otContent.replace('.grid-cal-stat-hours { font-size: 10px; font-weight: 700; color: #0d9488;', '.grid-cal-stat-hours { font-size: 10px; font-weight: 700; color: var(--tag-teal-text);');
otContent = otContent.replace('.grid-cal-empty-text { font-size: 10px; font-weight: 600; color: #cbd5e1;', '.grid-cal-empty-text { font-size: 10px; font-weight: 600; color: var(--text-caption);');
otContent = otContent.replace('.cal-summary-card { background: #ffffff; border: 1px solid #e2e8f0;', '.cal-summary-card { background: var(--bg-card); border: 1px solid var(--border-subtle);');
otContent = otContent.replace('.cal-summary-title { font-size: 13.5px; font-weight: 800; color: #0f172a;', '.cal-summary-title { font-size: 13.5px; font-weight: 800; color: var(--text-primary);');
otContent = otContent.replace('.cal-summary-stat-val { font-size: 20px; font-weight: 800; color: #2563eb;', '.cal-summary-stat-val { font-size: 20px; font-weight: 800; color: var(--tag-blue-text);');
otContent = otContent.replace('.cal-summary-stat-label { font-size: 10px; font-weight: 600; color: #64748b;', '.cal-summary-stat-label { font-size: 10px; font-weight: 600; color: var(--text-muted);');
otContent = otContent.replace('.cal-summary-ot { font-size: 11.5px; font-weight: 600; color: #64748b; display: flex; justify-content: space-between; padding-top: 12px; border-top: 1px solid #f1f5f9;', '.cal-summary-ot { font-size: 11.5px; font-weight: 600; color: var(--text-muted); display: flex; justify-content: space-between; padding-top: 12px; border-top: 1px solid var(--border-subtle);');
otContent = otContent.replace('.cal-summary-btn { width: 100%; padding: 10px; border-radius: 12px; border: 1px solid #7c3aed; background: transparent; color: #7c3aed;', '.cal-summary-btn { width: 100%; padding: 10px; border-radius: 12px; border: 1px solid var(--purple-primary); background: transparent; color: var(--purple-primary);');
otContent = otContent.replace('.cal-summary-btn:active { transform: scale(0.98); background: #f5f3ff; }', '.cal-summary-btn:active { transform: scale(0.98); background: var(--purple-subtle); }');

otContent = otContent.replace('<div id="calendarTabView" style="display: none;">', '<div id="calendarTabView" style="display: none; padding-bottom: 24px;">');
otContent = otContent.replaceAll(oldBadge, newBadge);

fs.writeFileSync(otPlanPath, otContent, 'utf8');
console.log('ot-plan.html updated!');
