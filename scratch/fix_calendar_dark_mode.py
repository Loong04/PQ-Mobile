import os

shift_plan_path = r'C:\Users\loong\PQ-Mobile\modules\attendance\options\shift-plan.html'
ot_plan_path = r'C:\Users\loong\PQ-Mobile\modules\attendance\options\ot-plan.html'

# 1. Fix shift-plan.html
with open(shift_plan_path, 'r', encoding='utf-8') as f:
    shift_content = f.read()

# Update border-top in cal-summary-ot and active background in cal-summary-btn
shift_content = shift_content.replace('border-top: 1px solid #f1f5f9;', 'border-top: 1px solid var(--border-subtle);')
shift_content = shift_content.replace('.cal-summary-btn:active { transform: scale(0.98); background: #f5f3ff; }', '.cal-summary-btn:active { transform: scale(0.98); background: var(--purple-subtle); }')

# Update calendarTabView padding
shift_content = shift_content.replace('<div id="calendarTabView" style="display: none;">', '<div id="calendarTabView" style="display: none; padding-bottom: 24px;">')

# Update badges background in calSummaryCard
old_badge = 'style="background: #52525b; color: #ffffff; padding: 4px 12px; border-radius: 12px; font-size: 11.5px; font-weight: 800;"'
new_badge = 'style="background: var(--bg-input); color: var(--text-primary); border: 1px solid var(--border-subtle); padding: 4px 12px; border-radius: 12px; font-size: 11.5px; font-weight: 800;"'
shift_content = shift_content.replace(old_badge, new_badge)

with open(shift_plan_path, 'w', encoding='utf-8') as f:
    f.write(shift_content)

print("shift-plan.html updated!")

# 2. Fix ot-plan.html
with open(ot_plan_path, 'r', encoding='utf-8') as f:
    ot_content = f.read()

# Replace hardcoded grid-cal styles in ot-plan.html
old_ot_css = """    /* Grid Calendar Styles (Light Theme) */
    .grid-cal-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 20px 16px; margin-top: 10px; }
    .grid-cal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .grid-cal-title { font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
    .grid-cal-toggle { display: flex; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    .grid-cal-toggle-btn { padding: 4px 12px; font-size: 11px; font-weight: 700; color: #64748b; border: none; background: transparent; cursor: pointer; transition: all 0.2s; }
    .grid-cal-toggle-btn.active { background: #7c3aed; color: #ffffff; }
    .grid-cal-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .grid-cal-nav-center { display: flex; align-items: center; gap: 16px; font-size: 14px; font-weight: 800; color: #0f172a; }
    .grid-cal-nav-btn { color: #0f172a; font-size: 14px; background: none; border: none; cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center; }
    .grid-cal-today { color: #7c3aed; font-size: 12px; font-weight: 700; background: none; border: none; cursor: pointer; }
    .grid-cal-legend { display: flex; gap: 16px; font-size: 10.5px; font-weight: 700; color: #64748b; margin-bottom: 16px; align-items: center; }
    .grid-cal-legend span { display: flex; align-items: center; gap: 4px; }
    .grid-cal-legend .dot { width: 6px; height: 6px; border-radius: 50%; }
    .grid-cal-legend .dot.blue { background: #2563eb; }
    .grid-cal-legend .dot.teal { background: #0d9488; }
    .grid-cal-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0; margin-bottom: 6px; }
    .grid-cal-weekday { text-align: center; font-size: 10px; font-weight: 700; color: #64748b; }
    .grid-cal-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0; border: 1px solid #f1f5f9; border-radius: 8px; overflow: hidden; background: #ffffff; }
    .grid-cal-cell { aspect-ratio: 0.85; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: all 0.2s; }
    .grid-cal-cell:nth-child(7n) { border-right: none; }
    .grid-cal-cell.empty { background: #f8fafc; }
    .grid-cal-cell.selected { border: 1.5px solid #7c3aed; background: #f5f3ff; border-radius: 6px; z-index: 10; box-shadow: 0 0 0 1px #7c3aed; }
    .grid-cal-date { font-size: 12.5px; font-weight: 800; color: #0f172a; margin-bottom: 2px; }
    .grid-cal-stat-staff { font-size: 10px; font-weight: 800; color: #2563eb; line-height: 1.1; margin-bottom: 1px; }
    .grid-cal-stat-hours { font-size: 10px; font-weight: 700; color: #0d9488; line-height: 1.1; }
    .grid-cal-empty-text { font-size: 10px; font-weight: 600; color: #cbd5e1; }
    
    /* Summary Card below Calendar */
    .cal-summary-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 16px; margin-top: 10px; }
    .cal-summary-title { font-size: 13.5px; font-weight: 800; color: #0f172a; margin-bottom: 12px; }
    .cal-summary-stats { display: flex; justify-content: space-between; margin-bottom: 16px; text-align: center; }
    .cal-summary-stat { display: flex; flex-direction: column; gap: 2px; flex: 1; }
    .cal-summary-stat-val { font-size: 20px; font-weight: 800; color: #2563eb; }
    .cal-summary-stat-label { font-size: 10px; font-weight: 600; color: #64748b; }
    .cal-summary-ot { font-size: 11.5px; font-weight: 600; color: #64748b; display: flex; justify-content: space-between; padding-top: 12px; border-top: 1px solid #f1f5f9; margin-bottom: 16px; }
    .cal-summary-btn { width: 100%; padding: 10px; border-radius: 12px; border: 1px solid #7c3aed; background: transparent; color: #7c3aed; font-size: 12.5px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s; }
    .cal-summary-btn:active { transform: scale(0.98); background: #f5f3ff; }"""

new_ot_css = """    /* Grid Calendar Styles */
    .grid-cal-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 20px; padding: 20px 16px; margin-top: 10px; }
    .grid-cal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .grid-cal-title { font-size: 16px; font-weight: 800; color: var(--text-primary); margin-bottom: 4px; }
    .grid-cal-toggle { display: flex; background: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: 8px; overflow: hidden; }
    .grid-cal-toggle-btn { padding: 4px 12px; font-size: 11px; font-weight: 700; color: var(--text-muted); border: none; background: transparent; cursor: pointer; transition: all 0.2s; }
    .grid-cal-toggle-btn.active { background: var(--purple-primary); color: var(--text-hero); }
    .grid-cal-nav { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .grid-cal-nav-center { display: flex; align-items: center; gap: 16px; font-size: 14px; font-weight: 800; color: var(--text-primary); }
    .grid-cal-nav-btn { color: var(--text-primary); font-size: 14px; background: none; border: none; cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center; }
    .grid-cal-today { color: var(--purple-primary); font-size: 12px; font-weight: 700; background: none; border: none; cursor: pointer; }
    .grid-cal-legend { display: flex; gap: 16px; font-size: 10.5px; font-weight: 700; color: var(--text-muted); margin-bottom: 16px; align-items: center; }
    .grid-cal-legend span { display: flex; align-items: center; gap: 4px; }
    .grid-cal-legend .dot { width: 6px; height: 6px; border-radius: 50%; }
    .grid-cal-legend .dot.blue { background: var(--tag-blue-text); }
    .grid-cal-legend .dot.teal { background: var(--tag-teal-text); }
    .grid-cal-weekdays { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0; margin-bottom: 6px; }
    .grid-cal-weekday { text-align: center; font-size: 10px; font-weight: 700; color: var(--text-muted); }
    .grid-cal-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0; border: 1px solid var(--border-subtle); border-radius: 8px; overflow: hidden; background: var(--bg-card); }
    .grid-cal-cell { aspect-ratio: 0.85; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; border-right: 1px solid var(--border-divider); border-bottom: 1px solid var(--border-divider); cursor: pointer; transition: all 0.2s; }
    .grid-cal-cell:nth-child(7n) { border-right: none; }
    .grid-cal-cell.empty { background: var(--bg-input); }
    .grid-cal-cell.selected { border: 1.5px solid var(--purple-primary); background: var(--purple-subtle); border-radius: 6px; z-index: 10; box-shadow: 0 0 0 1px var(--purple-primary); }
    .grid-cal-date { font-size: 12.5px; font-weight: 800; color: var(--text-primary); margin-bottom: 2px; }
    .grid-cal-stat-staff { font-size: 10px; font-weight: 800; color: var(--tag-blue-text); line-height: 1.1; margin-bottom: 1px; }
    .grid-cal-stat-hours { font-size: 10px; font-weight: 700; color: var(--tag-teal-text); line-height: 1.1; }
    .grid-cal-empty-text { font-size: 10px; font-weight: 600; color: var(--text-caption); }
    
    /* Summary Card below Calendar */
    .cal-summary-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 20px; padding: 16px; margin-top: 10px; }
    .cal-summary-title { font-size: 13.5px; font-weight: 800; color: var(--text-primary); margin-bottom: 12px; }
    .cal-summary-stats { display: flex; justify-content: space-between; margin-bottom: 16px; text-align: center; }
    .cal-summary-stat { display: flex; flex-direction: column; gap: 2px; flex: 1; }
    .cal-summary-stat-val { font-size: 20px; font-weight: 800; color: var(--tag-blue-text); }
    .cal-summary-stat-label { font-size: 10px; font-weight: 600; color: var(--text-muted); }
    .cal-summary-ot { font-size: 11.5px; font-weight: 600; color: var(--text-muted); display: flex; justify-content: space-between; padding-top: 12px; border-top: 1px solid var(--border-subtle); margin-bottom: 16px; }
    .cal-summary-btn { width: 100%; padding: 10px; border-radius: 12px; border: 1px solid var(--purple-primary); background: transparent; color: var(--purple-primary); font-size: 12.5px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.2s; }
    .cal-summary-btn:active { transform: scale(0.98); background: var(--purple-subtle); }"""

# Normalize line endings before replace
old_ot_css_norm = old_ot_css.replace('\r\n', '\n')
ot_content_norm = ot_content.replace('\r\n', '\n')

if old_ot_css_norm in ot_content_norm:
    ot_content_norm = ot_content_norm.replace(old_ot_css_norm, new_ot_css)
    print("Replaced CSS in ot-plan.html!")
else:
    print("WARNING: Exact match for old_ot_css not found, trying partial replacements...")
    ot_content_norm = ot_content_norm.replace('.grid-cal-card { background: #ffffff; border: 1px solid #e2e8f0;', '.grid-cal-card { background: var(--bg-card); border: 1px solid var(--border-subtle);')
    ot_content_norm = ot_content_norm.replace('.grid-cal-title { font-size: 16px; font-weight: 800; color: #0f172a;', '.grid-cal-title { font-size: 16px; font-weight: 800; color: var(--text-primary);')
    ot_content_norm = ot_content_norm.replace('.grid-cal-toggle { display: flex; background: #f8fafc; border: 1px solid #e2e8f0;', '.grid-cal-toggle { display: flex; background: var(--bg-input); border: 1px solid var(--border-subtle);')
    ot_content_norm = ot_content_norm.replace('.grid-cal-toggle-btn { padding: 4px 12px; font-size: 11px; font-weight: 700; color: #64748b;', '.grid-cal-toggle-btn { padding: 4px 12px; font-size: 11px; font-weight: 700; color: var(--text-muted);')
    ot_content_norm = ot_content_norm.replace('.grid-cal-toggle-btn.active { background: #7c3aed; color: #ffffff;', '.grid-cal-toggle-btn.active { background: var(--purple-primary); color: var(--text-hero);')
    ot_content_norm = ot_content_norm.replace('.grid-cal-nav-center { display: flex; align-items: center; gap: 16px; font-size: 14px; font-weight: 800; color: #0f172a;', '.grid-cal-nav-center { display: flex; align-items: center; gap: 16px; font-size: 14px; font-weight: 800; color: var(--text-primary);')
    ot_content_norm = ot_content_norm.replace('.grid-cal-nav-btn { color: #0f172a;', '.grid-cal-nav-btn { color: var(--text-primary);')
    ot_content_norm = ot_content_norm.replace('.grid-cal-today { color: #7c3aed;', '.grid-cal-today { color: var(--purple-primary);')
    ot_content_norm = ot_content_norm.replace('.grid-cal-legend { display: flex; gap: 16px; font-size: 10.5px; font-weight: 700; color: #64748b;', '.grid-cal-legend { display: flex; gap: 16px; font-size: 10.5px; font-weight: 700; color: var(--text-muted);')
    ot_content_norm = ot_content_norm.replace('.grid-cal-legend .dot.blue { background: #2563eb;', '.grid-cal-legend .dot.blue { background: var(--tag-blue-text);')
    ot_content_norm = ot_content_norm.replace('.grid-cal-legend .dot.teal { background: #0d9488;', '.grid-cal-legend .dot.teal { background: var(--tag-teal-text);')
    ot_content_norm = ot_content_norm.replace('.grid-cal-weekday { text-align: center; font-size: 10px; font-weight: 700; color: #64748b;', '.grid-cal-weekday { text-align: center; font-size: 10px; font-weight: 700; color: var(--text-muted);')
    ot_content_norm = ot_content_norm.replace('.grid-cal-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0; border: 1px solid #f1f5f9; border-radius: 8px; overflow: hidden; background: #ffffff;', '.grid-cal-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0; border: 1px solid var(--border-subtle); border-radius: 8px; overflow: hidden; background: var(--bg-card);')
    ot_content_norm = ot_content_norm.replace('.grid-cal-cell { aspect-ratio: 0.85; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; border-right: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;', '.grid-cal-cell { aspect-ratio: 0.85; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; border-right: 1px solid var(--border-divider); border-bottom: 1px solid var(--border-divider);')
    ot_content_norm = ot_content_norm.replace('.grid-cal-cell.empty { background: #f8fafc;', '.grid-cal-cell.empty { background: var(--bg-input);')
    ot_content_norm = ot_content_norm.replace('.grid-cal-cell.selected { border: 1.5px solid #7c3aed; background: #f5f3ff;', '.grid-cal-cell.selected { border: 1.5px solid var(--purple-primary); background: var(--purple-subtle);')
    ot_content_norm = ot_content_norm.replace('.grid-cal-date { font-size: 12.5px; font-weight: 800; color: #0f172a;', '.grid-cal-date { font-size: 12.5px; font-weight: 800; color: var(--text-primary);')
    ot_content_norm = ot_content_norm.replace('.grid-cal-stat-staff { font-size: 10px; font-weight: 800; color: #2563eb;', '.grid-cal-stat-staff { font-size: 10px; font-weight: 800; color: var(--tag-blue-text);')
    ot_content_norm = ot_content_norm.replace('.grid-cal-stat-hours { font-size: 10px; font-weight: 700; color: #0d9488;', '.grid-cal-stat-hours { font-size: 10px; font-weight: 700; color: var(--tag-teal-text);')
    ot_content_norm = ot_content_norm.replace('.grid-cal-empty-text { font-size: 10px; font-weight: 600; color: #cbd5e1;', '.grid-cal-empty-text { font-size: 10px; font-weight: 600; color: var(--text-caption);')
    ot_content_norm = ot_content_norm.replace('.cal-summary-card { background: #ffffff; border: 1px solid #e2e8f0;', '.cal-summary-card { background: var(--bg-card); border: 1px solid var(--border-subtle);')
    ot_content_norm = ot_content_norm.replace('.cal-summary-title { font-size: 13.5px; font-weight: 800; color: #0f172a;', '.cal-summary-title { font-size: 13.5px; font-weight: 800; color: var(--text-primary);')
    ot_content_norm = ot_content_norm.replace('.cal-summary-stat-val { font-size: 20px; font-weight: 800; color: #2563eb;', '.cal-summary-stat-val { font-size: 20px; font-weight: 800; color: var(--tag-blue-text);')
    ot_content_norm = ot_content_norm.replace('.cal-summary-stat-label { font-size: 10px; font-weight: 600; color: #64748b;', '.cal-summary-stat-label { font-size: 10px; font-weight: 600; color: var(--text-muted);')
    ot_content_norm = ot_content_norm.replace('.cal-summary-ot { font-size: 11.5px; font-weight: 600; color: #64748b; display: flex; justify-content: space-between; padding-top: 12px; border-top: 1px solid #f1f5f9;', '.cal-summary-ot { font-size: 11.5px; font-weight: 600; color: var(--text-muted); display: flex; justify-content: space-between; padding-top: 12px; border-top: 1px solid var(--border-subtle);')
    ot_content_norm = ot_content_norm.replace('.cal-summary-btn { width: 100%; padding: 10px; border-radius: 12px; border: 1px solid #7c3aed; background: transparent; color: #7c3aed;', '.cal-summary-btn { width: 100%; padding: 10px; border-radius: 12px; border: 1px solid var(--purple-primary); background: transparent; color: var(--purple-primary);')
    ot_content_norm = ot_content_norm.replace('.cal-summary-btn:active { transform: scale(0.98); background: #f5f3ff; }', '.cal-summary-btn:active { transform: scale(0.98); background: var(--purple-subtle); }')

# Update calendarTabView padding in ot-plan.html
ot_content_norm = ot_content_norm.replace('<div id="calendarTabView" style="display: none;">', '<div id="calendarTabView" style="display: none; padding-bottom: 24px;">')

# Update badges background in calSummaryCard in ot-plan.html
ot_content_norm = ot_content_norm.replace(old_badge, new_badge)

with open(ot_plan_path, 'w', encoding='utf-8') as f:
    f.write(ot_content_norm)

print("ot-plan.html updated!")
