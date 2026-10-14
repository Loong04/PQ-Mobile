// Excel-compatible CSV exports shared by Performance and Incident Highlight.
window.PeopleHcmHighlightExport = (() => {
  function csvText(rows) {
    const cell = value => {
      if (typeof value === 'number' && Number.isFinite(value)) return String(value);
      let text = String(value ?? '');
      if (/^\s*[=+@-]/.test(text)) text = "'" + text;
      return '"' + text.replace(/"/g, '""') + '"';
    };
    return '\uFEFF' + rows.map(row => row.map(cell).join(',')).join('\r\n');
  }
  function downloadCsv(filename, rows) {
    const href = URL.createObjectURL(new Blob([csvText(rows)], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = href; link.download = filename;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  }
  return { csvText, downloadCsv };
})();
